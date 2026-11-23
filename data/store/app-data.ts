// Everything the app saves on the device, and the checks applied when reading it back.
// No Expo or React imports in this file, so it can be unit tested with Jest.

import { createIngredientItem } from "../items/ingredientItem";
import { createIngredient, Ingredient } from "../recipe/ingredient";
import {
  createEmptyPlan,
  DayOverride,
  Meal,
  Plan,
  PlanItem,
} from "../recipe/meal-plan";
import { PantryEntry } from "../recipe/pantry";
import { createQuantity, Quantity } from "../recipe/quantity";
import { Recipe } from "../recipe/recipe";
import { INGREDIENT_CATEGORY, MEAL_TYPE, MEASUREMENT_TYPE, RECIPE_CATEGORY, UNITS, WEEKDAYS } from "../util/types";
import { isUnit } from "../util/unit";
import { toDateKey, DateKey } from "../util/util";

/** Bump this when the saved shape changes in a way old files can't be read as. */
export const DATA_VERSION = 1;

/** Meals ticked off as eaten. Keys come from doneKey(), a missing key means not done. */
export type DoneLog = Record<string, true>;

export interface AppData {
  ingredients: Ingredient[];
  recipes: Recipe[];
  plan: Plan;
  pantry: PantryEntry[];
  done: DoneLog;
}

/** What a brand new install starts with. */
export interface Defaults {
  ingredients: Ingredient[];
  recipes: Recipe[];
}

// Ticks older than this are dropped on load, so the file doesn't grow forever
const KEEP_DONE_DAYS = 90;

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function doneKey(date: Date, mealId: string): string {
  return `${toDateKey(date)}:${mealId}`;
}

export function createAppData(defaults: Defaults): AppData {
  return {
    ingredients: defaults.ingredients,
    recipes: defaults.recipes,
    plan: createEmptyPlan(),
    pantry: [],
    done: {},
  };
}

/* ---------- Lists (ingredients, recipes, pantry entries all have an id) ---------- */

/** Replaces the item with the same id, or adds it at the end. Returns a new list. */
export function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((existing) => existing.id === item.id)
    ? list.map((existing) => (existing.id === item.id ? item : existing))
    : [...list, item];
}

export function removeById<T extends { id: string }>(list: T[], id: string): T[] {
  return list.filter((existing) => existing.id !== id);
}

export function setDone(done: DoneLog, date: Date, mealIds: string[], isDone: boolean): DoneLog {
  const next = { ...done };
  for (const id of mealIds) {
    if (isDone) next[doneKey(date, id)] = true;
    else delete next[doneKey(date, id)];
  }
  return next;
}

/* ---------- Reading saved data ---------- */
// A file can be hand-edited, cut off mid-write, or written by an older version of the app.
// Anything that doesn't fit is dropped on its own, so one bad entry never loses the rest.

type Raw = Record<string, unknown>;

function isObject(value: unknown): value is Raw {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/** Runs `read` on every entry and keeps the ones that came back valid. */
function readList<T>(raw: unknown, read: (entry: unknown) => T | null): T[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry) => {
    const item = read(entry);
    return item === null ? [] : [item];
  });
}

function readIngredient(raw: unknown): Ingredient | null {
  if (!isObject(raw) || !isText(raw.id) || !isText(raw.name)) return null;

  const allowedUnits = readList(raw.allowedUnits, (unit) =>
    typeof unit === "string" && Object.values(MEASUREMENT_TYPE).includes(unit as MEASUREMENT_TYPE) ? unit as MEASUREMENT_TYPE : null,
  );
  if (allowedUnits.length === 0) return null;

  const category = Object.values(INGREDIENT_CATEGORY).includes(raw.ingredientCategory as INGREDIENT_CATEGORY)
    ? (raw.ingredientCategory as INGREDIENT_CATEGORY)
    : INGREDIENT_CATEGORY.OTHER;
  return createIngredient(raw.name, allowedUnits, category, raw.id);
}

function readPlanItem(raw: unknown): PlanItem | null {
  if (!isObject(raw) || !isText(raw.ingredientId)) return null;
  const quantity = readQuantity(raw.quantity)
  if (!quantity) return null;
  return { ingredientId: raw.ingredientId, quantity: quantity};
}

function readRecipe(raw: unknown): Recipe | null {
  if (!isObject(raw) || !isText(raw.id) || !isText(raw.name)) return null;

  const recipe: Recipe = {
    id: raw.id,
    name: raw.name,
    category: Object.keys(RECIPE_CATEGORY).includes(raw.category as string)
      ? (raw.category as RECIPE_CATEGORY)
      : RECIPE_CATEGORY.DINNER,
    items: readList(raw.items, readPlanItem),
    image: undefined
  };
  // Only photos with a uri survive a restart. A bundled image is a number that changes between builds.
  if (isObject(raw.image) && isText(raw.image.uri)) recipe.image = { uri: raw.image.uri };
  return recipe;
}

function readMeal(raw: unknown): Meal | null {
  if (!isObject(raw) || !isText(raw.id)) return null;
  if (!Object.values(MEAL_TYPE).includes(raw.type as MEAL_TYPE)) return null;
  if (typeof raw.time !== "string" || !TIME.test(raw.time)) return null;

  const meal: Meal = {
    id: raw.id,
    type: raw.type as MEAL_TYPE,
    time: raw.time,
    items: readList(raw.items, readPlanItem),
  };
  meal.note = isText(raw.note) ? raw.note : undefined;
  return meal;
}

function readOverride(raw: unknown): DayOverride | null {
  if (!isObject(raw)) return null;

  const changed: DayOverride["changed"] = {};
  if (isObject(raw.changed)) {
    for (const [mealId, value] of Object.entries(raw.changed)) {
      if (value === null) {
        changed[mealId] = null; // the meal was removed on this date
        continue;
      }
      const meal = readMeal(value);
      if (meal) changed[mealId] = meal;
    }
  }

  const added = readList(raw.added, readMeal);
  const isEmpty = Object.keys(changed).length === 0 && added.length === 0;
  return isEmpty ? null : { changed, added };
}

function readPlan(raw: unknown): Plan {
  const plan = createEmptyPlan();
  if (!isObject(raw)) return plan;

  if (isObject(raw.template)) {
    for (const day of Object.values(WEEKDAYS)) 
      plan.template[day] = readList(raw.template[day], readMeal);
  }
  if (isObject(raw.overrides)) {
    for (const [key, value] of Object.entries(raw.overrides)) {
      const override = DATE_KEY.test(key) ? readOverride(value) : null;
      if (override) plan.overrides[key] = override;
    }
  }
  return plan;
}

function readPantryEntry(raw: unknown): PantryEntry | null {
  if (!isObject(raw) || !isText(raw.id) || !isText(raw.ingredientId)) return null;
  const quantity = readQuantity(raw.quantity);
  if (!quantity) return null;

  const entry: PantryEntry = {
    id: raw.id,
    ingredientId: raw.ingredientId,
    quantity: quantity,
  };
  if (typeof raw.expiresOn === "string" && DATE_KEY.test(raw.expiresOn)) entry.expiresOn = raw.expiresOn;
  return entry;
}

function readDone(raw: unknown, now: Date): DoneLog {
  const done: DoneLog = {};
  if (!isObject(raw)) return done;

  const oldest: DateKey = toDateKey(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() - KEEP_DONE_DAYS),
  );
  for (const [key, value] of Object.entries(raw)) {
    const date = key.slice(0, 10);
    // Date keys sort the same way as the dates they stand for
    if (value === true && DATE_KEY.test(date) && key[10] === ":" && date >= oldest) done[key] = true;
  }
  return done;
}

function readQuantity(raw: unknown): Quantity | null {
  if (!isObject(raw)) return null;
  if (typeof raw.amount !== "number" || !isFinite(raw.amount)) return null;
  if (typeof raw.unit !== "string" || !isUnit(raw.unit) || raw.amount < 0) return null;
  return createQuantity(raw.amount, raw.unit as UNITS)
}

/**
 * Turns whatever was read from disk into valid app data.
 * `raw` is the parsed file, or anything else (undefined, a string...) when there is nothing usable.
 */
export function sanitizeAppData(raw: unknown, defaults: Defaults, now: Date = new Date()): AppData {
  if (!isObject(raw)) return createAppData(defaults);

  return {
    // The defaults only stand in for a list that was never saved. A saved empty list stays
    // empty, otherwise deleting every recipe would bring the starter recipes back.
    ingredients: Array.isArray(raw.ingredients) ? readList(raw.ingredients, readIngredient) : defaults.ingredients,
    recipes: Array.isArray(raw.recipes) ? readList(raw.recipes, readRecipe) : defaults.recipes,
    plan: readPlan(raw.plan),
    pantry: readList(raw.pantry, readPantryEntry),
    done: readDone(raw.done, now),
  };
}

/** The text written to disk. */
export function serializeAppData(data: AppData): string {
  return JSON.stringify({ version: DATA_VERSION, ...data }, null, 2);
}


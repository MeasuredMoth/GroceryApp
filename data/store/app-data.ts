// Everything the app saves on the device, and the checks applied when reading it back.
// No Expo or React imports in this file, so it can be unit tested with Jest.

import { Ingredient, INGREDIENT_CATEGORIES, IngredientCategory } from "../recipe/ingredient";
import {
  createEmptyPlan,
  DayOverride,
  Meal,
  MEAL_TYPES,
  MealType,
  Plan,
  PlanItem,
  WEEKDAYS,
} from "../recipe/meal-plan";
import { PantryEntry } from "../recipe/pantry";
import { Recipe, RecipeCategory } from "../recipe/recipe";
import { isUnit, Unit } from "../unit";
import { DateKey, toDateKey } from "../util";

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

const RECIPE_CATEGORIES: readonly RecipeCategory[] = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];
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
    typeof unit === "string" && isUnit(unit) ? unit : null,
  );
  if (allowedUnits.length === 0) return null;

  const category = INGREDIENT_CATEGORIES.includes(raw.category as IngredientCategory)
    ? (raw.category as IngredientCategory)
    : "Other";
  return { id: raw.id, name: raw.name, allowedUnits, category };
}

function readPlanItem(raw: unknown): PlanItem | null {
  if (!isObject(raw) || !isText(raw.ingredientId)) return null;
  if (typeof raw.amount !== "number" || !Number.isFinite(raw.amount) || raw.amount <= 0) return null;
  if (typeof raw.unit !== "string" || !isUnit(raw.unit)) return null;
  return { ingredientId: raw.ingredientId, amount: raw.amount, unit: raw.unit };
}

function readRecipe(raw: unknown): Recipe | null {
  if (!isObject(raw) || !isText(raw.id) || !isText(raw.name)) return null;

  const recipe: Recipe = {
    id: raw.id,
    name: raw.name,
    category: RECIPE_CATEGORIES.includes(raw.category as RecipeCategory)
      ? (raw.category as RecipeCategory)
      : "Dinner",
    items: readList(raw.items, readPlanItem),
  };
  // Only photos with a uri survive a restart. A bundled image is a number that changes between builds.
  if (isObject(raw.image) && isText(raw.image.uri)) recipe.image = { uri: raw.image.uri };
  return recipe;
}

function readMeal(raw: unknown): Meal | null {
  if (!isObject(raw) || !isText(raw.id)) return null;
  if (!MEAL_TYPES.includes(raw.type as MealType)) return null;
  if (typeof raw.time !== "string" || !TIME.test(raw.time)) return null;

  const meal: Meal = {
    id: raw.id,
    type: raw.type as MealType,
    time: raw.time,
    items: readList(raw.items, readPlanItem),
  };
  if (isText(raw.note)) meal.note = raw.note;
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
    for (const day of WEEKDAYS) plan.template[day] = readList(raw.template[day], readMeal);
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
  if (typeof raw.amount !== "number" || !Number.isFinite(raw.amount) || raw.amount < 0) return null;
  if (typeof raw.unit !== "string" || !isUnit(raw.unit)) return null;

  const entry: PantryEntry = {
    id: raw.id,
    ingredientId: raw.ingredientId,
    amount: raw.amount,
    unit: raw.unit as Unit,
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

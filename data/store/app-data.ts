// Everything the app saves on the device, and the checks applied when reading it back.
// No Expo or React imports in this file, so it can be unit tested with Jest.

import { createIngredientItem } from "../items/ingredientItem";
import {
  createIngredient,
  Ingredient,
  ShoppingExtras,
} from "../recipe/ingredient";
import {
  createEmptyPlan,
  mealsFor,
  DayOverride,
  Meal,
  Plan,
  PlanItem,
} from "../recipe/meal-plan";
import { PantryEntry } from "../recipe/pantry";
import {
  ConsumptionLog,
  PantryDeduction,
  consumeItems,
  restoreDeductions,
} from "../recipe/pantry-usage";
import { createQuantity, Quantity } from "../recipe/quantity";
import {
  PurchaseHistory,
  ShoppingItem,
  ShoppingList,
} from "../recipe/shopping-list";
import { isValidServings, Recipe } from "../recipe/recipe";
import {
  AISLE,
  INGREDIENT_CATEGORY,
  MEAL_TYPE,
  MEASUREMENT_TYPE,
  RECIPE_CATEGORY,
  UNITS,
  WEEKDAYS,
} from "../util/types";
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
  /** The current shopping list, or null before the first one is generated. Optional in old files. */
  shoppingList: ShoppingList | null;
  /** Pack formats the user has bought, per ingredient id. */
  purchaseHistory: PurchaseHistory;
  /** What each ticked meal took from the pantry, so un-ticking it can put it back. */
  consumed: ConsumptionLog;
}

/** What a brand new install starts with. */
export interface Defaults {
  ingredients: Ingredient[];
  recipes: Recipe[];
  pantry?: PantryEntry[]; // optional, so existing code and tests still work
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
    pantry: defaults.pantry ?? [],
    done: {},
    shoppingList: null,
    purchaseHistory: {},
    consumed: {},
  };
}

/* ---------- Lists (ingredients, recipes, pantry entries all have an id) ---------- */

/** Replaces the item with the same id, or adds it at the end. Returns a new list. */
export function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((existing) => existing.id === item.id)
    ? list.map((existing) => (existing.id === item.id ? item : existing))
    : [...list, item];
}

export function removeById<T extends { id: string }>(
  list: T[],
  id: string,
): T[] {
  return list.filter((existing) => existing.id !== id);
}

export function setDone(
  done: DoneLog,
  date: Date,
  mealIds: string[],
  isDone: boolean,
): DoneLog {
  const next = { ...done };
  for (const id of mealIds) {
    if (isDone) next[doneKey(date, id)] = true;
    else delete next[doneKey(date, id)];
  }
  return next;
}

/**
 * Ticks (isDone = true) or un-ticks meals of one date AND updates the pantry:
 *  - ticking takes the meal's ingredients out of the pantry and remembers what it took;
 *  - un-ticking puts exactly that back.
 * Ticking an already ticked meal, or un-ticking one that isn't, changes nothing, so nothing is
 * deducted twice. Meals ticked before this existed have no record, so un-ticking them restores nothing.
 * Returns the parts of AppData that changed, for store.update:
 *   store.update((d) => applyMealsDone(d, date, mealIds, isDone))
 */
export function applyMealsDone(
  data: AppData,
  date: Date,
  mealIds: string[],
  isDone: boolean,
): Pick<AppData, "done" | "pantry" | "consumed"> {
  const meals = mealsFor(data.plan, date);
  const consumed: ConsumptionLog = { ...data.consumed };
  let pantry = data.pantry;

  for (const id of mealIds) {
    const key = doneKey(date, id);
    const wasDone = data.done[key] === true;

    if (isDone && !wasDone) {
      const meal = meals.find((m) => m.id === id);
      if (!meal) continue;
      const result = consumeItems(pantry, meal.items, data.ingredients);
      pantry = result.pantry;
      if (result.taken.length > 0) consumed[key] = result.taken;
    } else if (!isDone && wasDone) {
      const taken = consumed[key];
      if (taken) pantry = restoreDeductions(pantry, taken, data.ingredients);
      delete consumed[key];
    }
  }
  return { done: setDone(data.done, date, mealIds, isDone), pantry, consumed };
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

// Category names saved by older versions of the app, and what they are called now
const LEGACY_CATEGORIES: Record<string, INGREDIENT_CATEGORY> = {
  PROTEIN: INGREDIENT_CATEGORY.PROTEIN,
  Diary: INGREDIENT_CATEGORY.DAIRY,
};

function readIngredient(raw: unknown): Ingredient | null {
  if (!isObject(raw) || !isText(raw.id) || !isText(raw.name)) return null;

  const allowedUnits = readList(raw.allowedUnits, (unit) =>
    typeof unit === "string" &&
    Object.values(MEASUREMENT_TYPE).includes(unit as MEASUREMENT_TYPE)
      ? (unit as MEASUREMENT_TYPE)
      : null,
  );
  if (allowedUnits.length === 0) return null;

  const savedCategory =
    LEGACY_CATEGORIES[raw.ingredientCategory as string] ??
    raw.ingredientCategory;
  const category = Object.values(INGREDIENT_CATEGORY).includes(
    savedCategory as INGREDIENT_CATEGORY,
  )
    ? (savedCategory as INGREDIENT_CATEGORY)
    : INGREDIENT_CATEGORY.OTHER;

  // Optional shopping data. Each field is checked on its own, a bad one is dropped (never fails the load).
  const extras: ShoppingExtras = {};
  if (Object.values(AISLE).includes(raw.aisle as AISLE))
    extras.aisle = raw.aisle as AISLE;
  if (typeof raw.pieceWeight === "number" && raw.pieceWeight > 0)
    extras.pieceWeight = raw.pieceWeight;
  if (typeof raw.density === "number" && raw.density > 0)
    extras.density = raw.density;
  if (typeof raw.packaged === "boolean") extras.packaged = raw.packaged;
  if (typeof raw.staple === "boolean") extras.staple = raw.staple;
  const defaultPackSize = readQuantity(raw.defaultPackSize);
  if (defaultPackSize && defaultPackSize.amount > 0)
    extras.defaultPackSize = defaultPackSize;
  if (
    typeof raw.shoppingUnit === "string" &&
    isUnit(raw.shoppingUnit) &&
    raw.shoppingUnit !== "pinch"
  )
    extras.shoppingUnit = raw.shoppingUnit as UNITS;

  return createIngredient(raw.name, allowedUnits, category, raw.id, extras);
}

function readPlanItem(raw: unknown): PlanItem | null {
  if (!isObject(raw) || !isText(raw.ingredientId)) return null;
  const quantity = readQuantity(raw.quantity);
  if (!quantity) return null;
  return { ingredientId: raw.ingredientId, quantity: quantity };
}

function readRecipe(raw: unknown): Recipe | null {
  if (!isObject(raw) || !isText(raw.id) || !isText(raw.name)) return null;

  const recipe: Recipe = {
    id: raw.id,
    name: raw.name,
    category: Object.values(RECIPE_CATEGORY).includes(
      raw.category as RECIPE_CATEGORY,
    )
      ? (raw.category as RECIPE_CATEGORY)
      : RECIPE_CATEGORY.DINNER,
    items: readList(raw.items, readPlanItem),
    // Recipes saved before servings existed are for one serving
    servings: isValidServings(raw.servings) ? raw.servings : 1,
    image: undefined,
  };
  // Only photos with a uri survive a restart. A bundled image is a number that changes between builds.
  if (isObject(raw.image) && isText(raw.image.uri))
    recipe.image = { uri: raw.image.uri };
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
  if (!isObject(raw) || !isText(raw.id) || !isText(raw.ingredientId))
    return null;
  const quantity = readQuantity(raw.quantity);
  if (!quantity) return null;

  const entry: PantryEntry = {
    id: raw.id,
    ingredientId: raw.ingredientId,
    quantity: quantity,
  };
  if (typeof raw.expiresOn === "string" && DATE_KEY.test(raw.expiresOn))
    entry.expiresOn = raw.expiresOn;
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
    if (
      value === true &&
      DATE_KEY.test(date) &&
      key[10] === ":" &&
      date >= oldest
    )
      done[key] = true;
  }
  return done;
}

function readQuantity(raw: unknown): Quantity | null {
  if (!isObject(raw)) return null;
  if (typeof raw.amount !== "number" || !isFinite(raw.amount)) return null;
  if (typeof raw.unit !== "string" || !isUnit(raw.unit) || raw.amount < 0)
    return null;
  return createQuantity(raw.amount, raw.unit as UNITS);
}

function readShoppingItem(raw: unknown): ShoppingItem | null {
  if (!isObject(raw) || !isText(raw.id)) return null;
  const needed = readQuantity(raw.needed);
  const toBuy = readQuantity(raw.toBuy);
  if (!needed || !toBuy) return null;

  const item: ShoppingItem = {
    id: raw.id,
    ingredientId: isText(raw.ingredientId) ? raw.ingredientId : null,
    needed,
    toBuy,
    sources: readList(raw.sources, (s) =>
      isObject(s) &&
      typeof s.date === "string" &&
      DATE_KEY.test(s.date) &&
      isText(s.mealId)
        ? { date: s.date, mealId: s.mealId }
        : null,
    ),
    checked: raw.checked === true,
    manual: raw.manual === true,
  };
  if (isText(raw.label)) item.label = raw.label;
  if (raw.packLocked === true) item.packLocked = true;
  if (
    typeof raw.packs === "number" &&
    Number.isInteger(raw.packs) &&
    raw.packs > 0
  )
    item.packs = raw.packs;
  const pack = readQuantity(raw.pack);
  if (pack) item.pack = pack;
  const leftover = readQuantity(raw.leftover);
  if (leftover) item.leftover = leftover;
  if (
    typeof raw.checkedAmount === "number" &&
    isFinite(raw.checkedAmount) &&
    raw.checkedAmount >= 0
  )
    item.checkedAmount = raw.checkedAmount;
  return item;
}

/** Only keeps records of meals that are still ticked, so the log never outlives the done log. */
function readConsumed(raw: unknown, done: DoneLog): ConsumptionLog {
  const log: ConsumptionLog = {};
  if (!isObject(raw)) return log;
  for (const [key, value] of Object.entries(raw)) {
    if (done[key] !== true) continue;
    const taken = readList(value, (d): PantryDeduction | null => {
      if (!isObject(d) || !isText(d.entryId) || !isText(d.ingredientId))
        return null;
      const quantity = readQuantity(d.quantity);
      if (!quantity || quantity.amount <= 0) return null;
      const deduction: PantryDeduction = {
        entryId: d.entryId,
        ingredientId: d.ingredientId,
        quantity,
      };
      if (typeof d.expiresOn === "string" && DATE_KEY.test(d.expiresOn))
        deduction.expiresOn = d.expiresOn;
      return deduction;
    });
    if (taken.length > 0) log[key] = taken;
  }
  return log;
}

function readShoppingList(raw: unknown): ShoppingList | null {
  if (
    !isObject(raw) ||
    typeof raw.startDate !== "string" ||
    !DATE_KEY.test(raw.startDate)
  )
    return null;
  const days =
    typeof raw.days === "number" && Number.isInteger(raw.days) && raw.days >= 1
      ? raw.days
      : 7;
  return {
    startDate: raw.startDate,
    days,
    items: readList(raw.items, readShoppingItem),
  };
}

function readPurchaseHistory(raw: unknown): PurchaseHistory {
  const history: PurchaseHistory = {};
  if (!isObject(raw)) return history;
  for (const [ingredientId, value] of Object.entries(raw)) {
    const formats = readList(value, (f) => {
      if (!isObject(f)) return null;
      const pack = readQuantity(f.pack);
      if (!pack || pack.amount <= 0) return null;
      if (typeof f.count !== "number" || !(f.count >= 1)) return null;
      if (typeof f.lastBought !== "string" || !DATE_KEY.test(f.lastBought))
        return null;
      return { pack, count: Math.floor(f.count), lastBought: f.lastBought };
    });
    if (formats.length > 0) history[ingredientId] = formats;
  }
  return history;
}

/**
 * Turns whatever was read from disk into valid app data.
 * `raw` is the parsed file, or anything else (undefined, a string...) when there is nothing usable.
 */
export function sanitizeAppData(
  raw: unknown,
  defaults: Defaults,
  now: Date = new Date(),
): AppData {
  if (!isObject(raw)) return createAppData(defaults);

  const done = readDone(raw.done, now);
  return {
    // The defaults only stand in for a list that was never saved. A saved empty list stays
    // empty, otherwise deleting every recipe would bring the starter recipes back.
    ingredients: Array.isArray(raw.ingredients)
      ? readList(raw.ingredients, readIngredient)
      : defaults.ingredients,
    recipes: Array.isArray(raw.recipes)
      ? readList(raw.recipes, readRecipe)
      : defaults.recipes,
    plan: readPlan(raw.plan),
    pantry: Array.isArray(raw.pantry)
      ? readList(raw.pantry, readPantryEntry)
      : (defaults.pantry ?? []),
    done,
    consumed: readConsumed(raw.consumed, done),
    // Files saved before the shopping list existed simply have no list and no history
    shoppingList: readShoppingList(raw.shoppingList),
    purchaseHistory: readPurchaseHistory(raw.purchaseHistory),
  };
}

/** The text written to disk. */
export function serializeAppData(data: AppData): string {
  return JSON.stringify({ version: DATA_VERSION, ...data }, null, 2);
}

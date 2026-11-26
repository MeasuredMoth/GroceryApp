import { createQuantity, Quantity } from "./quantity";
import { Ingredient } from "./ingredient";
import { Meal, Plan, mealsFor } from "./meal-plan";
import { PantryEntry } from "./pantry";
import {
  AISLE,
  LITERAL_UNIT,
  MEASUREMENT_TYPE,
  METRIC_UNIT,
  UNITS,
} from "../util/types";
import {
  ConvertableUnits,
  convertUnit,
  getMeasureTypeFromUnit,
} from "../util/unit";
import { DateKey, makeId, pad2, toDateKey } from "../util/util";

/*
 * Everything here is a pure function on plain data: it never changes its inputs and
 * returns new objects. The DataStore decides when to call it and what to save.
 * Nothing in the plan, recipe or pantry models had to change.
 */

/* ============================== Models ============================== */

/** Which meal needed an item, so the UI can show "Needed for: Tue dinner". */
export interface ShoppingSource {
  date: DateKey;
  mealId: string;
}

export interface ShoppingItem {
  /** For generated items this is the ingredientId, so regenerating can find the same row again. */
  id: string;
  /** null for a free-text manual item ("toilet paper"). */
  ingredientId: string | null;
  /** Only for manual items without an ingredient. */
  label?: string;
  /** What the meals need minus the pantry, in the ingredient's base unit (g, l or piece). */
  needed: Quantity;
  /** What to buy, in the unit shown on the list. For packaged items this is packs x pack size. */
  toBuy: Quantity;
  /** Packaged items only: "2 x 500 g". toBuy holds the total (1000 g). */
  packs?: number;
  pack?: Quantity;
  /** Bought minus needed, in the base unit. This is what ends up spare in the pantry. */
  leftover?: Quantity;
  sources: ShoppingSource[];
  checked: boolean;
  /** toBuy.amount at the moment it was checked. Lets a later plan change un-check an item that now needs more. */
  checkedAmount?: number;
  manual: boolean;
}

/** One persistent list, regenerated when the plan changes (see generateShoppingList). */
export interface ShoppingList {
  startDate: DateKey;
  days: number;
  items: ShoppingItem[];
}

/** A pack size the user has actually bought, learned at check-off. */
export interface PackFormat {
  pack: Quantity;
  count: number;
  lastBought: DateKey;
}

/** ingredientId -> the formats bought for it. */
export type PurchaseHistory = Record<string, PackFormat[]>;

/** A plan line the list could not use. Shown to the user instead of silently dropped. */
export interface SkippedLine {
  ingredientId: string;
  reason: "unknown-ingredient" | "cannot-convert";
}

/* ============================== Unit conversion for one ingredient ============================== */
// unit.ts converts within one type (mass->mass, volume->volume). Crossing types needs
// ingredient data: pieceWeight (piece <-> grams) and density (ml <-> grams).
// Everything crosses via grams: piece --pieceWeight--> g --density--> liters.

type Amount = Pick<Quantity, "amount" | "unit">;

const typeOf = (unit: UNITS): MEASUREMENT_TYPE =>
  getMeasureTypeFromUnit(unit)[0];
const r6 = (n: number): number => Math.round(n * 1e6) / 1e6;
const EPS = 1e-6;

/** The unit an ingredient is summed in: grams if it can be weighed, else liters, else pieces. */
export function baseUnitOf(ing: Ingredient): UNITS {
  if (ing.allowedUnits.includes(MEASUREMENT_TYPE.MASS)) return METRIC_UNIT.GRAM;
  if (ing.allowedUnits.includes(MEASUREMENT_TYPE.VOLUME))
    return METRIC_UNIT.LITER;
  return LITERAL_UNIT.PIECE;
}

function toGrams(ing: Ingredient, q: Amount): number | null {
  const type = typeOf(q.unit);
  if (type === MEASUREMENT_TYPE.MASS)
    return convertUnit(q.unit as ConvertableUnits, METRIC_UNIT.GRAM, q.amount);
  if (type === MEASUREMENT_TYPE.VOLUME)
    return ing.density
      ? convertUnit(q.unit as ConvertableUnits, METRIC_UNIT.LITER, q.amount) *
          1000 *
          ing.density
      : null;
  if (q.unit === LITERAL_UNIT.PIECE)
    return ing.pieceWeight ? q.amount * ing.pieceWeight : null;
  return null; // a pinch is "to taste": it has no weight
}

function fromGrams(ing: Ingredient, to: UNITS, grams: number): number | null {
  const type = typeOf(to);
  if (type === MEASUREMENT_TYPE.MASS)
    return convertUnit(METRIC_UNIT.GRAM, to as ConvertableUnits, grams);
  if (type === MEASUREMENT_TYPE.VOLUME)
    return ing.density
      ? convertUnit(
          METRIC_UNIT.LITER,
          to as ConvertableUnits,
          grams / (1000 * ing.density),
        )
      : null;
  if (to === LITERAL_UNIT.PIECE)
    return ing.pieceWeight ? grams / ing.pieceWeight : null;
  return null;
}

/** The amount of `q` expressed in unit `to` for this ingredient, or null if the data to do it is missing. */
export function convertFor(
  ing: Ingredient,
  q: Amount,
  to: UNITS,
): number | null {
  if (q.unit === to) return q.amount;
  const from = typeOf(q.unit);
  if (from === typeOf(to) && from !== MEASUREMENT_TYPE.COUNT)
    return convertUnit(
      q.unit as ConvertableUnits,
      to as ConvertableUnits,
      q.amount,
    );
  const grams = toGrams(ing, q);
  return grams === null ? null : fromGrams(ing, to, grams);
}

/* ============================== Packs ============================== */

/** Most often bought format (ties: the most recent), else the ingredient's default, else none. */
export function preferredPack(
  ing: Ingredient,
  history: PurchaseHistory = {},
): Quantity | null {
  const formats = [...(history[ing.id] ?? [])].sort(
    (a, b) => b.count - a.count || b.lastBought.localeCompare(a.lastBought),
  );
  return formats[0]?.pack ?? ing.defaultPackSize ?? null;
}

/** Call when an item is checked off, with the pack the user actually bought. Returns a new history. */
export function recordPurchase(
  history: PurchaseHistory,
  ingredientId: string,
  pack: Quantity,
  date: DateKey,
): PurchaseHistory {
  const list = history[ingredientId] ?? [];
  const i = list.findIndex(
    (f) => f.pack.unit === pack.unit && f.pack.amount === pack.amount,
  );
  const next =
    i >= 0
      ? list.map((f, j) =>
          j === i ? { ...f, count: f.count + 1, lastBought: date } : f,
        )
      : [...list, { pack, count: 1, lastBought: date }];
  return { ...history, [ingredientId]: next };
}

/** Rounds UP to a sensible step for the unit: whole pieces and grams, 0.1 kg, quarter cups. */
const STEP: Partial<Record<UNITS, number>> = {
  [LITERAL_UNIT.PIECE]: 1,
  [METRIC_UNIT.GRAM]: 1,
  [METRIC_UNIT.MILLIGRAM]: 1,
  [METRIC_UNIT.MILILITER]: 1,
  [METRIC_UNIT.KILOGRAM]: 0.1,
  [METRIC_UNIT.LITER]: 0.1,
};
function roundUp(amount: number, unit: UNITS): number {
  const step = STEP[unit] ?? 0.25;
  return r6(Math.ceil(r6(amount / step)) * step);
}

/* ============================== Generation ============================== */

export interface GenerateInput {
  plan: Plan;
  /** First day to cover. */
  startDate: Date;
  /** How many days to cover, including startDate. */
  days: number;
  ingredients: Ingredient[];
  pantry: PantryEntry[];
  history?: PurchaseHistory;
  /** Meals already eaten or skipped. Example: (d, m) => !!data.done[doneKey(d, m.id)] */
  isDone?: (date: Date, meal: Meal) => boolean;
  /** The current list, so check marks and manual items survive a regeneration. */
  previous?: ShoppingList | null;
  now?: Date;
}

interface Need {
  base: number;
  sources: ShoppingSource[];
  firstDate: DateKey;
}

function buildItem(
  ing: Ingredient,
  remaining: number,
  base: UNITS,
  sources: ShoppingSource[],
  history: PurchaseHistory,
): ShoppingItem {
  // Packaged: whole packs of the learned (or default) format. Loose: the shopping unit, rounded up.
  const pack = ing.packaged ? preferredPack(ing, history) : null;
  const packBase = pack ? convertFor(ing, pack, base) : null;

  let toBuy: Quantity;
  let packs: number | undefined;
  if (pack && packBase && packBase > 0) {
    packs = Math.ceil(r6(remaining / packBase));
    toBuy = createQuantity(r6(packs * pack.amount), pack.unit);
  } else {
    const wanted = ing.shoppingUnit ?? base;
    const converted = convertFor(
      ing,
      { amount: remaining, unit: base },
      wanted,
    );
    const unit = converted === null ? base : wanted; // no data for the shopping unit: stay in the base unit
    toBuy = createQuantity(roundUp(converted ?? remaining, unit), unit);
  }

  const boughtBase = convertFor(ing, toBuy, base) ?? remaining;
  const spare = r6(boughtBase - remaining);

  const item: ShoppingItem = {
    id: ing.id,
    ingredientId: ing.id,
    needed: createQuantity(r6(remaining), base),
    toBuy,
    sources,
    checked: false,
    manual: false,
  };
  if (packs !== undefined && pack) {
    item.packs = packs;
    item.pack = pack;
  }
  if (spare > EPS) item.leftover = createQuantity(spare, base);
  return item;
}

/**
 * Builds the list for `days` days starting at `startDate`:
 *  1. Collects the meals of those days (template + overrides, via mealsFor), skipping meals that are
 *     done, on a past day, or earlier today.
 *  2. Adds every plan item up per ingredient in its base unit (g / l / piece), remembering which meals.
 *  3. Subtracts the pantry (entries expiring before the first meal that needs them don't count).
 *  4. Staples (salt, oil) are only listed when the pantry holds none.
 *  5. Packaged items become whole packs, loose items are rounded up in their shopping unit.
 *  6. Merges with `previous`: check marks survive, manual items stay.
 * Also returns the plan lines it could not use, so the UI can tell the user.
 */
export function generateShoppingList(input: GenerateInput): {
  list: ShoppingList;
  skipped: SkippedLine[];
} {
  const { plan, startDate, days, ingredients, pantry, previous } = input;
  const history = input.history ?? {};
  const isDone = input.isDone ?? (() => false);
  const now = input.now ?? new Date();
  const todayKey = toDateKey(now);
  const nowTime = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;

  const byId = new Map(ingredients.map((i) => [i.id, i]));
  const needs = new Map<string, Need>();
  const skipped: SkippedLine[] = [];
  const skip = (ingredientId: string, reason: SkippedLine["reason"]) => {
    if (
      !skipped.some(
        (s) => s.ingredientId === ingredientId && s.reason === reason,
      )
    )
      skipped.push({ ingredientId, reason });
  };

  // 1 + 2: needs per ingredient
  for (let offset = 0; offset < days; offset++) {
    const date = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + offset,
    );
    const key = toDateKey(date);
    if (key < todayKey) continue; // yesterday and earlier can't be shopped for
    for (const meal of mealsFor(plan, date)) {
      if (isDone(date, meal)) continue;
      if (key === todayKey && meal.time < nowTime) continue;
      for (const line of meal.items) {
        const ing = byId.get(line.ingredientId);
        if (!ing) {
          skip(line.ingredientId, "unknown-ingredient");
          continue;
        }
        if (line.quantity.unit === LITERAL_UNIT.PINCH) continue; // to taste, never bought
        const amount = convertFor(ing, line.quantity, baseUnitOf(ing));
        if (amount === null) {
          skip(ing.id, "cannot-convert"); // e.g. cups of an ingredient with no density
          continue;
        }
        const need = needs.get(ing.id) ?? {
          base: 0,
          sources: [],
          firstDate: key,
        };
        need.base += amount;
        need.sources.push({ date: key, mealId: meal.id });
        if (key < need.firstDate) need.firstDate = key;
        needs.set(ing.id, need);
      }
    }
  }

  // 3 + 4 + 5: pantry, staples, packs
  const generated: ShoppingItem[] = [];
  for (const [ingredientId, need] of needs) {
    const ing = byId.get(ingredientId)!;
    const base = baseUnitOf(ing);

    let have = 0;
    for (const entry of pantry) {
      if (entry.ingredientId !== ingredientId) continue;
      if (entry.expiresOn && entry.expiresOn < need.firstDate) continue; // gone bad before it's needed
      have += convertFor(ing, entry.quantity, base) ?? 0;
    }

    if (ing.staple && have > 0) continue;
    const remaining = need.base - have;
    if (remaining <= EPS) continue;
    generated.push(buildItem(ing, remaining, base, need.sources, history));
  }

  // 6: merge with the previous list
  const previousByIngredient = new Map(
    (previous?.items ?? [])
      .filter((i) => !i.manual && i.ingredientId)
      .map((i) => [i.ingredientId!, i]),
  );
  const items = generated.map((item) => {
    const old = previousByIngredient.get(item.id);
    if (!old?.checked) return item;
    const boughtAmount = old.checkedAmount ?? old.toBuy.amount;
    // Checked, and the new need is still covered by what was put in the basket: stays checked.
    // The need grew (or the unit changed): un-checked again, but we remember what was already bought.
    const covered =
      old.toBuy.unit === item.toBuy.unit && item.toBuy.amount <= boughtAmount;
    return covered
      ? { ...item, checked: true, checkedAmount: boughtAmount }
      : {
          ...item,
          checked: false,
          checkedAmount:
            old.toBuy.unit === item.toBuy.unit ? boughtAmount : undefined,
        };
  });
  const generatedIds = new Set(generated.map((i) => i.id));
  for (const old of previous?.items ?? []) {
    if (old.manual)
      items.push(old); // manual items always stay
    else if (old.checked && !generatedIds.has(old.id)) items.push(old); // already in the basket, keep it
  }

  return { list: { startDate: toDateKey(startDate), days, items }, skipped };
}

/* ============================== Using the list ============================== */

export function setChecked(
  list: ShoppingList,
  itemId: string,
  checked: boolean,
): ShoppingList {
  return {
    ...list,
    items: list.items.map((i) =>
      i.id !== itemId
        ? i
        : {
            ...i,
            checked,
            checkedAmount: checked ? i.toBuy.amount : undefined,
          },
    ),
  };
}

/** For the progress bar. */
export function getProgress(list: ShoppingList): {
  checked: number;
  total: number;
  fraction: number;
} {
  const total = list.items.length;
  const checked = list.items.filter((i) => i.checked).length;
  return { checked, total, fraction: total === 0 ? 0 : checked / total };
}

/** A manual addition: free text ("toilet paper") or an ingredient. Defaults to 1 piece. */
export function addManualItem(
  list: ShoppingList,
  label: string,
  quantity: Quantity = createQuantity(1, LITERAL_UNIT.PIECE),
  ingredientId: string | null = null,
): ShoppingList {
  const trimmed = label.trim();
  if (trimmed === "" && ingredientId === null)
    throw new Error("A manual item needs a name");
  const item: ShoppingItem = {
    id: makeId("shop"),
    ingredientId,
    needed: quantity,
    toBuy: quantity,
    sources: [],
    checked: false,
    manual: true,
  };
  if (trimmed !== "") item.label = trimmed;
  return { ...list, items: [...list.items, item] };
}

export function itemName(
  item: ShoppingItem,
  byId: Map<string, Ingredient>,
): string {
  return (
    item.label ??
    (item.ingredientId ? byId.get(item.ingredientId)?.name : undefined) ??
    "Unknown item"
  );
}

/** Items grouped by aisle in the order of the AISLE enum, empty aisles left out. Names sorted inside. */
export function groupByAisle(
  list: ShoppingList,
  ingredients: Ingredient[],
): { aisle: AISLE; items: ShoppingItem[] }[] {
  const byId = new Map(ingredients.map((i) => [i.id, i]));
  const aisleOf = (item: ShoppingItem): AISLE =>
    (item.ingredientId ? byId.get(item.ingredientId)?.aisle : undefined) ??
    AISLE.OTHER;

  return Object.values(AISLE)
    .map((aisle) => ({
      aisle,
      items: list.items
        .filter((i) => aisleOf(i) === aisle)
        .sort((a, b) => itemName(a, byId).localeCompare(itemName(b, byId))),
    }))
    .filter((group) => group.items.length > 0);
}

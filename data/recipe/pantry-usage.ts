import { Ingredient } from "./ingredient";
import { PlanItem } from "./meal-plan";
import { mergeIntoPantry, PantryEntry } from "./pantry";
import { createQuantity, Quantity } from "./quantity";
import { baseUnitOf, convertFor } from "./shopping-list";
import { LITERAL_UNIT } from "../util/types";
import { DateKey, makeId } from "../util/util";

/*
 * What happens to the pantry when a meal is ticked as eaten (and when it is un-ticked).
 * Pure functions: they return new lists and never change their inputs.
 */

/** What was taken from ONE pantry entry for a meal. Kept so un-ticking the meal can put it back exactly. */
export interface PantryDeduction {
  entryId: string;
  ingredientId: string;
  /** In the entry's own unit at the time. */
  quantity: Quantity;
  /** Copied from the entry, so the amount can be re-created if the entry was deleted meanwhile. */
  expiresOn?: DateKey;
}

/** doneKey(date, mealId) -> what that meal took from the pantry. */
export type ConsumptionLog = Record<string, PantryDeduction[]>;

const r6 = (n: number): number => Math.round(n * 1e6) / 1e6;
const EPS = 1e-6;

/** Soonest expiry first, entries without an expiry date last. */
const byExpiry = (a: PantryEntry, b: PantryEntry): number =>
  (a.expiresOn ?? "9999-99-99").localeCompare(b.expiresOn ?? "9999-99-99");

/**
 * Takes the items of a meal out of the pantry.
 *  - Uses the entries that expire first.
 *  - Converts between units per ingredient (a meal in pieces can use a pantry entry in grams).
 *  - Never goes below 0: if the pantry holds less than the meal uses, it takes what is there.
 *    The row stays at 0 ("OUT") instead of being deleted.
 *  - Pinches are ignored, and so are lines that can't be converted (e.g. cups with no density).
 * `taken` is what was really removed, `missing` the ingredient ids the pantry could not fully cover.
 */
export function consumeItems(
  pantry: PantryEntry[],
  items: PlanItem[],
  ingredients: Ingredient[],
): { pantry: PantryEntry[]; taken: PantryDeduction[]; missing: string[] } {
  const byId = new Map(ingredients.map((i) => [i.id, i]));
  let next = pantry;
  const taken: PantryDeduction[] = [];
  const missing = new Set<string>();

  for (const item of items) {
    const ing = byId.get(item.ingredientId);
    if (!ing || item.quantity.unit === LITERAL_UNIT.PINCH) continue;

    const base = baseUnitOf(ing);
    let remaining = convertFor(ing, item.quantity, base);
    if (remaining === null) continue;

    const candidates = next
      .filter((e) => e.ingredientId === ing.id && e.quantity.amount > 0)
      .sort(byExpiry);

    for (const entry of candidates) {
      if (remaining <= EPS) break;
      const unit = entry.quantity.unit;
      const wanted = convertFor(ing, { amount: remaining, unit: base }, unit);
      if (wanted === null) continue; // this entry's unit can't be converted for this ingredient

      const take = Math.min(entry.quantity.amount, wanted);
      if (take <= EPS) continue;

      const left =
        take === entry.quantity.amount ? 0 : r6(entry.quantity.amount - take);
      next = next.map((e) =>
        e.id === entry.id ? { ...e, quantity: createQuantity(left, unit) } : e,
      );
      taken.push({
        entryId: entry.id,
        ingredientId: ing.id,
        quantity: createQuantity(r6(take), unit),
        expiresOn: entry.expiresOn,
      });
      remaining -= convertFor(ing, { amount: take, unit }, base) ?? remaining;
    }
    if (remaining > EPS) missing.add(ing.id);
  }

  return { pantry: next, taken, missing: [...missing] };
}

/**
 * Puts back what consumeItems took (the meal was un-ticked).
 * The amount goes back into the same entry. If that entry was deleted or its unit can no longer be
 * converted, it is added as a new entry with the same expiry date (merging with a matching one).
 */
export function restoreDeductions(
  pantry: PantryEntry[],
  taken: PantryDeduction[],
  ingredients: Ingredient[],
): PantryEntry[] {
  const byId = new Map(ingredients.map((i) => [i.id, i]));
  let next = pantry;

  for (const d of taken) {
    const ing = byId.get(d.ingredientId);
    const entry = next.find(
      (e) => e.id === d.entryId && e.ingredientId === d.ingredientId,
    );
    const back =
      entry && ing ? convertFor(ing, d.quantity, entry.quantity.unit) : null;

    if (entry && back !== null) {
      const amount = r6(entry.quantity.amount + back);
      next = next.map((e) =>
        e.id === entry.id
          ? { ...e, quantity: createQuantity(amount, entry.quantity.unit) }
          : e,
      );
    } else {
      next = mergeIntoPantry(next, {
        id: makeId("pantry"),
        ingredientId: d.ingredientId,
        quantity: d.quantity,
        expiresOn: d.expiresOn,
      });
    }
  }
  return next;
}

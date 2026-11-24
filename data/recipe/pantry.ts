import { UNITS } from "../util/types";
import { DateKey, makeId } from "../util/util";
import { Ingredient, isValidQuantity } from "./ingredient";
import { Quantity } from "./quantity";
import { canConvert,  } from "../util/unit";


/**
 * One purchase of an ingredient. The same ingredient may appear in several
 * entries (milk bought twice with different expiry dates); the pantry total
 * is the sum of its entries.
 */
export interface PantryEntry {
  id: string;
  ingredientId: string;
  quantity: Quantity;
  expiresOn?: DateKey; // "YYYY-MM-DD"
}

export function createPantryEntry(
  ingredient: Ingredient,
  quantity: Quantity,
  expiresOn?: DateKey,
): PantryEntry {
  if (!Number.isFinite(quantity.amount) || quantity.amount < 0) {
    throw new Error("Amount can't be negative");
  }
  if (!isValidQuantity(ingredient, quantity)) {
    throw new Error(`${ingredient.name} can't be stored in ${quantity.unit}`);
  }
  return {
    id: makeId("pantry"),
    ingredientId: ingredient.id,
    quantity: quantity,
    expiresOn,
  };
}

/** Undefined (no expiry date) only matches undefined. */
const sameExpiry = (a?: DateKey, b?: DateKey): boolean => (a ?? null) === (b ?? null);

/**
 * Saves `entry` into the pantry, merging instead of adding a duplicate row:
 *  1. Another entry of the same ingredient with the same expiry date (or both without one)
 *     whose unit converts gets the amount added to it, in that entry's unit.
 *  2. Otherwise, when adding something new, an emptied row of the same ingredient
 *     ("out of stock") is refilled instead of leaving it next to the new one.
 *  3. Otherwise the entry is added, or replaces the one with its id (an edit).
 * Returns a new list.
 */
export function mergeIntoPantry(pantry: PantryEntry[], entry: PantryEntry): PantryEntry[] {
  const isEdit = pantry.some((e) => e.id === entry.id);
  const others = pantry.filter((e) => e.id !== entry.id);

  const match = others.find(
    (e) =>
      e.ingredientId === entry.ingredientId &&
      sameExpiry(e.expiresOn, entry.expiresOn) &&
      canConvert(entry.quantity.unit, e.quantity.unit),
  );
  if (match) {
    const converted = entry.quantity.convertToUnit(match.quantity.unit)!;
    const amount = Number((match.quantity.amount + converted.amount).toFixed(4));
    converted.amount = amount;
    return others.map((e) => (e.id === match.id ? { ...match, quantity: converted } : e));
  }

  if (!isEdit) {
    const empty = others.find((e) => e.ingredientId === entry.ingredientId && e.quantity.amount === 0);
    if (empty) return pantry.map((e) => (e.id === empty.id ? { ...entry, id: empty.id } : e));
    return [...pantry, entry];
  }

  return pantry.map((e) => (e.id === entry.id ? entry : e));
}

import { allowsUnit, Ingredient } from "./ingredient";
import { Quantity, Unit } from "../unit";
import { DateKey, makeId } from "../util";

/**
 * One purchase of an ingredient. The same ingredient may appear in several
 * entries (milk bought twice with different expiry dates); the pantry total
 * is the sum of its entries.
 */
export interface PantryEntry {
  id: string;
  ingredientId: string;
  amount: number; // 0 is allowed: keeps "you're out of oats" instead of deleting the row
  unit: Unit;
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
  if (!allowsUnit(ingredient, quantity.unit)) {
    throw new Error(`${ingredient.name} can't be stored in ${quantity.unit}`);
  }
  return {
    id: makeId("pantry"),
    ingredientId: ingredient.id,
    amount: quantity.amount,
    unit: quantity.unit,
    expiresOn,
  };
}

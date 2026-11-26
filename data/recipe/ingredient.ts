import { Quantity } from "./quantity";
import {
  AISLE,
  INGREDIENT_CATEGORY,
  MEASUREMENT_TYPE,
  UNITS,
} from "../util/types";
import { makeId } from "../util/util";
import { getMeasureTypeFromUnit } from "../util/unit";

export interface Ingredient {
  id: string;
  name: string;
  allowedUnits: MEASUREMENT_TYPE[];
  ingredientCategory: INGREDIENT_CATEGORY;

  // Shopping-list data. All optional, so saved ingredients and existing code keep working.
  // Missing data never throws: list generation reports it instead (see ingredientIssues).
  aisle?: AISLE; // store section the item is grouped under
  pieceWeight?: number; // grams in ONE piece (onion = 150). Lets "2 onions" and "300 g onion" add up
  density?: number; // grams per ml. Only needed to convert cups/ml <-> grams
  packaged?: boolean; // pasta, beans: bought in packs. Fruit, veg, meat: loose
  defaultPackSize?: Quantity; // pack guess until we learn what the user buys
  shoppingUnit?: UNITS; // unit shown on the list (onion = piece, flour = g)
  staple?: boolean; // salt, oil: only listed when the pantry has none
}

export function createIngredient(
  name: string,
  allowedUnits: MEASUREMENT_TYPE[],
  ingredientCategory: INGREDIENT_CATEGORY,
  id: string = "",
  extras: ShoppingExtras = {},
): Ingredient {
  const trimmed = name.trim();

  if (trimmed === "") throw new Error("An ingredient needs a name.");
  if (allowedUnits.length === 0)
    throw new Error(`${trimmed} needs at least one allowed unit.`);

  if (extras.pieceWeight !== undefined && !(extras.pieceWeight > 0))
    throw new Error(`${trimmed}: pieceWeight must be greater than 0.`);
  if (extras.density !== undefined && !(extras.density > 0))
    throw new Error(`${trimmed}: density must be greater than 0.`);

  if (id == "") id = makeId(trimmed);

  return {
    id,
    name: trimmed, // FIX: was the untrimmed name
    allowedUnits,
    ingredientCategory,
    ...extras,
  };
}

export function isQuantityAllowed(
  ingredient: Ingredient,
  quantity: Quantity,
): boolean {
  return (
    Number.isFinite(quantity.amount) &&
    quantity.amount > 0 &&
    isValidQuantity(ingredient, quantity)
  );
}

export function isValidQuantity(ingredient: Ingredient, quantity: Quantity) {
  return ingredient.allowedUnits.some((u) =>
    getMeasureTypeFromUnit(quantity.unit).includes(u),
  );
}

/** The optional shopping fields, passed as the 5th argument of createIngredient. */
export type ShoppingExtras = Partial<
  Omit<Ingredient, "id" | "name" | "allowedUnits" | "ingredientCategory">
>;

/**
 * Missing data that would stop the shopping list from converting or packing this ingredient.
 * Run it over the built-in database in a test so gaps show up at build time.
 */
export function ingredientIssues(i: Ingredient): string[] {
  const has = (t: MEASUREMENT_TYPE) => i.allowedUnits.includes(t);
  const issues: string[] = [];
  if (
    has(MEASUREMENT_TYPE.COUNT) &&
    (has(MEASUREMENT_TYPE.MASS) || has(MEASUREMENT_TYPE.VOLUME)) &&
    !i.pieceWeight
  )
    issues.push(
      `${i.name}: allows pieces and mass/volume, needs a pieceWeight`,
    );
  if (
    has(MEASUREMENT_TYPE.VOLUME) &&
    (has(MEASUREMENT_TYPE.MASS) || has(MEASUREMENT_TYPE.COUNT)) &&
    !i.density
  )
    issues.push(`${i.name}: allows volume and mass/pieces, needs a density`);
  if (i.packaged && !i.defaultPackSize)
    issues.push(`${i.name}: is packaged, needs a defaultPackSize`);
  return issues;
}

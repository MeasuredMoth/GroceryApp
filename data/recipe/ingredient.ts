import { Quantity } from "./quantity";
import { INGREDIENT_CATEGORY, MEASUREMENT_TYPE } from "../util/types";
import { makeId } from "../util/util";
import { getMeasureTypeFromUnit } from "../util/unit";

export interface Ingredient {
  id: string;
  name: string;
  allowedUnits: MEASUREMENT_TYPE[];
  ingredientCategory: INGREDIENT_CATEGORY;
}

export function createIngredient(
  name: string,
  allowedUnits: MEASUREMENT_TYPE[],
  ingredientCategory: INGREDIENT_CATEGORY,
  id: string = "",
): Ingredient {
  const trimmed = name.trim();

  if (trimmed === "") throw new Error("An ingredient needs a name.");
  if (allowedUnits.length === 0)
    throw new Error(`${trimmed} needs at least one allowed unit.`);

  if (id == "") id = makeId(trimmed);

  return {
    id,
    name: trimmed, // FIX: was the untrimmed name
    allowedUnits,
    ingredientCategory,
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

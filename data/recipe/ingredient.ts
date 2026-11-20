import { Quantity } from "./quantity";
import { INGREDIENT_CATEGORIES, MEASUREMENT_TYPE } from "../util/types";

export interface Ingredient {
    name: string;
    allowedUnits: MEASUREMENT_TYPE[]; 
    ingredientCategory: INGREDIENT_CATEGORIES;
}

export function createIngredient(
  name: string,
  allowedUnits: MEASUREMENT_TYPE[],
  ingredientCategory: INGREDIENT_CATEGORIES
): Ingredient {
    const trimmed = name.trim();

    if (trimmed === "") 
        throw new Error("An ingredient needs a name.");
    if (allowedUnits.length === 0) 
        throw new Error(`${trimmed} needs at least one allowed unit.`);
    
    return {
        name,
        allowedUnits,
        ingredientCategory
    }
}

export function isQuantityAllowed(
  ingredient: Ingredient,
  quantity: Quantity,
): boolean {
  return (
    Number.isFinite(quantity.amount) && quantity.amount > 0 && isValidQuantity(ingredient, quantity)
  );
}

export function isValidQuantity(ingredient: Ingredient, quantity: Quantity){
  return ingredient.allowedUnits.some(u => quantity.unit.includes(u));
}
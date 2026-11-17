import { INGREDIENT_CATEGORIES, UNITS } from "data/util/types";
import { Quantity } from "./quantity";

export interface Ingredient {
    name: string;
    allowedUnits: UNITS[]; 
    ingredientCategory: INGREDIENT_CATEGORIES;
}

export function createIngredient(
  name: string,
  allowedUnits: UNITS[],
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
  return Object.values(ingredient.allowedUnits).includes(quantity.unit)
}
import { Ingredient, isValidQuantity } from "../recipe/ingredient";
import { Quantity } from "../recipe/quantity";

export interface IngredientItem {
    ingredient: Ingredient,
    quantity: Quantity,
}

export function createIngredientItem (
    ingredient: Ingredient,
    quantity: Quantity,
): IngredientItem {
    if (!isValidQuantity(ingredient, quantity))    
        throw new Error("ingredient and Quantity aren't valid together.");

    return {
        ingredient,
        quantity
    }
}
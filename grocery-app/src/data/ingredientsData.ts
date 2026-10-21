import { Ingredient, quantityFormats } from "../../recipe/ingredient";

export const ingredients: Ingredient[] = [
  Ingredient.createIngredient('Rice', 500, quantityFormats.METRIC),
  Ingredient.createIngredient('Chicken breast', 300, quantityFormats.METRIC),
  Ingredient.createIngredient('Olive oil', 1, quantityFormats.LITERAL),
  Ingredient.createIngredient('Milk', 1, quantityFormats.METRIC),
  Ingredient.createIngredient('Eggs', 6, quantityFormats.LITERAL),
];
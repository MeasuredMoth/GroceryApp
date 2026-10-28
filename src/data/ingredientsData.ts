import { Ingredient } from "../../data/recipe/ingredient";


export const ingredients: Ingredient[] = [
    Ingredient.createIngredient("Flour", "250 g"),
    Ingredient.createIngredient("Sugar", "100 g"),
    Ingredient.createIngredient("Butter", "50 g"),
    Ingredient.createIngredient("Milk", "200 ml"),
    Ingredient.createIngredient("Olive oil", "1 tbsp"),
    Ingredient.createIngredient("Baking powder", "1 tsp"),
    Ingredient.createIngredient("Salt", "1 pinch"),
    Ingredient.createIngredient("Eggs", { amount: 2, unit: "piece" }),
    Ingredient.createIngredient("Heavy cream", { amount: 1, unit: "cup" }),
    Ingredient.createIngredient("Cheddar", { amount: 4, unit: "oz" }),
];
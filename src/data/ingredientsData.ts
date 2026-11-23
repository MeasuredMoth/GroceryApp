import { createIngredient, Ingredient } from "../../data/recipe/ingredient";
import { INGREDIENT_CATEGORY, MEASUREMENT_TYPE } from "../../data/util/types";

export const ingredients: Ingredient[] = [
  // VEGETABLES
  createIngredient("Broccoli", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.VEGETABLE, "broccoli"),
  createIngredient("Tomato", [MEASUREMENT_TYPE.MASS, MEASUREMENT_TYPE.COUNT], INGREDIENT_CATEGORY.VEGETABLE, "tomato"),
  createIngredient("Cucumber", [MEASUREMENT_TYPE.MASS, MEASUREMENT_TYPE.COUNT], INGREDIENT_CATEGORY.VEGETABLE, "cucumber"),
  createIngredient("Lettuce", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.VEGETABLE, "lettuce"),
  createIngredient("Onion", [MEASUREMENT_TYPE.MASS, MEASUREMENT_TYPE.COUNT], INGREDIENT_CATEGORY.VEGETABLE, "onion"),
  createIngredient("Bell Pepper", [MEASUREMENT_TYPE.MASS, MEASUREMENT_TYPE.COUNT], INGREDIENT_CATEGORY.VEGETABLE, "bell-pepper"),
  createIngredient("Carrots", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.VEGETABLE, "carrots"),
  createIngredient("Peas", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.VEGETABLE, "peas"),

  // DIARY
  createIngredient("Milk", [MEASUREMENT_TYPE.VOLUME], INGREDIENT_CATEGORY.DIARY, "milk"),
  createIngredient("Butter", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.DIARY, "butter"),
  createIngredient("Greek Yogurt", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.DIARY, "greek-yogurt"),
  createIngredient("Parmesan", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.DIARY, "parmesan"),
  createIngredient("Feta", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.DIARY, "feta"),
  createIngredient("Cheese", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.DIARY, "cheese"),

  // PROTEINS
  createIngredient("Chicken Breast", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.PROTEIN, "chicken-breast"),
  createIngredient("Turkey Breast", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.PROTEIN, "turkey-breast"),
  createIngredient("Ground Beef", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.PROTEIN, "ground-beef"),
  createIngredient("Salmon", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.PROTEIN, "salmon"),
  createIngredient("Canned Tuna", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.PROTEIN, "canned-tuna"),
  createIngredient("Eggs", [MEASUREMENT_TYPE.COUNT], INGREDIENT_CATEGORY.PROTEIN, "eggs"),
  createIngredient("Chickpeas", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.PROTEIN, "chickpeas"),
  createIngredient("Protein Powder", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.PROTEIN, "protein-powder"),

  // CARBS
  createIngredient("Potatoes", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.CARB, "potatoes"),
  createIngredient("Oats", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.CARB, "oats"),
  createIngredient("Bread", [MEASUREMENT_TYPE.COUNT], INGREDIENT_CATEGORY.CARB, "bread"),
  createIngredient("Granola", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.CARB, "granola"),
  createIngredient("Flour", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.CARB, "flour"),
  createIngredient("Rice", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.CARB, "rice"),
  createIngredient("Pasta", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.CARB, "pasta"),
  createIngredient("Tortilla", [MEASUREMENT_TYPE.COUNT], INGREDIENT_CATEGORY.CARB, "tortilla"),

  // OTHER
  createIngredient("Banana", [MEASUREMENT_TYPE.COUNT], INGREDIENT_CATEGORY.FRUIT, "banana"),
  createIngredient("Blueberries", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.FRUIT, "blueberries"),
  createIngredient("Strawberries", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.FRUIT, "strawberries"),

  createIngredient("Lemon", [MEASUREMENT_TYPE.COUNT], INGREDIENT_CATEGORY.OTHER, "lemon"),
  createIngredient("Peanut Butter", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.OTHER, "peanut-butter"),
  createIngredient("Honey", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.OTHER, "honey"),
  createIngredient("Baking Powder", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.OTHER, "baking-powder"),
  createIngredient("Tomato Sauce", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.OTHER, "tomato-sauce"),
  createIngredient("Olive Oil", [MEASUREMENT_TYPE.VOLUME], INGREDIENT_CATEGORY.OTHER, "olive-oil"),
  createIngredient("Soy Sauce", [MEASUREMENT_TYPE.VOLUME], INGREDIENT_CATEGORY.OTHER, "soy-sauce"),
  createIngredient("Cocoa Powder", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.OTHER, "cocoa-powder"),
  createIngredient("Sugar", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.OTHER, "sugar"),
];
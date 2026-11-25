import { createIngredient, Ingredient } from "../../data/recipe/ingredient";

export const ingredients: Ingredient[] = [
  // VEGETABLES
  createIngredient("Broccoli", ["g", "kg"], "Vegetables", "broccoli"),
  createIngredient("Tomato", ["g", "kg", "piece"], "Vegetables", "tomato"),
  createIngredient("Cucumber", ["g", "kg", "piece"], "Vegetables", "cucumber"),
  createIngredient("Lettuce", ["g", "kg"], "Vegetables", "lettuce"),
  createIngredient("Onion", ["g", "kg", "piece"], "Vegetables", "onion"),
  createIngredient("Bell Pepper", ["g", "kg", "piece"], "Vegetables", "bell-pepper"),
  createIngredient("Carrots", ["g", "kg"], "Vegetables", "carrots"),
  createIngredient("Peas", ["g", "kg"], "Vegetables", "peas"),

  // DAIRY
  createIngredient("Milk", ["ml", "l"], "Dairy", "milk"),
  createIngredient("Butter", ["g", "kg"], "Dairy", "butter"),
  createIngredient("Greek Yogurt", ["g", "kg"], "Dairy", "greek-yogurt"),
  createIngredient("Parmesan", ["g", "kg"], "Dairy", "parmesan"),
  createIngredient("Feta", ["g", "kg"], "Dairy", "feta"),
  createIngredient("Cheese", ["g", "kg"], "Dairy", "cheese"),

  // PROTEINS
  createIngredient("Chicken Breast", ["g", "kg"], "Proteins", "chicken-breast"),
  createIngredient("Turkey Breast", ["g", "kg"], "Proteins", "turkey-breast"),
  createIngredient("Ground Beef", ["g", "kg"], "Proteins", "ground-beef"),
  createIngredient("Salmon", ["g", "kg"], "Proteins", "salmon"),
  createIngredient("Canned Tuna", ["g", "kg"], "Proteins", "canned-tuna"),
  createIngredient("Eggs", ["piece"], "Proteins", "eggs"),
  createIngredient("Chickpeas", ["g", "kg"], "Proteins", "chickpeas"),
  createIngredient("Protein Powder", ["g", "kg"], "Proteins", "protein-powder"),

  // CARBS
  createIngredient("Potatoes", ["g", "kg"], "Carbs", "potatoes"),
  createIngredient("Oats", ["g", "kg"], "Carbs", "oats"),
  createIngredient("Bread", ["piece"], "Carbs", "bread"),
  createIngredient("Granola", ["g", "kg"], "Carbs", "granola"),
  createIngredient("Flour", ["g", "kg"], "Carbs", "flour"),
  createIngredient("Rice", ["g", "kg"], "Carbs", "rice"),
  createIngredient("Pasta", ["g", "kg"], "Carbs", "pasta"),
  createIngredient("Tortilla", ["piece"], "Carbs", "tortilla"),

  // OTHER
  createIngredient("Banana", ["piece"], "Fruit", "banana"),
  createIngredient("Blueberries", ["g", "kg"], "Fruit", "blueberries"),
  createIngredient("Strawberries", ["g", "kg"], "Fruit", "strawberries"),
  createIngredient("Lemon", ["piece"], "Other", "lemon"),
  createIngredient("Peanut Butter", ["g", "kg"], "Other", "peanut-butter"),
  createIngredient("Honey", ["g", "kg"], "Other", "honey"),
  createIngredient("Baking Powder", ["g", "kg"], "Other", "baking-powder"),
  createIngredient("Tomato Sauce", ["g", "kg"], "Other", "tomato-sauce"),
  createIngredient("Olive Oil", ["ml", "l"], "Other", "olive-oil"),
  createIngredient("Soy Sauce", ["ml", "l"], "Other", "soy-sauce"),
  createIngredient("Cocoa Powder", ["g", "kg"], "Other", "cocoa-powder"),
  createIngredient("Sugar", ["g", "kg"], "Other", "sugar"),
];
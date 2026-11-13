import { createIngredient, Ingredient } from "../../data/recipe/ingredient";


export const ingredients: Ingredient[] = [
  // PRODUCE
  createIngredient("Banana", ["piece"], "Produce", "banana"),
  createIngredient("Blueberries", ["g", "kg"], "Produce", "blueberries"),
  createIngredient("Strawberries", ["g", "kg"], "Produce", "strawberries"),
  createIngredient("Broccoli", ["g", "kg"], "Produce", "broccoli"),
  createIngredient("Tomato", ["g", "kg", "piece"], "Produce", "tomato"),
  createIngredient("Cucumber", ["g", "kg", "piece"], "Produce", "cucumber"),
  createIngredient("Lemon", ["piece"], "Produce", "lemon"),
  createIngredient("Lettuce", ["g", "kg"], "Produce", "lettuce"),
  createIngredient("Potatoes", ["g", "kg"], "Produce", "potatoes"),
  createIngredient("Onion", ["g", "kg", "piece"], "Produce", "onion"),
  createIngredient("Bell Pepper", ["g", "kg", "piece"], "Produce", "bell-pepper"),
  createIngredient("Carrots", ["g", "kg"], "Produce", "carrots"),
  createIngredient("Peas", ["g", "kg"], "Produce", "peas"),

  // DAIRY
  createIngredient("Milk", ["ml", "l"], "Dairy", "milk"),
  createIngredient("Butter", ["g", "kg"], "Dairy", "butter"),
  createIngredient("Greek Yogurt", ["g", "kg"], "Dairy", "greek-yogurt"),
  createIngredient("Parmesan", ["g", "kg"], "Dairy", "parmesan"),
  createIngredient("Feta", ["g", "kg"], "Dairy", "feta"),
  createIngredient("Cheese", ["g", "kg"], "Dairy", "cheese"),

  // MEAT
  createIngredient("Chicken Breast", ["g", "kg"], "Meat", "chicken-breast"),
  createIngredient("Turkey Breast", ["g", "kg"], "Meat", "turkey-breast"),
  createIngredient("Ground Beef", ["g", "kg"], "Meat", "ground-beef"),
  createIngredient("Salmon", ["g", "kg"], "Meat", "salmon"),
  createIngredient("Canned Tuna", ["g", "kg"], "Meat", "canned-tuna"),

  // STAPLES
  createIngredient("Oats", ["g", "kg"], "Staples", "oats"),
  createIngredient("Bread", ["piece", "piece"], "Staples", "bread"),
  createIngredient("Peanut Butter", ["g", "kg"], "Staples", "peanut-butter"),
  createIngredient("Honey", ["g", "kg"], "Staples", "honey"),
  createIngredient("Granola", ["g", "kg"], "Staples", "granola"),
  createIngredient("Flour", ["g", "kg"], "Staples", "flour"),
  createIngredient("Baking Powder", ["g", "kg"], "Staples", "baking-powder"),
  createIngredient("Rice", ["g", "kg"], "Staples", "rice"),
  createIngredient("Pasta", ["g", "kg"], "Staples", "pasta"),
  createIngredient("Tomato Sauce", ["g", "kg"], "Staples", "tomato-sauce"),
  createIngredient("Olive Oil", ["ml", "l"], "Staples", "olive-oil"),
  createIngredient("Soy Sauce", ["ml", "l"], "Staples", "soy-sauce"),
  createIngredient("Chickpeas", ["g", "kg"], "Staples", "chickpeas"),
  createIngredient("Tortilla", ["piece"], "Staples", "tortilla"),
  createIngredient("Eggs", ["piece"], "Staples", "eggs"),
  createIngredient("Cocoa Powder", ["g", "kg"], "Staples", "cocoa-powder"),
  createIngredient("Sugar", ["g", "kg"], "Staples", "sugar"),

  // OTHER
  createIngredient("Protein Powder", ["g", "kg"], "Other", "protein-powder"),
];

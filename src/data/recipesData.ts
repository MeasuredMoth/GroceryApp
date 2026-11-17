import { createRecipe, Recipe } from "../../data/recipe/recipe";


export const recipes: Recipe[] = [
  // BREAKFAST

  createRecipe("Overnight Oats", [
    { ingredientId: "oats", amount: 80, unit: "g" },
    { ingredientId: "milk", amount: 200, unit: "ml" },
    { ingredientId: "banana", amount: 1, unit: "piece" },
    { ingredientId: "peanut-butter", amount: 20, unit: "g" },
    { ingredientId: "honey", amount: 10, unit: "g" },
  ], { id: "recipe-overnight-oats", category: "Breakfast" }),

  createRecipe("Scrambled Eggs & Toast", [
    { ingredientId: "eggs", amount: 3, unit: "piece" },
    { ingredientId: "bread", amount: 2, unit: "piece" },
    { ingredientId: "butter", amount: 10, unit: "g" },
    { ingredientId: "milk", amount: 30, unit: "ml" },
  ], { id: "recipe-scrambled-eggs", category: "Breakfast" }),

  createRecipe("Greek Yogurt Bowl", [
    { ingredientId: "greek-yogurt", amount: 200, unit: "g" },
    { ingredientId: "granola", amount: 50, unit: "g" },
    { ingredientId: "blueberries", amount: 80, unit: "g" },
    { ingredientId: "honey", amount: 15, unit: "g" },
    { ingredientId: "banana", amount: 1, unit: "piece" },
  ], { id: "recipe-yogurt-bowl", category: "Breakfast" }),

  createRecipe("Banana Pancakes", [
    { ingredientId: "banana", amount: 1, unit: "piece" },
    { ingredientId: "eggs", amount: 2, unit: "piece" },
    { ingredientId: "flour", amount: 100, unit: "g" },
    { ingredientId: "milk", amount: 100, unit: "ml" },
    { ingredientId: "baking-powder", amount: 5, unit: "g" },
  ], { id: "recipe-banana-pancakes", category: "Breakfast" }),

  // LUNCH

  createRecipe("Chicken Rice Bowl", [
    { ingredientId: "chicken-breast", amount: 150, unit: "g" },
    { ingredientId: "rice", amount: 100, unit: "g" },
    { ingredientId: "broccoli", amount: 100, unit: "g" },
    { ingredientId: "olive-oil", amount: 10, unit: "ml" },
    { ingredientId: "soy-sauce", amount: 15, unit: "ml" },
  ], { id: "recipe-chicken-rice", category: "Lunch" }),

  createRecipe("Tuna Pasta", [
    { ingredientId: "pasta", amount: 120, unit: "g" },
    { ingredientId: "canned-tuna", amount: 120, unit: "g" },
    { ingredientId: "tomato-sauce", amount: 150, unit: "g" },
    { ingredientId: "olive-oil", amount: 10, unit: "ml" },
    { ingredientId: "parmesan", amount: 15, unit: "g" },
  ], { id: "recipe-tuna-pasta", category: "Lunch" }),

  createRecipe("Chickpea Salad", [
    { ingredientId: "chickpeas", amount: 150, unit: "g" },
    { ingredientId: "tomato", amount: 100, unit: "g" },
    { ingredientId: "cucumber", amount: 100, unit: "g" },
    { ingredientId: "feta", amount: 40, unit: "g" },
    { ingredientId: "olive-oil", amount: 10, unit: "ml" },
    { ingredientId: "lemon", amount: 0.5, unit: "piece" },
  ], { id: "recipe-chickpea-salad", category: "Lunch" }),

  createRecipe("Turkey Sandwich", [
    { ingredientId: "bread", amount: 2, unit: "piece" },
    { ingredientId: "turkey-breast", amount: 100, unit: "g" },
    { ingredientId: "cheese", amount: 30, unit: "g" },
    { ingredientId: "lettuce", amount: 20, unit: "g" },
    { ingredientId: "tomato", amount: 50, unit: "g" },
  ], { id: "recipe-turkey-sandwich", category: "Lunch" }),

  // DINNER

  createRecipe("Salmon & Roasted Potatoes", [
    { ingredientId: "salmon", amount: 180, unit: "g" },
    { ingredientId: "potatoes", amount: 250, unit: "g" },
    { ingredientId: "broccoli", amount: 100, unit: "g" },
    { ingredientId: "olive-oil", amount: 15, unit: "ml" },
    { ingredientId: "lemon", amount: 0.5, unit: "piece" },
  ], { id: "recipe-salmon-potatoes", category: "Dinner" }),

  createRecipe("Spaghetti Bolognese", [
    { ingredientId: "pasta", amount: 120, unit: "g" },
    { ingredientId: "ground-beef", amount: 150, unit: "g" },
    { ingredientId: "tomato-sauce", amount: 150, unit: "g" },
    { ingredientId: "onion", amount: 50, unit: "g" },
    { ingredientId: "olive-oil", amount: 10, unit: "ml" },
    { ingredientId: "parmesan", amount: 15, unit: "g" },
  ], { id: "recipe-bolognese", category: "Dinner" }),

  createRecipe("Chicken Quesadillas", [
    { ingredientId: "chicken-breast", amount: 150, unit: "g" },
    { ingredientId: "tortilla", amount: 2, unit: "piece" },
    { ingredientId: "cheese", amount: 50, unit: "g" },
    { ingredientId: "bell-pepper", amount: 80, unit: "g" },
    { ingredientId: "onion", amount: 40, unit: "g" },
  ], { id: "recipe-chicken-quesadillas", category: "Dinner" }),

  createRecipe("Vegetable Fried Rice", [
    { ingredientId: "rice", amount: 100, unit: "g" },
    { ingredientId: "eggs", amount: 2, unit: "piece" },
    { ingredientId: "peas", amount: 50, unit: "g" },
    { ingredientId: "carrots", amount: 50, unit: "g" },
    { ingredientId: "soy-sauce", amount: 15, unit: "ml" },
    { ingredientId: "olive-oil", amount: 10, unit: "ml" },
  ], { id: "recipe-fried-rice", category: "Dinner" }),

  // SNACKS

  createRecipe("Peanut Butter Banana Toast", [
    { ingredientId: "bread", amount: 2, unit: "piece" },
    { ingredientId: "peanut-butter", amount: 30, unit: "g" },
    { ingredientId: "banana", amount: 1, unit: "piece" },
    { ingredientId: "honey", amount: 10, unit: "g" },
  ], { id: "recipe-banana-toast", category: "Snack" }),

  createRecipe("Protein Yogurt Bowl", [
    { ingredientId: "greek-yogurt", amount: 200, unit: "g" },
    { ingredientId: "protein-powder", amount: 30, unit: "g" },
    { ingredientId: "strawberries", amount: 100, unit: "g" },
    { ingredientId: "granola", amount: 30, unit: "g" },
  ], { id: "recipe-protein-yogurt", category: "Snack" }),

  // DESSERT

  createRecipe("Chocolate Mug Cake", [
    { ingredientId: "flour", amount: 40, unit: "g" },
    { ingredientId: "cocoa-powder", amount: 15, unit: "g" },
    { ingredientId: "sugar", amount: 25, unit: "g" },
    { ingredientId: "milk", amount: 50, unit: "ml" },
    { ingredientId: "butter", amount: 15, unit: "g" },
    { ingredientId: "baking-powder", amount: 3, unit: "g" },
  ], { id: "recipe-chocolate-mug-cake", category: "Dessert" }),
];

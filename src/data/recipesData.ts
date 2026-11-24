import { createQuantity } from "../../data/recipe/quantity";
import { createRecipe, Recipe } from "../../data/recipe/recipe";
import { LITERAL_UNIT, MEAL_TYPE, METRIC_UNIT, RECIPE_CATEGORY } from "../../data/util/types";


export const recipes: Recipe[] = [
  // BREAKFAST

  createRecipe("Overnight Oats", [
    { ingredientId: "oats", quantity: createQuantity(80, METRIC_UNIT.GRAM) },
    { ingredientId: "milk", quantity: createQuantity(200, METRIC_UNIT.MILILITER) },
    { ingredientId: "banana", quantity: createQuantity(1, LITERAL_UNIT.PIECE) },
    { ingredientId: "peanut-butter", quantity: createQuantity(20, METRIC_UNIT.GRAM) },
    { ingredientId: "honey", quantity: createQuantity(0, METRIC_UNIT.GRAM) },
  ], { id: "recipe-overnight-oats", category: RECIPE_CATEGORY.BREAKFAST }),

  createRecipe("Scrambled Eggs & Toast", [
    { ingredientId: "eggs", quantity: createQuantity(3, LITERAL_UNIT.PIECE) },
    { ingredientId: "bread", quantity: createQuantity(2, LITERAL_UNIT.PIECE) },
    { ingredientId: "butter", quantity: createQuantity(10, METRIC_UNIT.GRAM) },
    { ingredientId: "milk", quantity: createQuantity(30, METRIC_UNIT.MILILITER) },
  ], { id: "recipe-scrambled-eggs", category: RECIPE_CATEGORY.BREAKFAST }),

  createRecipe("Greek Yogurt Bowl", [
    { ingredientId: "greek-yogurt", quantity: createQuantity( 200,  METRIC_UNIT.GRAM) },
    { ingredientId: "granola", quantity: createQuantity( 50,  METRIC_UNIT.GRAM) },
    { ingredientId: "blueberries", quantity: createQuantity( 80,  METRIC_UNIT.GRAM) },
    { ingredientId: "honey", quantity: createQuantity( 15,  METRIC_UNIT.GRAM) },
    { ingredientId: "banana", quantity: createQuantity( 1,  LITERAL_UNIT.PIECE) },
  ], { id: "recipe-yogurt-bowl", category: RECIPE_CATEGORY.BREAKFAST }),

  createRecipe("Banana Pancakes", [
    { ingredientId: "banana",  quantity: createQuantity(1,  LITERAL_UNIT.PIECE) },
    { ingredientId: "eggs",  quantity: createQuantity(2,  LITERAL_UNIT.PIECE) },
    { ingredientId: "flour",  quantity: createQuantity(100,  METRIC_UNIT.GRAM) },
    { ingredientId: "milk",  quantity: createQuantity(100,  METRIC_UNIT.MILILITER) },
    { ingredientId: "baking-powder",  quantity: createQuantity(5,  METRIC_UNIT.GRAM) },
  ], { id: "recipe-banana-pancakes", category: RECIPE_CATEGORY.BREAKFAST }),

  // LUNCH

  createRecipe("Chicken Rice Bowl", [
    { ingredientId: "chicken-breast",  quantity: createQuantity(150,  METRIC_UNIT.GRAM )},
    { ingredientId: "rice",  quantity: createQuantity(100,  METRIC_UNIT.GRAM )},
    { ingredientId: "broccoli",  quantity: createQuantity(100,  METRIC_UNIT.GRAM )},
    { ingredientId: "olive-oil",  quantity: createQuantity(10,  METRIC_UNIT.MILILITER )},
    { ingredientId: "soy-sauce",  quantity: createQuantity(15,  METRIC_UNIT.MILILITER )},
  ], { id: "recipe-chicken-rice", category: RECIPE_CATEGORY.LUNCH }),

  createRecipe("Tuna Pasta", [
    { ingredientId: "pasta",  quantity: createQuantity(120,  METRIC_UNIT.GRAM )},
    { ingredientId: "canned-tuna",  quantity: createQuantity(120,  METRIC_UNIT.GRAM )},
    { ingredientId: "tomato-sauce",  quantity: createQuantity(150,  METRIC_UNIT.GRAM )},
    { ingredientId: "olive-oil",  quantity: createQuantity(10,  METRIC_UNIT.MILILITER )},
    { ingredientId: "parmesan",  quantity: createQuantity(15,  METRIC_UNIT.GRAM )},
  ], { id: "recipe-tuna-pasta", category: RECIPE_CATEGORY.LUNCH }),

  createRecipe("Chickpea Salad", [
    { ingredientId: "chickpeas",  quantity: createQuantity(150,  METRIC_UNIT.GRAM )},
    { ingredientId: "tomato",  quantity: createQuantity(100,  METRIC_UNIT.GRAM )},
    { ingredientId: "cucumber",  quantity: createQuantity(100,  METRIC_UNIT.GRAM )},
    { ingredientId: "feta",  quantity: createQuantity(40,  METRIC_UNIT.GRAM )},
    { ingredientId: "olive-oil",  quantity: createQuantity(10,  METRIC_UNIT.MILILITER )},
    { ingredientId: "lemon",  quantity: createQuantity(0.5,  LITERAL_UNIT.PIECE )},
  ], { id: "recipe-chickpea-salad", category: RECIPE_CATEGORY.LUNCH }),

  createRecipe("Turkey Sandwich", [
    { ingredientId: "bread",  quantity: createQuantity(2,  LITERAL_UNIT.PIECE )},
    { ingredientId: "turkey-breast",  quantity: createQuantity(100,  METRIC_UNIT.GRAM )},
    { ingredientId: "cheese",  quantity: createQuantity(30,  METRIC_UNIT.GRAM )},
    { ingredientId: "lettuce",  quantity: createQuantity(20,  METRIC_UNIT.GRAM )},
    { ingredientId: "tomato",  quantity: createQuantity(50,  METRIC_UNIT.GRAM )},
  ], { id: "recipe-turkey-sandwich", category: RECIPE_CATEGORY.LUNCH }),

  // DINNER

  createRecipe("Salmon & Roasted Potatoes", [
    { ingredientId: "salmon", quantity: createQuantity(180,  METRIC_UNIT.GRAM)},
    { ingredientId: "potatoes",  quantity: createQuantity(250,  METRIC_UNIT.GRAM)},
    { ingredientId: "broccoli",  quantity: createQuantity(100,  METRIC_UNIT.GRAM )},
    { ingredientId: "olive-oil",  quantity: createQuantity(15,  METRIC_UNIT.MILILITER) },
    { ingredientId: "lemon",  quantity: createQuantity(0.5,  LITERAL_UNIT.PIECE)},
  ], { id: "recipe-salmon-potatoes", category: RECIPE_CATEGORY.DINNER }),

  createRecipe("Spaghetti Bolognese", [
    { ingredientId: "pasta",  quantity: createQuantity(120,  METRIC_UNIT.GRAM )},
    { ingredientId: "ground-beef",  quantity: createQuantity(150,  METRIC_UNIT.GRAM) },
    { ingredientId: "tomato-sauce",  quantity: createQuantity(150,  METRIC_UNIT.GRAM) },
    { ingredientId: "onion",  quantity: createQuantity(50,  METRIC_UNIT.GRAM) },
    { ingredientId: "olive-oil",  quantity: createQuantity(10,  METRIC_UNIT.MILILITER )},
    { ingredientId: "parmesan",  quantity: createQuantity(15,  METRIC_UNIT.GRAM )},
  ], { id: "recipe-bolognese", category: RECIPE_CATEGORY.DINNER }),

  createRecipe("Chicken Quesadillas", [
    { ingredientId: "chicken-breast",  quantity: createQuantity(150,  METRIC_UNIT.GRAM )},
    { ingredientId: "tortilla",  quantity: createQuantity(2,  LITERAL_UNIT.PIECE )},
    { ingredientId: "cheese",  quantity: createQuantity(50,  METRIC_UNIT.GRAM )},
    { ingredientId: "bell-pepper",  quantity: createQuantity(80,  METRIC_UNIT.GRAM) },
    { ingredientId: "onion",  quantity: createQuantity(40,  METRIC_UNIT.GRAM )},
  ], { id: "recipe-chicken-quesadillas", category: RECIPE_CATEGORY.DINNER }),

  createRecipe("Vegetable Fried Rice", [
    { ingredientId: "rice",  quantity: createQuantity(100,  METRIC_UNIT.GRAM )},
    { ingredientId: "eggs",  quantity: createQuantity(2,  LITERAL_UNIT.PIECE )},
    { ingredientId: "peas",  quantity: createQuantity(50,  METRIC_UNIT.GRAM) },
    { ingredientId: "carrots",  quantity: createQuantity(50,  METRIC_UNIT.GRAM )},
    { ingredientId: "soy-sauce",  quantity: createQuantity(15,  METRIC_UNIT.MILILITER )},
    { ingredientId: "olive-oil",  quantity: createQuantity(10,  METRIC_UNIT.MILILITER )},
  ], { id: "recipe-fried-rice", category: RECIPE_CATEGORY.DINNER }),

  // SNACKS

  createRecipe("Peanut Butter Banana Toast", [
    { ingredientId: "bread",  quantity: createQuantity(2,  LITERAL_UNIT.PIECE) },
    { ingredientId: "peanut-butter",  quantity: createQuantity(30,  METRIC_UNIT.GRAM) },
    { ingredientId: "banana",  quantity: createQuantity(1,  LITERAL_UNIT.PIECE )},
    { ingredientId: "honey",  quantity: createQuantity(10,  METRIC_UNIT.GRAM )},
  ], { id: "recipe-banana-toast", category: RECIPE_CATEGORY.SNACK }),

  createRecipe("Protein Yogurt Bowl", [
    { ingredientId: "greek-yogurt",  quantity: createQuantity(200,  METRIC_UNIT.GRAM )},
    { ingredientId: "protein-powder",  quantity: createQuantity(30,  METRIC_UNIT.GRAM )},
    { ingredientId: "strawberries",  quantity: createQuantity(100,  METRIC_UNIT.GRAM )},
    { ingredientId: "granola",  quantity: createQuantity(30,  METRIC_UNIT.GRAM )},
  ], { id: "recipe-protein-yogurt", category: RECIPE_CATEGORY.SNACK }),

  // DESSERT

  createRecipe("Chocolate Mug Cake", [
    { ingredientId: "flour",  quantity: createQuantity(40,  METRIC_UNIT.GRAM )},
    { ingredientId: "cocoa-powder",  quantity: createQuantity(15,  METRIC_UNIT.GRAM )},
    { ingredientId: "sugar",  quantity: createQuantity(25,  METRIC_UNIT.GRAM )},
    { ingredientId: "milk",  quantity: createQuantity(50,  METRIC_UNIT.MILILITER )},
    { ingredientId: "butter",  quantity: createQuantity(15,  METRIC_UNIT.GRAM )},
    { ingredientId: "baking-powder",  quantity: createQuantity(3,  METRIC_UNIT.GRAM )},
  ], { id: "recipe-chocolate-mug-cake", category: RECIPE_CATEGORY.DESSERT }),
];

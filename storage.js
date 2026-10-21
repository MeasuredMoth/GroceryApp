// This file stores the .json files for the app.

import { Ingredient } from "./ingredient"
import { Recipe } from "./recipe"

// import File and Paths from expo
import { File, Paths } from 'expo-file-system';

//Recipes
// make recipes.json file
const recipeFile = new File(Paths.document, 'recipes.json');

// Load receipe
export function loadRecipe() {
  if (!recipeFile.exists) {
    return []; // return an empty array if the file doesn't exist
  }

  return JSON.parse(recipeFile.textSync()); // turns the file into javascript
}

export function saveRecipe(item) {
  const recipes = loadRecipe(); // get recipe data
  recipes.push(JSON.parse(item.getJSON())); // push the recipes into the array  


  recipeFile.write(JSON.stringify(recipes, null, 2)); // write the recipe array in the recipeFile
}

//Ingredient
const ingredientFile = new File(Paths.document, 'ingredients.json');

export function saveIngredient(item) {
  const ingredients = loadIngredient();
  ingredients.push(JSON.parse(item.getJSON()));

  ingredientFile.write(JSON.stringify(ingredients, null, 2));
}


export function loadIngredient() {
  if (!ingredientFile.exists) {
    return [];
  }

  return JSON.parse(ingredientFile.textSync());
}

// I had chatGPT generate the code, then I changed pantryFile to recipeFile/ingredientFile and changed the name of the functions and json files.

//chatGPT code
/*
import { File, Paths } from 'expo-file-system';

// convert pantryFile to a .json file
const pantryFile = new File(Paths.document, 'pantry.json');

export function savePantry(items) {
  pantryFile.write(JSON.stringify(items, null, 2));
}

// Load pantry data
export function loadPantry() {
  if (!pantryFile.exists) {
    return []; // return an empty array if the file doesn't exist
  }

  return JSON.parse(pantryFile.textSync());
}
// chatGPT code ends here.
*/

//10/21 Changes:
 //This is my first project handling JSON file, so I used chatGPT.
// I changed the saveRecipe and saveIngredient functions. Previously, it overwrote the code into the JSON file. Now, it adds the array in the JSON file. Both functions was generated with chatGPT. 

/*
export function saveRecipe(item) {
  const recipes = loadRecipe();
  recipes.push(JSON.parse(item.getJSON()));

  recipeFile.write(JSON.stringify(recipes, null, 2));
}

export function saveIngredient(item) {
  const ingredients = loadIngredient();
  ingredients.push(JSON.parse(item.getJSON()));

  ingredientFile.write(JSON.stringify(ingredients, null, 2));
}
*/

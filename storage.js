// This file stores the .json files for the app.

import { Ingredient } from "./ingredient"
import { Recipe } from "./recipe"

// import File and Paths from expo
import { File, Paths } from 'expo-file-system';

//Recipes
// make recipes.json file
const recipeFile = new File(Paths.document, 'recipes.json');

export function saveRecipe(item) {
  recipeFile.write(item.getJSON()); // write the recipe in the recipeFile
}

// Load receipe
export function loadRecipe() {
  if (!recipeFile.exists) {
    return []; // return an empty array if the file doesn't exist
  }

  return JSON.parse(recipeFile.textSync()); // turns the file into javascript
}

//Ingredient
const ingredientFile = new File(Paths.document, 'ingredients.json');

export function saveIngredient(item) {
  ingredientFile.write(item.getJSON());
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



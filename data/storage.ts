// Saves recipes and ingredients as JSON files in the app's document folder.
//
// Exported functions:
// loadRecipe()             -> returns Recipe[]      -> reads every saved recipe from recipes.json
// saveRecipe(recipe)       -> returns nothing       -> adds the recipe, or replaces the saved one with the same id
// deleteRecipe(id)         -> returns nothing       -> removes the recipe with that id
// loadIngredient()         -> returns Ingredient[]  -> reads every saved ingredient from ingredients.json
// saveIngredient(item)     -> returns nothing       -> adds the ingredient, or replaces the saved one with the same id
// deleteIngredient(id)     -> returns nothing       -> removes the ingredient with that id

import { File, Paths } from "expo-file-system"; // file API from Expo SDK 58

import { INGREDIENT_CATEGORIES, Ingredient } from "./recipe/ingredient"; // ingredient type and its allowed categories
import type { PlanItem } from "./recipe/meal-plan"; // shape of one "amount + unit of ingredient" line
import type { Recipe, RecipeCategory } from "./recipe/recipe"; // recipe type and its category names
import { isUnit } from "./unit"; // checks a string is one of the known units

const RECIPE_CATEGORIES: readonly RecipeCategory[] = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"]; // every valid recipe category

const recipeFile = new File(Paths.document, "recipes.json"); // where recipes are saved
const ingredientFile = new File(Paths.document, "ingredients.json"); // where ingredients are saved

// Read a JSON array from a file; return [] if it's missing or unreadable
function readList(file: File): unknown[] {
  if (!file.exists) return []; // nothing saved yet
  try {
    const data: unknown = JSON.parse(file.textSync()); // read and parse the whole file
    return Array.isArray(data) ? data : []; // only accept an array
  } catch {
    return []; // corrupt file: treat as empty instead of crashing
  }
}

// Write a list to a file as pretty-printed JSON
function writeList(file: File, list: unknown[]): void {
  if (!file.exists) file.create(); // make the file on first save
  file.writeSync(JSON.stringify(list, null, 2)); // replace the file's contents
}

// True when the value is a non-null object we can read fields from
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null; // arrays pass too, fields are checked after
}

// True when the value is a non-empty string
function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== ""; // rejects "" and "   "
}

// Check a saved entry really is an Ingredient before handing it to the app
function isIngredient(value: unknown): value is Ingredient {
  if (!isObject(value)) return false; // must be an object
  const { id, name, allowedUnits, category } = value; // pull out the fields we need
  return (
    isText(id) && // has an id
    isText(name) && // has a name
    Array.isArray(allowedUnits) && // units is a list
    allowedUnits.length > 0 && // with at least one unit
    allowedUnits.every((u) => typeof u === "string" && isUnit(u)) && // and only known units
    typeof category === "string" && // category is text
    (INGREDIENT_CATEGORIES as readonly string[]).includes(category) // and one of the known categories
  );
}

// Check a saved entry is a valid PlanItem
function isPlanItem(value: unknown): value is PlanItem {
  if (!isObject(value)) return false; // must be an object
  const { ingredientId, amount, unit } = value; // pull out the fields we need
  return (
    isText(ingredientId) && // points at an ingredient
    typeof amount === "number" && // amount is a number
    Number.isFinite(amount) && // and a real one (no NaN / Infinity)
    amount > 0 && // and positive
    typeof unit === "string" && // unit is text
    isUnit(unit) // and a known unit
  );
}

// Check a saved entry really is a Recipe before handing it to the app
function isRecipe(value: unknown): value is Recipe {
  if (!isObject(value)) return false; // must be an object
  const { id, name, category, items } = value; // pull out the fields we need
  return (
    isText(id) && // has an id
    isText(name) && // has a name
    typeof category === "string" && // category is text
    (RECIPE_CATEGORIES as readonly string[]).includes(category) && // and one of the known categories
    Array.isArray(items) && // items is a list
    items.every(isPlanItem) // and every item is valid
  );
}

// Replace the entry with the same id, or add it to the end if there is none
function upsert<T extends { id: string }>(list: T[], entry: T): T[] {
  const index = list.findIndex((e) => e.id === entry.id); // look for an existing entry
  if (index === -1) return [...list, entry]; // new: append it
  return list.map((e, i) => (i === index ? entry : e)); // existing: swap it in
}

// Recipes
export function loadRecipe(): Recipe[] {
  return readList(recipeFile).filter(isRecipe); // keep only valid recipes
}

export function saveRecipe(recipe: Recipe): void {
  writeList(recipeFile, upsert(loadRecipe(), recipe)); // add or replace, then save
}

export function deleteRecipe(id: string): void {
  writeList(recipeFile, loadRecipe().filter((r) => r.id !== id)); // drop it, then save
}

// Ingredients
export function loadIngredient(): Ingredient[] {
  return readList(ingredientFile).filter(isIngredient); // keep only valid ingredients
}

export function saveIngredient(item: Ingredient): void {
  writeList(ingredientFile, upsert(loadIngredient(), item)); // add or replace, then save
}

export function deleteIngredient(id: string): void {
  writeList(ingredientFile, loadIngredient().filter((i) => i.id !== id)); // drop it, then save
}

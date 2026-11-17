// The app's saved data: ingredients, recipes, the meal plan, the pantry and the eaten meals.
// Everything is kept in one JSON file on the device and shared by every screen.
//
// Reading, inside a component (the screen refreshes by itself when the data changes):
//   const { plan, recipes } = useAppData();
//
// Changing (saved to the file straight away):
//   updatePlan((plan) => addMeal(plan, date, meal, "day"));
//   saveIngredient(createIngredient("Tofu", ["g", "kg"], "Proteins"));
//   deleteRecipe(recipe.id);

import { useSyncExternalStore } from "react";
import { File, Paths } from "expo-file-system";
import { AppData, removeById, setDone, upsertById } from "../../data/store/app-data";
import { DataStore, StorageBackend } from "../../data/store/data-store";
import { Ingredient } from "../../data/recipe/ingredient";
import { Plan } from "../../data/recipe/meal-plan";
import { PantryEntry } from "../../data/recipe/pantry";
import { Recipe } from "../../data/recipe/recipe";
import { ingredients as starterIngredients } from "../data/ingredientsData";
import { recipes as starterRecipes } from "../data/recipesData";
import { pantry as starterPantry } from "../data/pantryData";


// Created on use because the file system isn't available when rendering for web
function dataFile() {
  return new File(Paths.document, "grocery-data.json");
}

const fileBackend: StorageBackend = {
  read() {
    const file = dataFile();
    return file.exists ? file.textSync() : null;
  },
  write(text) {
    const file = dataFile();
    if (!file.exists) file.create();
    file.writeSync(text);
  },
};

// A new install starts with the starter ingredients and recipes, and an empty plan and pantry
export const appStore = new DataStore(fileBackend, {
  ingredients: starterIngredients,
  recipes: starterRecipes,
  pantry: starterPantry,
});

/** The saved data, for use inside a component. */
export function useAppData(): AppData {
  return useSyncExternalStore(appStore.subscribe, appStore.get, appStore.get);
}

/** Every plan function in meal-plan.ts returns a new Plan, so they can be passed straight in. */
export function updatePlan(change: (plan: Plan) => Plan) {
  appStore.update((data) => ({ plan: change(data.plan) }));
}

/** Ticks (or unticks) meals as eaten on that date. */
export function setMealsDone(date: Date, mealIds: string[], done: boolean) {
  appStore.update((data) => ({ done: setDone(data.done, date, mealIds, done) }));
}

// The save functions add the item, or replace the one with the same id.
// Deleting an ingredient or recipe leaves the plan alone: recipes are copied into meals when
// added, and a meal that still names a deleted ingredient is for the screens to handle.

export function saveIngredient(ingredient: Ingredient) {
  appStore.update((data) => ({ ingredients: upsertById(data.ingredients, ingredient) }));
}

export function deleteIngredient(id: string) {
  appStore.update((data) => ({ ingredients: removeById(data.ingredients, id) }));
}

export function saveRecipe(recipe: Recipe) {
  appStore.update((data) => ({ recipes: upsertById(data.recipes, recipe) }));
}

export function deleteRecipe(id: string) {
  appStore.update((data) => ({ recipes: removeById(data.recipes, id) }));
}

export function savePantryEntry(entry: PantryEntry) {
  appStore.update((data) => ({ pantry: upsertById(data.pantry, entry) }));
}

export function deletePantryEntry(id: string) {
  appStore.update((data) => ({ pantry: removeById(data.pantry, id) }));
}

// The app's saved data: ingredients, recipes, the meal plan, the pantry and the eaten meals.
// Everything is kept in one JSON file on the device and shared by every screen.
//
// Reading, inside a component (the screen refreshes by itself when the data changes):
//   const { plan, recipes } = useAppData();
//
// Changing (saved to the file straight away):
//   updatePlan((plan) => addMeal(plan, date, meal, "day"));
//   saveIngredient(createIngredient("Tofu", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.PROTEIN));
//   deleteRecipe(recipe.id);

import { useSyncExternalStore } from "react";
import { File, Paths } from "expo-file-system";
import {
  AppData,
  applyMealsDone,
  doneKey,
  removeById,
  upsertById,
} from "../../data/store/app-data";
import { DataStore, StorageBackend } from "../../data/store/data-store";
import { Ingredient } from "../../data/recipe/ingredient";
import { Plan } from "../../data/recipe/meal-plan";
import { mergeIntoPantry, PantryEntry } from "../../data/recipe/pantry";
import { Recipe } from "../../data/recipe/recipe";
import { Quantity } from "../../data/recipe/quantity";
import {
  addManualItem,
  canRevertTrip,
  changePack,
  finishTrip,
  revertTrip,
  generateShoppingList,
  setChecked,
  ShoppingList,
  SkippedLine,
} from "../../data/recipe/shopping-list";
import { toDateKey } from "../../data/util/util";
import { isQuantityAllowed } from "../../data/recipe/ingredient";
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

/**
 * Ticks (or unticks) meals as eaten on that date, and updates the pantry with it:
 * ticking takes the meal's ingredients out of the pantry, unticking puts them back.
 */
export function setMealsDone(date: Date, mealIds: string[], done: boolean) {
  appStore.update((data) => applyMealsDone(data, date, mealIds, done));
}

// The save functions add the item, or replace the one with the same id.
// Deleting an ingredient or recipe leaves the plan alone: recipes are copied into meals when
// added, and a meal that still names a deleted ingredient is for the screens to handle.

export function saveIngredient(ingredient: Ingredient) {
  appStore.update((data) => ({
    ingredients: upsertById(data.ingredients, ingredient),
  }));
}

export function deleteIngredient(id: string) {
  appStore.update((data) => ({
    ingredients: removeById(data.ingredients, id),
  }));
}

export function saveRecipe(recipe: Recipe) {
  appStore.update((data) => ({ recipes: upsertById(data.recipes, recipe) }));
}

export function deleteRecipe(id: string) {
  appStore.update((data) => ({ recipes: removeById(data.recipes, id) }));
}

/** Adds or edits a pantry entry. Same ingredient + same expiry date sums into one row (see mergeIntoPantry). */
export function savePantryEntry(entry: PantryEntry) {
  appStore.update((data) => ({ pantry: mergeIntoPantry(data.pantry, entry) }));
}

export function deletePantryEntry(id: string) {
  appStore.update((data) => ({ pantry: removeById(data.pantry, id) }));
}

/* ---------- Shopping list ---------- */

/** How many days the list covers until the user picks another number. */
export const DEFAULT_SHOPPING_DAYS = 7;

/**
 * Rebuilds the list from the meal plan and the pantry (check marks and manual items are kept).
 * Call it when the shopping tab opens and whenever the plan, pantry or done meals change.
 * Pass `days` to change how many days are covered. Only saves when the list really changed.
 * Returns the plan lines that couldn't be used, so the screen can tell the user.
 */
export function regenerateShoppingList(days?: number): SkippedLine[] {
  const data = appStore.get();
  const { list, skipped } = generateShoppingList({
    plan: data.plan,
    startDate: new Date(),
    days: days ?? data.shoppingList?.days ?? DEFAULT_SHOPPING_DAYS,
    ingredients: data.ingredients,
    pantry: data.pantry,
    history: data.purchaseHistory,
    isDone: (date, meal) => data.done[doneKey(date, meal.id)] === true,
    previous: data.shoppingList,
  });
  if (JSON.stringify(list) !== JSON.stringify(data.shoppingList)) {
    appStore.update(() => ({ shoppingList: list }));
  }
  return skipped;
}

/** Crosses an item off, or puts it back. */
export function toggleShoppingItem(id: string) {
  appStore.update((data) => {
    const item = data.shoppingList?.items.find((i) => i.id === id);
    return data.shoppingList && item
      ? { shoppingList: setChecked(data.shoppingList, id, !item.checked) }
      : {};
  });
}

const emptyList = (): ShoppingList => ({
  startDate: toDateKey(new Date()),
  days: DEFAULT_SHOPPING_DAYS,
  items: [],
});

/** Adds a free-text item ("toilet paper") that isn't an ingredient. It is just removed when the trip finishes. */
export function addShoppingItem(label: string) {
  const text = label.trim();
  if (text === "") return;
  appStore.update((data) => ({
    shoppingList: addManualItem(data.shoppingList ?? emptyList(), text),
  }));
}

/**
 * Adds an ingredient from the app's ingredient list, in the amount and unit the user chose.
 * It is grouped by the ingredient's aisle and goes into the pantry when the trip finishes.
 * Returns false if the unit isn't one the ingredient allows.
 */
export function addShoppingIngredient(
  ingredientId: string,
  quantity: Quantity,
): boolean {
  const ingredient = appStore
    .get()
    .ingredients.find((i) => i.id === ingredientId);
  if (!ingredient || !isQuantityAllowed(ingredient, quantity)) return false;
  appStore.update((data) => ({
    shoppingList: addManualItem(
      data.shoppingList ?? emptyList(),
      "",
      quantity,
      ingredientId,
    ),
  }));
  return true;
}

/** Only manual items can be removed. Generated ones come back, because the plan still needs them. */
export function removeShoppingItem(id: string) {
  appStore.update((data) =>
    data.shoppingList
      ? {
          shoppingList: {
            ...data.shoppingList,
            items: data.shoppingList.items.filter(
              (i) => i.id !== id || !i.manual,
            ),
          },
        }
      : {},
  );
}

/** The user bought a different pack size. Returns false if that size can't be used for the ingredient. */
export function changeShoppingPack(id: string, pack: Quantity): boolean {
  const data = appStore.get();
  const item = data.shoppingList?.items.find((i) => i.id === id);
  const ingredient = data.ingredients.find((i) => i.id === item?.ingredientId);
  if (!data.shoppingList || !item || !ingredient) return false;

  const changed = changePack(item, ingredient, pack);
  if (!changed) return false;
  appStore.update((d) => ({
    shoppingList: d.shoppingList && {
      ...d.shoppingList,
      items: d.shoppingList.items.map((i) => (i.id === id ? changed : i)),
    },
  }));
  return true;
}

/** Puts what was bought into the pantry, learns the pack sizes, keeps the unchecked items. Returns how many items went in. */
export function finishShoppingTrip(): number {
  const data = appStore.get();
  if (!data.shoppingList) return 0;
  const result = finishTrip(
    data.shoppingList,
    data.pantry,
    data.ingredients,
    data.purchaseHistory,
    new Date(),
  );
  appStore.update(() => ({
    pantry: result.pantry,
    purchaseHistory: result.history,
    shoppingList: result.list,
    lastTrip: result.trip, // remembered so it can be undone
  }));
  regenerateShoppingList(); // the items left over are recomputed against the fuller pantry
  return result.added;
}

/**
 * Undoes the last finished trip (see revertTrip). Returns false if there is none to undo
 * or it is too old (TRIP_UNDO_HOURS).
 */
export function undoShoppingTrip(): boolean {
  const data = appStore.get();
  if (!canRevertTrip(data.lastTrip)) return false;
  const result = revertTrip(
    data.lastTrip,
    data.pantry,
    data.ingredients,
    data.shoppingList,
  );
  appStore.update(() => ({
    pantry: result.pantry,
    purchaseHistory: result.history,
    shoppingList: result.list,
    lastTrip: null,
  }));
  regenerateShoppingList(); // brings the list in step with the plan again
  return true;
}

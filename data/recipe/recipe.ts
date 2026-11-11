import type { ImageSourcePropType } from "react-native";
import type { PlanItem } from "./meal-plan";
import { makeId } from "../util";

export type RecipeCategory =
  | "Breakfast"
  | "Lunch"
  | "Dinner"
  | "Snack"
  | "Dessert";

/**
 * A recipe is a shortcut: a saved list of ingredients with quantities.
 * Adding it to a meal COPIES the items (see recipeToItems), so editing the
 * recipe later never silently changes a plan the user already set up.
 */
export interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  items: PlanItem[];
  image?: ImageSourcePropType;
}

export interface RecipeOptions {
  category?: RecipeCategory;
  image?: ImageSourcePropType;
  id?: string;
}

export function createRecipe(
  name: string,
  items: PlanItem[] = [],
  options: RecipeOptions = {},
): Recipe {
  const trimmed = name.trim();
  if (trimmed === "") throw new Error("A recipe needs a name");
  return {
    id: options.id ?? makeId("recipe"),
    name: trimmed,
    category: options.category ?? "Dinner",
    items,
    image: options.image,
  };
}

/** Fresh copies of the recipe's items, ready to put into a Meal. */
export function recipeToItems(recipe: Recipe): PlanItem[] {
  return recipe.items.map((i) => ({ ...i }));
}

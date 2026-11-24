import type { ImageSourcePropType } from "react-native";
import type { PlanItem } from "./meal-plan";
import { RECIPE_CATEGORY } from "../util/types";
import { makeId } from "../util/util";


/**
 * A recipe is a shortcut: a saved list of ingredients with quantities.
 * Adding it to a meal COPIES the items (see recipeToItems), so editing the
 * recipe later never silently changes a plan the user already set up.
 */
export interface Recipe {
  id: string;
  name: string;
  category: RECIPE_CATEGORY;
  items: PlanItem[];
  image?: ImageSourcePropType;
}

export interface RecipeOptions {
  category?: RECIPE_CATEGORY;
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
    category: options.category ?? RECIPE_CATEGORY.DINNER,
    items,
    image: options.image,
  };
}

/** Fresh copies of the recipe's items, ready to put into a Meal. */
export function recipeToItems(recipe: Recipe): PlanItem[] {
  return recipe.items.map((i) => ({ ...i }));
}

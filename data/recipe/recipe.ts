import type { ImageSourcePropType } from "react-native";
import type { PlanItem } from "./meal-plan";
import { createQuantity } from "./quantity";
import { RECIPE_CATEGORY } from "../util/types";
import { makeId } from "../util/util";

/** The most servings a recipe can be made for, to keep the steppers sensible. */
export const MAX_SERVINGS = 50;

/**
 * A recipe is a shortcut: a saved list of ingredients with quantities.
 * Adding it to a meal COPIES the items (see recipeToItems), so editing the
 * recipe later never silently changes a plan the user already set up.
 */
export interface Recipe {
  id: string;
  name: string;
  category: RECIPE_CATEGORY;
  /** The item amounts are for this many servings. */
  servings: number;
  items: PlanItem[];
  image?: ImageSourcePropType;
}

export interface RecipeOptions {
  category?: RECIPE_CATEGORY;
  servings?: number;
  image?: ImageSourcePropType;
  id?: string;
}

/** A whole number of servings between 1 and MAX_SERVINGS. */
export function isValidServings(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= MAX_SERVINGS;
}

export function createRecipe(
  name: string,
  items: PlanItem[] = [],
  options: RecipeOptions = {},
): Recipe {
  const trimmed = name.trim();
  if (trimmed === "") throw new Error("A recipe needs a name");
  const servings = options.servings ?? 1;
  if (!isValidServings(servings))
    throw new Error(`Servings must be a whole number from 1 to ${MAX_SERVINGS}`);
  return {
    id: options.id ?? makeId("recipe"),
    name: trimmed,
    category: options.category ?? RECIPE_CATEGORY.DINNER,
    servings,
    items,
    image: options.image,
  };
}

/** Rounds to 2 decimals so scaled amounts read well: 33.3333 -> 33.33. */
const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Fresh copies of the recipe's items, ready to put into a Meal.
 * Pass `servings` to scale the amounts: a 2-serving recipe made for 3 gets every amount x1.5.
 */
export function recipeToItems(recipe: Recipe, servings: number = recipe.servings): PlanItem[] {
  if (!isValidServings(servings))
    throw new Error(`Servings must be a whole number from 1 to ${MAX_SERVINGS}`);
  const factor = servings / recipe.servings;
  return recipe.items.map((i) => ({
    ...i,
    quantity: createQuantity(round2(i.quantity.amount * factor), i.quantity.unit),
  }));
}

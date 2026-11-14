import { Quantity, Unit } from "../unit";
import { makeId } from "../util";

// Re-exported so existing imports of Unit / Quantity / parseQuantity from "./ingredient" keep working.
export * from "../unit";

export type IngredientCategory =
  "Proteins"
  | "Carbs"
  | "Vegetables"
  | "Dairy"
  | "Fruit"
  | "Other";
export const INGREDIENT_CATEGORIES: readonly IngredientCategory[] = [
   "Proteins",
  "Carbs",
  "Vegetables",
  "Dairy",
  "Fruit",
  "Other",
];

/**
 * An ingredient is only a name plus the units it can be stored/measured in.
 * No quantities here: those live in PlanItem, RecipeItem and PantryEntry.
 */
export interface Ingredient {
  id: string;
  name: string;
  allowedUnits: Unit[]; // e.g. eggs: ["piece"], oats: ["g", "kg"]
  category: IngredientCategory;
}

export function createIngredient(
  name: string,
  allowedUnits: Unit[],
  category: IngredientCategory = "Other",
  id: string = makeId("ing"),
): Ingredient {
  const trimmed = name.trim();
  if (trimmed === "") throw new Error("An ingredient needs a name");
  if (allowedUnits.length === 0) {
    throw new Error(`${trimmed} needs at least one allowed unit`);
  }
  return {
    id,
    name: trimmed,
    allowedUnits: Array.from(new Set(allowedUnits)),
    category,
  };
}

export function allowsUnit(ingredient: Ingredient, unit: Unit): boolean {
  return ingredient.allowedUnits.includes(unit);
}

/** True when the amount is positive and the ingredient can be measured in that unit. */
export function isQuantityAllowed(
  ingredient: Ingredient,
  q: Quantity,
): boolean {
  return (
    Number.isFinite(q.amount) && q.amount > 0 && allowsUnit(ingredient, q.unit)
  );
}

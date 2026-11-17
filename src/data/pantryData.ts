import { PantryEntry } from "../../data/recipe/pantry";

// Stand-in: appStore.ts imports this file but it wasn't committed on feature/pantryTab.
// If you have your own version locally, keep yours.
export const pantry: PantryEntry[] = [
  { id: "pantry-oats", ingredientId: "oats", amount: 500, unit: "g" },
  { id: "pantry-eggs", ingredientId: "eggs", amount: 4, unit: "piece" },
  { id: "pantry-milk", ingredientId: "milk", amount: 1, unit: "l", expiresOn: "2026-11-21" },
  { id: "pantry-broccoli", ingredientId: "broccoli", amount: 200, unit: "g", expiresOn: "2026-11-19" },
  { id: "pantry-pasta", ingredientId: "pasta", amount: 500, unit: "g" },
  { id: "pantry-rice", ingredientId: "rice", amount: 1, unit: "kg" },
];

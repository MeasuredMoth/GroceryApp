import { ingredients } from "./ingredientsData";
import { createPantryEntry, PantryEntry } from "../../data/recipe/pantry";
import { Unit } from "../../data/unit";
import { toDateKey } from "../../data/util";

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

type Sample = { id: string; amount: number; unit: Unit; expiresInDays?: number };

const SAMPLES: Sample[] = [
  { id: "salmon", amount: 300, unit: "g", expiresInDays: 2 },
  { id: "lettuce", amount: 160, unit: "g", expiresInDays: 1 },
  { id: "greek-yogurt", amount: 250, unit: "g", expiresInDays: 3 },
  { id: "rice", amount: 1200, unit: "g" },
  { id: "eggs", amount: 4, unit: "piece", expiresInDays: 10 },
  { id: "broccoli", amount: 200, unit: "g", expiresInDays: 5 },
  { id: "pasta", amount: 500, unit: "g" },
  { id: "milk", amount: 1, unit: "l", expiresInDays: 6 },
  { id: "banana", amount: 0, unit: "piece" },
];

export const pantry: PantryEntry[] = SAMPLES.flatMap((s) => {
  const ingredient = ingredients.find((i) => i.id === s.id);
  if (!ingredient) return [];
  return [
    createPantryEntry(
      ingredient,
      { amount: s.amount, unit: s.unit },
      s.expiresInDays !== undefined ? daysFromNow(s.expiresInDays) : undefined,
    ),
  ];
});

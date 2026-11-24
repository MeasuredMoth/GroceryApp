import { ingredients } from "./ingredientsData";
import { createPantryEntry, PantryEntry } from "../../data/recipe/pantry";;
import { createQuantity } from "../../data/recipe/quantity";
import { toDateKey } from "../../data/util/util";
import { IMPERIAL_UNITS, LITERAL_UNIT, METRIC_UNIT, UNITS } from "../../data/util/types";

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

type Sample = { id: string; amount: number; unit: UNITS; expiresInDays?: number };

const SAMPLES: Sample[] = [
  { id: "salmon", amount: 300, unit: METRIC_UNIT.GRAM, expiresInDays: 2 },
  { id: "lettuce", amount: 160, unit: METRIC_UNIT.GRAM, expiresInDays: 1 },
  { id: "greek-yogurt", amount: 250, unit: METRIC_UNIT.GRAM, expiresInDays: 3 },
  { id: "rice", amount: 1200, unit: METRIC_UNIT.GRAM },
  { id: "eggs", amount: 4, unit: LITERAL_UNIT.PIECE, expiresInDays: 10 },
  { id: "broccoli", amount: 200, unit: METRIC_UNIT.GRAM, expiresInDays: 5 },
  { id: "pasta", amount: 500, unit: METRIC_UNIT.GRAM },
  { id: "milk", amount: 1, unit: METRIC_UNIT.LITER, expiresInDays: 6 },
  { id: "banana", amount: 0, unit: LITERAL_UNIT.PIECE },
  { id: "pumpkin", amount: 4, unit: IMPERIAL_UNITS.POUND },
  
];

export const pantry: PantryEntry[] = SAMPLES.flatMap((s) => {
  const ingredient = ingredients.find((i) => i.id === s.id);
  if (!ingredient) return [];
  return [
    createPantryEntry(
      ingredient,
      createQuantity(s.amount, s.unit),
      s.expiresInDays !== undefined ? daysFromNow(s.expiresInDays) : undefined,
    ),
  ];
});

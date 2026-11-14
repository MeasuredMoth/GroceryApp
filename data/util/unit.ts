import { Quantity } from "data/base/quantity";
import { Systrace } from "react-native";

export enum MEASUREMENT_SYSTEMS {
    METRIC = "Metric",
    IMPERIAL = "Imperial",
    LITERAL = "Literal",
};

export enum UNIT_TYPE {
    WEIGHT = "Weight",
    LIQUID = "Liquid",
    LITERAL = "Literal",
};

export enum METRIC_UNITS {
    // Mass
    MILIGRAM = "mg",
    GRAM = "g",
    KILOGRAM = "kg",
    // Volume
    MILILITER = "ml",
    LITER = "l",
    KILOLITER = "kl",
};

export enum IMPERIAL_UNITS {
    CUP = "cup",
    TABLESPOON = "tablespoon",
    TEASPOON = "teaspoon",
};

export enum LITERAL_UNITS {
    PIECE = "piece",
    PINCH = "pinch",
};

export type UNITS = METRIC_UNITS | IMPERIAL_UNITS | LITERAL_UNITS

const validUnits: Record<MEASUREMENT_SYSTEMS, UNITS[]> = {
    [MEASUREMENT_SYSTEMS.METRIC]: Object.values(METRIC_UNITS),
    [MEASUREMENT_SYSTEMS.IMPERIAL]: Object.values(IMPERIAL_UNITS),
    [MEASUREMENT_SYSTEMS.LITERAL]: Object.values(LITERAL_UNITS),
};

/** Mass and volume convert within their kind. Count units only match themselves. */
export function canConvert(from: UNITS, to: UNITS): boolean {
  return (
      (Object.keys(METRIC_UNITS).includes(from) && Object.keys(METRIC_UNITS).includes(to)) &&
      (Object.keys(IMPERIAL_UNITS).includes(from) && Object.keys(IMPERIAL_UNITS).includes(to))
    )
};

/** Returns null when the units can't be converted (e.g. g -> ml, piece -> g). */
/*
Need to rework coverting values

export function convert(quantity: Quantity, to: UNITS): Quantity | null {
  if (!canConvert(quantity.unit, to)) return null;
  const amount = (quantity.amount * TO_BASE[q.unit]) / TO_BASE[to];
  return { amount: Number(amount.toFixed(4)), unit: to };
}
*/ 

/** Parses strings like "100 g", "1.5tbsp", "2 fl oz". Returns null if invalid. */
/* 
Do we need this? Not sure what situations we really want to go back and forth like this.

export function parseQuantity(input: string): Quantity | null {
  const match = input.trim().match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z ]+)$/);
  if (!match) return null;

  const amount = parseFloat(match[1]);
  const unit = getUnit(match[2].trim().toLowerCase());

  if (!Number.isFinite(amount) || amount <= 0) return null;
  return createQuantity(amount, system, unit);
}
*/

export function formatQuantity(quantity: Quantity): string { return `${quantity.amount} ${quantity.unit}`; }

export function isValidUnit(system: MEASUREMENT_SYSTEMS, unit: UNITS): boolean {  return validUnits[system].includes(unit); }
import { createQuantity, Quantity } from "../recipe/quantity";
import {
  IMPERIAL_UNITS,
  LITERAL_UNIT,
  MEASUREMENT_SYSTEM,
  MEASUREMENT_TYPE,
  METRIC_UNIT,
  UNIT_TYPE,
  UNITS,
} from "./types";

const GRAM_PER_OUNCE: number = 28.34952;

export type ConvertableUnits = IMPERIAL_UNITS | METRIC_UNIT;

export const UnitConversions: Record<ConvertableUnits, number> = {
  [METRIC_UNIT.KILOGRAM]: 1000,
  [METRIC_UNIT.GRAM]: 1,
  [METRIC_UNIT.MILLIGRAM]: 0.001,

  [METRIC_UNIT.KILOLITER]: 1000,
  [METRIC_UNIT.LITER]: 1,
  [METRIC_UNIT.MILILITER]: 0.001,

  // FIX: imperial values were inverted (cup was 1/8 oz) and on the wrong scale.
  // Each type has its own scale: mass in grams, volume in liters.
  // Mass and volume never convert into each other (that needs a density, per ingredient).
  [IMPERIAL_UNITS.OUNCE]: GRAM_PER_OUNCE, // mass, in grams
  [IMPERIAL_UNITS.CUP]: 0.236588, // volume, in liters
  [IMPERIAL_UNITS.TABLESPOON]: 0.0147868, // volume, in liters
  [IMPERIAL_UNITS.TEASPOON]: 0.00492892, // volume, in liters
  [IMPERIAL_UNITS.POUND]: 16 * GRAM_PER_OUNCE, // mass, in grams (a pound is 16 oz)
};

// FIX: cup/tbsp/tsp are volume only and oz is mass only (they were tagged as both).
export const ValidTypeUnits: Record<MEASUREMENT_TYPE, UNITS[]> = {
  [MEASUREMENT_TYPE.MASS]: [
    METRIC_UNIT.KILOGRAM,
    METRIC_UNIT.GRAM,
    METRIC_UNIT.MILLIGRAM,

    IMPERIAL_UNITS.OUNCE,
    IMPERIAL_UNITS.POUND,
  ],
  [MEASUREMENT_TYPE.VOLUME]: [
    METRIC_UNIT.KILOLITER,
    METRIC_UNIT.LITER,
    METRIC_UNIT.MILILITER,

    IMPERIAL_UNITS.CUP,
    IMPERIAL_UNITS.TABLESPOON,
    IMPERIAL_UNITS.TEASPOON,
  ],
  [MEASUREMENT_TYPE.COUNT]: [LITERAL_UNIT.PIECE, LITERAL_UNIT.PINCH],
};

export const MeasurementTypes: Record<UNITS, MEASUREMENT_TYPE[]> = {
  [METRIC_UNIT.KILOGRAM]: [MEASUREMENT_TYPE.MASS],
  [METRIC_UNIT.GRAM]: [MEASUREMENT_TYPE.MASS],
  [METRIC_UNIT.MILLIGRAM]: [MEASUREMENT_TYPE.MASS],

  [METRIC_UNIT.KILOLITER]: [MEASUREMENT_TYPE.VOLUME],
  [METRIC_UNIT.LITER]: [MEASUREMENT_TYPE.VOLUME],
  [METRIC_UNIT.MILILITER]: [MEASUREMENT_TYPE.VOLUME],

  [IMPERIAL_UNITS.CUP]: [MEASUREMENT_TYPE.VOLUME],
  [IMPERIAL_UNITS.OUNCE]: [MEASUREMENT_TYPE.MASS],
  [IMPERIAL_UNITS.TABLESPOON]: [MEASUREMENT_TYPE.VOLUME],
  [IMPERIAL_UNITS.TEASPOON]: [MEASUREMENT_TYPE.VOLUME],
  [IMPERIAL_UNITS.POUND]: [MEASUREMENT_TYPE.MASS],

  [LITERAL_UNIT.PIECE]: [MEASUREMENT_TYPE.COUNT],
  [LITERAL_UNIT.PINCH]: [MEASUREMENT_TYPE.COUNT],
};

export const DefaultUnit: Record<MEASUREMENT_TYPE, UNITS> = {
  [MEASUREMENT_TYPE.MASS]: METRIC_UNIT.GRAM,
  [MEASUREMENT_TYPE.VOLUME]: METRIC_UNIT.LITER,
  [MEASUREMENT_TYPE.COUNT]: LITERAL_UNIT.PIECE,
};

const validUnits: Record<MEASUREMENT_SYSTEM | string, UNITS[]> = {
  [MEASUREMENT_SYSTEM.METRIC]: Object.values(METRIC_UNIT),
  [MEASUREMENT_SYSTEM.IMPERIAL]: Object.values(IMPERIAL_UNITS),
  [MEASUREMENT_SYSTEM.LITERAL]: Object.values(LITERAL_UNIT),
};

export function systemIsConvertable(from: UNITS, to: UNITS): boolean {
  return (
    (validUnits[MEASUREMENT_SYSTEM.METRIC].includes(from) ||
      validUnits[MEASUREMENT_SYSTEM.IMPERIAL].includes(from)) &&
    (validUnits[MEASUREMENT_SYSTEM.METRIC].includes(to) ||
      validUnits[MEASUREMENT_SYSTEM.IMPERIAL].includes(to))
  );
}

export function isMeasureTypesConvertable(from: UNITS, to: UNITS): boolean {
  return (
    getMeasureTypeFromUnit(from).filter((key) =>
      getMeasureTypeFromUnit(to).includes(key),
    ).length > 0
  );
}

/** Mass and volume convert within their kind. Count units only match themselves. */
export function canConvert(from: UNITS, to: UNITS): boolean {
  // same unit always converts (piece -> piece), otherwise metric/imperial of the same type
  return (
    from === to ||
    (systemIsConvertable(from, to) && isMeasureTypesConvertable(from, to))
  );
}

export function parseQuantity(input: string): Quantity | null {
  const match = input.trim().match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z ]+)$/);
  if (!match) return null;

  const amount = parseFloat(match[1]);
  const unit = match[2].trim().toLowerCase();

  if (!Number.isFinite(amount) || amount <= 0) return null;
  return createQuantity(amount, unit as UNITS);
}

export function formatQuantity(quantity: Quantity): string {
  return `${quantity.amount} ${quantity.unit}`;
}

export function isValidUnit(system: MEASUREMENT_SYSTEM, unit: UNITS): boolean {
  return validUnits[system].includes(unit);
}

export function isUnit(unit: string): boolean {
  return (
    Object.values(METRIC_UNIT).includes(unit as METRIC_UNIT) ||
    Object.values(IMPERIAL_UNITS).includes(unit as IMPERIAL_UNITS) ||
    Object.values(LITERAL_UNIT).includes(unit as LITERAL_UNIT)
  );
}

export function getSystemFromUnit(unit: UNITS): MEASUREMENT_SYSTEM | null {
  let result = Object.values(MEASUREMENT_SYSTEM).filter((key) =>
    isValidUnit(key as MEASUREMENT_SYSTEM, unit),
  );
  return result.length > 0 ? (result[0] as MEASUREMENT_SYSTEM) : null;
}

export function getMeasureTypeFromUnit(unit: UNITS): MEASUREMENT_TYPE[] {
  return MeasurementTypes[unit];
}

export function convertUnit(
  from: ConvertableUnits,
  to: ConvertableUnits,
  amount: number,
): number {
  return (UnitConversions[from] / UnitConversions[to]) * amount;
}

/** Every unit the measurement types allow, without duplicates (cup is both mass and volume). */
export function getPossibleUnitsFromType(types: MEASUREMENT_TYPE[]): UNITS[] {
  const units = new Set<UNITS>();
  for (const type of types) ValidTypeUnits[type].forEach((u) => units.add(u));

  return [...units];
}

import { createQuantity, Quantity } from "../recipe/quantity";
import { IMPERIAL_UNITS, LITERAL_UNITS, MEASUREMENT_SYSTEMS, MEASUREMENT_TYPE, METRIC_UNITS, UNITS } from "./types";

const GRAM_PER_OUNCE: number = 28.34952;

type ConvertableUnits = IMPERIAL_UNITS | METRIC_UNITS;

export const UnitConversions: Record<ConvertableUnits, number> = {
    [METRIC_UNITS.KILOGRAM]: 1000,
    [METRIC_UNITS.GRAM]: 1,
    [METRIC_UNITS.MILIGRAM]: 0.001,
    
    [METRIC_UNITS.KILOLITER]: 1000,
    [METRIC_UNITS.LITER]: 1,
    [METRIC_UNITS.MILILITER]: 0.001,

    [IMPERIAL_UNITS.OUNCE]: 1 * GRAM_PER_OUNCE,
    [IMPERIAL_UNITS.CUP]: 1/8 * GRAM_PER_OUNCE,
    [IMPERIAL_UNITS.TABLESPOON]: 1/2 * GRAM_PER_OUNCE,
    [IMPERIAL_UNITS.TEASPOON]: 1/6 * GRAM_PER_OUNCE,
}

export const MeasurementTypes: Record<UNITS, MEASUREMENT_TYPE[]> = {
    [METRIC_UNITS.KILOGRAM]: [MEASUREMENT_TYPE.COUNT],
    [METRIC_UNITS.GRAM]: [MEASUREMENT_TYPE.MASS],
    [METRIC_UNITS.MILIGRAM]: [MEASUREMENT_TYPE.MASS],

    [METRIC_UNITS.KILOLITER]: [MEASUREMENT_TYPE.VOLUME],
    [METRIC_UNITS.LITER]: [MEASUREMENT_TYPE.VOLUME],
    [METRIC_UNITS.MILILITER]: [MEASUREMENT_TYPE.VOLUME],

    [IMPERIAL_UNITS.CUP]: [MEASUREMENT_TYPE.VOLUME, MEASUREMENT_TYPE.MASS],
    [IMPERIAL_UNITS.OUNCE]: [MEASUREMENT_TYPE.VOLUME, MEASUREMENT_TYPE.MASS],
    [IMPERIAL_UNITS.TABLESPOON]: [MEASUREMENT_TYPE.VOLUME, MEASUREMENT_TYPE.MASS],
    [IMPERIAL_UNITS.TEASPOON]: [MEASUREMENT_TYPE.VOLUME, MEASUREMENT_TYPE.MASS],

    [LITERAL_UNITS.PIECE]: [MEASUREMENT_TYPE.COUNT],
    [LITERAL_UNITS.PINCH]: [MEASUREMENT_TYPE.COUNT],
} 

const validUnits: Record<MEASUREMENT_SYSTEMS | string, UNITS[]> = {
    [MEASUREMENT_SYSTEMS.METRIC]: Object.values(METRIC_UNITS),
    [MEASUREMENT_SYSTEMS.IMPERIAL]: Object.values(IMPERIAL_UNITS),
    [MEASUREMENT_SYSTEMS.LITERAL]: Object.values(LITERAL_UNITS),
};

/** Mass and volume convert within their kind. Count units only match themselves. */
export function canConvert(from: UNITS, to: UNITS): boolean {
  return (
      (Object.keys(METRIC_UNITS).includes(from) && Object.keys(METRIC_UNITS).includes(to)) &&
      (Object.keys(IMPERIAL_UNITS).includes(from) && Object.keys(IMPERIAL_UNITS).includes(to)) &&
      (getMeasureTypeFromUnit(from) == getMeasureTypeFromUnit(to))
    )
};

export function parseQuantity(input: string): Quantity | null {
    const match = input.trim().match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z ]+)$/);
    if (!match) return null;

    const amount = parseFloat(match[1]);
    const unit = match[2].trim().toLowerCase();
    
    if (!Number.isFinite(amount) || amount <= 0) return null;
    return createQuantity(amount, unit as UNITS);
}

export function formatQuantity(quantity: Quantity): string { return `${quantity.amount} ${quantity.unit}`; }

export function isValidUnit(system: MEASUREMENT_SYSTEMS, unit: UNITS): boolean {  return validUnits[system].includes(unit); }

export function getSystemFromUnit(unit: UNITS): MEASUREMENT_SYSTEMS | null  {
    let result = Object.values(MEASUREMENT_SYSTEMS).filter(key => isValidUnit(key as MEASUREMENT_SYSTEMS, unit))
    return  result.length > 0 ? result[0] as MEASUREMENT_SYSTEMS : null;
}

export function getMeasureTypeFromUnit(unit: UNITS): MEASUREMENT_TYPE[] {
    return MeasurementTypes[unit];
}

export function convertUnit(from: ConvertableUnits, to: ConvertableUnits, amount: number): number {
    return (UnitConversions[from] / UnitConversions[to]) * amount;
}
import { createQuantity, Quantity } from "data/base/quantity";
import { METRIC_UNITS, MEASUREMENT_SYSTEMS, LITERAL_UNITS, UNITS, IMPERIAL_UNITS } from "./types";

const GRAM_PER_OUNCE: number = 28.34952;

export const MetricConversions: Record<METRIC_UNITS, number> = {
    [METRIC_UNITS.KILOGRAM]: 1000,
    [METRIC_UNITS.GRAM]: 1,
    [METRIC_UNITS.MILIGRAM]: 0.001,

    [METRIC_UNITS.KILOLITER]: 1000,
    [METRIC_UNITS.LITER]: 1,
    [METRIC_UNITS.MILILITER]: 0.001,
}

// We do everthing in reference to ounces for simplicity
export const ImperialConversions: Record<IMPERIAL_UNITS, number> = {
    // Thes are all using the US imperial system, which is not 1:1 with the actual Imperial system. Idk either.
    [IMPERIAL_UNITS.OUNCE]: 1,
    [IMPERIAL_UNITS.CUP]: 1/8,
    [IMPERIAL_UNITS.TABLESPOON]: 1/2,
    [IMPERIAL_UNITS.TEASPOON]: 1/6,
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
      (Object.keys(IMPERIAL_UNITS).includes(from) && Object.keys(IMPERIAL_UNITS).includes(to))
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

export function convertBetweenMetric(from: METRIC_UNITS, to: METRIC_UNITS, amount: number): number {
    return (MetricConversions[from] / MetricConversions[to]) * amount;
}

export function convertBetweenImperial(from: IMPERIAL_UNITS, to: IMPERIAL_UNITS, amount: number): number {
    return (ImperialConversions[from] / ImperialConversions[to]) * amount;
}

export function convertMetricToImperial(from: METRIC_UNITS, to: IMPERIAL_UNITS, amount: number): number {
    let ounces = convertBetweenMetric(from, METRIC_UNITS.GRAM, amount) / GRAM_PER_OUNCE;
    return convertBetweenImperial(IMPERIAL_UNITS.OUNCE, to, ounces);
}

export function convertImperialToMetric(from: IMPERIAL_UNITS, to: METRIC_UNITS, amount: number): number {
    let grams = convertBetweenImperial(from, IMPERIAL_UNITS.OUNCE, amount) * GRAM_PER_OUNCE;
    return convertBetweenMetric(METRIC_UNITS.GRAM, to, grams);
}
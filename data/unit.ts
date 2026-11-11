export const UNITS = [
  // metric
  "g",
  "kg",
  "ml",
  "l",
  // imperial
  "oz",
  "lb",
  "fl oz",
  "cup",
  // kitchen / literal
  "tsp",
  "tbsp",
  "pinch",
  "piece",
] as const;

export type Unit = (typeof UNITS)[number];

/** What a unit measures. This is what makes "3 ml of eggs" detectable. */
export type UnitKind = "mass" | "volume" | "count";

export const UNIT_KIND: Record<Unit, UnitKind> = {
  g: "mass",
  kg: "mass",
  oz: "mass",
  lb: "mass",
  ml: "volume",
  l: "volume",
  "fl oz": "volume",
  cup: "volume",
  tsp: "volume",
  tbsp: "volume",
  pinch: "count",
  piece: "count",
};

export type UnitSystem = "metric" | "imperial" | "literal";

export const UNIT_SYSTEM: Record<Unit, UnitSystem> = {
  g: "metric",
  kg: "metric",
  ml: "metric",
  l: "metric",
  oz: "imperial",
  lb: "imperial",
  "fl oz": "imperial",
  cup: "imperial",
  tsp: "literal",
  tbsp: "literal",
  pinch: "literal",
  piece: "literal",
};

export interface Quantity {
  amount: number;
  unit: Unit;
}

/** Factor to the base unit of the kind: grams for mass, millilitres for volume. */
const TO_BASE: Record<Unit, number> = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
  ml: 1,
  l: 1000,
  "fl oz": 29.5735,
  cup: 236.588,
  tsp: 4.92892,
  tbsp: 14.7868,
  pinch: 1,
  piece: 1,
};

export function isUnit(value: string): value is Unit {
  return (UNITS as readonly string[]).includes(value);
}

/** Mass and volume convert within their kind. Count units only match themselves. */
export function canConvert(from: Unit, to: Unit): boolean {
  if (from === to) return true;
  const kind = UNIT_KIND[from];
  return kind !== "count" && kind === UNIT_KIND[to];
}

/** Returns null when the units can't be converted (e.g. g -> ml, piece -> g). */
export function convert(q: Quantity, to: Unit): Quantity | null {
  if (!canConvert(q.unit, to)) return null;
  const amount = (q.amount * TO_BASE[q.unit]) / TO_BASE[to];
  return { amount: Number(amount.toFixed(4)), unit: to };
}

/** Parses strings like "100 g", "1.5tbsp", "2 fl oz". Returns null if invalid. */
export function parseQuantity(input: string): Quantity | null {
  const match = input.trim().match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z ]+)$/);
  if (!match) return null;

  const amount = parseFloat(match[1]);
  const unit = match[2].trim().toLowerCase();

  if (!isUnit(unit) || !Number.isFinite(amount) || amount <= 0) return null;
  return { amount, unit };
}

export function formatQuantity(q: Quantity): string {
  return `${q.amount} ${q.unit}`;
}

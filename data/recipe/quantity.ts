import {
  IMPERIAL_UNITS,
  LITERAL_UNIT,
  MEASUREMENT_SYSTEM,
  METRIC_UNIT,
  UNITS,
} from "../util/types";
import {
  getSystemFromUnit,
  convertUnit,
  MeasurementTypes,
  getMeasureTypeFromUnit,
  canConvert,
  isMeasureTypesConvertable,
} from "../util/unit";

export abstract class Quantity {
  abstract amount: number;
  abstract system: MEASUREMENT_SYSTEM;
  abstract unit: UNITS;

  abstract convertToUnit(unit: UNITS): Quantity | null;
}

export class MetricQuantity implements Quantity {
  amount = 0;
  system = MEASUREMENT_SYSTEM.METRIC;
  unit = METRIC_UNIT.GRAM;
  constructor(amount: number, unit: METRIC_UNIT) {
    this.amount = amount;
    this.unit = unit;
  }

  convertToUnit(unit: UNITS): Quantity {
    if (!canConvert(unit, this.unit))
      throw new Error(`Cannot convert ${this.unit} to ${unit}.`);

    let unitSystem = getSystemFromUnit(unit);
    let quantityResult: Quantity | null = null;

    if (unitSystem == MEASUREMENT_SYSTEM.METRIC)
      quantityResult = this.convertToMetric(unit as METRIC_UNIT);
    if (unitSystem == MEASUREMENT_SYSTEM.IMPERIAL)
      quantityResult = this.convertToImperial(unit as IMPERIAL_UNITS);
    if (unitSystem == MEASUREMENT_SYSTEM.LITERAL)
      throw new Error(`Cannot convert metric unit system to type literal.`);

    if (!quantityResult)
      throw new Error(
        `Could not create coverted quantity. ${this.unit} to ${unit}.`,
      );

    return quantityResult;
  }

  convertToMetric(unit: METRIC_UNIT): MetricQuantity {
    return createQuantity(
      convertUnit(this.unit, unit, this.amount),
      unit,
    ) as MetricQuantity;
  }

  convertToImperial(unit: IMPERIAL_UNITS): ImperialQuantity {
    return createQuantity(
      convertUnit(this.unit, unit, this.amount),
      unit,
    ) as ImperialQuantity;
  }
}

export class ImperialQuantity implements Quantity {
  amount = 0;
  system = MEASUREMENT_SYSTEM.IMPERIAL;
  unit = IMPERIAL_UNITS.CUP;
  constructor(amount: number, unit: IMPERIAL_UNITS) {
    this.amount = amount;
    this.unit = unit;
  }

  convertToUnit(unit: UNITS): Quantity {
    if (!canConvert(unit, this.unit))
      throw new Error(`Cannot convert ${this.unit} to ${unit}.`);

    let unitSystem = getSystemFromUnit(unit);
    let quantityResult: Quantity | null = null;

    if (unitSystem == MEASUREMENT_SYSTEM.METRIC)
      quantityResult = this.convertToMetric(unit as METRIC_UNIT);
    if (unitSystem == MEASUREMENT_SYSTEM.IMPERIAL)
      quantityResult = this.convertToImperial(unit as IMPERIAL_UNITS);
    if (unitSystem == MEASUREMENT_SYSTEM.LITERAL)
      throw new Error(`Cannot convert metric unit system to type literal.`);

    if (!quantityResult)
      throw new Error(
        `Could not create coverted quantity. ${this.unit} to ${unit}.`,
      );

    return quantityResult;
  }

  convertToMetric(unit: METRIC_UNIT): MetricQuantity {
    return createQuantity(
      convertUnit(this.unit, unit, this.amount),
      unit,
    ) as MetricQuantity;
  }

  convertToImperial(unit: IMPERIAL_UNITS): ImperialQuantity {
    return createQuantity(
      convertUnit(this.unit, unit, this.amount),
      unit,
    ) as ImperialQuantity;
  }
}

export class LiteralQuantity implements Quantity {
  amount = 0;
  system = MEASUREMENT_SYSTEM.LITERAL;
  unit = LITERAL_UNIT.PIECE;
  constructor(amount: number, unit: LITERAL_UNIT) {
    this.amount = amount;
    this.unit = unit;
  }

  convertToUnit(unit: UNITS): Quantity {
    let unitSystem = getSystemFromUnit(unit);
    let quantityResult: Quantity | null = null;

    if (unitSystem != MEASUREMENT_SYSTEM.LITERAL)
      throw new Error(`Cannot convert ${this.unit} to ${unit}.`);

    // FIX: canConvert, so piece <-> pinch is refused (it used to convert 1:1)
    if (!canConvert(unit, this.unit))
      throw new Error(
        `Cannot convert between ${unit} and ${this.unit}, wrong types`,
      );

    quantityResult = createQuantity(this.amount, unit);

    if (!quantityResult)
      throw new Error(
        `Could not create converted quantity. ${this.unit} to ${unit}.`,
      );

    return quantityResult;
  }
}

type MakeQuantity = (amount: number, unit: any) => Quantity;

const systemToQuantity: Record<MEASUREMENT_SYSTEM, MakeQuantity> = {
  [MEASUREMENT_SYSTEM.METRIC]: (amount: number, unit: METRIC_UNIT) =>
    new MetricQuantity(amount, unit),
  [MEASUREMENT_SYSTEM.IMPERIAL]: (amount: number, unit: IMPERIAL_UNITS) =>
    new ImperialQuantity(amount, unit),
  [MEASUREMENT_SYSTEM.LITERAL]: (amount: number, unit: LITERAL_UNIT) =>
    new LiteralQuantity(amount, unit),
};

export function createQuantity(amount: number, unit: UNITS): Quantity {
  if (!Number.isFinite(amount))
    throw new Error(`Quantity needs a finite quantity. Got ${amount}.`);
  if (amount < 0) throw new Error(`Quantity cannot have negative amount.`);
  let system = getSystemFromUnit(unit);
  if (!system) throw new Error(`Couldn't get system from unit: ${unit}.`);

  return systemToQuantity[system](amount, unit);
}

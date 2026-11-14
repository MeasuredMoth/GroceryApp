import { IMPERIAL_UNITS, isValidUnit, LITERAL_UNITS, MEASUREMENT_SYSTEMS, METRIC_UNITS, UNITS } from "data/util/unit";

export abstract class Quantity {
    abstract amount: number;
    abstract system: MEASUREMENT_SYSTEMS;
    abstract unit: UNITS;
}

export class MetricQuantity implements Quantity {
    amount = 0
    system = MEASUREMENT_SYSTEMS.METRIC
    unit = METRIC_UNITS.GRAM
    constructor(
        amount: number,
        unit: METRIC_UNITS
    ) {
        this.amount = amount
        this.unit = unit
    }
}

export class ImperialQuantity implements Quantity{
    amount = 0
    system = MEASUREMENT_SYSTEMS.IMPERIAL
    unit = IMPERIAL_UNITS.CUP
    constructor(
        amount: number,
        unit: IMPERIAL_UNITS,
    ) {
        this.amount = amount
        this.unit = unit
    }
}

export class LiteralQuantity implements Quantity{
    amount = 0
    system = MEASUREMENT_SYSTEMS.LITERAL
    unit = LITERAL_UNITS.PIECE
    constructor(
        amount: number,
        unit: LITERAL_UNITS,
    ) {
        this.amount = amount
        this.unit = unit
    }
}

type MakeQuantity = (amount: number, unit: any) => Quantity;

const systemToQuantity: Record<MEASUREMENT_SYSTEMS, MakeQuantity > = {
    [MEASUREMENT_SYSTEMS.METRIC]: (amount: number, unit: METRIC_UNITS) => new MetricQuantity(amount, unit),
    [MEASUREMENT_SYSTEMS.IMPERIAL]: (amount: number, unit: IMPERIAL_UNITS) => new ImperialQuantity(amount, unit),
    [MEASUREMENT_SYSTEMS.LITERAL]: (amount: number, unit: LITERAL_UNITS) => new LiteralQuantity(amount, unit),
}

export function createQuantity(
    amount: number,
    system: MEASUREMENT_SYSTEMS,
    unit: UNITS,
): Quantity {
    if (!Number.isFinite(amount))
        throw new Error(`Quantity needs a finite quantity. Got ${amount}.`);
    if (amount <= 0)
        throw new Error(`Quantity cannot have negative/none amount.`);
    if (!isValidUnit(system, unit))
        throw new Error(`Quantity's unit needs to stay within system. Got system: ${system} unit: ${unit}.`);

    return systemToQuantity[system](amount, unit);
}


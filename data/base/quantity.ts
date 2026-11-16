import { convertBetweenImperial, convertBetweenMetric, convertImperialToMetric, convertMetricToImperial, getSystemFromUnit, IMPERIAL_UNITS, isValidUnit, LITERAL_UNITS, MEASUREMENT_SYSTEMS, METRIC_UNITS, MetricConversions, UNITS } from "data/util/unit";

export abstract class Quantity {
    abstract amount: number;
    abstract system: MEASUREMENT_SYSTEMS;
    abstract unit: UNITS;

    abstract convertToUnit(unit: UNITS): Quantity | null;
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

    convertToUnit(unit: UNITS): Quantity {
        let unitSystem = getSystemFromUnit(unit);
        let quantityResult: Quantity | null = null;

        if (unitSystem == MEASUREMENT_SYSTEMS.METRIC)
            quantityResult = this.convertToMetric(unit as METRIC_UNITS);
        if (unitSystem == MEASUREMENT_SYSTEMS.IMPERIAL)
            quantityResult = this.convertToImperial(unit as IMPERIAL_UNITS);
        if (unitSystem == MEASUREMENT_SYSTEMS.LITERAL)
            throw new Error(`Cannot convert metric unit system to type literal.`);
        
        if (!quantityResult)
            throw new Error(`Could not create coverted quantity. ${this.unit} to ${unit}.`);

        return quantityResult
    }

    convertToMetric(unit: METRIC_UNITS): MetricQuantity{
        return createQuantity(
            convertBetweenMetric(this.unit, unit, this.amount),
            unit,
        ) as MetricQuantity;
    } 

    convertToImperial(unit: IMPERIAL_UNITS): ImperialQuantity {
        return createQuantity(
            convertMetricToImperial(this.unit, unit, this.amount),
            unit
        ) as ImperialQuantity;
    }
}

export class ImperialQuantity implements Quantity {
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

    convertToUnit(unit: UNITS): Quantity {
        let unitSystem = getSystemFromUnit(unit);
        let quantityResult: Quantity | null = null;

        if (unitSystem == MEASUREMENT_SYSTEMS.METRIC)
            quantityResult = this.convertToMetric(unit as METRIC_UNITS);
        if (unitSystem == MEASUREMENT_SYSTEMS.IMPERIAL)
            quantityResult = this.convertToImperial(unit as IMPERIAL_UNITS);
        if (unitSystem == MEASUREMENT_SYSTEMS.LITERAL)
            throw new Error(`Cannot convert metric unit system to type literal.`);
        
        if (!quantityResult)
            throw new Error(`Could not create coverted quantity. ${this.unit} to ${unit}.`);

        return quantityResult
    }

    convertToMetric(unit: METRIC_UNITS): MetricQuantity{
        return createQuantity(
            convertImperialToMetric(this.unit, unit, this.amount),
            unit
        ) as MetricQuantity
    } 

    convertToImperial(unit: IMPERIAL_UNITS): ImperialQuantity {
        return createQuantity(
            convertBetweenImperial(this.unit, unit, this.amount),
            unit,
        ) as ImperialQuantity
    }
}

export class LiteralQuantity implements Quantity {
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

    convertToUnit(unit: UNITS): Quantity {
        let unitSystem = getSystemFromUnit(unit);
        let quantityResult: Quantity | null = null;

        if (unitSystem == MEASUREMENT_SYSTEMS.METRIC)
            throw new Error(`Cannot convert metric unit system to type literal.`);
        if (unitSystem == MEASUREMENT_SYSTEMS.IMPERIAL)
            throw new Error(`Cannot convert literal quantity to `)
        if (unitSystem == MEASUREMENT_SYSTEMS.LITERAL)
            quantityResult = createQuantity(this.amount, this.unit);
        
        if (!quantityResult)
            throw new Error(`Could not create coverted quantity. ${this.unit} to ${unit}.`);

        return quantityResult
    }
}

type MakeQuantity = (amount: number, unit: any) => Quantity;

const systemToQuantity: Record<MEASUREMENT_SYSTEMS, MakeQuantity> = {
    [MEASUREMENT_SYSTEMS.METRIC]: (amount: number, unit: METRIC_UNITS) => new MetricQuantity(amount, unit),
    [MEASUREMENT_SYSTEMS.IMPERIAL]: (amount: number, unit: IMPERIAL_UNITS) => new ImperialQuantity(amount, unit),
    [MEASUREMENT_SYSTEMS.LITERAL]: (amount: number, unit: LITERAL_UNITS) => new LiteralQuantity(amount, unit),
}

export function createQuantity(
    amount: number,
    unit: UNITS,
): Quantity {
    if (!Number.isFinite(amount))
        throw new Error(`Quantity needs a finite quantity. Got ${amount}.`);
    if (amount <= 0)
        throw new Error(`Quantity cannot have negative/none amount.`);
    let system = getSystemFromUnit(unit);

    return systemToQuantity[system](amount, unit);
}


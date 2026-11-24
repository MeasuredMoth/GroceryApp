import { createQuantity, ImperialQuantity, LiteralQuantity, MetricQuantity, Quantity } from "../data/recipe/quantity";
import { IMPERIAL_UNITS, LITERAL_UNIT, MEASUREMENT_SYSTEM, METRIC_UNIT } from "../data/util/types";


test("Create quantity.", () => {
    let quantity: Quantity = createQuantity(100, METRIC_UNIT.GRAM);

    expect(quantity.amount).toBe(100);
    expect(quantity.system).toBe(MEASUREMENT_SYSTEM.METRIC);
    expect(quantity.unit).toBe(METRIC_UNIT.GRAM);
})

test("createQuantity parameter checks.", () => {
    expect(() => createQuantity(-1, METRIC_UNIT.GRAM)).toThrow(/amount/);
    expect(() => createQuantity(Number.POSITIVE_INFINITY, METRIC_UNIT.GRAM)).toThrow(/finite quantity/);
})

test("createQuantity test correct class.", () => {
    expect(createQuantity(1, METRIC_UNIT.GRAM)).toBeInstanceOf(MetricQuantity);
    expect(createQuantity(1, IMPERIAL_UNITS.CUP)).toBeInstanceOf(ImperialQuantity);
    expect(createQuantity(1, LITERAL_UNIT.PIECE)).toBeInstanceOf(LiteralQuantity);
})

test("converting metric to other systems.", () => {
    let metricQuantity: MetricQuantity = createQuantity(1000, METRIC_UNIT.GRAM) as MetricQuantity;

    expect(metricQuantity.convertToUnit(METRIC_UNIT.KILOGRAM).amount).toBe(1);
    expect(metricQuantity.convertToUnit(IMPERIAL_UNITS.TEASPOON).amount).toBeCloseTo(211.64, 1);
    expect(() => metricQuantity.convertToUnit(LITERAL_UNIT.PIECE)).toThrow(/convert/);
})

test("converting imperial to other systems.", () => {
    let imperialQuantity: ImperialQuantity = createQuantity(10, IMPERIAL_UNITS.CUP) as ImperialQuantity;

    expect(imperialQuantity.convertToUnit(METRIC_UNIT.MILLIGRAM).amount).toBeCloseTo(35436.9, 1);
    expect(imperialQuantity.convertToUnit(IMPERIAL_UNITS.TABLESPOON).amount).toBe(2.5);
    expect(() => imperialQuantity.convertToUnit(LITERAL_UNIT.PINCH)).toThrow(/convert/);
})

test("converting literal to other systems.", () => {
    let literalQuantity: LiteralQuantity = createQuantity(100, LITERAL_UNIT.PIECE) as LiteralQuantity;

    expect(() => literalQuantity.convertToUnit(METRIC_UNIT.GRAM).amount).toThrow(/convert/);
    expect(() => literalQuantity.convertToUnit(IMPERIAL_UNITS.TABLESPOON).amount).toThrow(/convert/);
    expect(literalQuantity.convertToUnit(LITERAL_UNIT.PINCH).amount).toBe(100);
})
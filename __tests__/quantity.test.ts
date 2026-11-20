import { createQuantity, ImperialQuantity, LiteralQuantity, MetricQuantity, Quantity } from "../data/recipe/quantity";
import { IMPERIAL_UNITS, LITERAL_UNITS, MEASUREMENT_SYSTEMS, METRIC_UNITS } from "../data/util/types";


test("Create quantity.", () => {
    let quantity: Quantity = createQuantity(100, METRIC_UNITS.GRAM);

    expect(quantity.amount).toBe(100);
    expect(quantity.system).toBe(MEASUREMENT_SYSTEMS.METRIC);
    expect(quantity.unit).toBe(METRIC_UNITS.GRAM);
})

test("createQuantity parameter checks.", () => {
    expect(() => createQuantity(-1, METRIC_UNITS.GRAM)).toThrow(/amount/);
    expect(() => createQuantity(Number.POSITIVE_INFINITY, METRIC_UNITS.GRAM)).toThrow(/finite quantity/);
})

test("createQuantity test correct class.", () => {
    expect(createQuantity(1, METRIC_UNITS.GRAM)).toBeInstanceOf(MetricQuantity);
    expect(createQuantity(1, IMPERIAL_UNITS.CUP)).toBeInstanceOf(ImperialQuantity);
    expect(createQuantity(1, LITERAL_UNITS.PIECE)).toBeInstanceOf(LiteralQuantity);
})

test("converting metric to other systems.", () => {
    let metricQuantity: MetricQuantity = createQuantity(1000, METRIC_UNITS.GRAM) as MetricQuantity;

    expect(metricQuantity.convertToUnit(METRIC_UNITS.KILOGRAM).amount).toBe(1);
    expect(metricQuantity.convertToUnit(IMPERIAL_UNITS.TEASPOON).amount).toBeCloseTo(211.64, 1);
    expect(() => metricQuantity.convertToUnit(LITERAL_UNITS.PIECE)).toThrow(/literal/);
})

test("converting imperial to other systems.", () => {
    let imperialQuantity: ImperialQuantity = createQuantity(10, IMPERIAL_UNITS.CUP) as ImperialQuantity;

    expect(imperialQuantity.convertToUnit(METRIC_UNITS.MILIGRAM).amount).toBeCloseTo(35436.9, 1);
    expect(imperialQuantity.convertToUnit(IMPERIAL_UNITS.TABLESPOON).amount).toBe(2.5);
    expect(() => imperialQuantity.convertToUnit(LITERAL_UNITS.PINCH)).toThrow(/literal/);
})

test("converting literal to other systems.", () => {
    let literalQuantity: LiteralQuantity = createQuantity(100, LITERAL_UNITS.PIECE) as LiteralQuantity;

    expect(() => literalQuantity.convertToUnit(METRIC_UNITS.GRAM).amount).toThrow(/metric/);
    expect(() => literalQuantity.convertToUnit(IMPERIAL_UNITS.TABLESPOON).amount).toThrow(/imperial/);
    expect(literalQuantity.convertToUnit(LITERAL_UNITS.PINCH).amount).toBe(100);
})
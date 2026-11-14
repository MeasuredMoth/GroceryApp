import { createQuantity, ImperialQuantity, LiteralQuantity, MetricQuantity, Quantity } from "data/base/quantity";
import { IMPERIAL_UNITS, LITERAL_UNITS, MEASUREMENT_SYSTEMS, METRIC_UNITS } from "data/util/unit";

test("Create quantity.", () => {
    let quantity: Quantity = createQuantity(100, MEASUREMENT_SYSTEMS.METRIC, METRIC_UNITS.GRAM);

    expect(quantity.amount).toBe(100);
    expect(quantity.system).toBe(MEASUREMENT_SYSTEMS.METRIC);
    expect(quantity.unit).toBe(METRIC_UNITS.GRAM);
})

test("createQuantity parameter checks.", () => {
    expect(() => createQuantity(-1, MEASUREMENT_SYSTEMS.METRIC, METRIC_UNITS.GRAM)).toThrow(/amount/);
    expect(() => createQuantity(Number.POSITIVE_INFINITY, MEASUREMENT_SYSTEMS.METRIC, METRIC_UNITS.GRAM)).toThrow(/finite quantity/);
    expect(() => createQuantity(100, MEASUREMENT_SYSTEMS.METRIC, IMPERIAL_UNITS.CUP)).toThrow(/within system/);
})

test("createQuantity test correct class.", () => {
    expect(typeof createQuantity(1, MEASUREMENT_SYSTEMS.METRIC, METRIC_UNITS.GRAM)).toBe(typeof MetricQuantity);
    expect(typeof createQuantity(1, MEASUREMENT_SYSTEMS.IMPERIAL, IMPERIAL_UNITS.CUP)).toBe(typeof ImperialQuantity);
    expect(typeof createQuantity(1, MEASUREMENT_SYSTEMS.LITERAL, LITERAL_UNITS.PIECE)).toBe(typeof LiteralQuantity);
})
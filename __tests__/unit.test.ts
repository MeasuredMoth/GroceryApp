import { IMPERIAL_UNITS, LITERAL_UNIT, METRIC_UNIT } from "../data/util/types";
import { parseQuantity } from "../data/util/unit";

test("creating quantity from parseQuantity.", () => {
    expect(parseQuantity("10 g")?.amount).toBe(10);
    expect(parseQuantity("10 g")?.unit).toBe(METRIC_UNIT.GRAM);

    expect(parseQuantity("0.5 cup")?.amount).toBeCloseTo(0.5);
    expect(parseQuantity("0.5 cup")?.unit).toBe(IMPERIAL_UNITS.CUP);

    expect(parseQuantity("20 piece")?.amount).toBe(20);
    expect(parseQuantity("20 piece")?.unit).toBe(LITERAL_UNIT.PIECE);
})

test("test bad parse quantity.", () => {
    expect(parseQuantity("banana rama")).toBeNull();
    expect(() => parseQuantity("1000 beans")).toThrow(/system/);
})
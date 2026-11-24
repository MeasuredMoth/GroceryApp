import { createQuantity } from "../data/recipe/quantity";
import { IMPERIAL_UNITS, LITERAL_UNIT, MEASUREMENT_SYSTEM, MEASUREMENT_TYPE, METRIC_UNIT } from "../data/util/types";
import { formatQuantity, getMeasureTypeFromUnit, getSystemFromUnit, isUnit, parseQuantity } from "../data/util/unit";

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

test("Get measure type from quantity", () => {
    expect(getMeasureTypeFromUnit(LITERAL_UNIT.PINCH)).toStrictEqual([MEASUREMENT_TYPE.COUNT]);
    expect(getMeasureTypeFromUnit(METRIC_UNIT.GRAM)).toStrictEqual([MEASUREMENT_TYPE.MASS]);
    expect(getMeasureTypeFromUnit(IMPERIAL_UNITS.CUP)).toStrictEqual([MEASUREMENT_TYPE.VOLUME, MEASUREMENT_TYPE.MASS])
})

test("Test if string is a unit", () => {
    expect(isUnit("pinch")).toBeTruthy();
    expect(isUnit("g")).toBeTruthy();
    expect(isUnit("cup")).toBeTruthy();

    expect(isUnit("apple")).toBeFalsy();
    expect(isUnit("crabble")).toBeFalsy();
    expect(isUnit("")).toBeFalsy();
})

test("Test getting system from unit", () => {
    expect(getSystemFromUnit(LITERAL_UNIT.PIECE)).toBe(MEASUREMENT_SYSTEM.LITERAL);
    expect(getSystemFromUnit(METRIC_UNIT.KILOLITER)).toBe(MEASUREMENT_SYSTEM.METRIC);
    expect(getSystemFromUnit(IMPERIAL_UNITS.TABLESPOON)).toBe(MEASUREMENT_SYSTEM.IMPERIAL);
})

test("Format quantity", () => {
    expect(formatQuantity(createQuantity(100, METRIC_UNIT.GRAM))).toBe("100 g");
    expect(formatQuantity(createQuantity(20, LITERAL_UNIT.PIECE))).toBe("20 piece");
    expect(formatQuantity(createQuantity(50, IMPERIAL_UNITS.CUP))).toBe("50 cup");
})
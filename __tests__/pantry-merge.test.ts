import { mergeIntoPantry, PantryEntry } from "../data/recipe/pantry";
import { createQuantity, Quantity } from "../data/recipe/quantity";
import { LITERAL_UNIT, METRIC_UNIT } from "../data/util/types";

const entry = (id: string, ingredientId: string, quantity: Quantity, expiresOn?: string): PantryEntry =>
    expiresOn ? { id, ingredientId, quantity, expiresOn } : { id, ingredientId, quantity};

test("Adding an ingredient with the same expiry date sums into the existing row", () => {
    const pantry = [entry("a", "milk", createQuantity(1, METRIC_UNIT.LITER), "2026-11-20")];

    expect(mergeIntoPantry(pantry, entry("new", "milk", createQuantity(500, METRIC_UNIT.MILILITER), "2026-11-20"))).toEqual([
        entry("a", "milk", createQuantity(1.5, METRIC_UNIT.LITER), "2026-11-20"),
    ]);
})

test("No expiry date matches no expiry date", () => {
    const pantry = [entry("a", "oats", createQuantity(500, METRIC_UNIT.GRAM))];

    expect(mergeIntoPantry(pantry, entry("new", "oats", createQuantity(250, METRIC_UNIT.GRAM)))).toEqual([entry("a", "oats", createQuantity(750, METRIC_UNIT.GRAM))]);
})

test("A different expiry date gets its own row", () => {
    const pantry = [entry("a", "milk", createQuantity(1, METRIC_UNIT.LITER), "2026-11-20")];
    const fresh = entry("new", "milk", createQuantity(1, METRIC_UNIT.LITER), "2026-11-27");

    expect(mergeIntoPantry(pantry, fresh)).toEqual([...pantry, fresh]);
    expect(mergeIntoPantry([entry("a", "milk", createQuantity(1, METRIC_UNIT.LITER))], fresh)).toHaveLength(2);
})

test("Units that don't convert stay separate rows", () => {
    const pantry = [entry("a", "tomato", createQuantity(200, METRIC_UNIT.GRAM))];

    expect(mergeIntoPantry(pantry, entry("new", "tomato", createQuantity(3, LITERAL_UNIT.PIECE)))).toHaveLength(2);
})

test("Restocking an ingredient that ran out refills its row", () => {
    const pantry = [entry("out", "eggs", createQuantity(0, LITERAL_UNIT.PIECE)), entry("b", "oats", createQuantity(500, METRIC_UNIT.GRAM))];

    expect(mergeIntoPantry(pantry, entry("new", "eggs", createQuantity(6, LITERAL_UNIT.PIECE), "2026-11-30"))).toEqual([
        entry("out", "eggs", createQuantity(6, LITERAL_UNIT.PIECE), "2026-11-30"),
        entry("b", "oats", createQuantity(500, METRIC_UNIT.GRAM)),
    ]);
})

test("Editing a row saves it in place", () => {
    const pantry = [entry("a", "oats", createQuantity(500, METRIC_UNIT.GRAM)), entry("b", "rice", createQuantity(1, METRIC_UNIT.KILOGRAM))];

    expect(mergeIntoPantry(pantry, entry("a", "oats", createQuantity(0, METRIC_UNIT.GRAM)))).toEqual([entry("a", "oats", createQuantity(0, METRIC_UNIT.GRAM)), entry("b", "rice", createQuantity(1, METRIC_UNIT.KILOGRAM))]);
})

test("Editing a row to match another one merges the two", () => {
    const pantry = [entry("a", "milk", createQuantity(1, METRIC_UNIT.LITER), "2026-11-20"), entry("b", "milk", createQuantity(1, METRIC_UNIT.LITER), "2026-11-21")];

    expect(mergeIntoPantry(pantry, entry("b", "milk", createQuantity(1, METRIC_UNIT.LITER), "2026-11-20"))).toEqual([entry("a", "milk", createQuantity(2, METRIC_UNIT.LITER), "2026-11-20")]);
})

import { mergeIntoPantry, PantryEntry } from "../data/recipe/pantry";

const entry = (id: string, ingredientId: string, amount: number, unit: PantryEntry["unit"], expiresOn?: string): PantryEntry =>
    expiresOn ? { id, ingredientId, amount, unit, expiresOn } : { id, ingredientId, amount, unit };

test("Adding an ingredient with the same expiry date sums into the existing row", () => {
    const pantry = [entry("a", "milk", 1, "l", "2026-11-20")];

    expect(mergeIntoPantry(pantry, entry("new", "milk", 500, "ml", "2026-11-20"))).toEqual([
        entry("a", "milk", 1.5, "l", "2026-11-20"),
    ]);
})

test("No expiry date matches no expiry date", () => {
    const pantry = [entry("a", "oats", 500, "g")];

    expect(mergeIntoPantry(pantry, entry("new", "oats", 250, "g"))).toEqual([entry("a", "oats", 750, "g")]);
})

test("A different expiry date gets its own row", () => {
    const pantry = [entry("a", "milk", 1, "l", "2026-11-20")];
    const fresh = entry("new", "milk", 1, "l", "2026-11-27");

    expect(mergeIntoPantry(pantry, fresh)).toEqual([...pantry, fresh]);
    expect(mergeIntoPantry([entry("a", "milk", 1, "l")], fresh)).toHaveLength(2);
})

test("Units that don't convert stay separate rows", () => {
    const pantry = [entry("a", "tomato", 200, "g")];

    expect(mergeIntoPantry(pantry, entry("new", "tomato", 3, "piece"))).toHaveLength(2);
})

test("Restocking an ingredient that ran out refills its row", () => {
    const pantry = [entry("out", "eggs", 0, "piece"), entry("b", "oats", 500, "g")];

    expect(mergeIntoPantry(pantry, entry("new", "eggs", 6, "piece", "2026-11-30"))).toEqual([
        entry("out", "eggs", 6, "piece", "2026-11-30"),
        entry("b", "oats", 500, "g"),
    ]);
})

test("Editing a row saves it in place", () => {
    const pantry = [entry("a", "oats", 500, "g"), entry("b", "rice", 1, "kg")];

    expect(mergeIntoPantry(pantry, entry("a", "oats", 0, "g"))).toEqual([entry("a", "oats", 0, "g"), entry("b", "rice", 1, "kg")]);
})

test("Editing a row to match another one merges the two", () => {
    const pantry = [entry("a", "milk", 1, "l", "2026-11-20"), entry("b", "milk", 1, "l", "2026-11-21")];

    expect(mergeIntoPantry(pantry, entry("b", "milk", 1, "l", "2026-11-20"))).toEqual([entry("a", "milk", 2, "l", "2026-11-20")]);
})

import { addMeal, createMeal, mealsFor } from "../data/recipe/meal-plan";
import { createPantryEntry } from "../data/recipe/pantry";
import { createRecipe } from "../data/recipe/recipe";
import {
    createAppData,
    doneKey,
    removeById,
    sanitizeAppData,
    serializeAppData,
    setDone,
    upsertById,
} from "../data/store/app-data";
import { DataStore, StorageBackend } from "../data/store/data-store";
import { createIngredient } from "../data/recipe/ingredient";
import { INGREDIENT_CATEGORY, MEAL_TYPE, MEASUREMENT_TYPE, METRIC_UNIT, RECIPE_CATEGORY } from "../data/util/types";
import { createQuantity } from "../data/recipe/quantity";

// Wednesday, Nov 4 2026 at 10:00 local time
const NOW = new Date(2026, 10, 4, 10, 0);

const oats = createIngredient("Oats", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.CARB, "oats");
const milk = createIngredient("Milk", [MEASUREMENT_TYPE.VOLUME], INGREDIENT_CATEGORY.DAIRY, "milk");
const porridge = createRecipe("Porridge", [{ ingredientId: "oats", quantity: createQuantity(80, METRIC_UNIT.GRAM) }], {
    id: "recipe-porridge",
    category: RECIPE_CATEGORY.DINNER,
});
const defaults = { ingredients: [oats, milk], recipes: [porridge] };

/** Stands in for the file: `text` is what is "on disk". */
function memoryBackend(text: string | null = null) {
    const backend = {
        text,
        writes: 0,
        read: () => backend.text,
        write: (next: string) => {
            backend.text = next;
            backend.writes++;
        },
    };
    return backend;
}

function sampleData() {
    const data = createAppData(defaults);
    const breakfast = createMeal(MEAL_TYPE.BREAKFAST, "08:00", [{ ingredientId: "oats", quantity: createQuantity(80, METRIC_UNIT.GRAM) }], "warm");
    const snack = createMeal(MEAL_TYPE.SNACK, "16:00", [{ ingredientId: "milk", quantity: createQuantity(200, METRIC_UNIT.MILILITER)}]);

    data.plan = addMeal(data.plan, NOW, breakfast, "weekday");
    data.plan = addMeal(data.plan, NOW, snack, "day");
    data.pantry = [createPantryEntry(milk, createQuantity(1, METRIC_UNIT.LITER), "2026-11-09")];
    data.done = setDone({}, NOW, [breakfast.id], true);
    return data;
}

beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
})

afterEach(() => {
    jest.restoreAllMocks();
})

test("A new install starts with the defaults and an empty plan", () => {
    const data = new DataStore(memoryBackend(), defaults).get();

    expect(data.ingredients).toEqual([oats, milk]);
    expect(data.recipes).toEqual([porridge]);
    expect(mealsFor(data.plan, NOW)).toEqual([]);
    expect(data.pantry).toEqual([]);
    expect(data.done).toEqual({});
})

test("Everything survives being saved and read back", () => {
    const data = sampleData();

    const loaded = sanitizeAppData(JSON.parse(serializeAppData(data)), defaults, NOW);

    expect(loaded).toEqual(data);
})

test("A change is saved and is there after a restart", () => {
    const backend = memoryBackend();
    const store = new DataStore(backend, defaults);
    const meal = createMeal(MEAL_TYPE.LUNCH, "12:30", [{ ingredientId: "oats", quantity: createQuantity(50, METRIC_UNIT.GRAM) }]);

    store.update((data) => ({ plan: addMeal(data.plan, NOW, meal, "weekday") }));

    const restarted = new DataStore(backend, defaults);
    expect(mealsFor(restarted.get().plan, NOW)).toEqual([meal]);
})

test("Reading doesn't write, and each change writes once", () => {
    const backend = memoryBackend();
    const store = new DataStore(backend, defaults);

    store.get();
    expect(backend.writes).toBe(0);

    store.update(() => ({ pantry: [] }));
    expect(backend.writes).toBe(1);
})

test("Screens are told about changes until they stop listening", () => {
    const store = new DataStore(memoryBackend(), defaults);
    const listener = jest.fn();

    const stop = store.subscribe(listener);
    store.update(() => ({ pantry: [] }));
    stop();
    store.update(() => ({ pantry: [] }));

    expect(listener).toHaveBeenCalledTimes(1);
})

test("The data object only changes when there is an update", () => {
    const store = new DataStore(memoryBackend(), defaults);
    const before = store.get();

    expect(store.get()).toBe(before);
    store.update(() => ({ pantry: [] }));
    expect(store.get()).not.toBe(before);
    expect(store.get().recipes).toBe(before.recipes);
})

test("A broken file falls back to the defaults instead of crashing", () => {
    const store = new DataStore(memoryBackend("{ not json"), defaults);

    expect(store.get()).toEqual(createAppData(defaults));
})

test("A change still shows on screen when saving fails", () => {
    const backend: StorageBackend = {
        read: () => null,
        write: () => {
            throw new Error("disk full");
        },
    };
    const store = new DataStore(backend, defaults);
    const listener = jest.fn();
    store.subscribe(listener);

    store.update(() => ({ recipes: [] }));

    expect(store.get().recipes).toEqual([]);
    expect(listener).toHaveBeenCalledTimes(1);
})

test("Deleting every recipe doesn't bring the starter recipes back", () => {
    const backend = memoryBackend();
    new DataStore(backend, defaults).update(() => ({ recipes: [] }));

    expect(new DataStore(backend, defaults).get().recipes).toEqual([]);
})

test("Bad entries are dropped without losing the good ones", () => {
    const raw = {
        ingredients: [
            oats,
            { id: "eggs", name: "Eggs", allowedUnits: ["cccc"], ingredientCategory: "Protienss" }, // no valid unit
            { id: "salt", name: "Salt", allowedUnits: ["count"], ingredientCategory: "Seasoninggg" },
            "flour",
        ],
        recipes: [
            { id: "r1", name: "Mix", category: "Brunch", items: [
                { ingredientId: "oats", quantity: { amount: 80, unit: "g" }},
                { ingredientId: "oats", quantity: { amount: -5, unit: "g" }},
                { ingredientId: "milk", quantity: { amount: 1, unit: "bucket" }},
            ], image: 7 },
            { name: "No id" },
        ],
        pantry: [
            { id: "p1", ingredientId: "milk", quantity: { amount: 0, unit: "l" }, expiresOn: "next week" },
            { id: "p2", ingredientId: "milk", quantity: { amount: -1, unit: "l" }},
        ],
    };

    const data = sanitizeAppData(raw, defaults, NOW);

    expect(data.ingredients).toEqual([
        oats,
        { id: "salt", name: "Salt", allowedUnits: ["count"], ingredientCategory: "Other" },
    ]);
    expect(data.recipes).toEqual([
        { id: "r1", name: "Mix", category: "Dinner", servings: 1, image: undefined, items: [{ ingredientId: "oats", quantity: { amount: 80, system: "Metric", unit: "g" } }] },
    ]);
    expect(data.pantry).toEqual([{ id: "p1", ingredientId: "milk", quantity: {amount: 0, system: "Metric", unit: "l" } }]);
})

test("A damaged plan keeps the meals that are still valid", () => {
    const good = { id: "m1", type: "Lunch", time: "12:30", items: [] };
    const raw = {
        plan: {
            template: { Monday: [good, { id: "m2", type: "Lunch", time: "25:00", items: [] }], Tuesday: "none" },
            overrides: {
                "2026-11-04": { changed: { m1: null, m9: { id: "m9", type: "Brunch" } }, added: [good] },
                "2026-11-05": { changed: {}, added: [] },
                "someday": { changed: { m1: null }, added: [] },
            },
        },
    };

    const { plan } = sanitizeAppData(raw, defaults, NOW);

    expect(plan.template.Monday).toEqual([good]);
    expect(plan.template.Tuesday).toEqual([]);
    expect(plan.template.Sunday).toEqual([]);
    expect(plan.overrides).toEqual({ "2026-11-04": { changed: { m1: null }, added: [good] } });
})

test("Old ticks are dropped on load, recent ones are kept", () => {
    const raw = { done: { "2026-11-03:m1": true, "2026-01-01:m1": true, "2026-11-03:m2": false, "junk": true } };

    expect(sanitizeAppData(raw, defaults, NOW).done).toEqual({ "2026-11-03:m1": true });
})

test("Ticking and unticking meals", () => {
    let done = setDone({}, NOW, ["a", "b"], true);
    expect(done).toEqual({ [doneKey(NOW, "a")]: true, [doneKey(NOW, "b")]: true });

    done = setDone(done, NOW, ["a"], false);
    expect(done).toEqual({ "2026-11-04:b": true });
})

test("Saving an item replaces the one with the same id, or adds it", () => {
    const renamed = { ...oats, name: "Rolled Oats" };
    const list = [oats, milk];

    expect(upsertById(list, renamed)).toEqual([renamed, milk]);
    expect(upsertById([milk], oats)).toEqual([milk, oats]);
    expect(removeById(list, "oats")).toEqual([milk]);
    expect(list).toEqual([oats, milk]);
})

test("A recipe's category survives saving and reading back", () => {
    const pancakes = createRecipe("Pancakes", [{ ingredientId: "milk", quantity: createQuantity(1, METRIC_UNIT.LITER) }], {
        category: RECIPE_CATEGORY.BREAKFAST,
    });
    const saved = serializeAppData({ ...createAppData(defaults), recipes: [pancakes] });

    const data = sanitizeAppData(JSON.parse(saved), defaults, NOW);

    expect(data.recipes[0].category).toBe(RECIPE_CATEGORY.BREAKFAST);
});

test("Servings are kept, and older recipes without them are for one serving", () => {
    const stew = createRecipe("Stew", [], { servings: 4, id: "stew" });
    const oldStew = { ...stew, id: "old-stew" } as Partial<typeof stew>;
    delete oldStew.servings; // saved before servings existed
    const saved = JSON.parse(serializeAppData({ ...createAppData(defaults), recipes: [oldStew as typeof stew, stew] }));

    const data = sanitizeAppData(saved, defaults, NOW);

    expect(data.recipes.map((r) => r.servings)).toEqual([1, 4]);
});

test("Ingredients saved with the old PROTEIN and Diary categories are read as Protein and Dairy", () => {
    const raw = { ingredients: [
        { id: "tofu", name: "Tofu", allowedUnits: ["mass"], ingredientCategory: "PROTEIN" },
        { id: "feta", name: "Feta", allowedUnits: ["mass"], ingredientCategory: "Diary" },
    ] };

    const data = sanitizeAppData(raw, defaults, NOW);

    expect(data.ingredients[0].ingredientCategory).toBe(INGREDIENT_CATEGORY.PROTEIN);
    expect(INGREDIENT_CATEGORY.PROTEIN).toBe("Protein");
    expect(data.ingredients[1].ingredientCategory).toBe(INGREDIENT_CATEGORY.DAIRY);
    expect(INGREDIENT_CATEGORY.DAIRY).toBe("Dairy");
});

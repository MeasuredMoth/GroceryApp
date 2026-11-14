import { createIngredient, Ingredient, INGREDIENT_CATEGORIES } from "data/base/ingredient"
import { METRIC_UNITS } from "data/util/unit";

test("Creating ingredient.", () => {
    let ingredient: Ingredient = createIngredient("Flour", [ METRIC_UNITS.GRAM ], INGREDIENT_CATEGORIES.CARB);

    expect(ingredient.name).toBe("Flour");
    expect(ingredient.allowedUnits).toStrictEqual([ METRIC_UNITS.GRAM ]);
    expect(ingredient.ingredientCategory).toBe(INGREDIENT_CATEGORIES.CARB);
})

test("createIngredient parameter check.", () => {
    expect(() => createIngredient("   ", [ METRIC_UNITS.GRAM ], INGREDIENT_CATEGORIES.CARB)).toThrow(/name/);
    expect(() => createIngredient("Flour", [], INGREDIENT_CATEGORIES.CARB)).toThrow(/allowed unit/);
})

/*
Redone when reimplementing json

test("Getting JSON back from Ingredient", () => {
    let ingredient = new Ingredient("Flour");

    let jsonCompare = {
        "quantity": ingredient.getQuantity(),
        "system": ingredient.getSystem(),
        "type": ingredient.getType()
    }

    let data = ingredient.getJSON();

    expect(JSON.parse(data)).toStrictEqual(jsonCompare);
})
*/
import { createIngredient, Ingredient } from "../data/recipe/ingredient";
import { METRIC_UNIT, INGREDIENT_CATEGORY, MEASUREMENT_TYPE } from "../data/util/types";

test("Creating ingredient.", () => {
    let ingredient: Ingredient = createIngredient("Flour", [ MEASUREMENT_TYPE.MASS ], INGREDIENT_CATEGORY.CARB);

    expect(ingredient.name).toBe("Flour");
    expect(ingredient.allowedUnits).toStrictEqual([ MEASUREMENT_TYPE.MASS ]);
    expect(ingredient.ingredientCategory).toBe(INGREDIENT_CATEGORY.CARB);
})

test("createIngredient parameter check.", () => {
    expect(() => createIngredient("   ", [ MEASUREMENT_TYPE.MASS ], INGREDIENT_CATEGORY.CARB)).toThrow(/name/);
    expect(() => createIngredient("Flour", [], INGREDIENT_CATEGORY.CARB)).toThrow(/allowed unit/);
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
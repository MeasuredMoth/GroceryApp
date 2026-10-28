import { Dictionary } from "data/types";
import { Ingredient, Quantity, ingredientType, quantityFormats } from "data/recipe/ingredient";
import { Recipe } from "data/recipe/recipe";

test("Changing name of Recipe.", () => {
    let recipe = new Recipe();

    recipe.setName("Pie");

    expect(recipe.getName()).toBe("Pie")
});

test("Setting name of Recipe to nothing.", () => {
    let recipe = new Recipe();

    recipe.setName("Pie");
    recipe.setName("");

    expect(recipe.getName()).toBe("Pie");
})

test("Adding ingredent to Recipe.", () => {
    let recipe = new Recipe();

    recipe.appendIngredient(new Ingredient());
    recipe.appendIngredient(new Ingredient());
    recipe.appendIngredient(new Ingredient());

    expect(recipe.getIngredients().length).toBe(3);
})

test("Getting JSON back from Recipe", () => {
    let apple = new Ingredient("Apple", {amount: 1, unit: "piece"}, ingredientType.FRUIT);

    let recipe = new Recipe("Pie");

    recipe.appendIngredient(apple);

    let jsonCompare: Dictionary<any> = {}
    jsonCompare[recipe.getName()] = {
         "Apple": {
            "quantity": {amount: 1, unit: "piece"},
            "type": ingredientType.FRUIT,
            "system": "literal",
        }
    }

    let data = recipe.getJSON()

    expect(JSON.parse(data)).toStrictEqual(jsonCompare);
})

test("Getting recipe types from Recipe's Ingredients", () => {
    let recipe = new Recipe("Chicken And Rice", [
        new Ingredient("Chicken", {amount: 100, unit: "g"}, ingredientType.PROTIEN),
        new Ingredient("Rice", {amount: 200, unit: "kg"}, ingredientType.CARB),
    ])

    expect(recipe.getIngredientTypes()).toStrictEqual([ingredientType.PROTIEN, ingredientType.CARB]);
})
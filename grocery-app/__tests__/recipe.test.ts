import { Dictionary } from "../types";
import { Ingredient, quantityFormats } from "../recipe/ingredient";
import { Recipe } from "../recipe/recipe";

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

    recipe.addIngredient(new Ingredient());
    recipe.addIngredient(new Ingredient());
    recipe.addIngredient(new Ingredient());

    expect(recipe.getIngredients().length).toBe(3);
})

test("Getting JSON back from Recipe", () => {
    let recipe = new Recipe();
    let apple = new Ingredient();
    apple.setName("Apple");
    apple.setQuantity(1);
    apple.setFormat(quantityFormats.LITERAL);

    recipe.setName("Pie");
    recipe.addIngredient(apple);

    let jsonCompare: Dictionary<any> = {}
    jsonCompare[recipe.getName()] = {
         "Apple": {"quantity": 1, "format": quantityFormats.LITERAL}
    }

    let data = recipe.getJSON()

    expect(JSON.parse(data)).toStrictEqual(jsonCompare);
})
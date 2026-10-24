import { Ingredient } from "../data/recipe/ingredient"

test("Setting name of ingredient", () => {
    let ingredient = new Ingredient();

    ingredient.setName("Flour");

    expect(ingredient.getName()).toBe("Flour");
})

test("Setting name of Ingredient to nothing", () => {
    let ingredient = new Ingredient();

    ingredient.setName("Flour");
    ingredient.setName("");

    expect(ingredient.getName()).toBe("Flour");
})

test("Getting JSON back from Ingredient", () => {
    let ingredient = new Ingredient();

    ingredient.setName("Flour");

    let jsonCompare = {
        "quantity": ingredient.getQuantity(),
        "format": ingredient.getFormat()
    }

    let data = ingredient.getJSON();

    expect(JSON.parse(data)).toStrictEqual(jsonCompare);
})
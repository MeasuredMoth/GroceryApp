import { Ingredient } from "../recipe/ingredient"

test("Setting name of ingredient", () => {
    let ingredient = new Ingredient();

    ingredient.setName("Flour");

    expect(ingredient.name).toBe("Flour");
})

test("Setting name of Ingredient to nothing", () => {
    let ingredient = new Ingredient();

    ingredient.setName("Flour");
    ingredient.setName("");

    expect(ingredient.name).toBe("Flour");
})

test("Getting JSON back from Ingredient", () => {
    let ingredient = new Ingredient();

    ingredient.setName("Flour");

    let jsonCompare = {
        "quantity": ingredient.quantity,
        "format": ingredient.format
    }

    let data = ingredient.getJSON();

    expect(JSON.parse(data)).toStrictEqual(jsonCompare);
})
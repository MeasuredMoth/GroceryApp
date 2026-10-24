<<<<<<< HEAD
import { Ingredient } from "../recipe/ingredient"

test("Setting name of ingredient", () => {
    let ingredient = new Ingredient();

    ingredient.setName("Flour");
=======
import { Ingredient } from "data/recipe/ingredient"

test("Setting name of ingredient", () => {
    let ingredient = new Ingredient("Flour");
>>>>>>> origin/meal-plan

    expect(ingredient.getName()).toBe("Flour");
})

test("Setting name of Ingredient to nothing", () => {
<<<<<<< HEAD
    let ingredient = new Ingredient();

    ingredient.setName("Flour");
=======
    let ingredient = new Ingredient("Flour");

>>>>>>> origin/meal-plan
    ingredient.setName("");

    expect(ingredient.getName()).toBe("Flour");
})

test("Getting JSON back from Ingredient", () => {
<<<<<<< HEAD
    let ingredient = new Ingredient();

    ingredient.setName("Flour");

    let jsonCompare = {
        "quantity": ingredient.getQuantity(),
        "format": ingredient.getFormat()
=======
    let ingredient = new Ingredient("Flour");

    let jsonCompare = {
        "quantity": ingredient.getQuantity(),
        "format": ingredient.getFormat(),
        "type": ingredient.getType(),
>>>>>>> origin/meal-plan
    }

    let data = ingredient.getJSON();

    expect(JSON.parse(data)).toStrictEqual(jsonCompare);
})
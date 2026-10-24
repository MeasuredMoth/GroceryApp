import { Ingredient } from "data/recipe/ingredient"

test("Setting name of ingredient", () => {
<<<<<<< HEAD
    let ingredient = new Ingredient();

    ingredient.setName("Flour");
<<<<<<< HEAD
=======
    let ingredient = new Ingredient("Flour");
>>>>>>> f95010d (Actually added constructors to objects)

    expect(ingredient.getName()).toBe("Flour");
})

test("Setting name of Ingredient to nothing", () => {
<<<<<<< HEAD
=======
    
    expect(ingredient.name).toBe("Flour");
})

test("Setting name of ingredient to nothing", () => {
>>>>>>> e2ae8ad (Added setters + first recipe unit tests)
    let ingredient = new Ingredient();
=======
    let ingredient = new Ingredient("Flour");
>>>>>>> f95010d (Actually added constructors to objects)

    ingredient.setName("");

<<<<<<< HEAD
    expect(ingredient.getName()).toBe("Flour");
})

test("Getting JSON back from Ingredient", () => {
    let ingredient = new Ingredient("Flour");

    let jsonCompare = {
        "quantity": ingredient.getQuantity(),
        "format": ingredient.getFormat()
    }

    let data = ingredient.getJSON();

    expect(JSON.parse(data)).toStrictEqual(jsonCompare);
=======
    expect(ingredient.name).toBe("Flour");
>>>>>>> e2ae8ad (Added setters + first recipe unit tests)
})
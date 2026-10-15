import { Ingredient } from "../recipe/ingredient"

test("Setting name of ingredient", () => {
    let ingredient = new Ingredient();

    ingredient.setName("Flour");
    
    expect(ingredient.name).toBe("Flour");
})

test("Setting name of ingredient to nothing", () => {
    let ingredient = new Ingredient();

    ingredient.setName("Flour");
    ingredient.setName("");

    expect(ingredient.name).toBe("Flour");
})
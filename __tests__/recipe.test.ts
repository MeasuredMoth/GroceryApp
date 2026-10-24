<<<<<<< HEAD
import { Ingredient, quantityFormats } from "../recipe/ingredient";
import { Recipe } from "../recipe/recipe";
=======
import { Dictionary } from "data/types";
import { Ingredient, ingredientType, quantityFormats } from "data/recipe/ingredient";
import { Recipe } from "data/recipe/recipe";
>>>>>>> origin/meal-plan

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

<<<<<<< HEAD
    recipe.addIngredient(new Ingredient());
    recipe.addIngredient(new Ingredient());
    recipe.addIngredient(new Ingredient());
=======
    recipe.appendIngredient(new Ingredient());
    recipe.appendIngredient(new Ingredient());
    recipe.appendIngredient(new Ingredient());
>>>>>>> origin/meal-plan

    expect(recipe.getIngredients().length).toBe(3);
})

test("Getting JSON back from Recipe", () => {
<<<<<<< HEAD
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
=======
    let apple = new Ingredient("Apple", 1, quantityFormats.LITERAL, ingredientType.FRUIT);

    let recipe = new Recipe("Pie");

    recipe.appendIngredient(apple);

    let jsonCompare: Dictionary<any> = {}
    jsonCompare[recipe.getName()] = {
         "Apple": {
            "quantity": 1, 
            "format": quantityFormats.LITERAL,
            "type": ingredientType.FRUIT
        }
>>>>>>> origin/meal-plan
    }

    let data = recipe.getJSON()

    expect(JSON.parse(data)).toStrictEqual(jsonCompare);
<<<<<<< HEAD
=======
})

test("Getting recipe types from Recipe's Ingredients", () => {
    let recipe = new Recipe("Chicken And Rice", [
        new Ingredient("Chicken", 1, 0, ingredientType.PROTIEN),
        new Ingredient("Rice", 1, 0, ingredientType.CARB),
    ])

    expect(recipe.getIngredientTypes()).toStrictEqual([ingredientType.PROTIEN, ingredientType.CARB]);
>>>>>>> origin/meal-plan
})
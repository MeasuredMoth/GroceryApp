<<<<<<< HEAD
<<<<<<< HEAD
import { Ingredient, quantityFormats } from "../recipe/ingredient";
import { Recipe } from "../recipe/recipe";
=======
import { Dictionary } from "data/types";
<<<<<<< HEAD
<<<<<<< HEAD
import { Ingredient, quantityFormats } from "../data/recipe/ingredient";
import { Recipe } from "../data/recipe/recipe";
>>>>>>> f76cf9a (Init cleanup of file directories to be root focused)
=======
import { Ingredient, quantityFormats } from "data/recipe/ingredient";
=======
import { Ingredient, ingredientType, quantityFormats } from "data/recipe/ingredient";
>>>>>>> ba0f552 (Added ingredient types)
import { Recipe } from "data/recipe/recipe";
>>>>>>> 623ab66 (Changed to root based imports)

test("Changing name of Recipe.", () => {
=======
import { Recipe } from "../recipe/recipe";

test("Changing name of Recipe", () => {
>>>>>>> e2ae8ad (Added setters + first recipe unit tests)
    let recipe = new Recipe();

    recipe.setName("Pie");

<<<<<<< HEAD
    expect(recipe.getName()).toBe("Pie")
=======
    expect(recipe.name).toBe("Pie")
>>>>>>> e2ae8ad (Added setters + first recipe unit tests)
});

test("Setting name of Recipe to nothing.", () => {
    let recipe = new Recipe();

    recipe.setName("Pie");
    recipe.setName("");
<<<<<<< HEAD

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
    }

    let data = recipe.getJSON()

    expect(JSON.parse(data)).toStrictEqual(jsonCompare);
<<<<<<< HEAD
=======
    
    expect(recipe.name).toBe("Pie");
>>>>>>> e2ae8ad (Added setters + first recipe unit tests)
=======
})

test("Getting recipe types from Recipe's Ingredients", () => {
    let recipe = new Recipe("Chicken And Rice", [
        new Ingredient("Chicken", 1, 0, ingredientType.PROTIEN),
        new Ingredient("Rice", 1, 0, ingredientType.CARB),
    ])

    expect(recipe.getIngredientTypes()).toStrictEqual([ingredientType.PROTIEN, ingredientType.CARB]);
>>>>>>> ba0f552 (Added ingredient types)
})
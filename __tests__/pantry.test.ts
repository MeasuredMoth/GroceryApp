import { Ingredient, ingredientType } from "data/recipe/ingredient";
import { Pantry } from "data/tracking/pantry"
import { Dictionary } from "data/types";

test("Adding individual ingredients.", () => {
    let pantry = new Pantry();

    let ingredient1 = new Ingredient("Apple");
    let ingredient2 = new Ingredient("Banana");
    let ingredient3 = new Ingredient("Carrot");

    pantry.addIngredient(ingredient1);
    pantry.addIngredient(ingredient2);
    pantry.addIngredient(ingredient3);

    expect(pantry.getIngredientLength()).toBe(3);
})

test("Adding ingredients as a group.", () => {
    let pantry = new Pantry();

    let ingredients = [
        new Ingredient("Apple"),
        new Ingredient("Banana"),
        new Ingredient("Carrot"),
    ]

    pantry.addIngredients(ingredients);

    expect(pantry.getIngredientLength()).toBe(3);
})

test("Getting Ingredient at index.", () => {
    let pantry = new Pantry()

    let ingredents = [
        new Ingredient("Apple"),
        new Ingredient("Banana"),
        new Ingredient("Carrot"),
        new Ingredient("Pineapple"),
    ]

    pantry.addIngredients(ingredents);

    expect(pantry.getIngredientByIndex(1)?.getName()).toBe("Banana");
})

test("Getting Ingredient by name.", () => {
    let pantry = new Pantry()

    let ingredients = [
        new Ingredient("Apple", { amount: 10, unit: "g" }),
        new Ingredient("Banana", { amount: 1, unit: "g" }),
        new Ingredient("Carrot", { amount: 5, unit: "g" }),
        new Ingredient("Pineapple", { amount: 100, unit: "g" }),
    ]

    pantry.addIngredients(ingredients);

    expect(pantry.getIngredientByName("Apple")?.getQuantity().amount).toBe(10);
})

test("Getting JSON", () => {
    let pantry = new Pantry();

    let ingredients: Ingredient[] = [
        new Ingredient("Apple", { amount: 100, unit: "g" }, ingredientType.FRUIT),
    ];

    pantry.addIngredients(ingredients);

    let jsonData = pantry.getJSON();

    expect(JSON.parse(jsonData)).toStrictEqual({
        "Apple": {
            "quantity": {amount: 100, unit: "g"},
            "type": ingredientType.FRUIT,
            "system": "metric"
        }
    })
})

test("Loading Ingredient by JSON.", () => {
    let pantry = new Pantry();

    let ingredients: Ingredient[] = [
        new Ingredient("Apple", { amount: 100, unit: "g" }),
        new Ingredient("Banana", { amount: 2, unit: "cup" }),
        new Ingredient("Carrot", { amount: 3, unit: "pinch" })
    ];
    
    let dJSON: Dictionary<any> = {}
    ingredients.forEach((value: Ingredient) => {
        dJSON[value.getName()] = value.getData();
    })
    
    pantry.loadFromJSON(JSON.stringify(dJSON));

    expect(pantry.getIngredientByIndex(0)?.getQuantity()).toStrictEqual({ amount: 100, unit: "g"});
    expect(pantry.getIngredientByIndex(1)?.getSystem()).toBe("imperial");
    expect(pantry.getIngredientByIndex(2)?.getName()).toBe("Carrot");
})
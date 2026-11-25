import { createRecipe, recipeToItems } from "../data/recipe/recipe"
import { PlanItem } from "../data/recipe/meal-plan"
import { createQuantity } from "../data/recipe/quantity"
import { IMPERIAL_UNITS, LITERAL_UNIT, METRIC_UNIT, RECIPE_CATEGORY } from "../data/util/types"

test("Create recipe", () => {
    let recipe = createRecipe(
        "Apple Pie", 
        [
            {ingredientId: "Apple", quantity: createQuantity(10, LITERAL_UNIT.PIECE)} ,
            {ingredientId: "Flour", quantity: createQuantity(50, METRIC_UNIT.KILOGRAM)},
        ],
        {
            category: RECIPE_CATEGORY.DESSERT,
        }
    )
    expect(recipe.name).toBe("Apple Pie");
    expect(recipe.category).toBe(RECIPE_CATEGORY.DESSERT);
    expect(recipe.items.at(0)?.ingredientId).toBe("Apple");
    expect(recipe.items.at(1)?.ingredientId).toBe("Flour");
})

test("Try bad parameters", () => {
    expect(() => createRecipe("     ")).toThrow(/name/);
})

test("Extract items from recipe", () => {
     let recipe = createRecipe(
        "Apple Pie", 
        [
            {ingredientId: "Apple", quantity: createQuantity(10, LITERAL_UNIT.PIECE)} ,
            {ingredientId: "Flour", quantity: createQuantity(50, METRIC_UNIT.KILOGRAM)},
            {ingredientId: "Sauce", quantity: createQuantity(100, IMPERIAL_UNITS.OUNCE)},
        ],
    )

    let recipeItems = recipeToItems(recipe);

    expect(recipeItems.at(0)?.ingredientId).toBe("Apple");
    expect(recipeItems.at(1)?.quantity.amount).toBe(50);
    expect(recipeItems.at(2)?.quantity.unit).toBe(IMPERIAL_UNITS.OUNCE);
})
test("A recipe is for one serving unless told otherwise", () => {
    expect(createRecipe("Toast").servings).toBe(1);
    expect(createRecipe("Lasagna", [], { servings: 4 }).servings).toBe(4);
    expect(() => createRecipe("Lasagna", [], { servings: 0 })).toThrow(/Servings/);
    expect(() => createRecipe("Lasagna", [], { servings: 1.5 })).toThrow(/Servings/);
})

test("Items are scaled to the number of servings", () => {
    const recipe = createRecipe(
        "Pancakes",
        [
            { ingredientId: "flour", quantity: createQuantity(200, METRIC_UNIT.GRAM) },
            { ingredientId: "eggs", quantity: createQuantity(2, LITERAL_UNIT.PIECE) },
            { ingredientId: "milk", quantity: createQuantity(100, METRIC_UNIT.MILILITER) },
        ],
        { servings: 2 },
    )

    const triple = recipeToItems(recipe, 6);
    expect(triple.map((i) => i.quantity.amount)).toEqual([600, 6, 300]);
    expect(triple[1].quantity.unit).toBe(LITERAL_UNIT.PIECE);

    // Rounded to 2 decimals
    expect(recipeToItems(createRecipe("Thirds", [recipe.items[2]], { servings: 3 }), 1)[0].quantity.amount).toBe(33.33);

    // The recipe itself is untouched
    expect(recipe.items[0].quantity.amount).toBe(200);
    // Without a count it uses the recipe's own servings
    expect(recipeToItems(recipe)[0].quantity.amount).toBe(200);
})

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
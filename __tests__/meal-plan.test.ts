import { ingredients } from "@/data/ingredientsData"
import { createMeal, PlanItem, validatePlanItem } from "../data/recipe/meal-plan"
import { createQuantity } from "../data/recipe/quantity"
import { INGREDIENT_CATEGORY, LITERAL_UNIT, MEAL_TYPE, MEASUREMENT_TYPE, METRIC_UNIT } from "../data/util/types"
import { createIngredient, Ingredient } from "../data/recipe/ingredient"

test("Create meal-plan", () => {
    expect(createMeal(MEAL_TYPE.BREAKFAST, "12:00").time).toBe("12:00")
    expect(
        createMeal(
            MEAL_TYPE.LUNCH, "18:00", 
            [{ingredientId: "apple", quantity: createQuantity(100, LITERAL_UNIT.PIECE)}]
    ).items.length).toBe(1)
    expect(createMeal(MEAL_TYPE.DINNER, "22:00", [] ,"Eat nothing.").note).toBe("Eat nothing.");
})

test("Validate item", () => {
    let ingredient: Ingredient = createIngredient("apple", [MEASUREMENT_TYPE.COUNT], INGREDIENT_CATEGORY.FRUIT);

    expect(validatePlanItem({ingredientId: "apple", quantity: createQuantity(1, LITERAL_UNIT.PIECE)}, (id: string) => { return ingredient })).toBe(null);
    expect(validatePlanItem({ingredientId: "apple", quantity: createQuantity(1, LITERAL_UNIT.PIECE)}, (id: string) => { return undefined})).toMatch(/Unknown/);
    expect(validatePlanItem({ingredientId: "apple", quantity: createQuantity(1, METRIC_UNIT.GRAM)}, (id: string) => { return ingredient })).toMatch(/measured/);

})
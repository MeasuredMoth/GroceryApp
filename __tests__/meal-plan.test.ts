import { Ingredient, quantityFormats } from "data/recipe/ingredient";
import { MealPlan } from "data/recipe/meal-plan"
import { Recipe } from "data/recipe/recipe";

test("Setting name of MealPlan", () => {
    let plan = new MealPlan("Week")

    expect(plan.getName()).toBe("Week");
})

test("Setting name of MealPlan to nothing", () => {
    let plan = new MealPlan("Week");

    plan.setName("");

    expect(plan.getName()).toBe("Week");
})

test("Adding recipes to meal plan.", () => {
    let recipes: Recipe[] = [
        new Recipe("Cooked Chicken", [new Ingredient("Chicken", 1, quantityFormats.LITERAL)]),
        new Recipe("Cooked Rice", [new Ingredient("Rice", 100, quantityFormats.METRIC)]),
        new Recipe("Apple Pie", [new Ingredient("Flour", 0.5, quantityFormats.IMPERIAL), new Ingredient("Apple", 1, quantityFormats.LITERAL)])
    ]

    plan.setName("Week");
    // TODO: Finish test
})
    
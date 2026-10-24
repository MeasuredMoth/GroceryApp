import { MealPlan } from "../recipe/meal-plan"
import { Recipe } from "../recipe/recipe";

test("Setting name of MealPlan", () => {
    let plan = new MealPlan()

    plan.setName("Week");

    expect(plan.getName()).toBe("Week");
})

test("Setting name of MealPlan to nothing", () => {
    let plan = new MealPlan();

    plan.setName("Week");
    plan.setName("");

    expect(plan.getName()).toBe("Week");
})

test("Adding recipes to meal plan.", () => {
    let plan = new MealPlan();

    let recipes: Recipe[] = [
        new Recipe(),
        new Recipe(),
        new Recipe()
    ]

    plan.setName("Week");
    // TODO: Finish test
})
    
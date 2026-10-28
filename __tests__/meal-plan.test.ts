import { Ingredient, ingredientType, quantityFormats } from "data/recipe/ingredient";
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
        new Recipe("Cooked Chicken", [
            new Ingredient("Chicken", {amount: 1, unit: "piece"}, ingredientType.PROTIEN)
        ]),
        new Recipe("Cooked Rice", [
            new Ingredient("Rice", {amount: 100, unit: "g"}, ingredientType.CARB)
        ]),
        new Recipe("Apple Pie", [
            new Ingredient("Flour", {amount: 1, unit: "kg"}, ingredientType.CARB), 
            new Ingredient("Apple", {amount: 100, unit: "g"},ingredientType.FRUIT)
        ])
    ]

    let plan = new MealPlan("Week", recipes);

    let jsonCompare = {
        "Week": {
            "Cooked Chicken": {
                "Chicken": {
                    "quantity": {amount: 1, unit: "piece"},
                    "type": ingredientType.PROTIEN,
                    "system": "literal",
                },
            },
            "Cooked Rice": {
                "Rice": {
                    "quantity": {amount: 100, unit: "g"},
                    "type": ingredientType.CARB,
                    "system": "metric",
                },
            },
            "Apple Pie": {
                "Flour": {
                    "quantity": {amount: 1, unit: "kg"},
                    "type": ingredientType.CARB,
                    "system": "metric",
                },
                "Apple": {
                    "quantity": {amount: 100, unit: "g"},
                    "type": ingredientType.FRUIT,
                    "system": "metric",
                }
            }
        }
    }

    let data = plan.getJSON();

    expect(JSON.parse(data)).toStrictEqual(jsonCompare)
})
    
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
            new Ingredient("Chicken", 1, quantityFormats.LITERAL, ingredientType.PROTIEN)
        ]),
        new Recipe("Cooked Rice", [
            new Ingredient("Rice", 100, quantityFormats.METRIC, ingredientType.CARB)
        ]),
        new Recipe("Apple Pie", [
            new Ingredient("Flour", 0.5, quantityFormats.IMPERIAL, ingredientType.CARB), 
            new Ingredient("Apple", 1, quantityFormats.LITERAL, ingredientType.FRUIT)
        ])
    ]

    let plan = new MealPlan("Week", recipes);

    let jsonCompare = {
        "Week": {
            "Cooked Chicken": {
                "Chicken": {
                    "quantity": 1,
                    "format": quantityFormats.LITERAL,
                    "type": ingredientType.PROTIEN
                },
            },
            "Cooked Rice": {
                "Rice": {
                    "quantity": 100,
                    "format": quantityFormats.METRIC,
                    "type": ingredientType.CARB
                },
            },
            "Apple Pie": {
                "Flour": {
                    "quantity": 0.5,
                    "format": quantityFormats.IMPERIAL,
                    "type": ingredientType.CARB
                },
                "Apple": {
                    "quantity": 1,
                    "format": quantityFormats.LITERAL,
                    "type": ingredientType.FRUIT
                }
            }
        }
    }

    let data = plan.getJSON();

    expect(JSON.parse(data)).toStrictEqual(jsonCompare)
})
    
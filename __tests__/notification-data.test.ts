import { createIngredient } from "../data/recipe/ingredient";
import { addMeal, createMeal, removeMeal } from "../data/recipe/meal-plan";
import { createPantryEntry } from "../data/recipe/pantry";
import { createQuantity } from "../data/recipe/quantity";
import { createAppData, setDone } from "../data/store/app-data";
import { INGREDIENT_CATEGORY, LITERAL_UNIT, MEAL_TYPE, MEASUREMENT_TYPE, METRIC_UNIT } from "../data/util/types";
import { toNotificationData } from "../src/notifications/notificationData";
import { DEFAULT_SETTINGS, planNotifications } from "../src/notifications/planner";

// Wednesday, Nov 4 2026 at 10:00 local time
const NOW = new Date(2026, 10, 4, 10, 0);

const milk = createIngredient("Milk", [MEASUREMENT_TYPE.VOLUME], INGREDIENT_CATEGORY.DIARY, "milk");
const oats = createIngredient("Oats", [MEASUREMENT_TYPE.MASS], INGREDIENT_CATEGORY.CARB, "oats");
const banana = createIngredient("Banana", [MEASUREMENT_TYPE.COUNT], INGREDIENT_CATEGORY.FRUIT, "banana");
const items = [{ ingredientId: "milk", quantity: createQuantity(200, METRIC_UNIT.MILILITER) }];

function emptyData() {
    return createAppData({ ingredients: [milk, oats, banana], recipes: [] });
}

test("A weekly meal appears once for each day in the window", () => {
    const data = emptyData();
    data.plan = addMeal(data.plan, NOW, createMeal(MEAL_TYPE.DINNER, "19:00", items), "weekday");

    const { meals } = toNotificationData(data, NOW);

    expect(meals).toEqual([
        { recipeName: "Dinner (Milk)", at: new Date(2026, 10, 4, 19, 0) },
        { recipeName: "Dinner (Milk)", at: new Date(2026, 10, 11, 19, 0) },
    ]);
})

test("Changes for a single day are respected", () => {
    const data = emptyData();
    const dinner = createMeal(MEAL_TYPE.DINNER, "19:00", items);
    data.plan = addMeal(data.plan, NOW, dinner, "weekday");
    data.plan = removeMeal(data.plan, NOW, dinner.id, "day");
    data.plan = addMeal(data.plan, NOW, createMeal(MEAL_TYPE.SNACK, "16:00", items), "day");

    const { meals } = toNotificationData(data, NOW);

    expect(meals).toEqual([
        { recipeName: "Snack (Milk)", at: new Date(2026, 10, 4, 16, 0) },
        { recipeName: "Dinner (Milk)", at: new Date(2026, 10, 11, 19, 0) },
    ]);
})

test("Empty meals and meals already eaten are left out", () => {
    const data = emptyData();
    const lunch = createMeal(MEAL_TYPE.LUNCH, "12:30", items);
    data.plan = addMeal(data.plan, NOW, lunch, "day");
    data.plan = addMeal(data.plan, NOW, createMeal(MEAL_TYPE.DINNER, "19:00"), "day");
    data.done = setDone({}, NOW, [lunch.id], true);

    expect(toNotificationData(data, NOW).meals).toEqual([]);
})

test("Pantry entries with an expiry date are passed on by ingredient name", () => {
    const data = emptyData();
    data.pantry = [
        createPantryEntry(milk, createQuantity(1, METRIC_UNIT.LITER), "2026-11-06"),
        createPantryEntry(milk, createQuantity(1, METRIC_UNIT.LITER)), // no expiry date
        createPantryEntry(milk, createQuantity(0, METRIC_UNIT.LITER), "2026-11-05"), // none left
        { id: "p", ingredientId: "deleted", amount: 1, unit: METRIC_UNIT.LITER, expiresOn: "2026-11-05" },
    ];

    expect(toNotificationData(data, NOW).pantry).toEqual([{ name: "Milk", expiresOn: new Date(2026, 10, 6) }]);
})

test("Saved data turns into a meal reminder and an expiry reminder", () => {
    const data = emptyData();
    data.plan = addMeal(data.plan, NOW, createMeal(MEAL_TYPE.DINNER, "19:00", items), "day");
    data.pantry = [createPantryEntry(milk, createQuantity(1, METRIC_UNIT.LITER), "2026-11-07")];
    const settings = {
        ...DEFAULT_SETTINGS,
        mealPrep: { enabled: true, hoursBefore: 2 },
        expiry: { enabled: true, daysBefore: 2, hour: 9, minute: 0 },
    };

    const plan = planNotifications(toNotificationData(data, NOW), settings, NOW);

    expect(plan.map((n) => [n.body, n.url])).toEqual([
        ["Dinner (Milk) is planned for 7:00 PM", "/mealplanTab"],
        ["Milk expires in 2 days", "/pantryTab"],
    ]);
})

test("Reminders name up to two ingredients, once each", () => {
    const data = emptyData();
    const breakfast = createMeal(MEAL_TYPE.BREAKFAST, "08:00", [
        { ingredientId: "oats", quantity: createQuantity(80, METRIC_UNIT.GRAM) },
        { ingredientId: "milk", quantity: createQuantity(200, METRIC_UNIT.MILILITER) },
        { ingredientId: "oats", quantity: createQuantity(10, METRIC_UNIT.GRAM)  },
        { ingredientId: "banana", quantity: createQuantity(1, LITERAL_UNIT.PIECE)  },
    ]);
    const snack = createMeal(MEAL_TYPE.SNACK, "16:00", [{ ingredientId: "deleted", quantity: createQuantity(1, LITERAL_UNIT.PIECE) }]);
    data.plan = addMeal(data.plan, NOW, breakfast, "day");
    data.plan = addMeal(data.plan, new Date(2026, 10, 5), snack, "day");

    expect(toNotificationData(data, NOW).meals.map((m) => m.recipeName)).toEqual([
        "Breakfast (Oats, Milk +1 more)",
        "Snack",
    ]);
})

import { createIngredient } from "../data/recipe/ingredient";
import { addMeal, createMeal, removeMeal } from "../data/recipe/meal-plan";
import { createPantryEntry } from "../data/recipe/pantry";
import { createAppData, setDone } from "../data/store/app-data";
import { toNotificationData } from "../src/notifications/notificationData";
import { DEFAULT_SETTINGS, planNotifications } from "../src/notifications/planner";

// Wednesday, Nov 4 2026 at 10:00 local time
const NOW = new Date(2026, 10, 4, 10, 0);

const milk = createIngredient("Milk", ["ml", "l"], "Dairy", "milk");
const items = [{ ingredientId: "milk", amount: 200, unit: "ml" as const }];

function emptyData() {
    return createAppData({ ingredients: [milk], recipes: [] });
}

test("A weekly meal appears once for each day in the window", () => {
    const data = emptyData();
    data.plan = addMeal(data.plan, NOW, createMeal("Dinner", "19:00", items), "weekday");

    const { meals } = toNotificationData(data, NOW);

    expect(meals).toEqual([
        { recipeName: "Dinner", at: new Date(2026, 10, 4, 19, 0) },
        { recipeName: "Dinner", at: new Date(2026, 10, 11, 19, 0) },
    ]);
})

test("Changes for a single day are respected", () => {
    const data = emptyData();
    const dinner = createMeal("Dinner", "19:00", items);
    data.plan = addMeal(data.plan, NOW, dinner, "weekday");
    data.plan = removeMeal(data.plan, NOW, dinner.id, "day");
    data.plan = addMeal(data.plan, NOW, createMeal("Snack", "16:00", items), "day");

    const { meals } = toNotificationData(data, NOW);

    expect(meals).toEqual([
        { recipeName: "Snack", at: new Date(2026, 10, 4, 16, 0) },
        { recipeName: "Dinner", at: new Date(2026, 10, 11, 19, 0) },
    ]);
})

test("Empty meals and meals already eaten are left out", () => {
    const data = emptyData();
    const lunch = createMeal("Lunch", "12:30", items);
    data.plan = addMeal(data.plan, NOW, lunch, "day");
    data.plan = addMeal(data.plan, NOW, createMeal("Dinner", "19:00"), "day");
    data.done = setDone({}, NOW, [lunch.id], true);

    expect(toNotificationData(data, NOW).meals).toEqual([]);
})

test("Pantry entries with an expiry date are passed on by ingredient name", () => {
    const data = emptyData();
    data.pantry = [
        createPantryEntry(milk, { amount: 1, unit: "l" }, "2026-11-06"),
        createPantryEntry(milk, { amount: 1, unit: "l" }), // no expiry date
        createPantryEntry(milk, { amount: 0, unit: "l" }, "2026-11-05"), // none left
        { id: "p", ingredientId: "deleted", amount: 1, unit: "l", expiresOn: "2026-11-05" },
    ];

    expect(toNotificationData(data, NOW).pantry).toEqual([{ name: "Milk", expiresOn: new Date(2026, 10, 6) }]);
})

test("Saved data turns into a meal reminder and an expiry reminder", () => {
    const data = emptyData();
    data.plan = addMeal(data.plan, NOW, createMeal("Dinner", "19:00", items), "day");
    data.pantry = [createPantryEntry(milk, { amount: 1, unit: "l" }, "2026-11-07")];
    const settings = {
        ...DEFAULT_SETTINGS,
        mealPrep: { enabled: true, hoursBefore: 2 },
        expiry: { enabled: true, daysBefore: 2, hour: 9, minute: 0 },
    };

    const plan = planNotifications(toNotificationData(data, NOW), settings, NOW);

    expect(plan.map((n) => [n.body, n.url])).toEqual([
        ["Dinner is planned for 7:00 PM", "/mealplanTab"],
        ["Milk expires in 2 days", "/pantryTab"],
    ]);
})

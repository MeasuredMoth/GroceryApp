import {
    DEFAULT_SETTINGS,
    NotificationSettings,
    formatTime,
    planNotifications,
    sanitizeSettings,
} from "../src/notifications/planner";

// Wednesday, Nov 4 2026 at 10:00 local time
const NOW = new Date(2026, 10, 4, 10, 0);

const noData = { meals: [], pantry: [] };

function settingsWith(changes: Partial<NotificationSettings>): NotificationSettings {
    return { ...DEFAULT_SETTINGS, ...changes };
}

const mealPrepOn = settingsWith({ mealPrep: { enabled: true, hoursBefore: 2 } });
const expiryOn = settingsWith({ expiry: { enabled: true, daysBefore: 2, hour: 9, minute: 0 } });

function firesAt(notification: { trigger: any }): Date {
    return notification.trigger.date;
}

test("Nothing is scheduled by default", () => {
    let meal = { recipeName: "Pie", at: new Date(2026, 10, 5, 18, 0) };
    let item = { name: "Milk", expiresOn: new Date(2026, 10, 6) };

    expect(planNotifications({ meals: [meal], pantry: [item] }, DEFAULT_SETTINGS, NOW)).toEqual([]);
})

test("Weekly reminder uses the chosen day and time", () => {
    let settings = settingsWith({ weeklyPlan: { enabled: true, weekday: 3, hour: 7, minute: 30 } });

    let plan = planNotifications(noData, settings, NOW);

    expect(plan.length).toBe(1);
    expect(plan[0].url).toBe("/mealplan");
    expect(plan[0].trigger).toEqual({ kind: "weekly", weekday: 3, hour: 7, minute: 30 });
})

test("Meal reminder fires before the meal", () => {
    let meals = [{ recipeName: "Pie", at: new Date(2026, 10, 4, 18, 0) }];

    let plan = planNotifications({ meals, pantry: [] }, mealPrepOn, NOW);

    expect(plan.length).toBe(1);
    expect(firesAt(plan[0])).toEqual(new Date(2026, 10, 4, 16, 0));
    expect(plan[0].body).toBe("Pie is planned for 6:00 PM");
})

test("Meal reminder that would fire in the past is skipped", () => {
    // Prep time was 09:30, half an hour ago, even though the meal itself is still ahead
    let meals = [{ recipeName: "Pie", at: new Date(2026, 10, 4, 11, 30) }];

    expect(planNotifications({ meals, pantry: [] }, mealPrepOn, NOW)).toEqual([]);
})

test("Meal reminder beyond the 7 day window is skipped", () => {
    let meals = [{ recipeName: "Pie", at: new Date(2026, 10, 20, 18, 0) }];

    expect(planNotifications({ meals, pantry: [] }, mealPrepOn, NOW)).toEqual([]);
})

test("Meal with an invalid date is skipped", () => {
    let meals = [{ recipeName: "Pie", at: new Date("not a date") }];

    expect(planNotifications({ meals, pantry: [] }, mealPrepOn, NOW)).toEqual([]);
})

test("Reminder mentions tomorrow when prep starts the day before", () => {
    let settings = settingsWith({ mealPrep: { enabled: true, hoursBefore: 24 } });
    let meals = [{ recipeName: "Pie", at: new Date(2026, 10, 6, 18, 0) }];

    let plan = planNotifications({ meals, pantry: [] }, settings, NOW);

    expect(plan[0].body).toBe("Pie is planned for tomorrow at 6:00 PM");
})

test("Same recipe twice gets two different ids", () => {
    let meals = [
        { recipeName: "Pie", at: new Date(2026, 10, 5, 18, 0) },
        { recipeName: "Pie", at: new Date(2026, 10, 6, 18, 0) },
    ];

    let plan = planNotifications({ meals, pantry: [] }, mealPrepOn, NOW);

    expect(new Set(plan.map((notification) => notification.id)).size).toBe(2);
})

test("Expiry alert fires the chosen number of days before", () => {
    let pantry = [{ name: "Milk", expiresOn: new Date(2026, 10, 8) }];

    let plan = planNotifications({ meals: [], pantry }, expiryOn, NOW);

    expect(plan.length).toBe(1);
    expect(plan[0].url).toBe("/ingredientsTab");
    expect(firesAt(plan[0])).toEqual(new Date(2026, 10, 6, 9, 0));
    expect(plan[0].body).toBe("Milk expires in 2 days");
})

test("Items alerted on the same day share one notification", () => {
    let pantry = [
        { name: "Milk", expiresOn: new Date(2026, 10, 8) },
        { name: "Spinach", expiresOn: new Date(2026, 10, 8) },
    ];

    let plan = planNotifications({ meals: [], pantry }, expiryOn, NOW);

    expect(plan.length).toBe(1);
    expect(plan[0].body).toBe("Milk (in 2 days), Spinach (in 2 days)");
})

test("Item expiring tomorrow still alerts when its usual time has passed", () => {
    // 2 days before would have been yesterday, and 09:00 today has passed too
    let pantry = [{ name: "Milk", expiresOn: new Date(2026, 10, 5) }];

    let plan = planNotifications({ meals: [], pantry }, expiryOn, NOW);

    expect(firesAt(plan[0])).toEqual(new Date(2026, 10, 5, 9, 0));
    expect(plan[0].body).toBe("Milk expires today");
})

test("Item expiring today alerts later today if the time has not passed", () => {
    let settings = settingsWith({ expiry: { enabled: true, daysBefore: 2, hour: 17, minute: 0 } });
    let pantry = [{ name: "Milk", expiresOn: new Date(2026, 10, 4) }];

    let plan = planNotifications({ meals: [], pantry }, settings, NOW);

    expect(firesAt(plan[0])).toEqual(new Date(2026, 10, 4, 17, 0));
})

test("Already expired items and items past today's alert time are skipped", () => {
    let pantry = [
        { name: "Old milk", expiresOn: new Date(2026, 10, 1) },
        { name: "Today's milk", expiresOn: new Date(2026, 10, 4) },
    ];

    expect(planNotifications({ meals: [], pantry }, expiryOn, NOW)).toEqual([]);
})

test("Never schedules more than the iOS limit and keeps the soonest", () => {
    let settings = settingsWith({
        weeklyPlan: { enabled: true, weekday: 1, hour: 18, minute: 0 },
        mealPrep: { enabled: true, hoursBefore: 0 },
    });
    let meals = [];
    for (let i = 100; i > 0; i--) {
        meals.push({ recipeName: `Meal ${i}`, at: new Date(NOW.getTime() + i * 60 * 60 * 1000) });
    }

    let plan = planNotifications({ meals, pantry: [] }, settings, NOW);

    expect(plan.length).toBe(64);
    expect(plan[0].id).toBe("weekly-plan");
    expect(plan[1].body).toContain("Meal 1 ");
})

test("Formatting times", () => {
    expect(formatTime(0, 0)).toBe("12:00 AM");
    expect(formatTime(9, 5)).toBe("9:05 AM");
    expect(formatTime(12, 0)).toBe("12:00 PM");
    expect(formatTime(18, 30)).toBe("6:30 PM");
})

test("Bad saved settings fall back to defaults", () => {
    expect(sanitizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings("garbage")).toEqual(DEFAULT_SETTINGS);

    let settings = sanitizeSettings({ weeklyPlan: { enabled: "yes", weekday: 9, hour: 8.5, minute: -1 } });

    expect(settings.weeklyPlan).toEqual(DEFAULT_SETTINGS.weeklyPlan);
})

test("Good saved settings are kept", () => {
    let saved = {
        weeklyPlan: { enabled: true, weekday: 7, hour: 23, minute: 59 },
        mealPrep: { enabled: true, hoursBefore: 4 },
        expiry: { enabled: true, daysBefore: 1, hour: 8, minute: 15 },
    };

    expect(sanitizeSettings(saved)).toEqual(saved);
})

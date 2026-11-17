// Picks out of the saved data what the notification planner needs.
// No Expo imports in this file, so it can be unit tested with Jest.

import { AppData, doneKey } from "../../data/store/app-data";
import { mealsFor } from "../../data/recipe/meal-plan";
import { NotificationData } from "./planner";

// Today plus the next 7 days, the same window planner.ts schedules one-time notifications in
const DAYS_AHEAD = 7;

export function toNotificationData(data: AppData, now: Date = new Date()): NotificationData {
  const meals: NotificationData["meals"] = [];

  for (let offset = 0; offset <= DAYS_AHEAD; offset++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);

    for (const meal of mealsFor(data.plan, day)) {
      // An empty slot has nothing to prepare, and a meal already ticked off needs no reminder
      if (meal.items.length === 0 || data.done[doneKey(day, meal.id)]) continue;

      const [hour, minute] = meal.time.split(":").map(Number);
      meals.push({
        recipeName: meal.type, // meals are a list of ingredients now, so the reminder names the slot
        at: new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute),
      });
    }
  }

  const pantry: NotificationData["pantry"] = [];
  for (const entry of data.pantry) {
    const ingredient = data.ingredients.find((i) => i.id === entry.ingredientId);
    if (!ingredient || !entry.expiresOn || entry.amount === 0) continue;

    // Built from the parts because new Date("YYYY-MM-DD") is UTC and can land on the day before
    const [year, month, date] = entry.expiresOn.split("-").map(Number);
    pantry.push({ name: ingredient.name, expiresOn: new Date(year, month - 1, date) });
  }

  return { meals, pantry };
}

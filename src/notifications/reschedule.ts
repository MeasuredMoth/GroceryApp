// The one function to call whenever anything notifications depend on has changed.

import { Platform } from "react-native";
import { applyPlan, hasNotificationPermission } from "./notifications";
import { loadNotificationSettings } from "./notificationSettings";
import { NotificationData, planNotifications } from "./planner";

// TODO: connect real data once it exists, then call rescheduleNotifications() after saving it.
//  - meals: needs a date and time on each MealPlan entry
//  - pantry: needs an expiry date on Ingredient
// The meal prep and expiry rules in planner.ts are ready and tested for when these arrive.
function loadNotificationData(): NotificationData {
  return { meals: [], pantry: [] };
}

let queue: Promise<void> = Promise.resolve();

/**
 * Rebuilds all scheduled notifications from the saved settings and data.
 * Never shows the permission prompt. Runs one at a time, so quick changes in
 * Settings can't overlap and leave an old reminder behind.
 */
export function rescheduleNotifications(): Promise<void> {
  const run = async () => {
    if (Platform.OS === "web") return;
    if (!(await hasNotificationPermission())) return;

    await applyPlan(planNotifications(loadNotificationData(), loadNotificationSettings()));
  };

  queue = queue.then(run, run);
  return queue;
}

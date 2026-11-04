// Local notifications (scheduled on the device, no server needed).
// Works in Expo Go on Android. Remote push would need a development build.

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { PlannedNotification, PlannedTrigger } from "./planner";

const CHANNEL_ID = "default";
const TEST_NOTIFICATION_ID = "test";

// Show notifications as a banner even when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function createChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "General",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

/** Creates the Android channel and asks for permission. Returns true if allowed. */
export async function setupNotifications(): Promise<boolean> {
  // Android 13+ won't show the permission prompt until a channel exists
  await createChannel();

  if (await hasNotificationPermission()) return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/** Checks for permission without ever showing the prompt. */
export async function hasNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

function toExpoTrigger(trigger: PlannedTrigger): Notifications.SchedulableNotificationTriggerInput {
  if (trigger.kind === "weekly") {
    return {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: trigger.weekday,
      hour: trigger.hour,
      minute: trigger.minute,
      channelId: CHANNEL_ID,
    };
  }

  return {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: trigger.date,
    channelId: CHANNEL_ID,
  };
}

/** Replaces everything currently scheduled on the device with this plan. */
export async function applyPlan(plan: PlannedNotification[]) {
  await createChannel();

  // A test notification may be on its way, so it is the one thing left in place
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.identifier !== TEST_NOTIFICATION_ID) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }

  for (const notification of plan) {
    await Notifications.scheduleNotificationAsync({
      identifier: notification.id,
      content: {
        title: notification.title,
        body: notification.body,
        data: { url: notification.url },
      },
      trigger: toExpoTrigger(notification.trigger),
    });
  }
}

/** Schedules a test notification `seconds` from now. Returns its id. */
export async function scheduleTestNotification(seconds: number = 5): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    identifier: TEST_NOTIFICATION_ID,
    content: {
      title: "GroceryMeal",
      body: "Test notification: notifications are working!",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: seconds,
      channelId: CHANNEL_ID,
    },
  });
}

// Local notifications (scheduled on the device, no server needed).
// Works in Expo Go on Android. Remote push would need a development build.

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const CHANNEL_ID = "default";

// Show notifications as a banner even when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Creates the Android channel and asks for permission. Returns true if allowed. */
export async function setupNotifications(): Promise<boolean> {
  // Android 13+ won't show the permission prompt until a channel exists
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "General",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/** Schedules a test notification `seconds` from now. Returns its id. */
export async function scheduleTestNotification(seconds: number = 5): Promise<string> {
  return Notifications.scheduleNotificationAsync({
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

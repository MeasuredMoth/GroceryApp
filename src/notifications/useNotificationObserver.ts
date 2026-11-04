import { useEffect } from "react";
import { Platform } from "react-native";
import { Href, router } from "expo-router";
import * as Notifications from "expo-notifications";
import { rescheduleNotifications } from "./reschedule";

function openScreen(notification: Notifications.Notification) {
  const url = notification.request.content.data?.url;
  if (typeof url === "string") {
    router.push(url as Href);
    Notifications.clearLastNotificationResponse();
  }
}

/** Opens the right screen when a notification is tapped, and refreshes the schedule on launch. */
export function useNotificationObserver() {
  useEffect(() => {
    if (Platform.OS === "web") return;

    rescheduleNotifications().catch((error) => console.warn("Could not schedule notifications", error));

    // Tapped while the app was closed
    const response = Notifications.getLastNotificationResponse();
    if (response?.notification) openScreen(response.notification);

    // Tapped while the app was open or in the background
    const subscription = Notifications.addNotificationResponseReceivedListener((tapped) => {
      openScreen(tapped.notification);
    });

    return () => subscription.remove();
  }, []);
}

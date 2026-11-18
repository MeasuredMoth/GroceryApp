import { useEffect } from "react";
import { Platform } from "react-native";
import { Href, router } from "expo-router";
import * as Notifications from "expo-notifications";
import { rescheduleNotifications } from "./reschedule";
import { appStore } from "../storage/appStore";

// Several edits in a row (ticking off a few meals) only rebuild the schedule once
const RESCHEDULE_DELAY_MS = 1000;

function refreshSchedule() {
  rescheduleNotifications().catch((error) => console.warn("Could not schedule notifications", error));
}

function openScreen(notification: Notifications.Notification) {
  const url = notification.request.content.data?.url;
  if (typeof url === "string") {
    router.push(url as Href);
    Notifications.clearLastNotificationResponse();
  }
}

/** Opens the right screen when a notification is tapped, and keeps the schedule in step with the saved data. */
export function useNotificationObserver() {
  useEffect(() => {
    if (Platform.OS === "web") return;

    refreshSchedule();

    // The meal and expiry reminders depend on the plan and the pantry
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stopWatching = appStore.subscribe(() => {
      clearTimeout(timer);
      timer = setTimeout(refreshSchedule, RESCHEDULE_DELAY_MS);
    });

    // Tapped while the app was closed
    const response = Notifications.getLastNotificationResponse();
    if (response?.notification) openScreen(response.notification);

    // Tapped while the app was open or in the background
    const subscription = Notifications.addNotificationResponseReceivedListener((tapped) => {
      openScreen(tapped.notification);
    });

    return () => {
      subscription.remove();
      stopWatching();
      clearTimeout(timer);
    };
  }, []);
}

// Saves the user's notification choices on the device.

import { File, Paths } from "expo-file-system";
import { DEFAULT_SETTINGS, NotificationSettings, sanitizeSettings } from "./planner";

// Created on use because the file system isn't available when rendering for web
function settingsFile() {
  return new File(Paths.document, "notification-settings.json");
}

export function loadNotificationSettings(): NotificationSettings {
  try {
    const file = settingsFile();
    return file.exists ? sanitizeSettings(JSON.parse(file.textSync())) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveNotificationSettings(settings: NotificationSettings) {
  const file = settingsFile();
  if (!file.exists) file.create();
  file.writeSync(JSON.stringify(settings, null, 2));
}

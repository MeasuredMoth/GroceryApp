import { Colors } from "@/constants/Colors";
import { hasNotificationPermission, scheduleTestNotification, setupNotifications } from "@/notifications/notifications";
import { loadNotificationSettings, saveNotificationSettings } from "@/notifications/notificationSettings";
import { NotificationSettings, WEEKDAY_NAMES, formatTime } from "@/notifications/planner";
import { rescheduleNotifications } from "@/notifications/reschedule";
import { useEffect, useState } from "react";
import { AppState, Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

const MINUTES_IN_DAY = 24 * 60;

function refreshSchedule() {
  rescheduleNotifications().catch((error) => console.warn("Could not schedule notifications", error));
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>(loadNotificationSettings);
  const [permissionAllowed, setPermissionAllowed] = useState(true);
  const [wasDenied, setWasDenied] = useState(false);
  const [testStatus, setTestStatus] = useState("");

  const weekly = settings.weeklyPlan;
  const needsPermission = !permissionAllowed && (weekly.enabled || wasDenied);

  // Permission can change outside the app, so check again whenever the user comes back
  useEffect(() => {
    if (Platform.OS === "web") return;

    const checkPermission = async () => {
      const allowed = await hasNotificationPermission();
      setPermissionAllowed(allowed);
      if (allowed) refreshSchedule();
    };

    checkPermission();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") checkPermission();
    });

    return () => subscription.remove();
  }, []);

  const updateWeekly = (changes: Partial<NotificationSettings["weeklyPlan"]>) => {
    const next = { ...settings, weeklyPlan: { ...weekly, ...changes } };
    setSettings(next);
    saveNotificationSettings(next);
    refreshSchedule();
  };

  // Only asks for permission when the user actually turns a reminder on
  const askPermission = async () => {
    const allowed = await setupNotifications();
    setPermissionAllowed(allowed);
    setWasDenied(!allowed);
    return allowed;
  };

  const toggleWeekly = async (enabled: boolean) => {
    if (enabled && !(await askPermission())) return;
    updateWeekly({ enabled });
  };

  const changeTime = (minutes: number) => {
    const total = (weekly.hour * 60 + weekly.minute + minutes + MINUTES_IN_DAY) % MINUTES_IN_DAY;
    updateWeekly({ hour: Math.floor(total / 60), minute: total % 60 });
  };

  const sendTestNotification = async () => {
    if (!(await askPermission())) return;
    await scheduleTestNotification(5);
    setTestStatus("Scheduled! It will appear in 5 seconds.");
  };

  if (Platform.OS === "web") {
    return (
      <View style={styles.screen}>
        <Text style={styles.hint}>Notifications are only available in the phone app.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Notifications</Text>

      {needsPermission && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>Notifications are turned off for this app on your phone.</Text>
          <Pressable onPress={() => Linking.openSettings()} accessibilityRole="button">
            <Text style={styles.warningLink}>Open phone settings</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.label}>Weekly planning reminder</Text>
            <Text style={styles.hint}>A nudge to plan your meals for the week</Text>
          </View>
          <Switch
            value={weekly.enabled}
            onValueChange={toggleWeekly}
            trackColor={{ true: Colors.primary }}
            accessibilityLabel="Weekly planning reminder"
          />
        </View>

        {weekly.enabled && (
          <>
            <View style={styles.days}>
              {WEEKDAY_NAMES.map((name, index) => {
                const weekday = index + 1;
                const selected = weekly.weekday === weekday;
                return (
                  <Pressable
                    key={name}
                    style={[styles.day, selected && styles.daySelected]}
                    onPress={() => updateWeekly({ weekday })}
                    accessibilityRole="button"
                    accessibilityLabel={name}
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.dayText, selected && styles.daySelectedText]}>{name.slice(0, 1)}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.time}>{WEEKDAY_NAMES[weekly.weekday - 1]} at {formatTime(weekly.hour, weekly.minute)}</Text>

            <View style={styles.timeButtons}>
              {[{ label: "-1 hr", minutes: -60 }, { label: "+1 hr", minutes: 60 }, { label: "-15 min", minutes: -15 }, { label: "+15 min", minutes: 15 }].map((step) => (
                <Pressable key={step.label} style={styles.timeButton} onPress={() => changeTime(step.minutes)} accessibilityRole="button">
                  <Text style={styles.timeButtonText}>{step.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>

      {/* For checking notifications work on a device. Hidden in release builds. */}
      {__DEV__ && (
        <>
          <Pressable style={styles.testButton} onPress={sendTestNotification} accessibilityRole="button">
            <Text style={styles.testButtonText}>Send test notification</Text>
          </Pressable>
          {testStatus !== "" && <Text style={styles.hint}>{testStatus}</Text>}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  hint: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 2,
  },
  days: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  day: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
  },
  daySelected: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  daySelectedText: {
    color: Colors.textOnPrimary,
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    textAlign: 'center',
  },
  timeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: Colors.primarySoft,
  },
  timeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  warning: {
    backgroundColor: Colors.breakfastBg,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  warningText: {
    fontSize: 14,
    color: Colors.textDark,
  },
  warningLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  testButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

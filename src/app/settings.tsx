import { Colors } from "@/constants/Colors";
import { hasNotificationPermission, scheduleTestNotification, setupNotifications } from "@/notifications/notifications";
import { loadNotificationSettings, saveNotificationSettings } from "@/notifications/notificationSettings";
import { NotificationSettings, WEEKDAY_NAMES, formatTime } from "@/notifications/planner";
import { rescheduleNotifications } from "@/notifications/reschedule";
import { useEffect, useState } from "react";
import { AppState, Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

const MINUTES_IN_DAY = 24 * 60;

// The same limits sanitizeSettings() in planner.ts accepts
const MAX_HOURS_BEFORE = 48;
const MAX_DAYS_BEFORE = 14;

const TIME_STEPS = [
  { label: "-1 hr", minutes: -60 },
  { label: "+1 hr", minutes: 60 },
  { label: "-15 min", minutes: -15 },
  { label: "+15 min", minutes: 15 },
];

function hoursBeforeLabel(hours: number): string {
  if (hours === 0) return "At meal time";
  return `${hours} ${hours === 1 ? "hour" : "hours"} before`;
}

function daysBeforeLabel(days: number): string {
  if (days === 0) return "On the day it expires";
  return `${days} ${days === 1 ? "day" : "days"} before`;
}

/** A value with a minus and a plus button on each side. */
function Stepper({ label, onMinus, onPlus, minusLabel, plusLabel }: {
  label: string;
  onMinus: () => void;
  onPlus: () => void;
  minusLabel: string;
  plusLabel: string;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable style={styles.stepButton} onPress={onMinus} accessibilityRole="button" accessibilityLabel={minusLabel}>
        <Text style={styles.stepButtonText}>-</Text>
      </Pressable>
      <Text style={styles.stepperLabel}>{label}</Text>
      <Pressable style={styles.stepButton} onPress={onPlus} accessibilityRole="button" accessibilityLabel={plusLabel}>
        <Text style={styles.stepButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

function refreshSchedule() {
  rescheduleNotifications().catch((error) => console.warn("Could not schedule notifications", error));
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>(loadNotificationSettings);
  const [permissionAllowed, setPermissionAllowed] = useState(true);
  const [wasDenied, setWasDenied] = useState(false);
  const [testStatus, setTestStatus] = useState("");

  const weekly = settings.weeklyPlan;
  const mealPrep = settings.mealPrep;
  const expiry = settings.expiry;
  const anyEnabled = weekly.enabled || mealPrep.enabled || expiry.enabled;
  const needsPermission = !permissionAllowed && (anyEnabled || wasDenied);

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

  // Saves a change to one reminder and rebuilds the schedule
  const update = <K extends keyof NotificationSettings>(key: K, changes: Partial<NotificationSettings[K]>) => {
    const next = { ...settings, [key]: { ...settings[key], ...changes } };
    setSettings(next);
    saveNotificationSettings(next);
    refreshSchedule();
  };
  const updateWeekly = (changes: Partial<NotificationSettings["weeklyPlan"]>) => update("weeklyPlan", changes);

  // Only asks for permission when the user actually turns a reminder on
  const askPermission = async () => {
    const allowed = await setupNotifications();
    setPermissionAllowed(allowed);
    setWasDenied(!allowed);
    return allowed;
  };

  // Turning a reminder on asks for permission first, and stays off if it's refused
  const toggle = async (key: keyof NotificationSettings, enabled: boolean) => {
    if (enabled && !(await askPermission())) return;
    update(key, { enabled });
  };

  /** Moves a time of day by `minutes`, wrapping past midnight. */
  const shiftTime = (hour: number, minute: number, minutes: number) => {
    const total = (hour * 60 + minute + minutes + MINUTES_IN_DAY) % MINUTES_IN_DAY;
    return { hour: Math.floor(total / 60), minute: total % 60 };
  };

  const changeTime = (minutes: number) => updateWeekly(shiftTime(weekly.hour, weekly.minute, minutes));
  const changeExpiryTime = (minutes: number) => update("expiry", shiftTime(expiry.hour, expiry.minute, minutes));

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
    // The automatic inset starts the content below the top bar on iOS, where the bar floats over the screen
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
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
            onValueChange={(enabled) => toggle("weeklyPlan", enabled)}
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
              {TIME_STEPS.map((step) => (
                <Pressable key={step.label} style={styles.timeButton} onPress={() => changeTime(step.minutes)} accessibilityRole="button">
                  <Text style={styles.timeButtonText}>{step.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.label}>Meal prep reminders</Text>
            <Text style={styles.hint}>Before each planned meal, so you have time to cook</Text>
          </View>
          <Switch
            value={mealPrep.enabled}
            onValueChange={(enabled) => toggle("mealPrep", enabled)}
            trackColor={{ true: Colors.primary }}
            accessibilityLabel="Meal prep reminders"
          />
        </View>

        {mealPrep.enabled && (
          <Stepper
            label={hoursBeforeLabel(mealPrep.hoursBefore)}
            onMinus={() => update("mealPrep", { hoursBefore: Math.max(0, mealPrep.hoursBefore - 1) })}
            onPlus={() => update("mealPrep", { hoursBefore: Math.min(MAX_HOURS_BEFORE, mealPrep.hoursBefore + 1) })}
            minusLabel="1 hour less"
            plusLabel="1 hour more"
          />
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.label}>Expiry alerts</Text>
            <Text style={styles.hint}>When something in your pantry is about to expire</Text>
          </View>
          <Switch
            value={expiry.enabled}
            onValueChange={(enabled) => toggle("expiry", enabled)}
            trackColor={{ true: Colors.primary }}
            accessibilityLabel="Expiry alerts"
          />
        </View>

        {expiry.enabled && (
          <>
            <Stepper
              label={daysBeforeLabel(expiry.daysBefore)}
              onMinus={() => update("expiry", { daysBefore: Math.max(0, expiry.daysBefore - 1) })}
              onPlus={() => update("expiry", { daysBefore: Math.min(MAX_DAYS_BEFORE, expiry.daysBefore + 1) })}
              minusLabel="1 day less"
              plusLabel="1 day more"
            />

            <Text style={styles.time}>at {formatTime(expiry.hour, expiry.minute)}</Text>

            <View style={styles.timeButtons}>
              {TIME_STEPS.map((step) => (
                <Pressable key={step.label} style={styles.timeButton} onPress={() => changeExpiryTime(step.minutes)} accessibilityRole="button">
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
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    textAlign: 'center',
  },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
  },
  stepButtonText: {
    fontSize: 20,
    fontWeight: '700',
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

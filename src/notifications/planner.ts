// Decides which notifications should exist, given the app's data and settings.
// No Expo imports in this file, so it can be unit tested with Jest.

export interface PlannedMeal {
  recipeName: string;
  at: Date;
}

export interface ExpiringItem {
  name: string;
  expiresOn: Date;
}

export interface NotificationData {
  meals: PlannedMeal[];
  pantry: ExpiringItem[];
}

export interface NotificationSettings {
  weeklyPlan: { enabled: boolean; weekday: number; hour: number; minute: number };
  mealPrep: { enabled: boolean; hoursBefore: number };
  expiry: { enabled: boolean; daysBefore: number; hour: number; minute: number };
}

export type PlannedTrigger =
  | { kind: "weekly"; weekday: number; hour: number; minute: number }
  | { kind: "date"; date: Date };

export interface PlannedNotification {
  id: string;
  title: string;
  body: string;
  url: string;      // Screen to open when the notification is tapped
  trigger: PlannedTrigger;
}

// Weekdays use the numbering expo-notifications expects: 1 is Sunday, 7 is Saturday
export const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Everything is off until the user opts in, so the app never asks for permission on launch
export const DEFAULT_SETTINGS: NotificationSettings = {
  weeklyPlan: { enabled: false, weekday: 1, hour: 18, minute: 0 },
  mealPrep: { enabled: false, hoursBefore: 2 },
  expiry: { enabled: false, daysBefore: 2, hour: 9, minute: 0 },
};

// One-time notifications are only scheduled this far ahead. Opening the app extends the window.
const WINDOW_DAYS = 7;

// iOS keeps at most 64 pending notifications per app and silently drops the rest
const MAX_SCHEDULED = 64;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Formats 24-hour time for display, like "6:05 PM". */
export function formatTime(hour: number, minute: number): string {
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

/** Number of calendar days from `from` to `to`, ignoring the time of day. */
function daysBetween(from: Date, to: Date): number {
  const fromDay = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const toDay = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((toDay - fromDay) / DAY_MS);
}

/** The same calendar day shifted by `days`, at the given time. */
function atTime(day: Date, days: number, hour: number, minute: number): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + days, hour, minute);
}

function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

function planMealPrep(meals: PlannedMeal[], settings: NotificationSettings, now: Date): PlannedNotification[] {
  const planned: PlannedNotification[] = [];

  for (const meal of meals) {
    if (!isValidDate(meal.at)) continue;

    const fireAt = new Date(meal.at.getTime() - settings.mealPrep.hoursBefore * HOUR_MS);
    if (fireAt <= now || fireAt.getTime() > now.getTime() + WINDOW_DAYS * DAY_MS) continue;

    const time = formatTime(meal.at.getHours(), meal.at.getMinutes());
    const daysAway = daysBetween(fireAt, meal.at);
    let when = `${WEEKDAY_NAMES[meal.at.getDay()]} at ${time}`;
    if (daysAway === 0) when = time;
    if (daysAway === 1) when = `tomorrow at ${time}`;

    planned.push({
      id: `meal-${meal.at.getTime()}-${meal.recipeName}`,
      title: "Time to prep",
      body: `${meal.recipeName} is planned for ${when}`,
      url: "/mealplan",
      trigger: { kind: "date", date: fireAt },
    });
  }

  return planned;
}

function expiryLabel(daysLeft: number): string {
  if (daysLeft === 0) return "today";
  if (daysLeft === 1) return "tomorrow";
  return `in ${daysLeft} days`;
}

// Items alerted on the same day share one notification, so a full fridge doesn't send ten of them
function planExpiry(pantry: ExpiringItem[], settings: NotificationSettings, now: Date): PlannedNotification[] {
  const { daysBefore, hour, minute } = settings.expiry;
  const groups = new Map<number, { fireAt: Date; items: { name: string; daysLeft: number }[] }>();

  for (const item of pantry) {
    if (!isValidDate(item.expiresOn)) continue;

    // If the usual alert time has passed, alert at the next one instead of skipping the item
    let fireAt = atTime(item.expiresOn, -daysBefore, hour, minute);
    if (fireAt <= now) fireAt = atTime(now, 0, hour, minute);
    if (fireAt <= now) fireAt = atTime(now, 1, hour, minute);

    const daysLeft = daysBetween(fireAt, item.expiresOn);
    if (daysLeft < 0 || fireAt.getTime() > now.getTime() + WINDOW_DAYS * DAY_MS) continue;

    const group = groups.get(fireAt.getTime()) ?? { fireAt, items: [] };
    group.items.push({ name: item.name, daysLeft });
    groups.set(fireAt.getTime(), group);
  }

  return Array.from(groups.values()).map(({ fireAt, items }) => {
    const body = items.length === 1
      ? `${items[0].name} expires ${expiryLabel(items[0].daysLeft)}`
      : items.map((item) => `${item.name} (${expiryLabel(item.daysLeft)})`).join(", ");

    return {
      id: `expiry-${fireAt.getTime()}`,
      title: "Expiring soon",
      body,
      url: "/ingredientsTab",
      trigger: { kind: "date", date: fireAt } as PlannedTrigger,
    };
  });
}

/** Returns every notification that should currently be scheduled. */
export function planNotifications(
  data: NotificationData,
  settings: NotificationSettings,
  now: Date = new Date()
): PlannedNotification[] {
  const recurring: PlannedNotification[] = [];

  if (settings.weeklyPlan.enabled) {
    const { weekday, hour, minute } = settings.weeklyPlan;
    recurring.push({
      id: "weekly-plan",
      title: "Plan your week",
      body: "Take a few minutes to plan your meals for the week.",
      url: "/mealplan",
      trigger: { kind: "weekly", weekday, hour, minute },
    });
  }

  const oneTime: PlannedNotification[] = [];
  if (settings.mealPrep.enabled) oneTime.push(...planMealPrep(data.meals, settings, now));
  if (settings.expiry.enabled) oneTime.push(...planExpiry(data.pantry, settings, now));

  // Soonest first, so that hitting the limit only drops the ones furthest away
  const fireTime = (notification: PlannedNotification) =>
    notification.trigger.kind === "date" ? notification.trigger.date.getTime() : 0;
  oneTime.sort((a, b) => fireTime(a) - fireTime(b));

  return [...recurring, ...oneTime.slice(0, MAX_SCHEDULED - recurring.length)];
}

function intInRange(value: unknown, min: number, max: number, fallback: number): number {
  return Number.isInteger(value) && (value as number) >= min && (value as number) <= max
    ? (value as number)
    : fallback;
}

/** Turns whatever was read from disk into valid settings, using defaults for anything bad. */
export function sanitizeSettings(raw: unknown): NotificationSettings {
  const saved = (raw ?? {}) as { [K in keyof NotificationSettings]?: Partial<NotificationSettings[K]> };
  const weeklyPlan = saved.weeklyPlan ?? {};
  const mealPrep = saved.mealPrep ?? {};
  const expiry = saved.expiry ?? {};
  const defaults = DEFAULT_SETTINGS;

  return {
    weeklyPlan: {
      enabled: weeklyPlan.enabled === true,
      weekday: intInRange(weeklyPlan.weekday, 1, 7, defaults.weeklyPlan.weekday),
      hour: intInRange(weeklyPlan.hour, 0, 23, defaults.weeklyPlan.hour),
      minute: intInRange(weeklyPlan.minute, 0, 59, defaults.weeklyPlan.minute),
    },
    mealPrep: {
      enabled: mealPrep.enabled === true,
      hoursBefore: intInRange(mealPrep.hoursBefore, 0, 48, defaults.mealPrep.hoursBefore),
    },
    expiry: {
      enabled: expiry.enabled === true,
      daysBefore: intInRange(expiry.daysBefore, 0, 14, defaults.expiry.daysBefore),
      hour: intInRange(expiry.hour, 0, 23, defaults.expiry.hour),
      minute: intInRange(expiry.minute, 0, 59, defaults.expiry.minute),
    },
  };
}

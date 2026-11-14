import * as Notifications from "expo-notifications";
import { applyPlan, scheduleTestNotification } from "../src/notifications/notifications";
import { loadNotificationSettings } from "../src/notifications/notificationSettings";
import { DEFAULT_SETTINGS } from "../src/notifications/planner";
import { rescheduleNotifications } from "../src/notifications/reschedule";

jest.mock("react-native", () => ({ Platform: { OS: "android" } }));

jest.mock("../src/notifications/notificationSettings", () => ({
    loadNotificationSettings: jest.fn(),
}));

jest.mock("expo-notifications", () => ({
    AndroidImportance: { HIGH: 4 },
    SchedulableTriggerInputTypes: { WEEKLY: "weekly", DATE: "date", TIME_INTERVAL: "timeInterval" },
    setNotificationHandler: jest.fn(),
    setNotificationChannelAsync: jest.fn(),
    getPermissionsAsync: jest.fn(),
    requestPermissionsAsync: jest.fn(),
    getAllScheduledNotificationsAsync: jest.fn(),
    cancelScheduledNotificationAsync: jest.fn(),
    scheduleNotificationAsync: jest.fn(),
}));

const mocked = Notifications as jest.Mocked<typeof Notifications>;
const mockedSettings = loadNotificationSettings as jest.Mock;

const weeklyOn = { ...DEFAULT_SETTINGS, weeklyPlan: { enabled: true, weekday: 2, hour: 8, minute: 30 } };

function allowPermission(allowed: boolean) {
    mocked.getPermissionsAsync.mockResolvedValue({ status: allowed ? "granted" : "denied" } as any);
}

function alreadyScheduled(...identifiers: string[]) {
    mocked.getAllScheduledNotificationsAsync.mockResolvedValue(identifiers.map((identifier) => ({ identifier })) as any);
}

beforeEach(() => {
    jest.resetAllMocks();
    alreadyScheduled();
    allowPermission(true);
    mockedSettings.mockReturnValue(DEFAULT_SETTINGS);
})

test("Weekly reminder reaches Expo as a weekly trigger", async () => {
    await applyPlan([{
        id: "weekly-plan",
        title: "Plan your week",
        body: "Body",
        url: "/mealplan",
        trigger: { kind: "weekly", weekday: 2, hour: 8, minute: 30 },
    }]);

    expect(mocked.scheduleNotificationAsync).toHaveBeenCalledWith({
        identifier: "weekly-plan",
        content: { title: "Plan your week", body: "Body", data: { url: "/mealplan" } },
        trigger: { type: "weekly", weekday: 2, hour: 8, minute: 30, channelId: "default" },
    });
})

test("One-time reminder reaches Expo as a date trigger", async () => {
    let date = new Date(2026, 10, 5, 16, 0);

    await applyPlan([{ id: "meal", title: "T", body: "B", url: "/mealplan", trigger: { kind: "date", date } }]);

    expect(mocked.scheduleNotificationAsync.mock.calls[0][0].trigger).toEqual({ type: "date", date, channelId: "default" });
})

test("Old reminders are removed but a pending test notification is kept", async () => {
    alreadyScheduled("weekly-plan", "test", "meal-1");

    await applyPlan([]);

    expect(mocked.cancelScheduledNotificationAsync.mock.calls).toEqual([["weekly-plan"], ["meal-1"]]);
})

test("Test notification uses the id that rescheduling leaves alone", async () => {
    await scheduleTestNotification(5);

    expect(mocked.scheduleNotificationAsync.mock.calls[0][0].identifier).toBe("test");
})

test("Rescheduling uses the saved settings", async () => {
    mockedSettings.mockReturnValue(weeklyOn);

    await rescheduleNotifications();

    expect(mocked.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(mocked.scheduleNotificationAsync.mock.calls[0][0].identifier).toBe("weekly-plan");
})

test("Turning the reminder off removes it", async () => {
    alreadyScheduled("weekly-plan");

    await rescheduleNotifications();

    expect(mocked.cancelScheduledNotificationAsync).toHaveBeenCalledWith("weekly-plan");
    expect(mocked.scheduleNotificationAsync).not.toHaveBeenCalled();
})

test("Rescheduling without permission does nothing and never prompts", async () => {
    allowPermission(false);
    mockedSettings.mockReturnValue(weeklyOn);

    await rescheduleNotifications();

    expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(mocked.scheduleNotificationAsync).not.toHaveBeenCalled();
})

test("Overlapping reschedules run one at a time", async () => {
    let running = 0;
    let mostAtOnce = 0;
    mocked.getAllScheduledNotificationsAsync.mockImplementation(async () => {
        running++;
        mostAtOnce = Math.max(mostAtOnce, running);
        await new Promise((resolve) => setTimeout(resolve, 5));
        running--;
        return [];
    });

    await Promise.all([rescheduleNotifications(), rescheduleNotifications()]);

    expect(mostAtOnce).toBe(1);
    expect(mockedSettings).toHaveBeenCalledTimes(2);
})

test("A failed reschedule doesn't block the next one", async () => {
    mocked.getAllScheduledNotificationsAsync.mockRejectedValueOnce(new Error("failed"));
    mockedSettings.mockReturnValue(weeklyOn);

    await expect(rescheduleNotifications()).rejects.toThrow("failed");
    await rescheduleNotifications();

    expect(mocked.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
})

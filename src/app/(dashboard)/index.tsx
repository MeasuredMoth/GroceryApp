import DaySelector from "@/components/daySelector";
import Header from "@/components/header";
import MealSlot from "@/components/mealSlot";
import NutritionSummary from "@/components/nutritionSummary";
import Screen from "@/components/Screen";
import { Colors } from "@/constants/Colors";
import {
  scheduleTestNotification,
  setupNotifications,
} from "@/notifications/notifications";
import { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
  Modal,
} from "react-native";
import {
  addMeal,
  createMeal,
  editMeal,
  EditScope,
  Meal,
  mealsFor,
  weekdayOf,
} from "../../../data/recipe/meal-plan";
import { Recipe, recipeToItems } from "../../../data/recipe/recipe";
import dayjs from "dayjs";
import { ActionCard } from "@/components/actionCard";
import { Entypo, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Card } from "@/components/card";
import { DayScreen } from "@/components/dayScreen";
import { Banner } from "@/components/bannerWithButton";
import RecipePickerModal from "@/components/recipePickerModal";
import { doneKey } from "../../../data/store/app-data";
import { setMealsDone, updatePlan, useAppData } from "@/storage/appStore";
import { MEAL_TYPE } from "../../../data/util/types";
import { Href, router } from "expo-router";

//TODO
//1. Removing the possibility to add ingredients or recipes from the today tab: that can only be possible in the mealplan tab

//the core job is helping someone follow and manage a plan they already have, day by day.


// Time given to a meal created from the picker. Meal times become editable later.
const DEFAULT_TIMES: Record<MEAL_TYPE, string> = {
  Breakfast: "08:00",
  Lunch: "12:30",
  Dinner: "19:00",
  Snack: "16:00",
};

function buildDays(range = 30): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: range * 2 + 1 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i - range);
    return d;
  });
}

function greeting(hour: number): string {
  if (hour >= 6 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

const DAYS = buildDays();
const TODAY_INDEX = 30;

export default function Index() {
  //  Will be changed with the user's name
  const userName = "Lorenzo";
  const [pickerFor, setPickerFor] = useState<MEAL_TYPE | null>(null);

  const [selected, setSelected] = useState(TODAY_INDEX);
  const [pageWidth, setPageWidth] = useState(0);
  const date = DAYS[selected];

  const greetingPhrase = greeting(dayjs().hour());

  // Saved on the device and shared with the meal plan tab.
  // Every plan function returns a new Plan, so it can be passed straight to updatePlan.
  const { plan, done } = useAppData();

  // Adds a recipe's ingredients to the meal of that type on the selected date.
  // TODO: ask "just this day" or "every <weekday>" instead of always using "day".
  const addRecipe = (type: MEAL_TYPE, recipe: Recipe, scope: EditScope, servings: number) => {
    const items = recipeToItems(recipe, servings);
    updatePlan((p) => {
      const existing = mealsFor(p, date).find((m) => m.type === type);
      return existing
        ? editMeal(
            p,
            date,
            { ...existing, items: [...existing.items, ...items] },
            scope,
          )
        : addMeal(p, date, createMeal(type, DEFAULT_TIMES[type], items), scope);
    });
    setPickerFor(null);
  };
  const removeItem = (meal: Meal, index: number) => {
    updatePlan((p) =>
      editMeal(
        p,
        date,
        { ...meal, items: meal.items.filter((_, i) => i !== index) },
        "day",
      ),
    );
  };

  const [notificationStatus, setNotificationStatus] = useState("");

  //TEMPORARY: test button for notifications, remove once real reminders exist
  const sendTestNotification = async () => {
    const allowed = await setupNotifications();
    if (!allowed) {
      setNotificationStatus(
        "Notification permission denied. Enable it in Settings.",
      );
      return;
    }
    await scheduleTestNotification(5);
    setNotificationStatus("Scheduled! It will appear in 5 seconds.");
  };

  const isDone = (m: Meal) => !!done[doneKey(date, m.id)];

  const toggleDone = (meals: Meal[]) => {
    const allDone = meals.every(isDone);
    setMealsDone(
      date,
      meals.map((m) => m.id),
      !allDone,
    );
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Header
          icon={<Entypo name="leaf" size={24} color="#2E7D4F" />}
          textHeader="GroceryMeal"
          firstSubheading={`${greetingPhrase}, ${userName}`}
          secondSubheading="Healthy meals. Less waste."
        />
        <View style={{ marginTop: 16 }}>
          <DayScreen
            date={date}
            plan={plan}
            isDone={isDone}
            onToggleDone={toggleDone}
          />

          <RecipePickerModal
            type={pickerFor}
            weekday={weekdayOf(date)}
            onPick={(r, scope, servings) => pickerFor && addRecipe(pickerFor, r, scope, servings)}
            onClose={() => setPickerFor(null)}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 16, marginTop: 16 }}>
          <View style={{ flex: 1 }}>
            <ActionCard
              title="Add ingredient"
              subtitle="Save it to your ingredient database"
              icon={<Ionicons name="add" size={20} color="white" />}
              onPress={() => router.push("/ingredient-new" as Href)}
            />
          </View>

          <View style={{ flex: 1 }}>
            <ActionCard
              title="Add recipe"
              subtitle="Create a new recipe from your ingredients"
              icon={
                <MaterialCommunityIcons
                  name="file-document-edit-outline"
                  size={20}
                  color="white"
                />
              }
              variant="blue"
              onPress={() => router.push("/recipe-new" as Href)}
            />
          </View>
        </View>

        <View>
          <Banner
            title="Keep your plan up to date"
            subtitle="Change a meal, adjust its time, or add a note."
            buttonLabel="Edit this week"
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16 },
  greeting: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0d3332",
    marginTop: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#6B7A72",
  },
  testButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  testButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  slots: { gap: 12, paddingHorizontal: 16 },
  pickRow: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f4d3a",
    paddingHorizontal: 16,
  },
  pickText: { fontSize: 16, color: Colors.primaryDark },
});

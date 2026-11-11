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
import { useReducer, useRef, useState } from "react";
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
import { MEAL_TYPES, MealPlan, MealType } from "../../../data/recipe/meal-plan";
import { Recipe } from "../../../data/recipe/recipe";
import { recipes } from "@/data/recipesData";
import dayjs from "dayjs";
import { ActionCard } from "@/components/actionCard";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Card } from "@/components/card";
import { DayScreen } from "@/components/dayScreen";
import { Banner } from "@/components/bannerWithButton";

//the core job is helping someone follow and manage a plan they already have, day by day.

const MEALS = MEAL_TYPES;

function buildDays(range = 30): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: range * 2 + 1 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i - range);
    return d;
  });
}

const DAYS = buildDays();
const TODAY_INDEX = 30;

export default function Index() {
  //  Will be changed with the user's name
  const userName = "Lorenzo";
  const [pickerFor, setPickerFor] = useState<MealType | null>(null);

  const [selected, setSelected] = useState(TODAY_INDEX);
  const [pageWidth, setPageWidth] = useState(0);

  //when rerender is called, React sees that the state (number) is changed and so re-runs Index.ts and updates the changes make to mealplan with the line
  // keep the counter this time, the list needs it (see the gotcha below)
  const [version, rerender] = useReducer((n: number) => n + 1, 0);
  const date = DAYS[selected];

  //to persistently store data inside mealPlan:
  const planRef = useRef(new MealPlan("My plan")); //every rerender you get the same planRef component (mutations survive)

  const plan = planRef.current; //updates the plan object with the newest one (planRef doesn't die after rerender)

  const addRecipe = (meal: MealType, recipe: Recipe) => {
    //adds a recipe and refreshes
    plan.addRecipe(date, meal, recipe);
    setPickerFor(null);
    rerender();
  };

  const removeRecipe = (d: Date, meal: MealType, recipe: Recipe) => {
    //removes a recipe and refreshes
    plan.removeRecipe(d, meal, recipe);
    rerender();
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

  return (
    <Screen>
      <View style={styles.content}>
        <Header
          textHeader="GroceryMeal"
          firstSubheading={`Good morning, ${userName}`}
          secondSubheading="Healthy meals. Less waste."
        />
        <View style={{ marginTop: 16 }}>
          <View onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}>
            {pageWidth > 0 && (
              <FlatList
                data={DAYS}
                extraData={version}
                keyExtractor={(d) => d.toISOString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={TODAY_INDEX}
                getItemLayout={(_, i) => ({
                  length: pageWidth,
                  offset: pageWidth * i,
                  index: i,
                })}
                onMomentumScrollEnd={(e) =>
                  setSelected(
                    Math.round(e.nativeEvent.contentOffset.x / pageWidth),
                  )
                }
                renderItem={({ item }) => (
                  <View style={{ width: pageWidth }}>
                    <DayScreen
                      date={item}
                      plan={plan}
                      onAdd={setPickerFor}
                      onRemove={(m, r) => removeRecipe(item, m, r)}
                    />
                  </View>
                )}
              />
            )}
          </View>

          {/* your <Modal> goes here, unchanged, outside the pager */}

          <Modal
            visible={pickerFor !== null}
            animationType="slide"
            onRequestClose={() => setPickerFor(null)}
          >
            <Screen>
              <Text style={[styles.sectionTitle, { padding: 16 }]}>
                Add to {pickerFor}
              </Text>
              <FlatList
                data={recipes}
                keyExtractor={(r) => r.getId()}
                contentContainerStyle={{ padding: 16, gap: 10 }}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.pickRow}
                    onPress={() => pickerFor && addRecipe(pickerFor, item)}
                  >
                    <Text style={styles.pickText}>{item.getName()}</Text>
                  </Pressable>
                )}
                ListFooterComponent={
                  <Pressable
                    onPress={() => setPickerFor(null)}
                    style={{ padding: 16, alignItems: "center" }}
                  >
                    <Text style={{ color: Colors.textMuted }}>Cancel</Text>
                  </Pressable>
                }
              />
            </Screen>
          </Modal>
        </View>

        <View style={{ flexDirection: "row", gap: 16, marginTop: 16 }}>
          <View style={{ flex: 1 }}>
            <ActionCard
              title="Add ingredient"
              subtitle="Save it to your ingredient database"
              icon={<Ionicons name="add" size={20} color="white" />}
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

        {/* <Pressable style={styles.testButton} onPress={sendTestNotification}>
          <Text style={styles.testButtonText}>Send test notification</Text>
        </Pressable>
        {notificationStatus !== "" && (
          <Text style={styles.tagline}>{notificationStatus}</Text>
        )} */}
      </View>
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

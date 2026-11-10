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
import { SafeAreaView } from "react-native-safe-area-context";
import { MEAL_TYPES, MealPlan, MealType } from "../../../data/recipe/meal-plan";
import { Recipe } from "../../../data/recipe/recipe";
import { recipes } from "@/data/recipesData";

//TODO
//Merging hometab with mealplan tab and display some of the info of the original home tab to the new one

const MEALS = MEAL_TYPES;

function getWeek(): Date[] {
  const today = new Date(); //returns 0 for Sunday through 6 for Saturday
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7)); //converts it to 0 for Monday through 6 for Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function Index() {
  //  Will be changed with the user's name
  const userName = "Lorenzo";
  const week = getWeek();
  const [selected, setSelected] = useState((new Date().getDay() + 6) % 7);
  const [pickerFor, setPickerFor] = useState<MealType | null>(null);

  //to persistently store data inside mealPlan:
  const planRef = useRef(new MealPlan("My plan")); //every rerender you get the same planRef component (mutations survive)

  //when rerender is called, React sees that the state (number) is changed and so re-runs Index.ts and updates the changes make to mealplan with the line
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  const plan = planRef.current; //updates the plan object with the newest one (planRef doesn't die after rerender)
  const date = week[selected];

  const addRecipe = (meal: MealType, recipe: Recipe) => {
    //adds a recipe and refreshes
    plan.addRecipe(date, meal, recipe);
    setPickerFor(null);
    rerender();
  };

  const removeRecipe = (meal: MealType, recipe: Recipe) => {
    //removes a recipe and refreshes
    plan.removeRecipe(date, meal, recipe);
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

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.slots}>
            {MEALS.map((m) => (
              <MealSlot
                key={m}
                type={m}
                recipes={[...plan.getMeal(date, m)]}
                kcal={plan.getDayTotals(date).kcal}
                onAdd={() => setPickerFor(m)}
                onRemove={(r) => removeRecipe(m, r)}
              />
            ))}
          </View>
        </ScrollView>

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

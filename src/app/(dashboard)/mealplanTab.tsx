import { useReducer, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Modal,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import Screen from "@/components/Screen";
import Header from "@/components/header";
import DaySelector from "@/components/daySelector";
import NutritionSummary, { Totals } from "@/components/nutritionSummary";
import { recipes } from "@/data/recipesData";
import { Colors } from "@/constants/Colors";
import { Recipe } from "../../../data/recipe/recipe";
import { MealType, MEAL_TYPES, MealPlan } from "../../../data/recipe/meal-plan";
import MealSlot from "@/components/mealSlot";
import { ActionCard } from "@/components/actionCard";
import { Ionicons } from "@expo/vector-icons";

//TODO
//transfer everything into meal plan class
const MEALS = MEAL_TYPES;
const GOALS: Totals = { kcal: 2200, protein: 150, carbs: 250, fat: 70 };

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

export default function MealPlanTab() {
  const week = getWeek();
  const [selected, setSelected] = useState((new Date().getDay() + 6) % 7);
  const [pickerFor, setPickerFor] = useState<MealType | null>(null);

  // MealPlan is mutable, so keep one instance and force a re-render after changes.
  const planRef = useRef(new MealPlan("My plan"));
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const plan = planRef.current;

  const date = week[selected];

  const addRecipe = (meal: MealType, recipe: Recipe) => {
    plan.addRecipe(date, meal, recipe);
    setPickerFor(null);
    rerender();
  };

  const removeRecipe = (meal: MealType, recipe: Recipe) => {
    plan.removeRecipe(date, meal, recipe);
    rerender();
  };

  return (
    <Screen>
      <View style={styles.headerContainer}>
        <Header
          textHeader="Meal Plan"
          secondSubheading="Your personalized meal plan for the week."
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <DaySelector days={week} selected={selected} onSelect={setSelected} />
        <NutritionSummary totals={plan.getDayTotals(date)} goals={GOALS} />

        <Text style={styles.sectionTitle}>Planned meals</Text>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: { paddingHorizontal: 16, paddingBottom: 12 },
  content: { gap: 16, paddingBottom: 24 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f4d3a",
    paddingHorizontal: 16,
  },
  slots: { gap: 12, paddingHorizontal: 16 },
  pickRow: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  pickText: { fontSize: 16, color: Colors.primaryDark },
});

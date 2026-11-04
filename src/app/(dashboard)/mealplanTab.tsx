import { useState } from "react";
import { View, Text, ScrollView, Modal, FlatList, Pressable, StyleSheet } from "react-native";
import Screen from "@/components/Screen";
import Header from "@/components/header";
import DaySelector from "@/components/daySelector";
import NutritionSummary, { Totals } from "@/components/nutritionSummary";
import MealSlot, { MealType } from "@/components/mealSlot";
import { recipes } from "@/data/recipesData";
import { Colors } from "@/constants/Colors";
import { Recipe } from "../../../data/recipe/recipe";


const MEALS: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];
const GOALS: Totals = { kcal: 2200, protein: 150, carbs: 250, fat: 70 };

// TEMP: Recipe no longer has nutrition fields. Replace with real getters later.
const nutritionOf = (_r: Recipe): Totals => ({ kcal: 500, protein: 25, carbs: 60, fat: 15 });

type DayPlan = Partial<Record<MealType, Recipe[]>>;

function getWeek(): Date[] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const keyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

export default function MealPlanTab() {
  const week = getWeek();
  const [selected, setSelected] = useState((new Date().getDay() + 6) % 7);
  const [plan, setPlan] = useState<Record<string, DayPlan>>({});
  const [pickerFor, setPickerFor] = useState<MealType | null>(null);

  const dayKey = keyOf(week[selected]);
  const day: DayPlan = plan[dayKey] ?? {};

  const addRecipe = (meal: MealType, recipe: Recipe) => {
    setPlan((prev) => {
      const current = prev[dayKey] ?? {};
      return { ...prev, [dayKey]: { ...current, [meal]: [...(current[meal] ?? []), recipe] } };
    });
    setPickerFor(null);
  };

  const removeRecipe = (meal: MealType, recipe: Recipe) => {
    setPlan((prev) => {
      const current = prev[dayKey] ?? {};
      return {
        ...prev,
        [dayKey]: { ...current, [meal]: (current[meal] ?? []).filter((r) => r !== recipe) },
      };
    });
  };

  const sum = (list: Recipe[]): Totals =>
    list.reduce(
      (t, r) => {
        const n = nutritionOf(r);
        return { kcal: t.kcal + n.kcal, protein: t.protein + n.protein, carbs: t.carbs + n.carbs, fat: t.fat + n.fat };
      },
      { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );

  const totals = sum(MEALS.flatMap((m) => day[m] ?? []));

  return (
    <Screen>
      <View style={styles.headerContainer}>
        <Header textHeader="Meal Plan" secondSubheading="Your personalized meal plan for the week." />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <DaySelector days={week} selected={selected} onSelect={setSelected} />
        <NutritionSummary totals={totals} goals={GOALS} />

        <Text style={styles.sectionTitle}>Planned meals</Text>
        <View style={styles.slots}>
          {MEALS.map((m) => (
            <MealSlot
              key={m}
              type={m}
              recipes={day[m] ?? []}
              kcal={sum(day[m] ?? []).kcal}
              onAdd={() => setPickerFor(m)}
              onRemove={(r) => removeRecipe(m, r)}
            />
          ))}
        </View>
      </ScrollView>

      <Modal visible={pickerFor !== null} animationType="slide" onRequestClose={() => setPickerFor(null)}>
        <Screen>
          <Text style={[styles.sectionTitle, { padding: 16 }]}>Add to {pickerFor}</Text>
          <FlatList
            data={recipes}
            keyExtractor={(r) => r.getId()}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            renderItem={({ item }) => (
              <Pressable style={styles.pickRow} onPress={() => pickerFor && addRecipe(pickerFor, item)}>
                <Text style={styles.pickText}>{item.getName()}</Text>
              </Pressable>
            )}
            ListFooterComponent={
              <Pressable onPress={() => setPickerFor(null)} style={{ padding: 16, alignItems: "center" }}>
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
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#0f4d3a", paddingHorizontal: 16 },
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
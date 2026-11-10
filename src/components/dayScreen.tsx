import { StyleSheet, Text, View } from "react-native";
import dayjs from "dayjs";
import { Card } from "@/components/card";
import MealSlot from "@/components/mealSlot";
import { MEAL_TYPES, MealPlan, MealType } from "../../data/recipe/meal-plan";
import { Recipe } from "../../data/recipe/recipe";

interface DayScreenProps {
  date: Date;
  plan: MealPlan;
  onAdd: (meal: MealType) => void;
  onRemove: (meal: MealType, recipe: Recipe) => void;
}
const RELATIVE_LABELS: Record<number, string> = {
  [-1]: "Yesterday",
  0: "Today",
  1: "Tomorrow",
};

export function DayScreen({ date, plan, onAdd, onRemove }: DayScreenProps) {
  const today = dayjs();
  const d = dayjs(date);

  const dayDiff = d.startOf("day").diff(today.startOf("day"), "day");
  const relativeLabel = RELATIVE_LABELS[dayDiff];

  const formatted = d.format("dddd, MMM D");
  const title = relativeLabel ? `${relativeLabel} - ${formatted}` : formatted;

  return (
    <Card>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.slots}>
        {MEAL_TYPES.map((m) => (
          <MealSlot
            key={m}
            type={m}
            recipes={[...plan.getMeal(date, m)]}
            kcal={plan.getDayTotals(date).kcal}
            onAdd={() => onAdd(m)}
            onRemove={(r) => onRemove(m, r)}
          />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f4d3a",
    paddingHorizontal: 16,
  },
  slots: { gap: 12, paddingHorizontal: 16 },
});

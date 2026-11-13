import { StyleSheet, Text, View } from "react-native";
import dayjs from "dayjs";
import { Card } from "@/components/card";
import MealSlot from "@/components/mealSlot";
import {
  Meal,
  MEAL_TYPES,
  mealsFor,
  MealType,
  Plan,
} from "../../data/recipe/meal-plan";

interface DayScreenProps {
  date: Date;
  plan: Plan;
  onAdd: (meal: MealType) => void;
  onRemoveItem: (meal: Meal, index: number) => void;
}

const RELATIVE_LABELS: Record<number, string> = {
  [-1]: "Yesterday",
  0: "Today",
  1: "Tomorrow",
};

export function DayScreen({ date, plan, onAdd, onRemoveItem }: DayScreenProps) {
  const today = dayjs();
  const d = dayjs(date);

  const dayDiff = d.startOf("day").diff(today.startOf("day"), "day");
  const relativeLabel = RELATIVE_LABELS[dayDiff];

  const formatted = d.format("dddd, MMM D");
  const title = relativeLabel ? `${relativeLabel} - ${formatted}` : formatted;

  const meals = mealsFor(plan, date);

  return (
    <Card>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.slots}>
        {MEAL_TYPES.map((type) => (
          <MealSlot
            key={type}
            type={type}
            meals={meals.filter((m) => m.type === type)}
            onAdd={() => onAdd(type)}
            onRemoveItem={onRemoveItem}
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
    marginBottom: 12,
  },
  slots: { gap: 12, paddingHorizontal: 16 },
});
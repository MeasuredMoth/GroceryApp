import { StyleSheet, Text, View } from "react-native";
import dayjs from "dayjs";
import { Card } from "@/components/card";
import MealSlot from "@/components/mealSlot";
import {
  Meal,
  mealsFor,
  Plan,
} from "../../data/recipe/meal-plan";
import { MEAL_TYPE } from "../../data/util/types";

interface DayScreenProps {
  date: Date;
  plan: Plan;
  onAdd?: (meal: MEAL_TYPE) => void;
  onRemoveItem?: (meal: Meal, index: number) => void;
  isDone?: (meal: Meal) => boolean;
  onToggleDone?: (meals: Meal[]) => void;
}

const RELATIVE_LABELS: Record<number, string> = {
  [-1]: "Yesterday",
  0: "Today",
  1: "Tomorrow",
};

export function DayScreen({ date, plan, onAdd, onRemoveItem, isDone, onToggleDone }: DayScreenProps) {
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
        {Object.values(MEAL_TYPE).map((type) => {
  const slotMeals = meals.filter((m) => m.type === type);
  return (
   <MealSlot
  key={type}
  type={type}
  meals={slotMeals}
  onAdd={onAdd ? () => onAdd(type) : undefined}
  onRemoveItem={onRemoveItem}
  done={!!isDone && slotMeals.length > 0 && slotMeals.every(isDone)}
  onToggleDone={onToggleDone && slotMeals.length > 0 ? () => onToggleDone(slotMeals) : undefined}
/>
  );
})}
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
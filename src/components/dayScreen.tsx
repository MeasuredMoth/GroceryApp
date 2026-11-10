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

export function DayScreen({ date, plan, onAdd, onRemove }: DayScreenProps) {
  const isToday = dayjs(date).isSame(dayjs(), "day");
  const title = `${isToday ? "Today - " : ""}${dayjs(date).format("dddd, MMM D")}`;

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

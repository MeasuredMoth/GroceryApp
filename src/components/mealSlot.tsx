import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import IngredientRow from "@/components/ingredientRow";
import SwipeableRow from "@/components/swipeableRow";
import { Meal } from "../../data/recipe/meal-plan";
import { MEAL_TYPE } from "../../data/util/types";

// Same timings as the pantry list
const ROW_EXIT = FadeOut.duration(160);
const ROW_LAYOUT = LinearTransition.duration(240).easing(
  Easing.out(Easing.cubic),
);

//Sets the icon and tint for each meal type
const ICONS: Record<
  MEAL_TYPE,
  { name: keyof typeof Ionicons.glyphMap; bg: string; fg: string }
> = {
  Breakfast: { name: "sunny-outline", bg: "#FDF0C8", fg: "#B7791F" },
  Lunch: { name: "restaurant-outline", bg: "#FDE5C8", fg: "#C05621" },
  Dinner: { name: "moon-outline", bg: "#E3E8FB", fg: "#4C5FC7" },
  Snack: { name: "cafe-outline", bg: "#DCEFE4", fg: "#2E7D4F" },
};

// "chicken-breast" -> "Chicken breast"
const pretty = (s: string) => {
  const t = s.replace(/-/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
};

type Props = {
  type: MEAL_TYPE;
  meals: Meal[]; // the day's meals of this type (usually 0 or 1)
  onAdd?: () => void;
  onRemoveItem?: (meal: Meal, index: number) => void;
  // Turns an ingredient id into a display name. Defaults to showing the id
  // until an ingredient library exists to look names up in.
  nameOf?: (ingredientId: string) => string;
  done?: boolean;
  onToggleDone?: () => void;
};

export default function MealSlot({
  type,
  meals,
  onAdd,
  onRemoveItem,
  nameOf = (id) => id,
  done,
  onToggleDone,
}: Props) {
  const icon = ICONS[type];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {onToggleDone && (
          <Pressable
            onPress={onToggleDone}
            hitSlop={8}
            style={[styles.check, done && styles.checkDone]}
          >
            {done && <Ionicons name="checkmark" size={16} color="white" />}
          </Pressable>
        )}
        <View style={[styles.iconCircle, { backgroundColor: icon.bg }]}>
          <Ionicons name={icon.name} size={22} color={icon.fg} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, done && styles.titleDone]}>{type}</Text>
          <Text style={styles.sub}>
            {meals.length
              ? meals.map((m) => m.time).join(" · ")
              : "Nothing planned"}
          </Text>
        </View>
      </View>

      <View style={styles.items}>
  {meals.map((meal) => {
    const seen: Record<string, number> = {};
    return meal.items.map((item, index) => {
      const n = (seen[item.ingredientId] = (seen[item.ingredientId] ?? 0) + 1);

      const row = (
        <IngredientRow
          title={pretty(nameOf(item.ingredientId))}
          value={`${item.quantity.amount} ${item.quantity.unit}`}
          trailing={
            onRemoveItem ? (
              <Pressable onPress={() => onRemoveItem(meal, index)} hitSlop={8}>
                <Ionicons name="close" size={18} color={Colors.textMuted} />
              </Pressable>
            ) : undefined
          }
        />
      );

      return (
        <Animated.View
          key={`${meal.id}-${item.ingredientId}-${n}`}
          entering={FadeIn.duration(200)}
          exiting={ROW_EXIT}
          layout={ROW_LAYOUT}
        >
          {onRemoveItem ? (
            <SwipeableRow onDelete={() => onRemoveItem(meal, index)}>{row}</SwipeableRow>
          ) : (
            row
          )}
        </Animated.View>
      );
    });
  })}
</View>

     {onAdd && (
  <Pressable style={styles.addPill} onPress={onAdd}>
    <Ionicons name="add" size={18} color="#0f4d3a" />
    <Text style={styles.addText}>Add recipe or ingredient</Text>
  </Pressable>
)}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    padding: 16,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: { flex: 1 },
  title: { fontSize: 18, fontWeight: "700", color: Colors.primaryDark },
  sub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#0f4d3a",
    alignItems: "center",
    justifyContent: "center",
  },
  checkDone: { backgroundColor: "#0f4d3a" },
  titleDone: { textDecorationLine: "line-through", color: Colors.textMuted },
  items: { gap: 8, marginTop: 12 },
  addPill: {
    marginTop: 12,
    backgroundColor: "#E6F1EC",
    borderRadius: 999,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addText: { fontSize: 14, fontWeight: "600", color: "#0f4d3a" },
});

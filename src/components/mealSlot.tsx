import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Meal, MealType } from "../../data/recipe/meal-plan";
import SwipeableRow from "./swipeableRow";


//Sets the icon and tint for each meal type
const ICONS: Record<
  MealType,
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
  type: MealType;
  meals: Meal[]; // the day's meals of this type (usually 0 or 1)
  onAdd: () => void;
  onRemoveItem: (meal: Meal, index: number) => void;
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
  const hasItems = meals.some((m) => m.items.length > 0);

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

      {hasItems && <View style={styles.divider} />}

   {meals.map((meal) =>
  meal.items.map((item, index) => (
    <SwipeableRow
      key={`${meal.id}-${item.ingredientId}-${index}`}
      radius={8}
      onDelete={() => onRemoveItem(meal, index)}
    >
      <View style={styles.itemRow}>
        <View style={styles.bullet} />
        <Text style={styles.itemName} numberOfLines={1}>
          {pretty(nameOf(item.ingredientId))}
        </Text>
        <Text style={styles.itemQty}>
          {item.amount} {item.unit}
        </Text>
        <Pressable onPress={() => onRemoveItem(meal, index)} hitSlop={8}>
          <Ionicons name="close" size={16} color={Colors.textMuted} />
        </Pressable>
      </View>
    </SwipeableRow>
  )),
)}

      <Pressable style={styles.addPill} onPress={onAdd}>
        <Ionicons name="add" size={18} color="#0f4d3a" />
        <Text style={styles.addText}>Add recipe or ingredient</Text>
      </Pressable>
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
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 14,
    marginBottom: 6,
  },
itemRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  paddingVertical: 8,
  backgroundColor: Colors.card,
},
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.textMuted,
  },

  itemName: { flex: 1, fontSize: 15, color: Colors.primaryDark },
  itemQty: { fontSize: 14, fontWeight: "600", color: Colors.primaryDark },
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
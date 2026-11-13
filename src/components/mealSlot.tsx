import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Meal, MealType } from "../../data/recipe/meal-plan";

//Sets the icons for each meal type
const ICONS: Record<MealType, keyof typeof Ionicons.glyphMap> = {
  Breakfast: "sunny-outline",
  Lunch: "restaurant-outline",
  Dinner: "moon-outline",
  Snack: "cafe-outline",
};

type Props = {
  type: MealType;
  meals: Meal[]; // the day's meals of this type (usually 0 or 1)
  onAdd: () => void;
  onRemoveItem: (meal: Meal, index: number) => void;
  // Turns an ingredient id into a display name. Defaults to showing the id
  // until an ingredient library exists to look names up in.
  nameOf?: (ingredientId: string) => string;
};

export default function MealSlot({
  type,
  meals,
  onAdd,
  onRemoveItem,
  nameOf = (id) => id,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name={ICONS[type]} size={20} color="#2E7D4F" />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{type}</Text>
          <Text style={styles.sub}>
            {meals.length
              ? meals.map((m) => m.time).join(" · ")
              : "Nothing planned"}
          </Text>
        </View>
        <Pressable style={styles.addButton} onPress={onAdd} hitSlop={8}>
          <Ionicons name="add" size={20} color="white" />
        </Pressable>
      </View>

      {meals.map((meal) =>
        meal.items.map((item, index) => (
          <View key={`${meal.id}-${index}`} style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>
              {nameOf(item.ingredientId)}
            </Text>
            <Text style={styles.itemQty}>
              {item.amount} {item.unit}
            </Text>
            <Pressable onPress={() => onRemoveItem(meal, index)} hitSlop={8}>
              <Ionicons name="close" size={18} color={Colors.textMuted} />
            </Pressable>
          </View>
        )),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DCEFE4",
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: { flex: 1 },
  title: { fontSize: 17, fontWeight: "600", color: Colors.primaryDark },
  sub: { fontSize: 13, color: Colors.textMuted },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0f4d3a",
    alignItems: "center",
    justifyContent: "center",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  itemName: { flex: 1, fontSize: 15, color: Colors.primaryDark },
  itemQty: { fontSize: 15, color: Colors.textMuted },
});
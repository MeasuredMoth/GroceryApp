import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Recipe } from "../../data/recipe/recipe";


export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

const ICONS: Record<MealType, keyof typeof Ionicons.glyphMap> = {
  Breakfast: "sunny-outline",
  Lunch: "restaurant-outline",
  Dinner: "moon-outline",
  Snack: "cafe-outline",
};

type Props = {
  type: MealType;
  recipes: Recipe[];
  kcal: number;
  onAdd: () => void;
  onRemove: (recipe: Recipe) => void;
};

export default function MealSlot({ type, recipes, kcal, onAdd, onRemove }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name={ICONS[type]} size={20} color="#2E7D4F" />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{type}</Text>
          <Text style={styles.sub}>{recipes.length ? `${kcal} kcal` : "Nothing planned"}</Text>
        </View>
        <Pressable style={styles.addButton} onPress={onAdd} hitSlop={8}>
          <Ionicons name="add" size={20} color="white" />
        </Pressable>
      </View>

      {recipes.map((r) => {
        const image = r.getImage();
        return (
          <View key={r.getId()} style={styles.recipeRow}>
            {image ? (
              <Image source={image} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]} />
            )}
            <Text style={styles.recipeName} numberOfLines={1}>{r.getName()}</Text>
            <Pressable onPress={() => onRemove(r)} hitSlop={8}>
              <Ionicons name="close" size={18} color={Colors.textMuted} />
            </Pressable>
          </View>
        );
      })}
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
  recipeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  thumb: { width: 40, height: 40, borderRadius: 10 },
  thumbPlaceholder: { backgroundColor: Colors.border },
  recipeName: { flex: 1, fontSize: 15, color: Colors.primaryDark },
});
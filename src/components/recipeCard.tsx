import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Recipe, RecipeCategory } from "../../data/recipe/recipe";

type Props = {
  recipe: Recipe;
  onPress?: (recipe: Recipe) => void;
  onMenuPress?: (recipe: Recipe) => void;
};

const CHIP_COLORS: Record<RecipeCategory, { bg: string; text: string }> = {
  Breakfast: { bg: "#E3F0FB", text: "#1F5F99" },
  Lunch: { bg: "#FFF3CC", text: "#8A6A00" },
  Dinner: { bg: "#E3F3E6", text: "#2E7D4F" },
  Snack: { bg: "#EDE7F8", text: "#6B4FA3" },
  Dessert: { bg: "#FBE4EC", text: "#A33A62" },
};

export default function RecipeCard({ recipe, onPress, onMenuPress }: Props) {
  const chip = CHIP_COLORS[recipe.getCategory()];
  const image = recipe.getImage();

  return (
    // pressable image on the outer left (currently does nothing on press)
    <Pressable style={styles.card} onPress={() => onPress?.(recipe)}>   
      {image ? (
        <Image source={image} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="restaurant-outline" size={24} color={Colors.textMuted} />
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={2}>{recipe.getName()}</Text>
          <Pressable hitSlop={10} onPress={() => onMenuPress?.(recipe)}>
            <Ionicons name="ellipsis-horizontal" size={18} color={Colors.textMuted} />
          </Pressable>
        </View>

        <View style={[styles.chip, { backgroundColor: chip.bg }]}>
          <Text style={[styles.chipText, { color: chip.text }]}>{recipe.getCategory()}</Text>
        </View>

        <View style={styles.metaRow}>
          {/* <View style={styles.meta}>
            <Ionicons name="flame-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.metaText}>{recipe.getKcal()} kcal</Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="people-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.metaText}>{recipe.getServingsString()}</Text>
          </View> */}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 10,
    gap: 10,
  },
  image: { width: 64, height: 64, borderRadius: 10 },
  imagePlaceholder: {
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, gap: 6 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", gap: 4 },
  name: { flex: 1, fontSize: 15, fontWeight: "600", color: Colors.primaryDark },
  chip: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  chipText: { fontSize: 12, fontWeight: "500" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", columnGap: 10, rowGap: 2 },
  meta: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { fontSize: 12, color: Colors.textMuted },
});
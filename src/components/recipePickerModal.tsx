import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Screen from "@/components/Screen";
import { Colors } from "@/constants/Colors";
import { recipes } from "@/data/recipesData";
import { EditScope, MealType } from "../../data/recipe/meal-plan";
import { Recipe } from "../../data/recipe/recipe";

type Props = {
  type: MealType | null; // null = closed
  weekday: string; // "Monday", used in the "every Monday" option
  onPick: (recipe: Recipe, scope: EditScope) => void;
  onClose: () => void;
};

export default function RecipePickerModal({ type, weekday, onPick, onClose }: Props) {
  const [scope, setScope] = useState<EditScope>("day");

  const pick = (recipe: Recipe) => {
    onPick(recipe, scope);
    setScope("day");
  };

  return (
    <Modal visible={type !== null} animationType="slide" onRequestClose={onClose}>
      <Screen>
        <Text style={styles.title}>Add to {type}</Text>

        <View style={styles.scopeRow}>
          <Pressable
            style={[styles.chip, scope === "day" && styles.chipActive]}
            onPress={() => setScope("day")}
          >
            <Text style={[styles.chipText, scope === "day" && styles.chipTextActive]}>
              Just this day
            </Text>
          </Pressable>
          <Pressable
            style={[styles.chip, scope === "weekday" && styles.chipActive]}
            onPress={() => setScope("weekday")}
          >
            <Text style={[styles.chipText, scope === "weekday" && styles.chipTextActive]}>
              Every {weekday}
            </Text>
          </Pressable>
        </View>

        <FlatList
          data={recipes}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => pick(item)}>
              <Text style={styles.rowText}>{item.name}</Text>
            </Pressable>
          )}
          ListFooterComponent={
            <Pressable onPress={onClose} style={{ padding: 16, alignItems: "center" }}>
              <Text style={{ color: Colors.textMuted }}>Cancel</Text>
            </Pressable>
          }
        />
      </Screen>
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: "700", color: "#0f4d3a", padding: 16 },
  scopeRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cfe3d9",
  },
  chipActive: { backgroundColor: "#0f4d3a", borderColor: "#0f4d3a" },
  chipText: { color: "#0f4d3a" },
  chipTextActive: { color: "white" },
  row: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  rowText: { fontSize: 16, color: Colors.primaryDark },
});
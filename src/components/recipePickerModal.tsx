import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Screen from "@/components/Screen";
import { Colors } from "@/constants/Colors";
import { useAppData } from "@/storage/appStore";
import { EditScope, PlanItem } from "../../data/recipe/meal-plan";
import { Ingredient } from "../../data/recipe/ingredient";
import { Recipe, recipeToItems } from "../../data/recipe/recipe";
import { MEAL_TYPE, UNITS } from "../../data/util/types";
import { createQuantity } from "../../data/recipe/quantity";
import { DefaultUnit, getPossibleUnitsFromType } from "../../data/util/unit";
import { ServingsStepper } from "@/components/servingsStepper";
import { UnitDropdown } from "@/components/unitDropdown";

type Props = {
  type: MEAL_TYPE | null; // null = closed
  weekday: string; // "Monday", used in the "every Monday" option
  onPick: (recipe: Recipe, scope: EditScope, servings: number) => void; // servings to scale the recipe to
  onPickIngredient?: (item: PlanItem, scope: EditScope) => void; // omit to hide the Ingredient option
  onClose: () => void;
};

type Mode = "recipe" | "ingredient";

export default function RecipePickerModal({
  type,
  weekday,
  onPick,
  onPickIngredient,
  onClose,
}: Props) {
  const { recipes, ingredients } = useAppData();
  const nameOf = (id: string) => ingredients.find((i) => i.id === id)?.name ?? id;
  const [scope, setScope] = useState<EditScope>("day");
  const [mode, setMode] = useState<Mode>("recipe");
  const [search, setSearch] = useState("");
  // Step 2 of the ingredient flow: the chosen ingredient plus its amount and unit
  const [chosen, setChosen] = useState<Ingredient | null>(null);
  const [amountText, setAmountText] = useState("");
  const [unit, setUnit] = useState<UNITS | null>(null);
  // Step 2 of the recipe flow: the chosen recipe and how many servings to make
  const [pickedRecipe, setPickedRecipe] = useState<Recipe | null>(null);
  const [servings, setServings] = useState(1);

  const reset = () => {
    setScope("day");
    setMode("recipe");
    setSearch("");
    setChosen(null);
    setAmountText("");
    setUnit(null);
    setPickedRecipe(null);
    setServings(1);
  };

  const close = () => {
    reset();
    onClose();
  };

  const pickRecipe = (recipe: Recipe) => {
    setPickedRecipe(recipe);
    setServings(recipe.servings);
  };

  const confirmRecipe = () => {
    if (!pickedRecipe) return;
    onPick(pickedRecipe, scope, servings);
    reset();
  };

  const chooseIngredient = (ingredient: Ingredient) => {
    setChosen(ingredient);
    setUnit(DefaultUnit[ingredient.allowedUnits[0]] ?? null);
    setAmountText("");
  };

  const amount = parseFloat(amountText.replace(",", "."));
  const canAdd = !!chosen && !!unit && Number.isFinite(amount) && amount > 0;

  const confirmIngredient = () => {
    if (!chosen || !unit || !canAdd || !onPickIngredient) return;
    onPickIngredient({ ingredientId: chosen.id, quantity: createQuantity(amount, unit) }, scope);
    reset();
  };

  const visibleIngredients = ingredients.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal
      visible={type !== null}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={close}
    >
      <SafeAreaProvider>
        <Screen>
          <View style={styles.header}>
            <Text style={styles.title}>Add to {type}</Text>
            <Pressable
              onPress={close}
              hitSlop={12}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={22} color={Colors.primaryDark} />
            </Pressable>
          </View>

          {/* Applies to both recipes and ingredients */}
          <View style={styles.chipRow}>
            <Chip label="Just this day" active={scope === "day"} onPress={() => setScope("day")} />
            <Chip
              label={`Every ${weekday}`}
              active={scope === "weekday"}
              onPress={() => setScope("weekday")}
            />
          </View>

          {onPickIngredient && !chosen && !pickedRecipe && (
            <View style={styles.segment}>
              <SegmentButton
                label="Recipe"
                active={mode === "recipe"}
                onPress={() => setMode("recipe")}
              />
              <SegmentButton
                label="Ingredient"
                active={mode === "ingredient"}
                onPress={() => setMode("ingredient")}
              />
            </View>
          )}

          {pickedRecipe ? (
            // Recipe step 2: how many servings, with the amounts worked out
            <ScrollView contentContainerStyle={styles.amountStep}>
              <Pressable style={styles.back} onPress={() => setPickedRecipe(null)} hitSlop={8}>
                <Ionicons name="chevron-back" size={18} color={Colors.primaryDark} />
                <Text style={styles.backText}>Back</Text>
              </Pressable>

              <Text style={styles.chosenName}>{pickedRecipe.name}</Text>
              <Text style={styles.rowSub}>
                Recipe makes {pickedRecipe.servings} {pickedRecipe.servings === 1 ? "serving" : "servings"}
              </Text>

              <View style={styles.servingsRow}>
                <Text style={styles.label}>How many servings?</Text>
                <ServingsStepper value={servings} onChange={setServings} />
              </View>

              <View style={styles.preview}>
                {recipeToItems(pickedRecipe, servings).map((item, i) => (
                  <View key={`${item.ingredientId}-${i}`} style={styles.previewRow}>
                    <Text style={styles.previewName}>{nameOf(item.ingredientId)}</Text>
                    <Text style={styles.previewAmount}>
                      {item.quantity.amount} {item.quantity.unit}
                    </Text>
                  </View>
                ))}
                {pickedRecipe.items.length === 0 && (
                  <Text style={styles.empty}>This recipe has no ingredients</Text>
                )}
              </View>

              <Pressable style={styles.confirm} onPress={confirmRecipe}>
                <Text style={styles.confirmText}>Add to {type}</Text>
              </Pressable>
            </ScrollView>
          ) : mode === "recipe" || !onPickIngredient ? (
            <FlatList
              data={recipes}
              keyExtractor={(r) => r.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <Pressable style={styles.row} onPress={() => pickRecipe(item)}>
                  <Text style={styles.rowText}>{item.name}</Text>
                  <Text style={styles.rowSub}>
                    {item.servings} {item.servings === 1 ? "serving" : "servings"}
                  </Text>
                </Pressable>
              )}
            />
          ) : chosen ? (
            // Step 2: amount and unit
            <View style={styles.amountStep}>
              <Pressable style={styles.back} onPress={() => setChosen(null)} hitSlop={8}>
                <Ionicons name="chevron-back" size={18} color={Colors.primaryDark} />
                <Text style={styles.backText}>Back</Text>
              </Pressable>

              <Text style={styles.chosenName}>{chosen.name}</Text>

              <Text style={styles.label}>Amount</Text>
              <TextInput
                style={styles.input}
                value={amountText}
                onChangeText={setAmountText}
                keyboardType="decimal-pad"
                placeholder="e.g. 100"
                placeholderTextColor={Colors.textMuted}
                autoFocus
              />

              <Text style={styles.label}>Unit</Text>
              <UnitDropdown
                units={getPossibleUnitsFromType(chosen.allowedUnits)}
                value={unit}
                onChange={setUnit}
              />

              <Pressable
                style={[styles.confirm, !canAdd && styles.confirmDisabled]}
                onPress={confirmIngredient}
                disabled={!canAdd}
              >
                <Text style={styles.confirmText}>Add to {type}</Text>
              </Pressable>
            </View>
          ) : (
            // Step 1: pick an ingredient
            <FlatList
              data={visibleIngredients}
              keyExtractor={(i) => i.id}
              contentContainerStyle={styles.list}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                <TextInput
                  style={styles.input}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search ingredients"
                  placeholderTextColor={Colors.textMuted}
                />
              }
              ListEmptyComponent={<Text style={styles.empty}>No ingredients found</Text>}
              renderItem={({ item }) => (
                <Pressable style={styles.row} onPress={() => chooseIngredient(item)}>
                  <Text style={styles.rowText}>{item.name}</Text>
                  <Text style={styles.rowSub}>{item.ingredientCategory}</Text>
                </Pressable>
              )}
            />
          )}
        </Screen>
      </SafeAreaProvider>
    </Modal>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function SegmentButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.segmentButton, active && styles.segmentActive]} onPress={onPress}>
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#0f4d3a" },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E6F1EC",
    alignItems: "center",
    justifyContent: "center",
  },
  chipRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16 },
  chipRowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
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
  segment: {
    flexDirection: "row",
    backgroundColor: "#E6F1EC",
    borderRadius: 999,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 12,
  },
  segmentButton: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: "center" },
  segmentActive: { backgroundColor: "#0f4d3a" },
  segmentText: { fontWeight: "600", color: "#0f4d3a" },
  segmentTextActive: { color: "white" },
  list: { padding: 16, gap: 10 },
  row: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowText: { fontSize: 16, color: Colors.primaryDark },
  rowSub: { fontSize: 12, color: Colors.textMuted },
  empty: { textAlign: "center", color: Colors.textMuted, paddingVertical: 24 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.primaryDark,
    marginBottom: 10,
  },
  amountStep: { padding: 16, gap: 8 },
  back: { flexDirection: "row", alignItems: "center", gap: 2, marginBottom: 4 },
  backText: { fontSize: 15, color: Colors.primaryDark },
  chosenName: { fontSize: 22, fontWeight: "700", color: "#0f4d3a", marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "600", color: Colors.textMuted, marginTop: 4 },
  confirm: {
    marginTop: 16,
    backgroundColor: "#0f4d3a",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmDisabled: { opacity: 0.4 },
  servingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  preview: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    borderRadius: 14,
    overflow: "hidden",
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  previewName: { fontSize: 15, color: Colors.primaryDark },
  previewAmount: { fontSize: 15, fontWeight: "600", color: Colors.textDark },
  confirmText: { color: "white", fontWeight: "600", fontSize: 15 },
});
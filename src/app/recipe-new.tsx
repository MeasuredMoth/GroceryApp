// Create a new recipe from the ingredient database (opened from the Today tab's "Add recipe" card).

import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Href, router } from "expo-router";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { ChipRow, FormChip } from "@/components/formChip";
import { ServingsStepper } from "@/components/servingsStepper";
import { UnitDropdown } from "@/components/unitDropdown";
import { saveRecipe, useAppData } from "@/storage/appStore";
import { Ingredient } from "../../data/recipe/ingredient";
import { PlanItem } from "../../data/recipe/meal-plan";
import { createQuantity } from "../../data/recipe/quantity";
import { createRecipe } from "../../data/recipe/recipe";
import { RECIPE_CATEGORY, UNITS } from "../../data/util/types";
import { DefaultUnit, getPossibleUnitsFromType } from "../../data/util/unit";

const MAX_MATCHES = 6;

/** Accepts "1,5" as well as "1.5". Returns NaN for anything that isn't a number. */
function parseAmount(text: string): number {
  const cleaned = text.replace(",", ".").trim();
  return /^\d*\.?\d+$/.test(cleaned) ? Number(cleaned) : NaN;
}

/** Keeps up to 2 decimals and drops trailing zeros: 1.50 -> "1.5". */
const formatAmount = (n: number) => String(Math.round(n * 100) / 100);

/** Adds the item, or sums it into a line of the same ingredient and unit. */
function addItem(items: PlanItem[], item: PlanItem): PlanItem[] {
  const index = items.findIndex(
    (i) =>
      i.ingredientId === item.ingredientId &&
      i.quantity.unit === item.quantity.unit,
  );
  if (index === -1) return [...items, item];
  const total = items[index].quantity.amount + item.quantity.amount;
  return items.map((i, n) =>
    n === index
      ? { ...i, quantity: createQuantity(total, i.quantity.unit) }
      : i,
  );
}

export default function NewRecipeScreen() {
  const { ingredients, recipes } = useAppData();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<RECIPE_CATEGORY>(
    RECIPE_CATEGORY.DINNER,
  );
  const [servings, setServings] = useState(1);
  const [items, setItems] = useState<PlanItem[]>([]);

  // The ingredient being added right now
  const [search, setSearch] = useState("");
  const [chosen, setChosen] = useState<Ingredient | null>(null);
  const [amountText, setAmountText] = useState("");
  const [unit, setUnit] = useState<UNITS | null>(null);

  const nameOf = (id: string) =>
    ingredients.find((i) => i.id === id)?.name ?? id;

  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    return ingredients
      .filter((i) => i.name.toLowerCase().includes(query))
      .slice(0, MAX_MATCHES);
  }, [ingredients, search]);

  const trimmed = name.trim();
  const duplicateName = recipes.some(
    (r) => r.name.toLowerCase() === trimmed.toLowerCase(),
  );
  const canSave = trimmed !== "" && !duplicateName && items.length > 0;

  const amount = parseAmount(amountText);
  const amountOk = Number.isFinite(amount) && amount > 0;
  const canAddItem = chosen !== null && unit !== null && amountOk;

  const choose = (ingredient: Ingredient) => {
    setChosen(ingredient);
    setUnit(DefaultUnit[ingredient.allowedUnits[0]]);
    setAmountText("");
  };

  const cancelItem = () => {
    setChosen(null);
    setAmountText("");
    setUnit(null);
  };

  const confirmItem = () => {
    if (!chosen || !unit || !amountOk) return;
    setItems((current) =>
      addItem(current, {
        ingredientId: chosen.id,
        quantity: createQuantity(amount, unit),
      }),
    );
    cancelItem();
    setSearch("");
  };

  const removeItem = (index: number) =>
    setItems((current) => current.filter((_, i) => i !== index));

  const createIngredientShortcut = () => {
    const query = search.trim();
    router.push(
      (query
        ? `/ingredient-new?name=${encodeURIComponent(query)}`
        : "/ingredient-new") as Href,
    );
  };

  const save = () => {
    if (!canSave) return;
    saveRecipe(createRecipe(trimmed, items, { category, servings }));
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.titleBar}>
        <View
          style={[styles.titleIcon, { backgroundColor: Colors.addRecipeBg }]}
        >
          <Ionicons
            name="document-text-outline"
            size={20}
            color={Colors.addRecipeIcon}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>New recipe</Text>
          <Text style={styles.subtitle}>
            Create a recipe from your ingredients
          </Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={18} color={Colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            style={styles.textField}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Overnight oats"
            placeholderTextColor={Colors.textMuted}
          />
          {duplicateName && (
            <Text style={styles.error}>
              You already have a recipe called {trimmed}
            </Text>
          )}

          <Text style={[styles.fieldLabel, { marginTop: 6 }]}>Category</Text>
          <ChipRow>
            {Object.values(RECIPE_CATEGORY).map((c) => (
              <FormChip
                key={c}
                label={c}
                active={c === category}
                onPress={() => setCategory(c)}
              />
            ))}
          </ChipRow>

          <View style={[styles.row, { marginTop: 6 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Servings</Text>
              <Text style={styles.muted}>
                Enter the amounts for this many servings
              </Text>
            </View>
            <ServingsStepper value={servings} onChange={setServings} />
          </View>
        </View>

        {/* Ingredients already in the recipe */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            INGREDIENTS · {servings} {servings === 1 ? "SERVING" : "SERVINGS"}
          </Text>
          <Text style={styles.sectionCount}>
            {items.length} {items.length === 1 ? "item" : "items"}
          </Text>
        </View>

        <Animated.View layout={LinearTransition} style={styles.list}>
          {items.length === 0 && (
            <Text style={[styles.muted, { padding: 14 }]}>
              No ingredients yet. Add at least one below.
            </Text>
          )}
          {items.map((item, index) => (
            <Animated.View
              key={`${item.ingredientId}-${item.quantity.unit}`}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              style={styles.itemRow}
            >
              <Text style={styles.itemName}>{nameOf(item.ingredientId)}</Text>
              <Text style={styles.itemAmount}>
                {formatAmount(item.quantity.amount)} {item.quantity.unit}
              </Text>
              <Pressable
                onPress={() => removeItem(index)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${nameOf(item.ingredientId)}`}
              >
                <Ionicons name="close" size={18} color={Colors.textMuted} />
              </Pressable>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Adding one ingredient: pick it, then amount and unit */}
        {chosen && unit ? (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={styles.selectedCard}
          >
            <View style={styles.row}>
              <Text style={styles.selectedName}>{chosen.name}</Text>
              <View style={{ flex: 1 }} />
              <Pressable
                onPress={cancelItem}
                hitSlop={8}
                accessibilityLabel="Pick another ingredient"
              >
                <Text style={styles.link}>Change</Text>
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>Amount</Text>
            <TextInput
              style={styles.textField}
              value={amountText}
              onChangeText={setAmountText}
              keyboardType="decimal-pad"
              placeholder="e.g. 100"
              placeholderTextColor={Colors.textMuted}
              autoFocus
              onSubmitEditing={confirmItem}
            />
            {amountText !== "" && !amountOk && (
              <Text style={styles.error}>Enter an amount greater than 0</Text>
            )}

            <Text style={styles.fieldLabel}>Unit</Text>
            <UnitDropdown
              units={getPossibleUnitsFromType(chosen.allowedUnits)}
              value={unit}
              onChange={setUnit}
            />

            <Pressable
              style={[styles.addButton, !canAddItem && styles.disabled]}
              onPress={confirmItem}
              disabled={!canAddItem}
              accessibilityRole="button"
            >
              <Ionicons name="add" size={18} color="white" />
              <Text style={styles.addButtonText}>Add to recipe</Text>
            </Pressable>
          </Animated.View>
        ) : (
          <>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Search ingredients to add"
                placeholderTextColor={Colors.textMuted}
                autoCorrect={false}
              />
              {search !== "" && (
                <Pressable
                  onPress={() => setSearch("")}
                  hitSlop={8}
                  accessibilityLabel="Clear search"
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={Colors.textMuted}
                  />
                </Pressable>
              )}
            </View>

            <View style={styles.list}>
              {matches.map((ingredient) => (
                <Pressable
                  key={ingredient.id}
                  style={styles.matchRow}
                  onPress={() => choose(ingredient)}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${ingredient.name}`}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{ingredient.name}</Text>
                    <Text style={styles.muted}>
                      {ingredient.ingredientCategory}
                    </Text>
                  </View>
                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color={Colors.textMuted}
                  />
                </Pressable>
              ))}
              {matches.length === 0 && (
                <Text style={[styles.muted, { padding: 14 }]}>
                  No ingredients match.
                </Text>
              )}
              <Pressable
                style={styles.matchRow}
                onPress={createIngredientShortcut}
                accessibilityRole="button"
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.link}>Can&apos;t find it?</Text>
                  <Text style={styles.muted}>
                    {search.trim()
                      ? `Create "${search.trim()}" as a new ingredient`
                      : "Create a new ingredient"}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.textMuted}
                />
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}
      >
        <Pressable
          style={[styles.saveButton, !canSave && styles.disabled]}
          onPress={save}
          disabled={!canSave}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave }}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="white" />
          <Text style={styles.saveButtonText}>Save recipe</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  titleBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  titleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: Colors.primaryDark },
  subtitle: { fontSize: 13, color: Colors.textMuted },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: Colors.textMuted },
  textField: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 15,
    color: Colors.textDark,
  },
  error: { fontSize: 12, color: Colors.danger },
  muted: { fontSize: 12, color: Colors.textMuted },
  link: { fontSize: 15, fontWeight: "600", color: Colors.primaryDark },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  sectionCount: { fontSize: 11, color: Colors.textMuted },
  list: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    overflow: "hidden",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textDark,
  },
  itemAmount: { fontSize: 14, color: Colors.textMuted },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textDark },
  selectedCard: {
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  selectedName: { fontSize: 17, fontWeight: "700", color: Colors.textDark },
  addButton: {
    marginTop: 6,
    flexDirection: "row",
    gap: 6,
    backgroundColor: Colors.primaryDark,
    borderRadius: 12,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: { color: "white", fontSize: 15, fontWeight: "700" },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#0f4d3a",
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.4 },
  saveButtonText: { color: "white", fontSize: 16, fontWeight: "700" },
});

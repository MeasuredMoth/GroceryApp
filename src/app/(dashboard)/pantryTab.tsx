import { useState } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { Href, router } from "expo-router";
import Animated, { Easing, FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import Header from "@/components/header";
import IngredientRow from "@/components/ingredientRow";
import SwipeableRow, { closeOpenRow } from "@/components/swipeableRow";
import IngredientsListHeader from "@/components/ingredientListHeader";
import SearchAndFilters from "@/components/searchAndFilters";
import { deletePantryEntry, useAppData } from "@/storage/appStore";
import { Ionicons } from "@expo/vector-icons";
import Screen from "@/components/Screen";
import Feather from "@expo/vector-icons/Feather";
import { Ingredient } from "../../../data/recipe/ingredient";
import { PantryEntry } from "../../../data/recipe/pantry";
import PantryResume from "@/components/pantryResume";
import { INGREDIENT_CATEGORY } from "../../../data/util/types";


enum CATEGORIES {
  ALLITEMS = "All items",
  PROTEINS = "Proteins",
  CARBS = "Carbs",
  VEGETABLES = "Vegetables",
  DAIRY = "Dairy",
  FRUIT = "Fruit",
  OTHER = "Other"
}

const LabelCategories: Record<CATEGORIES | string, INGREDIENT_CATEGORY | null>  = {
  [CATEGORIES.ALLITEMS]: null,
  [CATEGORIES.PROTEINS]: INGREDIENT_CATEGORY.PROTEIN,
  [CATEGORIES.CARBS]: INGREDIENT_CATEGORY.CARB,
  [CATEGORIES.VEGETABLES]: INGREDIENT_CATEGORY.VEGETABLE,
  [CATEGORIES.DAIRY]: INGREDIENT_CATEGORY.DAIRY,
  [CATEGORIES.FRUIT]: INGREDIENT_CATEGORY.FRUIT,
  [CATEGORIES.OTHER]: INGREDIENT_CATEGORY.OTHER,
};

//TODO check that when adding a new ingredient and so adding the allowed units, you can only add those units in the pantry

//TODO check that when adding a new ingredient and so adding the allowed units, you can only add those units in the pantry

type Row = { entry: PantryEntry; ingredient: Ingredient };

// Removed rows fade out quickly, then the rows below glide up. No spring, so nothing bounces.
const ROW_EXIT = FadeOut.duration(160);
const ROW_LAYOUT = LinearTransition.duration(240).easing(Easing.out(Easing.cubic));
const EXPIRING_SOON_DAYS = 3;
const MS_PER_DAY = 86_400_000;


// Assumes expiresOn is an ISO date string like "2026-11-20".
// Parsed as a local date so the day count doesn't shift with timezones.
function daysUntil(isoDate: string): number | null {
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(y, m - 1, d).getTime() - today.getTime()) / MS_PER_DAY);
}

export default function PantryTab() {
  const { ingredients, pantry } = useAppData();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All items");

  const rows: Row[] = pantry.flatMap((entry) => {
    const ingredient = ingredients.find((i) => i.id === entry.ingredientId);
    return ingredient ? [{ entry, ingredient }] : [];
  });

  const visible = rows.filter(
    ({ ingredient }) =>
      (category === CATEGORIES.ALLITEMS || ingredient.ingredientCategory === LabelCategories[category]) &&
      ingredient.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Computed from all rows, not `visible`, so search/filters don't change the warning.
const withExpiry = rows
  .filter(({ entry }) => entry.expiresOn && entry.quantity.amount > 0)
  .map(({ entry, ingredient }) => ({
    name: ingredient.name,
    daysLeft: daysUntil(entry.expiresOn!),
  }))
  .filter((r): r is { name: string; daysLeft: number } => r.daysLeft !== null)
  .sort((a, b) => a.daysLeft - b.daysLeft);

const expiringSoon = withExpiry.filter((r) => r.daysLeft <= EXPIRING_SOON_DAYS);
const nextExpiring = withExpiry[0];


  return (
    <Screen>
      {/* Fixed (non-scrolling) area */}
      <View style={styles.headerContainer}>
        <Header
          icon={<Feather name="archive" size={24} color="#0d3332" />}
          textHeader="Pantry"
          secondSubheading="Your ingredient database"
          action={
            <Pressable
              style={styles.addButton}
              onPress={() => {
                closeOpenRow();
                router.push("/pantry-item" as Href);
              }}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addLabel}>Add item</Text>
            </Pressable>
          }
        />
      </View>

   <View style={styles.resumeContainer}>
  <PantryResume
    totalItems={rows.length}
    expiringSoonCount={expiringSoon.length}
    nextExpiring={nextExpiring}
  />
</View>

      <SearchAndFilters
        search={search}
        onSearchChange={setSearch}
        onFilterPress={() => console.log("Open filters")}
        categories={Object.values(CATEGORIES)}
        category={category}
        onCategoryChange={setCategory}
        placeholder="Search ingredients"
      />

      {/* Only this scrolls. Swipe a row left for Edit / Remove. */}
      <Animated.FlatList
        data={visible}
        keyExtractor={(item) => item.entry.id}
        itemLayoutAnimation={ROW_LAYOUT}
        onScrollBeginDrag={closeOpenRow}
        renderItem={({ item }) => (
          <Animated.View entering={FadeIn.duration(200)} exiting={ROW_EXIT}>
            <SwipeableRow
              onEdit={() => router.push(`/pantry-item?id=${encodeURIComponent(item.entry.id)}` as Href)}
              onDelete={() => deletePantryEntry(item.entry.id)}
            >
              <IngredientRow
                title={item.ingredient.name}
                value={`${item.entry.quantity.amount} ${item.entry.quantity.unit}`}
                subtitle={item.entry.expiresOn ? `Expires ${item.entry.expiresOn}` : undefined}
                badge={item.entry.quantity.amount === 0 ? "OUT" : undefined}
                onPress={closeOpenRow}
              />
            </SwipeableRow>
          </Animated.View>
        )}
        ListHeaderComponent={<IngredientsListHeader count={visible.length} />}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0f4d3a",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  addLabel: { color: "white", fontWeight: "600" },
  headerContainer: { paddingHorizontal: 16, paddingBottom: 8 },
  resumeContainer: { paddingHorizontal: 16, paddingBottom: 8 },
});

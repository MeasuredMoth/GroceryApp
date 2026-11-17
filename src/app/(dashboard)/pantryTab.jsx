import { useState } from "react";
import { View, StyleSheet, FlatList, Pressable, Text } from "react-native";
import Header from "@/components/header";
import IngredientRow from "@/components/ingredientRow";
import IngredientsListHeader from "@/components/ingredientListHeader";
import SearchAndFilters from "@/components/searchAndFilters";
import { useAppData } from "@/storage/appStore";
import { Ionicons } from "@expo/vector-icons";
import Screen from "@/components/Screen";
import Feather from "@expo/vector-icons/Feather";

const CATEGORIES = [
  "All items",
  "Proteins",
  "Carbs",
  "Vegetables",
  "Dairy",
  "Fruit",
  "Other",
];

//TODO
//show the pantry entries (useAppData().pantry, changed with savePantryEntry / deletePantryEntry).
//For now this lists the saved ingredients.

export default function PantryTab() {
  const { ingredients, pantry } = useAppData();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All items");

  const rows = pantry.flatMap((entry) => {
    const ingredient = ingredients.find((i) => i.id === entry.ingredientId);
    return ingredient ? [{ entry, ingredient }] : [];
  });

  const visible = rows.filter(
    ({ ingredient }) =>
      (category === "All items" || ingredient.category === category) &&
      ingredient.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Screen>
      {/* Fixed (non-scrolling) area */}
      <View style={styles.headerContainer}>
        <Header
          icon={<Feather name="archive" size={24} color="#0d3332" />}
          textHeader="Pantry"
          secondSubheading="Your ingredient database"
          action={
            <Pressable style={styles.addButton} onPress={() => {}}>
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addLabel}>Add item</Text>
            </Pressable>
          }
        />
      </View>

      <SearchAndFilters
        search={search}
        onSearchChange={setSearch}
        onFilterPress={() => console.log("Open filters")}
        categories={CATEGORIES}
        category={category}
        onCategoryChange={setCategory}
        placeholder="Search ingredients"
      />

      {/* Only this scrolls */}
      <FlatList
        data={visible}
        keyExtractor={(item) => item.entry.id}
        renderItem={({ item }) => (
          <IngredientRow
            title={item.ingredient.name}
            value={`${item.entry.amount} ${item.entry.unit}`}
            subtitle={
              item.entry.expiresOn
                ? `Expires ${item.entry.expiresOn}`
                : undefined
            }
            badge={item.entry.amount === 0 ? "OUT" : undefined}
          />
        )}
        ListHeaderComponent={<IngredientsListHeader count={visible.length} />}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
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
  addRow: { alignItems: "flex-end", paddingHorizontal: 16, marginTop: 8 },
  headerContainer: { paddingHorizontal: 16, paddingBottom: 8 },
});

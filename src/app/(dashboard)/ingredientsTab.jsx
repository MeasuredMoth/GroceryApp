import { useState } from "react";
import { View, StyleSheet, FlatList, Pressable, Text } from "react-native";
import Header from "@/components/header";
import IngredientRow from "@/components/ingredientRow";
import IngredientsListHeader from "@/components/ingredientListHeader";
import SearchAndFilters from "@/components/searchAndFilters";
import { ingredients } from "@/data/ingredientsData";
import { Ionicons } from "@expo/vector-icons";
import Screen from "@/components/Screen";

const CATEGORIES = ["All items", "Proteins", "Carbs", "Vegetables", "Dairy", "Other"];

export default function IngredientsTab() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All items");

  const visible = ingredients.filter(
    (i) => i.getName().toLowerCase().includes(search.toLowerCase())
    // add the category filter once Ingredient has a category field
  );

  return (
    <Screen>
      {/* Fixed (non-scrolling) area */}
      <View style={styles.headerContainer}>
        <Header
          textHeader="Ingredients"
          firstSubheading="Your ingredient database"
          secondSubheading="Save nutrition, prices and details once. Reuse them in every recipe."
          action={
                 <Pressable style={styles.addButton} onPress={() => {}}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addLabel}>Add ingredient</Text>
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
      />

      {/* Only this scrolls */}
      <FlatList
        data={visible}
        keyExtractor={(item) => item.getName()}
        renderItem={({ item }) => <IngredientRow ingredient={item} />}
        ListHeaderComponent={<IngredientsListHeader count={visible.length} />}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
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
  headerContainer: { paddingHorizontal: 16 },
});
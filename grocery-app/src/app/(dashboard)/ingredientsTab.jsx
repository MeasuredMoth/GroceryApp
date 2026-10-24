import { useState } from "react";
import { View, StyleSheet, FlatList, Pressable, Text } from "react-native";
import Header from "@/components/header";
import IngredientRow from "@/components/ingredientRow";
import IngredientsListHeader from "@/components/ingredientListHeader";
import { ingredients } from "../../data/ingredientsData";
import { Ionicons } from "@expo/vector-icons";

export default function IngredientsTab() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All items");

  const visible = ingredients.filter(
    (i) =>
      i.getName().toLowerCase().includes(search.toLowerCase())
    // add the category filter once Ingredient has a category field
  );

  return (
   
    
    <View style={styles.screen}>

      <View style={styles.headerContainer}>
      <Header
        textHeader="Ingredients"
        firstSubheading="Your ingredient database"
        secondSubheading="Save nutrition, prices and details once. Reuse them in every recipe."
      />

      <Pressable style={styles.addButton} onPress={() => {}}>
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.addLabel}>Add ingredient</Text>
      </Pressable>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.getName()}
        renderItem={({ item }) => <IngredientRow ingredient={item} />}
        ListHeaderComponent={
          <IngredientsListHeader
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            count={visible.length}
            onAddPress={() => {}}
            onFilterPress={() => {}}
          />
        }
        contentContainerStyle={{ padding: 16, gap: 12 }}
      />
    </View>
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
});
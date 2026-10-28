import { Text, View, StyleSheet, TextInput } from "react-native";
import Screen from "@/components/Screen";
import Header from "@/components/header";
import SearchAndFilters from "@/components/searchAndFilters"
import { useState } from "react";



const CATEGORIES = ["All", "Breakfast", "Lunch", "Dinner", "Snacks", "Desserts"];


export default function IngredientsTab() {
      const [search, setSearch] = useState("");
      const [category, setCategory] = useState("All");

  
  return (

    <Screen>
      <View style={styles.headerContainer}>
          <Header textHeader="Recipes"
            secondSubheading= "Your recipes, your meals. Create, organize and cook.">
          </Header>
      </View>

        <SearchAndFilters
              search={search}
              onSearchChange={setSearch}
              onFilterPress={() => console.log("Open filters")}
              categories={CATEGORIES}
              category={category}
              onCategoryChange={setCategory}
              placeholder="Search your recipes..."
            />

    </Screen>

  );
}


const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
})
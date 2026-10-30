
import { Text, View, StyleSheet, TextInput, FlatList } from "react-native";
import Screen from "@/components/Screen";
import Header from "@/components/header";
import SearchAndFilters from "@/components/searchAndFilters"
import { useState, useMemo } from "react";
import RecipesListHeader from "@/components/recipesListHeader"
import { recipes } from "@/data/recipesData"
import RecipeCard from "@/components/recipeCard"

const CATEGORIES = ["All", "Breakfast", "Lunch", "Dinner", "Snacks", "Desserts"];

export default function RecipesTab() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  //useMemo stores the value in cache and only recalculates the result if one of the dependencies (search/category) changes
  //this allows to avoid re-rendering the filter every time an action occurs in recipeTab
  const visible = useMemo(  
    () =>
      recipes.filter(
        (r) =>
          r.getName().toLowerCase().includes(search.toLowerCase()) &&
          (category === "All" || r.getCategory() === category)
      ),
    [search, category]
  );

  //spacing trick in order to append a null at the end if the number of recipes is odd (since we have recipes split into two columns)
  const data = useMemo(
    () => (visible.length % 2 === 1 ? [...visible, null] : visible),
    [visible]
  );


  return (

    <Screen>
      <View style={styles.headerContainer}>
        <Header textHeader="Recipes"
          secondSubheading="Your recipes, your meals. Create, organize and cook.">
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

      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item, i) => (item ? item.getId() : `spacer-${i}`)} //gives a key to every recipe based on its ID
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListHeaderComponent={<RecipesListHeader count={visible.length} />} //renders the title, number of recipes and the sort by button
        renderItem={({ item }) =>
          item ? <RecipeCard recipe={item} /> : <View style={{ flex: 1 }} /> //decides how each recipe is rendered 
        }                                                                    //(if null it renders a spacer to avoid the last odd recipe to stretch)
        keyboardShouldPersistTaps="handled"
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
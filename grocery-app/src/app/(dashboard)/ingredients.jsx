import { Text, View, StyleSheet, TextInput, FlatList } from "react-native";
import Header from "@/components/header";
import IngredientRow from "@/components/ingredientRow"



export default function IngredientsTab() {
  // const ingredients[] 

  return (
    <View>
        <Header headerText= "Ingredients"/>

        <Spacer />
        <FlatList /> 

        <IngredientRow ingredient = {{}}/>
    </View>
  );
}
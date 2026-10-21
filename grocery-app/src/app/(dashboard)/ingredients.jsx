import { Text, View, StyleSheet, TextInput } from "react-native";
import Header from "@/components /header";
import IngredientRow from "@/components /ingredientRow"



export default function IngredientsTab() {
  return (
    <View>
        <Header headerText= "Ingredients"/>

        <IngredientRow ingredient = {{}}/>
    </View>
  );
}
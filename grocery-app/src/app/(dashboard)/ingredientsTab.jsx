import { Text, View, StyleSheet, TextInput, FlatList } from "react-native";
import Header from "@/components/header";
import IngredientRow from "@/components/ingredientRow"
import { Ingredient, quantityFormats } from "../../../recipe/ingredient";
import { ingredients } from '../../data/ingredientsData';


const DATA = ingredients;

export default function IngredientsTab() {

  return (
    <View>
        <Header textHeader= "Ingredients"/>

        <FlatList 
        data={DATA}
        renderItem={({ item }) => (
          <IngredientRow ingredient={item} />        )}
        keyExtractor={(item) => item.getName()}
        /> 

        {/* <IngredientRow ingredient = {{}}/> */}
    </View>
  );
}
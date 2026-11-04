import { Text, View, StyleSheet, TextInput } from "react-native";
import Screen from "@/components/Screen";
import Header from "@/components/header";


export default function MealPlanTab() {
  return (
    <Screen>

    <View style={styles.headerContainer}>
        <Header textHeader="Meal Plan"
          secondSubheading="Your personalized meal plan for the week.">
        </Header>
      </View>

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
import Header from "@/components/header";
import Screen from "@/components/Screen";
import { Text, View, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {

  //  Will be changed with the user's name
  const userName= "Lorenzo"

  return (
    <Screen>
      <View style={styles.content}>
        <Header
          textHeader="GroceryMeal"
          firstSubheading={`Good morning, ${userName}`}
          secondSubheading="Healthy meals. Less waste."
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
   content: { paddingHorizontal: 16 },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0d3332',
    marginTop: 8,
  },
    tagline: {
    fontSize: 16,
    color: '#6B7A72',
  },
});
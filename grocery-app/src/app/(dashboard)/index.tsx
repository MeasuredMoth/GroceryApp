import Header from "@/components/header";
import { Link } from "expo-router";
import { Text, View, StyleSheet, TextInput } from "react-native";

export default function Index() {

  {/* Will be changed with the user's name */}
  const userName= "Lorenzo"
  
  return (
    <View>
        <Header headerText= "GroceryMeal" /> 
        <Text style={styles.greeting}>Good morning, {userName}!</Text>
        <Text style={styles.tagline}>Healthy meals. Less waste.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0d3332',
    marginTop: 8,
  },
    tagline: {
    fontSize: 16,
    color: '#6B7A72',
  }
});

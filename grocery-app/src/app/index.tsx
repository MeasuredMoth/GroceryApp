import Header from "@/components /header";
import { Text, View, StyleSheet, TextInput } from "react-native";


export default function Index() {
  return (
    <View>
        <Header userName="Lorenzo" /> 
        {/* Will be changed with the user's name */}
        
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

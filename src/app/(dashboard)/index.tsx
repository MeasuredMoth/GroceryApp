import Header from "@/components/header";
import Screen from "@/components/Screen";
import { Colors } from "@/constants/Colors";
import { scheduleTestNotification, setupNotifications } from "@/notifications/notifications";
import { useState } from "react";
import { Text, View, StyleSheet, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {

  //  Will be changed with the user's name
  const userName= "Lorenzo"

  const [notificationStatus, setNotificationStatus] = useState("");

  //TEMPORARY: test button for notifications, remove once real reminders exist
  const sendTestNotification = async () => {
    const allowed = await setupNotifications();
    if (!allowed) {
      setNotificationStatus("Notification permission denied. Enable it in Settings.");
      return;
    }
    await scheduleTestNotification(5);
    setNotificationStatus("Scheduled! It will appear in 5 seconds.");
  };

  return (
<<<<<<< HEAD
    <View>
<<<<<<< HEAD
        <Header textHeader= "GroceryMeal" firstSubheading={`Good morning, ${userName}`} secondSubheading="Healthy meals. Less waste." /> 
=======
        <Header textHeader= "GroceryMeal" />
        <Text style={styles.greeting}>Good morning, {userName}!</Text>
        <Text style={styles.tagline}>Healthy meals. Less waste.</Text>
=======
    <Screen>
    <Header textHeader= "GroceryMeal" firstSubheading={`Good morning, ${userName}`} secondSubheading="Healthy meals. Less waste." /> 

>>>>>>> d6904ca (Replaced wrapper view with more flexible SafeAreaView (Screen component))

        <Pressable style={styles.testButton} onPress={sendTestNotification}>
          <Text style={styles.testButtonText}>Send test notification</Text>
        </Pressable>
        {notificationStatus !== "" && <Text style={styles.tagline}>{notificationStatus}</Text>}
<<<<<<< HEAD
>>>>>>> 5c7495e (Add test local notification and commit package.json)
    </View>
=======
    </Screen>
>>>>>>> d6904ca (Replaced wrapper view with more flexible SafeAreaView (Screen component))
  );
}

const styles = StyleSheet.create({
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
  testButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  testButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  }
});

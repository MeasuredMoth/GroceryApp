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
    <Screen>
    <Header textHeader= "GroceryMeal" firstSubheading={`Good morning, ${userName}`} secondSubheading="Healthy meals. Less waste." /> 


        <Pressable style={styles.testButton} onPress={sendTestNotification}>
          <Text style={styles.testButtonText}>Send test notification</Text>
        </Pressable>
        {notificationStatus !== "" && <Text style={styles.tagline}>{notificationStatus}</Text>}
    </Screen>
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
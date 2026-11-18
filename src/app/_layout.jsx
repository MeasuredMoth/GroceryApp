import { useNotificationObserver } from "@/notifications/useNotificationObserver";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  useNotificationObserver();

  //The stack is applied to every single tab and adds the top left arrow for history navigation
  return (
    // Swipeable rows need the gesture handler root around the whole app
    <GestureHandlerRootView style={{ flex: 1 }}>
    <Stack>
      {/* To remove the title on the top bar */}
      <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: "Settings", headerBackButtonDisplayMode: "minimal"}} />
      {/* Add / edit pantry item, slides up as a sheet */}
      <Stack.Screen name="pantry-item" options={{ presentation: "modal", headerShown: false }} />
    </Stack>
    </GestureHandlerRootView>
  );
}

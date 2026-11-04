import { useNotificationObserver } from "@/notifications/useNotificationObserver";
import { Stack } from "expo-router";

export default function RootLayout() {    //The stack is applied to every single tab and adds the top left arrow for history navigation
  useNotificationObserver();

  return  (
    <Stack>
      {/* To remove the title on the top bar */}
      <Stack.Screen name="(dashboard)" options={{headerShown: false}} />
      <Stack.Screen name="settings" options={{title: "Settings"}} />

    </Stack>
  
  )
}
 
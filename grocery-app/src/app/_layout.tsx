import { Stack } from "expo-router";

export default function RootLayout() {    //The stack is applied to every single tab and adds the top left arrow for history navigation
  return  (
    <Stack>
      <Stack.Screen name="index" options={{title: 'Home'}} />  

    </Stack>
  
  
  )
}

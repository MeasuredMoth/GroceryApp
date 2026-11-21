import { Tabs } from "expo-router";
import { Colors } from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import SlidingTabBar from "@/components/slidingTabBar";

const ICON_SIZE = 26;

const DashBoardLayout = () => {
  return (
    <Tabs
      tabBar={(props) => <SlidingTabBar {...props} />}
  
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryDark,
        tabBarInactiveTintColor: Colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={ICON_SIZE} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="mealplanTab"
        options={{
          title: "Plan",
          tabBarIcon: ({ color }) => (
            <Feather name="calendar" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="pantryTab"
        options={{
          title: "Pantry",
          tabBarIcon: ({ color }) => (
            <Feather name="archive" size={24} color={color} />          ),
        }}
      />

      <Tabs.Screen
        name="shoppinglist"
        options={{
          title: "Shopping List",
          tabBarIcon: ({ color }) => (
            <AntDesign name="shopping-cart" size={ICON_SIZE} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default DashBoardLayout;

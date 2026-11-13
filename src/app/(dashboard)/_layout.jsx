import { Tabs } from "expo-router";
import { Colors } from "@/constants/Colors";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ICON_SIZE = 26;

const DashBoardLayout = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryDark,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelPosition: "below-icon",
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: {
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
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
        name="ingredientsTab"
        options={{
          title: "Ingredients",
          tabBarIcon: ({ color }) => (
            <AntDesign name="database" size={ICON_SIZE} color={color} />
          ),
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


import { Tabs } from 'expo-router';
import { Colors } from '@/constants/Colors';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';

const ICON_SIZE = 26;

const DashBoardLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryDark,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: {fontSize: 12},
        tabBarStyle: {height: 64, paddingTop: 6}
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({color}) => (
            <Feather name="home" size={ICON_SIZE} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="mealplan"
        options={{
          title: 'Meal Plan',
          tabBarIcon: ({color}) => (
            <FontAwesome name="calendar-o" size={ICON_SIZE} color={color} />
          ),
        }}
      />

       <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({color}) => (
            <Entypo name="magnifying-glass" size={ICON_SIZE} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="ingredients"
        options={{
          title: 'Ingredients',
          tabBarIcon: ({color}) => (
            <AntDesign name="database" size={ICON_SIZE} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="shoppinglist"
        options={{
          title: 'Shopping List',
          tabBarIcon: ({color}) => (
            <AntDesign name="shopping-cart" size={ICON_SIZE} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default DashBoardLayout;

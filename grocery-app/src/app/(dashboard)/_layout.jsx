
import { Tabs } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';

const DashBoardLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#084828',
        tabBarInactiveTintColor: '#86929d',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="mealplan"
        options={{
          title: 'Meal Plan',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar-o" size={size} color={color} />
          ),
        }}
      />

       <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color, size }) => (
            <Entypo name="magnifying-glass" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="ingredients"
        options={{
          title: 'Ingredients',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="database" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="shoppinglist"
        options={{
          title: 'Shopping List',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="shopping-cart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default DashBoardLayout;


import {Tabs} from 'expo-router'

const DashBoardLayout = () => {
    return (
     <Tabs screenOptions={{headerShown: false }}>
        <Tabs.Screen name= "index" options={{title: 'Home'}}/>
    <Tabs.Screen name= "ingredients" options={{title: 'Ingredients'}}/>
    <Tabs.Screen name= "mealplan" options={{title: 'Meal Plan'}}/>
    <Tabs.Screen name= "recipes" options={{title: 'Recipes'}}/>
    <Tabs.Screen name= "shoppinglist" options={{title: 'Shopping List'}}/>


    </Tabs> 
    )
}

export default DashBoardLayout;
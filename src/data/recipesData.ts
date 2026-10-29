import { Recipe } from "../../data/recipe/recipe";

export const recipes: Recipe[] = [
  new Recipe("Chicken & Rice Bowl", { category: "Dinner"}),
  new Recipe("Pasta al Pomodoro", { category: "Lunch" }),
  new Recipe("Greek Yogurt Bowl", { category: "Breakfast"}),
  new Recipe("Tofu Stir Fry", { category: "Dinner"}),
  new Recipe("Banana Bread", { category: "Snack" }),
  new Recipe("Chicken Wrap", { category: "Lunch"}),
];

//TODO 
//add ingredients for each recipe
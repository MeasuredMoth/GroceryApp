import { Ingredient } from "../../data/recipe/ingredient";
import { Recipe } from "../../data/recipe/recipe";
import { ingredients } from "@/data/ingredientsData";

export const recipes: Recipe[] = [
  new Recipe("Chicken & Rice Bowl", {
    category: "Dinner",
    image: require("../../assets/images/recipes/rice-chicken.jpg"),
  }),
  new Recipe("Pasta al Pomodoro", {
    category: "Lunch",
    image: require("../../assets/images/recipes/pasta-pomodoro.jpeg"),
  }),
  new Recipe("Greek Yogurt Bowl", {
    category: "Breakfast",
    image: require("../../assets/images/recipes/greek-yogurt.jpeg"),
  }),
  new Recipe("Tofu Stir Fry", {
    category: "Dinner",
    image: require("../../assets/images/recipes/tofu-stir-fry.jpg"),
  }),
  new Recipe("Banana Bread", {
    category: "Snack",
    image: require("../../assets/images/recipes/banana-bread.jpeg"),
  }),
  new Recipe("Chicken Wrap", {
    category: "Lunch",
    image: require("../../assets/images/recipes/chicken-wrap.jpg"),
  }),
];

//TODO
//add ingredients for each recipe

<<<<<<< HEAD
import { Recipe } from "./recipe";
=======
import { Dictionary } from "data/types";
import { Recipe } from "data/recipe/recipe";
>>>>>>> 623ab66 (Changed to root based imports)

export class MealPlan {
    private name: string = "Unnamed";
    private meals: Recipe[] = []
    
    public setName(name: string){
        if (name == "")
            return;

        this.name = name;
    }

    public getName(){
        return this.name;
    }

    public addRecipe(recipe: Recipe) {
        this.meals.push(recipe);
    }

    public removeRecipe(index: number) {
        if (index < 0 || index > this.meals.length)
            return;

        this.meals.splice(index, 1)
    }

    public getJSON(){
        let data: Dictionary<any> = {};
        data[this.name] = this.getData();
    }

    public getData(){
        let data: Dictionary<any> = {};

        for (let i = 0; i < this.meals.length; i++){
            let recipe = this.meals[i];

            data[recipe.getName()] = recipe.getData();
        }
    }
}
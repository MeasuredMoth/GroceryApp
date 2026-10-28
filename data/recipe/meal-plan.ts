import { Dictionary } from "data/types";
import { Recipe } from "data/recipe/recipe";

export class MealPlan {
    private name: string = "Unnamed";
    private recipes: Recipe[] = []
    
    constructor(name: string = "", recipes: Recipe[] = []){
        this.setName(name);
        this.addRecipes(recipes);
    }

    public appendRecipe(recipe: Recipe) {
        this.recipes.push(recipe);
    }

    public addRecipes(recipes: Recipe[]) {
        recipes.forEach((value: Recipe) => {
            this.appendRecipe(value);
        })
    }

    public removeRecipe(index: number) {
        if (index < 0 || index > this.recipes.length)
            return;

        this.recipes.splice(index, 1)
    }

    public getRecipes() {
        return this.recipes;
    }

    public getJSON(){
        let data: Dictionary<any> = {};

        data[this.name] = this.getData();

        return JSON.stringify(data);
    }

    public getData(){
        let data: Dictionary<any> = {};

        this.recipes.forEach((value: Recipe) => {
            data[value.getName()] = value.getData();
        })

        return data;
    }

    public setName(name: string){
        if (name == "")
            return;

        this.name = name;
    }

    public getName(){ return this.name; }
}
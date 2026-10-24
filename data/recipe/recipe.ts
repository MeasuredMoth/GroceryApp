import { Ingredient } from "./ingredient";
import { Dictionary } from "data/types";

 export class Recipe {
    private name: string = "Unnamed";
    private ingredients: Ingredient[] = [];

    Recipe(name: string, ingredients: Ingredient[] = []){
        this.setName(name);
        this.addIngredients(ingredients);
    }

    public getJSON(): string {
        let data: Dictionary<any> = {};
        data[this.name] = this.getData();

        return JSON.stringify(data);
    }

    public getData(): Dictionary<any> {
        return this.getIngredientsData()
    }

    private getIngredientsData(): Dictionary<any> {
        let data: Dictionary<any> = {};

        for (let i = 0; i < this.ingredients.length; i++){
            let ingredient: Ingredient = this.ingredients[i];

            data[ingredient.getName()] = ingredient.getData();
        }

        return data
    }

    public addIngredient(ingredient: Ingredient){
        this.ingredients.push(ingredient)
    }

    public addIngredients(ingredients: Ingredient[]){
        ingredients.forEach((value: Ingredient) => {
            this.ingredients.push(value);
        })
    }

    public getIngredients(): Ingredient[]{
        return this.ingredients;
    }

    public setName(name: string){
        if (name == "") return;

        this.name = name;
    }

    public getName(): string { return this.name }
}
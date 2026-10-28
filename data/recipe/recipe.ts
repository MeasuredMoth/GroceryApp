import { Dictionary } from "../types";
import { Ingredient } from "./ingredient";

 export class Recipe {
    private name: string = "Unnamed";
    private ingredients: Ingredient[] = [];

 public getJSON(): string {
    return JSON.stringify({ [this.name]: this.getData() });
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

    public getIngredients(): Ingredient[]{
        return this.ingredients;
    }

    public setName(name: string){
        if (name == "") return;

        this.name = name;
    }

    public getName(): string { return this.name }

    // Recipe
public getData(): Dictionary<any> {
    const data: Dictionary<any> = {};
    this.ingredients.forEach(i => data[i.getName()] = i.getData());
    return data;
}


}
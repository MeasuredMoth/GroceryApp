import { Dictionary } from "../types";
import { Ingredient, ingredientType } from "./ingredient";

 export class Recipe {
    private name: string = "Unnamed";
    private ingredients: Ingredient[] = [];

    constructor(name: string = "", ingredients: Ingredient[] = []){
        this.setName(name);
        this.addIngredients(ingredients);
    }

    public getJSON(): string {
        let data: Dictionary<any> = {};

        data[this.name] = this.getData();

        return JSON.stringify(data);
    }

    public getData(): Dictionary<any> {
        return this.getIngredientsData();
    }

    private getIngredientsData(): Dictionary<any> {
        let data: Dictionary<any> = {};

        this.ingredients.forEach((value: Ingredient) => {
            data[value.getName()] = value.getData();
        })

        return data;
    }

    public appendIngredient(ingredient: Ingredient){
        this.ingredients.push(ingredient);
    }

    public addIngredients(ingredients: Ingredient[]){
        ingredients.forEach((value: Ingredient) => {
            this.appendIngredient(value);
        })
    }

    public getIngredients(): Ingredient[]{
        return this.ingredients;
    }

    public getIngredientTypes(): ingredientType[]{
        let data: ingredientType[] = []

        this.getIngredients().forEach((value: Ingredient) => {
            data.push(value.getType());
        });

        return data;
    }

    public setName(name: string){
        if (name == "") return;

        this.name = name;
    }

    public getName(): string { return this.name };
}
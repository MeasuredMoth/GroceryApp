import { Ingredient } from "./ingredient";
import { Dictionary } from "data/types";

 export class Recipe {
<<<<<<< HEAD
    private name: string = "Unnamed";
    private ingredients: Ingredient[] = [];

    Recipe(name: string, ingredients: Ingredient[] = []){
        this.setName(name);
        this.addIngredients(ingredients);
    }

    public getJSON(): string {
        let data: Dictionary<any> = {};
<<<<<<< HEAD
        data[this.name] = this.getIngredientsData();
=======
    name: string = "Unnamed";
    ingredients: Ingredient[] = [];

    public getJSON(): string {
        let data: Dictionary<string> = {
            "name": this.getIngiredentsJson()
        }
>>>>>>> e2ae8ad (Added setters + first recipe unit tests)
=======
        data[this.name] = this.getData();
>>>>>>> 2685ca7 (WIP constructors and ingredientTypes)

        return JSON.stringify(data);
    }

<<<<<<< HEAD
<<<<<<< HEAD
=======
    public getData(): Dictionary<any> {
        return this.getIngredientsData()
    }

>>>>>>> 2685ca7 (WIP constructors and ingredientTypes)
    private getIngredientsData(): Dictionary<any> {
        let data: Dictionary<any> = {};

        for (let i = 0; i < this.ingredients.length; i++){
            let ingredient: Ingredient = this.ingredients[i];
=======
    private getIngiredentsJson(): string {
        let data: Dictionary<string> = {};

        for (let i = 0; i++; i < this.ingredients.length){
            let ingredent: Ingredient = this.ingredients[i];
>>>>>>> e2ae8ad (Added setters + first recipe unit tests)

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
<<<<<<< HEAD

        this.name = name;
    }

    public getName(): string { return this.name }
=======
        
        this.name = name;
    }
>>>>>>> e2ae8ad (Added setters + first recipe unit tests)
}
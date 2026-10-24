import { Ingredient, ingredientType } from "data/recipe/ingredient";
import { Dictionary } from "data/types";

 export class Recipe {
<<<<<<< HEAD
    private name: string = "Unnamed";
    private ingredients: Ingredient[] = [];

    constructor(name: string = "", ingredients: Ingredient[] = []){
        this.setName(name);
        this.addIngredients(ingredients);
    }

    public getJSON(): string {
        let data: Dictionary<any> = {};
<<<<<<< HEAD
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
=======

>>>>>>> ba0f552 (Added ingredient types)
        data[this.name] = this.getData();
>>>>>>> 2685ca7 (WIP constructors and ingredientTypes)

        return JSON.stringify(data);
    }

<<<<<<< HEAD
<<<<<<< HEAD
=======
    public getData(): Dictionary<any> {
        return this.getIngredientsData();
    }

>>>>>>> 2685ca7 (WIP constructors and ingredientTypes)
    private getIngredientsData(): Dictionary<any> {
        let data: Dictionary<any> = {};

<<<<<<< HEAD
        for (let i = 0; i < this.ingredients.length; i++){
            let ingredient: Ingredient = this.ingredients[i];
=======
    private getIngiredentsJson(): string {
        let data: Dictionary<string> = {};

        for (let i = 0; i++; i < this.ingredients.length){
            let ingredent: Ingredient = this.ingredients[i];
>>>>>>> e2ae8ad (Added setters + first recipe unit tests)
=======
        this.ingredients.forEach((value: Ingredient) => {
            data[value.getName()] = value.getData();
        })
>>>>>>> 623ab66 (Changed to root based imports)

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
<<<<<<< HEAD

        this.name = name;
    }

<<<<<<< HEAD
    public getName(): string { return this.name }
=======
        
        this.name = name;
    }
>>>>>>> e2ae8ad (Added setters + first recipe unit tests)
=======
    public getName(): string { return this.name };
>>>>>>> 623ab66 (Changed to root based imports)
}
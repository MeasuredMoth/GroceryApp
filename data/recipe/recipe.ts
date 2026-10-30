import { Dictionary } from "../types";
import { Ingredient, ingredientType } from "./ingredient";
import { ImageSourcePropType } from "react-native";


export interface RecipeOptions {
    category?: RecipeCategory;
    // kcal?: number;
    // servings?: number;
    // servingUnit?: string;
    image?: ImageSourcePropType;
}

let nextId = 1; //we need this id as a key for the flatlist inside recipesTab

export type RecipeCategory = "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Dessert";

 export class Recipe {
    private id = `recipe-${nextId++}`; //each id is incremented as a new recipe object is instantiated
    private name: string = "Unnamed";
    private ingredients: Ingredient[] = [];
    private category: RecipeCategory = "Dinner"; //added category for each type of meal
    private image?: ImageSourcePropType; //For images of the recipes

        constructor(name = "", options: RecipeOptions = {}) {
        this.setName(name);
        this.category = options.category ?? this.category;
        // this.kcal = options.kcal ?? this.kcal;
        // this.servings = options.servings ?? this.servings;
        // this.servingUnit = options.servingUnit ?? this.servingUnit;
        this.image = options.image;
    }


 public getJSON(): string {
    return JSON.stringify({ [this.name]: this.getData() });
}

    public getCategory() { return this.category; } 

    public getImage(): ImageSourcePropType | undefined { return this.image; }

    public getId(): string { return this.id; }

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

    public getName(): string { return this.name }

    // Recipe
public getData(): Dictionary<any> {
    const data: Dictionary<any> = {};
    this.ingredients.forEach(i => data[i.getName()] = i.getData());
    return data;
}


}
import { Dictionary } from "../types";
import { Recipe } from "./recipe";

export class MealPlan {
    private name = "Unnamed";
    private recipes: Recipe[] = [];

    constructor(name = "", recipes: Recipe[] = []) {
        this.setName(name);
        this.addRecipes(recipes);
    }

    public addRecipe(recipe: Recipe): void {
        this.recipes.push(recipe);
    }

    public addRecipes(recipes: Recipe[]): void {
        recipes.forEach(r => this.addRecipe(r));
    }

    public removeRecipe(index: number): void {
        if (index < 0 || index >= this.recipes.length) return;
        this.recipes.splice(index, 1);
    }

    public getRecipes(): readonly Recipe[] {
        return this.recipes;
    }

    public getData(): Dictionary<any> {
        const data: Dictionary<any> = {};
        this.recipes.forEach(r => data[r.getName()] = r.getData());
        return data;
    }

    public getJSON(): string {
        return JSON.stringify({ [this.name]: this.getData() });
    }

    public setName(name: string): void {
        if (name.trim() === "") return;
        this.name = name;
    }

    public getName(): string { return this.name; }
}
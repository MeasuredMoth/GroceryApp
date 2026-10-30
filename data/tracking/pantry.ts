import { Ingredient } from "data/recipe/ingredient";

export class Pantry {
    private ingredients: Ingredient[] = [];

    public addIngredient(ingredient: Ingredient) { 
        if (this.getIngredientByName(ingredient.getName()))
            return;

        this.ingredients.push(ingredient); 
    }

    public addIngredients(ingredients: Ingredient[]) {
        ingredients.forEach((value: Ingredient) => {
            this.addIngredient(value);
        })
    }

    public getIngredients(): Ingredient[] { return this.ingredients; }

    public getIngredientByIndex(index: number ) { return this.ingredients.at(index); } 
    
    public removeIngredient(index: number) {
        if (index < 0 || index >= this.ingredients.length)
            return;

        this.ingredients.splice(index, 1);
    }

    public getIngredientByName(name: string) {
        let result: Ingredient[] = this.ingredients.filter((ingredient) => ingredient.getName() == name);

        if (result.length == 0)
            return ""

        return result[0]
    }
}
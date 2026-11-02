import { Ingredient } from "data/recipe/ingredient";
import { Dictionary } from "data/types";

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

    public getIngredientLength(): number { return this.ingredients.length; }

    public getIngredientByIndex(index: number ) { return this.ingredients.at(index); } 
    
    public removeIngredient(index: number) {
        if (index < 0 || index >= this.ingredients.length)
            return;

        this.ingredients.splice(index, 1);
    }

    public getIngredientByName(name: string): Ingredient | null {
        let result: Ingredient[] = this.ingredients.filter((ingredient) => ingredient.getName() == name);

        if (result.length == 0)
            return null

        return result[0]
    }

    public getJSON() {
        return JSON.stringify(this.getData());
    }

    public getData() {
        return this.getIngredientsData();
    }

    private getIngredientsData(): Dictionary<any> {
        let data: Dictionary<any> = {};

        this.ingredients.forEach((value: Ingredient) => {
            data[value.getName()] = value.getData();
        })

        return data;
    }

    public loadFromJSON(data: string){
        let dataObject: Dictionary<any> = JSON.parse(data)

        for (let name in dataObject){
            let currData = dataObject[name];
            
            let ingredient = new Ingredient(
                name,
                currData["quantity"],
                currData["type"],
            )

            this.addIngredient(ingredient);
        }
    }
}
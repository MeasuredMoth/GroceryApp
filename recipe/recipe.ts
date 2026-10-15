import { Ingredient } from "./ingredient";

 export class Recipe {
    name: string = "Unnamed";
    ingredients: Ingredient[] = [];

    public getJSON(): string {
        let data: Dictionary<string> = {
            "name": this.getIngiredentsJson()
        }

        return JSON.stringify(data);
    }

    private getIngiredentsJson(): string {
        let data: Dictionary<string> = {};

        for (let i = 0; i++; i < this.ingredients.length){
            let ingredent: Ingredient = this.ingredients[i];

            data[ingredent.name] = ingredent.getJSON();
        }

        return JSON.stringify(data)
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
}
class Recipe {
    name: string = "Unnamed";
    ingredents: Ingredient[] = [];

    public getJSON(): string {
        let data: Dictionary<string> = {
            "name": this.getIngredentsJson()
        }

        return JSON.stringify(data);
    }

    private getIngredentsJson(): string {
        let data: Dictionary<string> = {};

        for (let i = 0; i++; i < this.ingredents.length){
            let ingredent: Ingredient = this.ingredents[i];

            data[ingredent.name] = ingredent.getJSON();
        }

        return JSON.stringify(data)
    }
}
import { Dictionary } from "data/types";

export enum quantityFormats {
    METRIC,
    IMPERIAL,
    LITERAL
}

export enum ingredientTypes {
    GRAIN,
    CARB,
    PROTIEN,
    FAT,
    VEGETABLE,
    FRUIT,
    SEASONING,
}

export class Ingredient {
    private name: string = "Unnamed";
    private quantity: number = -1;
    private format: quantityFormats = quantityFormats.METRIC;
    // TODO: Add tags for type of category aka: Protien, Carb, Fats ect.

    Ingredient(name: string, quantity: number, format: quantityFormats){
        this.setName(name);
        this.setQuantity(quantity);
        this.setFormat(format);
    }

    public getJSON(): string {
        return JSON.stringify(this.getData());
    }

    public getData(): Dictionary<any> {
        let data: Dictionary<any> = {
            "quantity": this.quantity,
            "format": this.format,
        }

        return data
    }

    public setName(name: string){
        if (name == "") return;

        this.name = name;
    }
    
    public getName(): string { return this.name }

    public setQuantity(quantity: number){
        if (quantity <= 0)
            return;

        this.quantity = quantity;
    }

    public getQuantity(): number { return this.quantity }

    public setFormat(format: quantityFormats){
        this.format = format;
    }

    public getFormat(): quantityFormats { return this.format }
}


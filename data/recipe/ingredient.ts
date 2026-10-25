import { Dictionary } from "../types";

export enum quantityFormats {
    METRIC,
    IMPERIAL,
    LITERAL
}

export enum ingredientType {
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
    private ingTyp: ingredientType = ingredientType.GRAIN;

    constructor(
        name: string = "", 
        quantity: number = -1, 
        format: quantityFormats = quantityFormats.LITERAL, 
        ingType: ingredientType = ingredientType.GRAIN
    ) {
        this.setName(name);
        this.setQuantity(quantity);
        this.setFormat(format);
        this.setType(ingType);
    }

    public getJSON(): string {
        return JSON.stringify(this.getData());
    }

    public getData(): Dictionary<any> {
        let data: Dictionary<any> = {
            "quantity": this.quantity,
            "format": this.format,
            "type": this.ingTyp,
        };

        return data;
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

    public setFormat(format: quantityFormats) { this.format = format; }
        
    public getFormat(): quantityFormats { return this.format; }

    public setType(ingTyp: ingredientType) { this.ingTyp = ingTyp; }

    public getType(): ingredientType { return this.ingTyp; }
    
}


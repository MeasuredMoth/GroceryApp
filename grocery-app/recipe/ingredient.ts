import { Dictionary } from "../types";

export enum quantityFormats {
    METRIC,
    IMPERIAL,
    LITERAL
}

export class Ingredient {
    private name: string = "Unnamed";
    private quantity: number = -1;
    private format: quantityFormats = quantityFormats.METRIC;

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
        this.quantity = quantity;
    }

    public getQuantity(): number { return this.quantity }

    public setFormat(format: quantityFormats){
        this.format = format;
    }

    public getFormat(): quantityFormats { return this.format }
}


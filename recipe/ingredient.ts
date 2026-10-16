export enum quantityFormats {
    METRIC,
    IMPERIAL,
    LITERAL
}

export class Ingredient {
    name: string = "Unnamed";
    quantity: number = -1;
    format: quantityFormats = quantityFormats.METRIC;

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

    public setQuantity(quantity: number){
        this.quantity = quantity;
    }

    public setFormat(format: quantityFormats){
        this.format = format;
    }
}


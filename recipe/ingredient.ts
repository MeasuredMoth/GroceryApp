enum quantityFormats {
    METRIC,
    IMPERIAL,
    LITERAL
}

export class Ingredient {
    name: string = "Unnamed";
    quantity: number = -1;
    format: quantityFormats = quantityFormats.METRIC;

    public getJSON(): string {
        let data = {
            "quantity": this.quantity,
            "format": this.format,
        }

        return JSON.stringify(data);
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


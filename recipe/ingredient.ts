enum quantityFormats {
    METRIC,
    IMPERIAL,
    LITERAL
}

class Ingredient {
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
}


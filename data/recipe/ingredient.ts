import { Dictionary } from "data/types";

export const UNITS = [
    // metric
    "g", "kg", "ml", "l",
    // imperial
    "oz", "lb", "fl oz", "cup",
    // kitchen / literal
    "tsp", "tbsp", "pinch", "piece",
] as const;

export type Unit = typeof UNITS[number];

export type UnitSystem = "metric" | "imperial" | "literal";

const UNIT_SYSTEM: Record<Unit, UnitSystem> = {
    g: "metric", kg: "metric", ml: "metric", l: "metric",
    oz: "imperial", lb: "imperial", "fl oz": "imperial", cup: "imperial",
    tsp: "literal", tbsp: "literal", pinch: "literal", piece: "literal",
};

export interface Quantity {
    amount: number;
    unit: Unit;
}

export function isUnit(value: string): value is Unit {
    return (UNITS as readonly string[]).includes(value);
}

/** Parses strings like "100 g", "1.5tbsp", "2 fl oz". Returns null if invalid. */
export function parseQuantity(input: string): Quantity | null {
    const match = input.trim().match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z ]+)$/);
    if (!match) return null;

    const amount = parseFloat(match[1]);
    const unit = match[2].trim().toLowerCase();

    if (!isUnit(unit) || !Number.isFinite(amount) || amount <= 0) return null;
    return { amount, unit };
}

export function formatQuantity(q: Quantity): string {
    return `${q.amount} ${q.unit}`;
}

export class Ingredient {
    private name: string = "Unnamed";
<<<<<<< HEAD
    private quantity: Quantity = { amount: 1, unit: "g" };
=======
    private quantity: number = -1;
    private format: quantityFormats = quantityFormats.METRIC;
    // TODO: Add tags for type of category aka: Protien, Carb, Fats ect.

    constructor(name: string = "", quantity: number = -1, format: quantityFormats = quantityFormats.LITERAL){
        this.setName(name);
        this.setQuantity(quantity);
        this.setFormat(format);
    }
>>>>>>> f95010d (Actually added constructors to objects)

    public getJSON(): string {
        return JSON.stringify(this.getData());
    }

    public getData(): Dictionary<any> {
<<<<<<< HEAD
        return {
            name: this.name,
            quantity: this.quantity,
            system: this.getSystem(),
        };
=======
        let data: Dictionary<any> = {
            "quantity": this.quantity,
            "format": this.format,
        };

        return data;
>>>>>>> 623ab66 (Changed to root based imports)
    }

    public setName(name: string) {
        if (name.trim() === "") return;
        this.name = name;
    }
    public getName(): string { return this.name }

    /** Accepts a validated Quantity or a string like "100 g". Throws on invalid input. */
    public setQuantity(quantity: Quantity | string) {
        const q = typeof quantity === "string" ? parseQuantity(quantity) : quantity;

        if (!q || !isUnit(q.unit) || !Number.isFinite(q.amount) || q.amount <= 0) {
            throw new Error(`Invalid quantity: ${JSON.stringify(quantity)}`);
        }
        this.quantity = { amount: q.amount, unit: q.unit };
    }

    public getQuantity(): Quantity { return { ...this.quantity } }

    public getSystem(): UnitSystem { return UNIT_SYSTEM[this.quantity.unit] }

    public toString(): string {
        return `${formatQuantity(this.quantity)} ${this.name}`;
    }

<<<<<<< HEAD
    public static createIngredient(name: string, quantity: Quantity | string): Ingredient {
        const ingredient = new Ingredient();
        ingredient.setName(name);
        ingredient.setQuantity(quantity);
        return ingredient;
    }
=======
    public getFormat(): quantityFormats { return this.format };
}
>>>>>>> 623ab66 (Changed to root based imports)

    public getQuantityString(): string {
    return formatQuantity(this.quantity);
    }
}
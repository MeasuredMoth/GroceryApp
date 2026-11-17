export interface Dictionary<T> {
    [key: string]: T;
}

export enum MEASUREMENT_SYSTEMS {
    METRIC = "Metric",
    IMPERIAL = "Imperial",
    LITERAL = "Literal"
}

export enum UNIT_TYPE {
    WEIGHT = "Weight",
    LIQUID = "Liquid",
    LITERAL = "Literal"
}

export enum METRIC_UNITS {
    // Mass
    MILIGRAM = "mg",
    GRAM = "g",
    KILOGRAM = "kg",
    // Volume
    MILILITER = "ml",
    LITER = "l",
    KILOLITER = "kl"
}

export enum LITERAL_UNITS {
    PIECE = "piece",
    PINCH = "pinch"
}

export type UNITS = METRIC_UNITS | IMPERIAL_UNITS | LITERAL_UNITS;

export enum INGREDIENT_CATEGORIES {
  GRAIN = "Grain",
  CARB = "Carb",
  PROTIEN = "Protien",
  FAT = "Fat",
  VEGETABLE = "Vegetable",
  FRUIT = "Fruit",
  SEASONING = "Seasoning"
}
export enum IMPERIAL_UNITS {
    CUP = "cup",
    TABLESPOON = "tbsp",
    TEASPOON = "tsp",
    OUNCE = "oz"
}


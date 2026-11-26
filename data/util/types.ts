export interface Dictionary<T> {
  [key: string]: T;
}

export enum MEASUREMENT_SYSTEM {
  METRIC = "Metric",
  IMPERIAL = "Imperial",
  LITERAL = "Literal",
}

export enum UNIT_TYPE {
  WEIGHT = "Weight",
  LIQUID = "Liquid",
  LITERAL = "Literal",
}

export enum METRIC_UNIT {
  // Mass
  MILLIGRAM = "mg",
  GRAM = "g",
  KILOGRAM = "kg",
  // Volume
  MILILITER = "ml",
  LITER = "l",
  KILOLITER = "kl",
}

export enum IMPERIAL_UNITS {
  CUP = "cup",
  TABLESPOON = "tbsp",
  TEASPOON = "tsp",
  OUNCE = "oz",
  POUND = "lb",
}

export enum LITERAL_UNIT {
  PIECE = "piece",
  PINCH = "pinch",
}

export type UNITS = METRIC_UNIT | IMPERIAL_UNITS | LITERAL_UNIT;

export enum INGREDIENT_CATEGORY {
  GRAIN = "Grain",
  CARB = "Carb",
  PROTEIN = "Protein",
  FAT = "Fat",
  VEGETABLE = "Vegetable",
  FRUIT = "Fruit",
  SEASONING = "Seasoning",
  DAIRY = "Dairy",
  OTHER = "Other",
}

/** Store section used to group the shopping list. Separate from INGREDIENT_CATEGORY, which is nutritional. */
export enum AISLE {
  PRODUCE = "Produce",
  MEAT_FISH = "Meat & Fish",
  DAIRY = "Dairy",
  DRY_GOODS = "Dry goods",
  CANNED = "Canned",
  SPICES = "Spices",
  FROZEN = "Frozen",
  OTHER = "Other",
}

export enum RECIPE_CATEGORY {
  BREAKFAST = "Breakfast",
  LUNCH = "Lunch",
  DINNER = "Dinner",
  SNACK = "Snack",
  DESSERT = "Dessert",
}

export enum MEAL_TYPE {
  BREAKFAST = "Breakfast",
  LUNCH = "Lunch",
  DINNER = "Dinner",
  SNACK = "Snack",
}

export enum WEEKDAYS {
  SUNDAY = "Sunday",
  MONDAY = "Monday",
  TUESDAY = "Tuesday",
  WEDNESDAY = "Wednesday",
  THURSDAY = "Thursday",
  FRIDAY = "Friday",
  SATURDAY = "Saturday",
}

export enum MEASUREMENT_TYPE {
  MASS = "mass",
  VOLUME = "volume",
  COUNT = "count",
}

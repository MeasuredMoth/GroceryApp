import { Dictionary } from "../types";
import { Recipe } from "./recipe";

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";
export const MEAL_TYPES: readonly MealType[] = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
];

export type Nutrition = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};
export type DayPlan = Partial<Record<MealType, Recipe[]>>;

// TEMP: Recipe has no nutrition fields yet. Replace with real getters later.
const nutritionOf = (_r: Recipe): Nutrition => ({
  kcal: 500,
  protein: 25,
  carbs: 60,
  fat: 15,
});

export class MealPlan {
  private name = "Unnamed";
  private days = new Map<string, DayPlan>();

  constructor(name = "", recipes: Recipe[] = []) {
    this.setName(name);
    this.addRecipes(recipes);
  }

  public static keyOf(d: Date): string {
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  public addRecipe(date: Date, meal: MealType, recipe: Recipe): void {
    const key = MealPlan.keyOf(date);
    const day = this.days.get(key) ?? {};
    day[meal] = [...(day[meal] ?? []), recipe];
    this.days.set(key, day);
  }

  public removeRecipe(date: Date, meal: MealType, recipe: Recipe): void {
    const day = this.days.get(MealPlan.keyOf(date));
    const list = day?.[meal];
    if (!day || !list) return;
    const i = list.indexOf(recipe);
    if (i === -1) return;
    day[meal] = list.filter((_, idx) => idx !== i); // removes only one occurrence
  }

  public getDay(date: Date): Readonly<DayPlan> {
    return this.days.get(MealPlan.keyOf(date)) ?? {};
  }

  public getMeal(date: Date, meal: MealType): readonly Recipe[] {
    return this.getDay(date)[meal] ?? [];
  }

  public getMealTotals(date: Date, meal: MealType): Nutrition {
    return MealPlan.sum(this.getMeal(date, meal));
  }

  public getDayTotals(date: Date): Nutrition {
    const day = this.getDay(date);
    return MealPlan.sum(MEAL_TYPES.flatMap((m) => day[m] ?? []));
  }

  private static sum(list: readonly Recipe[]): Nutrition {
    return list.reduce(
      (t, r) => {
        const n = nutritionOf(r);
        return {
          kcal: t.kcal + n.kcal,
          protein: t.protein + n.protein,
          carbs: t.carbs + n.carbs,
          fat: t.fat + n.fat,
        };
      },
      { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }

  public getData(): Dictionary<any> {
    const data: Dictionary<any> = {};
    this.recipes.forEach((r) => (data[r.getName()] = r.getData()));
    return data;
  }

  public getJSON(): string {
    return JSON.stringify({ [this.name]: this.getData() });
  }

  public setName(name: string): void {
    if (name.trim() === "") return;
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }
}

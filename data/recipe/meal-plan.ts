import { allowsUnit, Ingredient } from "./ingredient";
import { Unit } from "../unit";
import { DateKey, makeId, pad2, toDateKey } from "../util";

/* ---------- Types ---------- */

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";
export const MEAL_TYPES: readonly MealType[] = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
];

// Indexed by Date.getDay(), so Sunday is first.
export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const weekdayOf = (d: Date): Weekday => WEEKDAYS[d.getDay()];

/** One line of the plan: "80 g oats". */
export interface PlanItem {
  ingredientId: string;
  amount: number;
  unit: Unit;
}

export interface Meal {
  id: string; // needed so "just this day" edits can say which meal they mean
  type: MealType; // two snacks are allowed, so type is not unique
  time: string; // "HH:mm", 24h
  items: PlanItem[];
  note?: string;
}

/**
 * Changes for a single date, stored per meal (not as a whole replacement day),
 * so later edits to the template still reach the meals nobody touched.
 */
export interface DayOverride {
  /** Template meal id -> replacement meal, or null if removed on this date. */
  changed: Record<string, Meal | null>;
  /** Meals that exist only on this date. */
  added: Meal[];
}

export interface Plan {
  template: Record<Weekday, Meal[]>;
  overrides: Record<DateKey, DayOverride>;
}

/** "day" = just this date, "weekday" = every Monday (or whichever weekday the date is). */
export type EditScope = "day" | "weekday";

/* ---------- Creating ---------- */

export function createEmptyPlan(): Plan {
  const template = {} as Record<Weekday, Meal[]>;
  WEEKDAYS.forEach((d) => (template[d] = []));
  return { template, overrides: {} };
}

export function createMeal(
  type: MealType,
  time: string,
  items: PlanItem[] = [],
  note?: string,
): Meal {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new Error(`Invalid time "${time}", expected HH:mm`);
  }
  return { id: makeId("meal"), type, time, items, note };
}

/** Returns an error message, or null if the item is fine. */
export function validatePlanItem(
  item: PlanItem,
  getIngredient: (id: string) => Ingredient | undefined,
): string | null {
  const ing = getIngredient(item.ingredientId);
  if (!ing) return `Unknown ingredient: ${item.ingredientId}`;
  if (!Number.isFinite(item.amount) || item.amount <= 0) {
    return "Amount must be greater than 0";
  }
  if (!allowsUnit(ing, item.unit))
    return `${ing.name} can't be measured in ${item.unit}`;
  return null;
}

/* ---------- Reading ---------- */

const sortByTime = (meals: Meal[]): Meal[] =>
  [...meals].sort((a, b) => a.time.localeCompare(b.time));

/** The meals the user actually sees for a date: template + that date's overrides. */
export function mealsFor(plan: Plan, date: Date): Meal[] {
  const base = plan.template[weekdayOf(date)];
  const ov = plan.overrides[toDateKey(date)];
  if (!ov) return sortByTime(base);

  const kept: Meal[] = [];
  for (const m of base) {
    const changed = ov.changed[m.id];
    if (changed === null) continue; // removed on this date
    kept.push(changed ?? m);
  }
  return sortByTime([...kept, ...ov.added]);
}

export function hasOverride(plan: Plan, date: Date): boolean {
  return toDateKey(date) in plan.overrides;
}

/**
 * First upcoming meal: later today, otherwise the next days.
 * Pass isDone (from the eaten/skipped log) to skip meals already handled.
 */
export function nextMeal(
  plan: Plan,
  now: Date,
  isDone: (date: Date, meal: Meal) => boolean = () => false,
): { date: Date; meal: Meal } | null {
  const nowTime = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  for (let offset = 0; offset < 8; offset++) {
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + offset,
    );
    const meal = mealsFor(plan, date).find(
      (m) => !isDone(date, m) && (offset > 0 || m.time >= nowTime),
    );
    if (meal) return { date, meal };
  }
  return null;
}

/* ---------- Editing (all return a new Plan, nothing is mutated) ---------- */

const emptyOverride = (): DayOverride => ({ changed: {}, added: [] });

function setOverride(plan: Plan, key: DateKey, ov: DayOverride): Plan {
  const isEmpty = Object.keys(ov.changed).length === 0 && ov.added.length === 0;
  const overrides = { ...plan.overrides };
  if (isEmpty) delete overrides[key];
  else overrides[key] = ov;
  return { ...plan, overrides };
}

const setTemplate = (plan: Plan, day: Weekday, meals: Meal[]): Plan => ({
  ...plan,
  template: { ...plan.template, [day]: meals },
});

export function addMeal(
  plan: Plan,
  date: Date,
  meal: Meal,
  scope: EditScope,
): Plan {
  if (scope === "weekday") {
    const day = weekdayOf(date);
    return setTemplate(plan, day, [...plan.template[day], meal]);
  }
  const key = toDateKey(date);
  const ov = plan.overrides[key] ?? emptyOverride();
  return setOverride(plan, key, { ...ov, added: [...ov.added, meal] });
}

/** `meal` is the edited version and must keep the id of the meal being changed. */
export function editMeal(
  plan: Plan,
  date: Date,
  meal: Meal,
  scope: EditScope,
): Plan {
  const key = toDateKey(date);
  const day = weekdayOf(date);
  const ov = plan.overrides[key] ?? emptyOverride();
  const isAddedHere = ov.added.some((m) => m.id === meal.id);

  if (scope === "day") {
    if (isAddedHere) {
      const added = ov.added.map((m) => (m.id === meal.id ? meal : m));
      return setOverride(plan, key, { ...ov, added });
    }
    return setOverride(plan, key, {
      ...ov,
      changed: { ...ov.changed, [meal.id]: meal },
    });
  }

  // weekday: change the template (or promote a this-day-only meal into it)
  const inTemplate = plan.template[day].some((m) => m.id === meal.id);
  const meals = inTemplate
    ? plan.template[day].map((m) => (m.id === meal.id ? meal : m))
    : [...plan.template[day], meal];

  // This date must not keep a stale override of the meal we just changed everywhere.
  const { [meal.id]: _stale, ...changed } = ov.changed;
  const next = setTemplate(plan, day, meals);
  return setOverride(next, key, {
    changed,
    added: ov.added.filter((m) => m.id !== meal.id),
  });
}

export function removeMeal(
  plan: Plan,
  date: Date,
  mealId: string,
  scope: EditScope,
): Plan {
  const key = toDateKey(date);
  const day = weekdayOf(date);
  const ov = plan.overrides[key] ?? emptyOverride();

  if (scope === "day") {
    if (ov.added.some((m) => m.id === mealId)) {
      return setOverride(plan, key, {
        ...ov,
        added: ov.added.filter((m) => m.id !== mealId),
      });
    }
    return setOverride(plan, key, {
      ...ov,
      changed: { ...ov.changed, [mealId]: null },
    });
  }

  const next = setTemplate(
    plan,
    day,
    plan.template[day].filter((m) => m.id !== mealId),
  );
  const { [mealId]: _gone, ...changed } = ov.changed;
  return setOverride(next, key, {
    changed,
    added: ov.added.filter((m) => m.id !== mealId),
  });
}

/** Drops every change for that date, back to the usual plan for that weekday. */
export function resetDay(plan: Plan, date: Date): Plan {
  return setOverride(plan, toDateKey(date), emptyOverride());
}

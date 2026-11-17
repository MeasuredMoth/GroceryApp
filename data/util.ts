/** Local calendar date as "YYYY-MM-DD". Never use toISOString() for this (UTC can shift the day). */
export type DateKey = string;

export const pad2 = (n: number): string => String(n).padStart(2, "0");

export function toDateKey(d: Date): DateKey {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

let counter = 0;

/** Unique enough for local data, and stable once saved (unlike a module counter that resets on restart). */
export function makeId(prefix: string): string {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}${rand}`;
}

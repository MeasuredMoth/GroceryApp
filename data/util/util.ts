/** Local calendar date as "YYYY-MM-DD". Never use toISOString() for this (UTC can shift the day). */
export type DateKey = string;

export const pad2 = (n: number): string => String(n).padStart(2, "0");

export function toDateKey(d: Date): DateKey {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
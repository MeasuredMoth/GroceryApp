// Keeps the app's data in memory, saves every change, and tells the screens when it changed.
// No Expo or React imports in this file, so it can be unit tested with Jest.

import { AppData, Defaults, sanitizeAppData, serializeAppData } from "./app-data";

/** Where the JSON text lives. The app uses a file, the tests use a variable. */
export interface StorageBackend {
  /** The saved text, or null if nothing has been saved yet. */
  read(): string | null;
  write(text: string): void;
}

export class DataStore {
  private data: AppData | null = null;
  private listeners = new Set<() => void>();

  constructor(
    private backend: StorageBackend,
    private defaults: Defaults,
  ) {}

  // Loaded on first use, not when the app starts, because the file system
  // isn't available while Expo renders the screens for web.
  private load(): AppData {
    let raw: unknown;
    try {
      const text = this.backend.read();
      if (text !== null) raw = JSON.parse(text);
    } catch (error) {
      console.warn("Could not read saved data, starting from the defaults", error);
    }
    return sanitizeAppData(raw, this.defaults);
  }

  /** The current data. Treat it as read-only and make changes through update(). */
  get = (): AppData => {
    if (this.data === null) this.data = this.load();
    return this.data;
  };

  /**
   * Applies a change, saves it, and refreshes every screen that uses the data.
   * `change` gets the current data and returns the parts that are different,
   * for example: store.update((d) => ({ plan: addMeal(d.plan, date, meal, "day") }))
   */
  update = (change: (data: AppData) => Partial<AppData>): void => {
    const current = this.get();
    this.data = { ...current, ...change(current) };

    try {
      this.backend.write(serializeAppData(this.data));
    } catch (error) {
      // The change still shows on screen, it just won't survive a restart
      console.warn("Could not save data", error);
    }
    this.listeners.forEach((listener) => listener());
  };

  /** Calls `listener` after every change. Returns a function that stops it. */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
}

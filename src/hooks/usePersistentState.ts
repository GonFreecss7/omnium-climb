import { useEffect, useState } from "react";

/** useState mirrored to localStorage under `key` (JSON). Falls back to `initial` on any read error. */
export function usePersistentState<T>(key: string, initial: () => T, validate?: (v: unknown) => v is T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (!validate || validate(parsed)) return parsed as T;
      }
    } catch {
      // ignore malformed/unavailable storage
    }
    return initial();
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore write failures
    }
  }, [key, value]);
  return [value, setValue] as const;
}

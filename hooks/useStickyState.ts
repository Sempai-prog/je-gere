import { useState, useEffect, Dispatch, SetStateAction } from 'react';

/**
 * A custom hook that persists state in localStorage.
 *
 * @param defaultValue The default value if no value is found in localStorage.
 * @param key The key to use in localStorage.
 * @returns A stateful value and a function to update it.
 */
export function useStickyState<T>(defaultValue: T, key: string): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (e) {
      console.warn(`Error parsing localStorage key "${key}":`, e);
      return defaultValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

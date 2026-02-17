import { useState, useEffect, useRef } from 'react';

/**
 * A hook that persists state to localStorage with debouncing to prevent blocking the UI
 * on every update, especially for large objects.
 *
 * @param defaultValue The initial value if nothing is in storage
 * @param key The localStorage key
 * @param delay The debounce delay in ms (default: 300)
 */
export function useStickyState<T>(defaultValue: T, key: string, delay: number = 300): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stickyValue = window.localStorage.getItem(key);
        return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
      }
      return defaultValue;
    } catch (e) {
      console.warn(`Error parsing localStorage key "${key}":`, e);
      return defaultValue;
    }
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (e) {
        console.warn(`Error saving to localStorage key "${key}":`, e);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, value, delay]);

  return [value, setValue];
}

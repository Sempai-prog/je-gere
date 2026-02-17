import { expect, test, mock, afterEach, describe, beforeEach } from "bun:test";
import React from "react";

// Mock localStorage
const setItemMock = mock(() => {});
const getItemMock = mock(() => null);

global.window = {
  localStorage: {
    setItem: setItemMock,
    getItem: getItemMock,
  },
} as any;

// Mock React
// We rely on the fact that useStickyState imports from 'react'.
// However, bun test mocking usually requires mock.module BEFORE import.
// But we are importing useStickyState which imports react.

mock.module("react", () => {
  return {
    useState: (initial: any) => {
      const val = typeof initial === 'function' ? initial() : initial;
      return [val, mock(() => {})];
    },
    useEffect: (effect: any, deps: any) => {
      // Execute effect immediately to start the timeout
      effect();
    },
    useRef: (initial: any) => ({ current: initial }),
    // Add other react exports if needed
    default: {
      useState: (initial: any) => {
        const val = typeof initial === 'function' ? initial() : initial;
        return [val, mock(() => {})];
      },
      useEffect: (effect: any, deps: any) => {
        effect();
      },
      useRef: (initial: any) => ({ current: initial }),
    }
  };
});

// Import hook AFTER mocking react
const { useStickyState } = await import("./useStickyState");

describe("useStickyState", () => {
  beforeEach(() => {
    setItemMock.mockClear();
    getItemMock.mockClear();
  });

  test("should debounce writes to localStorage", async () => {
    const delay = 50;

    // Call the hook
    useStickyState("test-value", "test-key", delay);

    // Should NOT be called immediately due to timeout
    expect(setItemMock).not.toHaveBeenCalled();

    // Wait for timeout
    await new Promise(resolve => setTimeout(resolve, delay + 50));

    // Should be called now
    expect(setItemMock).toHaveBeenCalled();
    expect(setItemMock).toHaveBeenCalledWith("test-key", JSON.stringify("test-value"));
  });
});

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import React from "react";
import { render, screen, act, renderHook } from "@testing-library/react";
import { UserProvider, useUser } from "./UserContext";

// Test component to consume context
const TestComponent = () => {
  const { user, login, logout, updateRole } = useUser();

  return (
    <div>
      <div data-testid="user-name">{user.name}</div>
      <div data-testid="user-role">{user.role}</div>
      <div data-testid="user-auth">{user.isAuthenticated.toString()}</div>
      <button onClick={() => login("Chef", "Test Chef")}>Login Chef</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => updateRole("Owner")}>Update Role Owner</button>
    </div>
  );
};

describe("UserContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it("provides default user state when localStorage is empty", () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByTestId("user-name").textContent).toBe("Guest");
    expect(screen.getByTestId("user-role").textContent).toBe("Manager");
    expect(screen.getByTestId("user-auth").textContent).toBe("false");
  });

  it("loads user state from localStorage on initialization", () => {
    const savedUser = {
      id: "123",
      name: "Saved User",
      role: "Service",
      isAuthenticated: true,
    };
    window.localStorage.setItem("jg_user_context", JSON.stringify(savedUser));

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByTestId("user-name").textContent).toBe("Saved User");
    expect(screen.getByTestId("user-role").textContent).toBe("Service");
    expect(screen.getByTestId("user-auth").textContent).toBe("true");
  });

  it("updates user state and localStorage on login", () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    const loginButton = screen.getByText("Login Chef");
    act(() => {
      loginButton.click();
    });

    expect(screen.getByTestId("user-name").textContent).toBe("Test Chef");
    expect(screen.getByTestId("user-role").textContent).toBe("Chef");
    expect(screen.getByTestId("user-auth").textContent).toBe("true");

    const stored = JSON.parse(window.localStorage.getItem("jg_user_context") || "{}");
    expect(stored.name).toBe("Test Chef");
    expect(stored.role).toBe("Chef");
    expect(stored.isAuthenticated).toBe(true);
  });

  it("clears user state and localStorage on logout", () => {
    const savedUser = {
      id: "123",
      name: "Logged In User",
      role: "Chef",
      isAuthenticated: true,
    };
    window.localStorage.setItem("jg_user_context", JSON.stringify(savedUser));

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    const logoutButton = screen.getByText("Logout");
    act(() => {
      logoutButton.click();
    });

    expect(screen.getByTestId("user-name").textContent).toBe("Guest");
    expect(screen.getByTestId("user-role").textContent).toBe("Manager");
    expect(screen.getByTestId("user-auth").textContent).toBe("false");

    const stored = JSON.parse(window.localStorage.getItem("jg_user_context") || "{}");
    expect(stored.name).toBe("Guest");
    expect(stored.isAuthenticated).toBe(false);
  });

  it("updates only role when updateRole is called", () => {
    const savedUser = {
      id: "123",
      name: "Existing User",
      role: "Service",
      isAuthenticated: true,
    };
    window.localStorage.setItem("jg_user_context", JSON.stringify(savedUser));

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    const updateRoleButton = screen.getByText("Update Role Owner");
    act(() => {
      updateRoleButton.click();
    });

    expect(screen.getByTestId("user-role").textContent).toBe("Owner");
    expect(screen.getByTestId("user-name").textContent).toBe("Existing User");

    const stored = JSON.parse(window.localStorage.getItem("jg_user_context") || "{}");
    expect(stored.role).toBe("Owner");
    expect(stored.name).toBe("Existing User");
  });

  it("throws error when useUser is used outside UserProvider", () => {
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      renderHook(() => useUser());
    }).toThrow("useUser must be used within a UserProvider");

    console.error = originalError;
  });
});

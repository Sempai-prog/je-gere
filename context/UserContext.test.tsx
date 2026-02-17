import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { render, screen, act, cleanup } from '@testing-library/react';
import React from 'react';
import { UserProvider, useUser } from './UserContext';
import { UserRole } from '../types';

const TestComponent = () => {
  const { login, user } = useUser();
  return (
    <div>
      <div data-testid="user-name">{user.name}</div>
      <button onClick={() => login('Chef' as UserRole, 'TestUser')}>Login</button>
    </div>
  );
};

describe('UserContext Security', () => {
  beforeEach(() => {
    // We expect window.localStorage to exist because of happy-dom
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('should NOT persist sensitive user data to localStorage', () => {
    // Initial check
    expect(window.localStorage.getItem('jg_user_context')).toBeNull();

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // Trigger login
    const button = screen.getByText('Login');
    act(() => {
      button.click();
    });

    // Check localStorage again
    const storedData = window.localStorage.getItem('jg_user_context');

    // This expectation will FAIL if the code is vulnerable (it stores data)
    // This expectation will PASS if the code is secure (it doesn't store data)
    expect(storedData).toBeNull();
  });
});

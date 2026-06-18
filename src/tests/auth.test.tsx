import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Auth } from '../components/Auth';

describe('Authentication workflows', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders sign in screen with options to toggle registration', () => {
    const mockSuccess = vi.fn();
    render(<Auth onAuthSuccess={mockSuccess} />);

    expect(screen.getByText(/CV & Cover Letter Suite/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();

    const signUpToggle = screen.getByText(/Need an account\? Sign Up/i);
    fireEvent.click(signUpToggle);

    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('allows entering in Guest Mode sandbox when firebase is unconfigured', () => {
    const mockSuccess = vi.fn();
    render(<Auth onAuthSuccess={mockSuccess} />);

    const guestBtn = screen.getByRole('button', { name: /Enter as Guest →/i });
    fireEvent.click(guestBtn);

    expect(localStorage.getItem('LOCAL_USER')).toBe('guest@local.sandbox');
    expect(mockSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'guest@local.sandbox',
        isLocal: true
      })
    );
  });
});

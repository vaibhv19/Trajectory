import { create } from 'zustand';
import type { AuthResponse } from '../types';

interface AuthState {
  token: string | null;
  email: string | null;
  fullName: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  setAuth: (auth: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  const fullName = localStorage.getItem('fullName');
  const userId = localStorage.getItem('userId');

  return {
    token,
    email,
    fullName,
    userId,
    isAuthenticated: !!token,
    setAuth: (auth: AuthResponse) => {
      localStorage.setItem('token', auth.token);
      localStorage.setItem('email', auth.email);
      localStorage.setItem('fullName', auth.fullName);
      localStorage.setItem('userId', auth.userId);
      set({
        token: auth.token,
        email: auth.email,
        fullName: auth.fullName,
        userId: auth.userId,
        isAuthenticated: true,
      });
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('fullName');
      localStorage.removeItem('userId');
      set({
        token: null,
        email: null,
        fullName: null,
        userId: null,
        isAuthenticated: false,
      });
    },
  };
});

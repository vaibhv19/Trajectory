import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';
import { useThemeStore } from './themeStore';

describe('Zustand State Stores', () => {
  beforeEach(() => {
    // Reset localstorage mock before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('useAuthStore', () => {
    it('should initialize with null auth fields and false isAuthenticated', () => {
      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.email).toBeNull();
      expect(state.fullName).toBeNull();
      expect(state.userId).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should update state and localstorage on setAuth', () => {
      const mockAuth = {
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        email: 'test@email.com',
        fullName: 'Test User',
        userId: 'uuid-1234',
      };

      useAuthStore.getState().setAuth(mockAuth);

      const state = useAuthStore.getState();
      expect(state.token).toBe('mock-jwt-token');
      expect(state.refreshToken).toBe('mock-refresh-token');
      expect(state.email).toBe('test@email.com');
      expect(state.fullName).toBe('Test User');
      expect(state.userId).toBe('uuid-1234');
      expect(state.isAuthenticated).toBe(true);

      expect(localStorage.getItem('token')).toBe('mock-jwt-token');
      expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token');
      expect(localStorage.getItem('email')).toBe('test@email.com');
    });

    it('should clear state and localstorage on logout', () => {
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('useThemeStore', () => {
    it('should initialize with dark theme', () => {
      const state = useThemeStore.getState();
      expect(state.theme).toBe('dark');
    });

    it('should cycle theme mode through dark, system, and light', () => {
      // Initial state is dark mode
      expect(useThemeStore.getState().theme).toBe('dark');

      // Toggle once (dark -> system; system resolves to dark via matchMedia mock)
      useThemeStore.getState().toggleTheme();
      expect(useThemeStore.getState().theme).toBe('dark');
      expect(localStorage.getItem('themeMode')).toBe('system');

      // Toggle again (system -> light)
      useThemeStore.getState().toggleTheme();
      expect(useThemeStore.getState().theme).toBe('light');
      expect(localStorage.getItem('themeMode')).toBe('light');

      // Toggle again (light -> dark)
      useThemeStore.getState().toggleTheme();
      expect(useThemeStore.getState().theme).toBe('dark');
      expect(localStorage.getItem('themeMode')).toBe('dark');
    });
  });
});

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType } from './types';
import { SupabaseAuthService } from './services/supabase-auth';
import { DevAuthService } from './services/dev-auth';
import { notesService } from '../services/notes';
import { isDev } from '../utils/env';
import { authConfig } from './config';

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [authService] = useState(() => isDev ? new DevAuthService() : new SupabaseAuthService());
  const [state, setState] = useState<AuthContextType>({
    user: null,
    loading: true,
    error: null,
    signIn: async (provider: AuthProvider = 'google') => {
      if (!authConfig.providers.includes(provider)) {
        throw new Error(`Unsupported auth provider: ${provider}`);
      }

      try {
        const { data, error } = await authService.signIn(provider);
        if (error) throw error;
        if (isDev) {
          // In dev mode, immediately update the user state
          setState(prev => ({ ...prev, user: data.user }));
        }
      } catch (error) {
        setState(prev => ({ ...prev, error: error as Error }));
        throw error;
      }
    },
    signOut: async () => {
      try {
        await authService.signOut();
        if (isDev) {
          notesService.clearNotes();
        }
        setState(prev => ({ ...prev, user: null }));
      } catch (error) {
        setState(prev => ({ ...prev, error: error as Error }));
        throw error;
      }
    }
  });

  useEffect(() => {
    // Initial user check
    authService.getCurrentUser().then(user => {
      setState(prev => ({ ...prev, user, loading: false }));
    });

    // Subscribe to auth changes
    return authService.onAuthStateChange(user => {
      setState(prev => ({ ...prev, user, loading: false }));
    });
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}
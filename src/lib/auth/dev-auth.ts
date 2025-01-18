import { User } from '@supabase/supabase-js';
import { logger } from '../logger';

const DEV_USER: User = {
  id: 'dev-user-id',
  email: 'dev@example.com',
  role: 'authenticated',
  aud: 'authenticated',
  created_at: new Date().toISOString()
};

let currentUser: User | null = null;
const listeners = new Set<(user: User | null) => void>();

const updateAuthState = (user: User | null) => {
  currentUser = user;
  listeners.forEach(listener => listener(user));
};

export const devAuth = {
  getCurrentUser: async () => {
    logger.auth.success('getCurrentUser [DEV]', { user: currentUser });
    return currentUser;
  },
  
  signIn: async () => {
    logger.auth.success('signIn [DEV]');
    updateAuthState(DEV_USER);
    return { data: { user: DEV_USER }, error: null };
  },
  
  signOut: async () => {
    logger.auth.success('signOut [DEV]');
    updateAuthState(null);
    return { error: null };
  },
  
  onAuthStateChange: (callback: (user: User | null) => void) => {
    logger.auth.success('onAuthStateChange [DEV]');
    listeners.add(callback);
    callback(currentUser);
    
    return () => {
      listeners.delete(callback);
    };
  }
};
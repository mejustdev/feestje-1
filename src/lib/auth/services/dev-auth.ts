import { User } from '@supabase/supabase-js';
import { logger } from '../../logger';
import { IAuthService, AuthProvider } from '../types';

const DEV_USER: User = {
  id: '00000000-0000-4000-a000-000000000000',
  email: 'dev@example.com',
  app_metadata: {
    provider: 'email'
  },
  user_metadata: {
    name: 'Dev User'
  },
  aud: 'authenticated',
  role: 'authenticated',
  created_at: new Date().toISOString()
};

const DEV_SESSION = {
  access_token: 'dev-access-token',
  refresh_token: 'dev-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: DEV_USER
};

export class DevAuthService implements IAuthService {
  private currentUser: User | null = null;
  private listeners = new Set<(user: User | null) => void>();

  constructor() {
    // Initialize with null user in dev mode
    this.currentUser = null;
  }

  private updateAuthState(user: User | null) {
    this.currentUser = user;
    this.listeners.forEach(listener => listener(user));
  }

  async getCurrentUser() {
    logger.auth.success('getCurrentUser [DEV]', { user: this.currentUser });
    return this.currentUser;
  }

  async getSession() {
    return {
      data: {
        session: this.currentUser ? DEV_SESSION : null
      },
      error: null
    };
  }

  async getUser() {
    return {
      data: {
        user: this.currentUser,
      },
      error: null
    };
  }
  
  async signIn(provider: AuthProvider) {
    logger.auth.success('signIn [DEV]', { provider });
    this.updateAuthState(DEV_USER);
    return { data: { user: DEV_USER, session: DEV_SESSION }, error: null };
  }
  
  async signOut() {
    logger.auth.success('signOut [DEV]');
    this.updateAuthState(null);
    return { error: null };
  }
  
  onAuthStateChange(callback: (user: User | null) => void) {
    logger.auth.success('onAuthStateChange [DEV]');
    this.listeners.add(callback);
    callback(this.currentUser);
    
    return () => {
      this.listeners.delete(callback);
    };
  }
}
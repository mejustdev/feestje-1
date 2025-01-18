import { User } from '@supabase/supabase-js';

export type AuthProvider = 'google';

export type AuthConfig = {
  providers: AuthProvider[];
  redirectUrl: string;
};

export type AuthState = {
  user: User | null;
  loading: boolean;
  error: Error | null;
};

export interface IAuthService {
  getCurrentUser: () => Promise<User | null>;
  signIn: (provider: AuthProvider) => Promise<{ data: any; error: Error | null; }>;
  signOut: () => Promise<{ error: Error | null; }>;
  onAuthStateChange: (callback: (user: User | null) => void) => () => void;
}

export type AuthContextType = AuthState & {
  signIn: (provider?: AuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
};
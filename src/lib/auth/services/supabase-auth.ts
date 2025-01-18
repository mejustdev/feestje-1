import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../supabase/client';
import { logger } from '../../logger';
import { IAuthService, AuthProvider } from '../types';
import { authConfig } from '../config';

export class SupabaseAuthService implements IAuthService {
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        if (!(error instanceof AuthError && error.name === 'AuthSessionMissingError')) {
          logger.auth.error('getCurrentUser', error);
        }
        return null;
      }
      
      if (user) {
        logger.auth.success('getCurrentUser', { id: user.id, email: user.email });
      }
      return user;
    } catch (error) {
      logger.auth.error('getCurrentUser', error as Error);
      return null;
    }
  }

  onAuthStateChange(callback: (user: any) => void) {
    logger.auth.success('Setting up auth state change listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      logger.auth.stateChange(event, session);
      callback(session?.user ?? null);
    });
    return () => {
      logger.auth.success('Cleaning up auth state change listener');
      subscription.unsubscribe();
    };
  }

  async signIn(provider: AuthProvider) {
    try {
      logger.auth.success('signIn:start', { provider });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: authConfig.redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        logger.auth.error('signIn', error);
        throw error;
      }

      logger.auth.success('signIn:complete', { provider });
      return { data, error: null };
    } catch (error) {
      logger.auth.error('signIn', error as Error);
      throw error;
    }
  }

  async signOut() {
    try {
      logger.auth.success('signOut:start');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.auth.error('signOut', error);
        throw error;
      }

      logger.auth.success('signOut:complete');
      return { error: null };
    } catch (error) {
      logger.auth.error('signOut', error as Error);
      throw error;
    }
  }
}
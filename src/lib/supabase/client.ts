import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Create Supabase client with proper configuration
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: localStorage
    },
    db: {
      schema: 'public'
    }
  }
);
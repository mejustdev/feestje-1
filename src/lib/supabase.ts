import { createClient } from '@supabase/supabase-js';

// Immediate logging before anything else
console.log('=== Supabase Client Initialization ===');
console.log('Script loaded and running');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log environment variables immediately
console.log('Environment Variables:', {
  VITE_SUPABASE_URL: supabaseUrl,
  VITE_SUPABASE_ANON_KEY: supabaseAnonKey?.substring(0, 10) + '...',
  NODE_ENV: import.meta.env.MODE,
  BASE_URL: import.meta.env.BASE_URL
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

console.log('✓ Creating Supabase client...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'sb-auth-token',
    storage: window.localStorage
  }
});

console.log('✓ Supabase client created');

// Immediate connection test
console.log('Testing connection...');
supabase.from('wish_list_reservations').select('count', { count: 'exact' })
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Connection test failed:', error);
    } else {
      console.log('✓ Connection test successful:', data);
    }
  })
  .catch(err => {
    console.error('❌ Unexpected error:', err);
  });

export default supabase;
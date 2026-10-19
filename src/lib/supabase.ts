import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve public environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if valid credentials have been supplied
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here' &&
  supabaseUrl.startsWith('https://')
);

// Centralized Supabase client instance
// If not configured, initialize as null or dummy to prevent unhandled runtime crashes
let clientInstance: SupabaseClient | null = null;

if (isSupabaseConfigured && supabaseUrl && supabaseAnonKey) {
  clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'ledgerlens_auth_token',
    },
  });
}

export const supabase = clientInstance as SupabaseClient;

// Configuration status descriptor for debugging and setup guidance
export const getSupabaseConfigStatus = () => {
  return {
    isConfigured: isSupabaseConfigured,
    hasUrl: Boolean(supabaseUrl),
    hasAnonKey: Boolean(supabaseAnonKey),
    urlValue: supabaseUrl ? (isSupabaseConfigured ? supabaseUrl : '(placeholder)') : 'missing',
  };
};

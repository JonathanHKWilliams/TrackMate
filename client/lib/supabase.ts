import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// @ts-ignore - Expo environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
// @ts-ignore - Expo environment variables
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key. Please check your .env file and restart Expo server.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

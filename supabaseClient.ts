import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Automatically correct dashboard URLs to the correct project URL
if (supabaseUrl.includes('supabase.com/dashboard/project/')) {
  const match = supabaseUrl.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/);
  if (match && match[1]) {
    supabaseUrl = `https://${match[1]}.supabase.co`;
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anon Key is missing. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.'
  );
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'
);

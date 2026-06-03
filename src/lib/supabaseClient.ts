import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are set
export const isMockMode = !supabaseUrl || !supabaseAnonKey;

if (isMockMode) {
  console.warn(
    'ATTENZIONE: Variabili d\'ambiente Supabase non trovate! Configura VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY in un file .env.\nLa Web App funzionerà in MODALITÀ DEMO con dati simulati in tempo reale.'
  );
}

// Initialize client (with fallbacks if empty, to prevent app crash)
export const supabase = createClient(
  supabaseUrl || 'https://your-project-id.supabase.co',
  supabaseAnonKey || 'your-public-anon-key-placeholder'
);

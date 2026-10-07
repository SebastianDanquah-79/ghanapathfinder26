// Supabase Cloud client for GhanaPathFinder.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// These are Supabase publishable credentials. They are intentionally safe to
// expose in a browser build; database access must still be protected by RLS.
// Environment variables take precedence so every deployment can override them.
const DEFAULT_SUPABASE_URL = 'https://qcvypvvjzrooqylfvpza.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xAO66S4UghstoT-95nyTsA_qqcZM5Uq';

const SUPABASE_URL =
  import.meta.env['VITE_SUPABASE_URL'] ??
  import.meta.env['VITE_SUPABASE_PROJECT_URL'] ??
  DEFAULT_SUPABASE_URL;

const SUPABASE_KEY =
  import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] ??
  import.meta.env['VITE_SUPABASE_ANON_KEY'] ??
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

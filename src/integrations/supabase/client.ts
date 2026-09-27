// Supabase client configuration.
// Lovable Cloud supplies VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY when configured.
// The fallback preserves the existing GitHub/Supabase development environment.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qcvypvvjzrooqylfvpza.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_xAO66S4UghstoT-95nyTsA_qqcZM5Uq';

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === 'Bearer ' + supabaseKey) {
      headers.delete('Authorization');
    }

    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: {
    fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
  },
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'ghanapathfinder-auth-v2',
    persistSession: true,
    autoRefreshToken: true,
  },
});
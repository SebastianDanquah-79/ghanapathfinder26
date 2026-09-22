import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env['VITE_SUPABASE_URL'] || 'https://qcvypvvjzrooqylfvpza.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env['VITE_SUPABASE_ANON_KEY'] ??
  import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] ??
  '';

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    if (supabaseKey && isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }
    if (supabaseKey) headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

// The browser receives the configured Supabase key from Vercel/Vite.
// During SSR, Vercel can render the shell even if public Supabase env vars are
// temporarily unavailable. Auth/data operations are performed after hydration.
const isBrowser = typeof window !== 'undefined';
const serverFallbackKey = 'sb_publishable_ssr_fallback';

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY || (isBrowser ? '' : serverFallbackKey),
  {
    global: {
      fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY || (isBrowser ? '' : serverFallbackKey)),
    },
    auth: {
      storage: isBrowser ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);

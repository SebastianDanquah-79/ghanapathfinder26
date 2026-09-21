import { supabase } from "@/integrations/supabase/client";
import { getLanguage, type AppLanguage } from "@/lib/i18n";

export type BackendRoute = {
  language_backend: string;
  country_code: string | null;
  language_code: string;
  locale: string | null;
  direction: "ltr" | "rtl";
};

const COUNTRY_KEYS = ["gp-country", "gp-country-code", "countryCode"];

export function getSelectedCountry(): string | null {
  if (typeof window === "undefined") return null;
  for (const key of COUNTRY_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }
  return null;
}

export async function resolveBackend(language: AppLanguage = getLanguage()): Promise<BackendRoute> {
  const country = getSelectedCountry();
  const { data, error } = await supabase.rpc("resolve_gpf_backend", {
    p_language: language,
    p_country_code: country,
  });
  if (error) throw error;
  return (data?.[0] ?? {
    language_backend: `lang_${language}`,
    country_code: country,
    language_code: language,
    locale: language,
    direction: language === "ar" ? "rtl" : "ltr",
  }) as BackendRoute;
}

export async function getBackendContent(
  language: AppLanguage = getLanguage(),
  keys: string[] = [],
) {
  const { data, error } = await supabase.rpc("get_backend_content", {
    p_language: language,
    p_keys: keys,
  });
  if (error) throw error;
  return data ?? [];
}

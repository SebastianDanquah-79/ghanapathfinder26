export type AppLanguage = "en";

export const LANGUAGES: { code: AppLanguage; label: string; nativeName: string; rtl?: boolean }[] = [
  { code: "en", label: "English", nativeName: "English" },
];

const COPY: Record<AppLanguage, Record<string, string>> = {
  en: {
    language: "Language",
    translation_tool: "Translation tool",
    country: "Country",
    qualification: "Qualification / Exam",
    results: "Results",
    ghana_universities: "Ghanaian Universities",
    international_students: "International Students",
    how_to_apply: "How to apply",
    scholarships: "Scholarships",
    visa: "Visa and residence",
    jobs: "Jobs",
    internships: "Internships",
    search: "Search",
    about: "About",
    sign_in: "Sign in",
    sign_out: "Sign out",
  },
};

export function getLanguage(): AppLanguage {
  if (typeof window === "undefined") return "en";
  return "en";
}

export function setLanguage(_language: AppLanguage = "en") {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("gp-language", "en");
    document.documentElement.lang = "en-GH";
    document.documentElement.dir = "ltr";
    window.dispatchEvent(new Event("gp-language-change"));
  }
}

export function t(key: string, _language: AppLanguage = "en") {
  return COPY.en[key] ?? key;
}

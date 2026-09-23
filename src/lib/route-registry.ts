import { OPPORTUNITY_CATEGORIES } from "./opportunity-categories";

/**
 * Every static path the app links to. `route-registry.test.ts` checks that
 * each path has a route file and that navigation only uses these paths, so a
 * menu item can never point at a page that does not exist.
 */
export const STATIC_ROUTES = [
  "/", "/about", "/admission-match", "/applications", "/auth", "/career-path", "/careers",
  "/community", "/compare", "/compare-scholarships", "/contact", "/credits", "/dashboard",
  "/disclaimer", "/faq", "/inspiration", "/internships", "/matcher", "/my-path", "/onboarding",
  "/parent", "/preferences", "/privacy", "/professional-councils", "/programmes", "/references",
  "/reset-password", "/saved", "/scholarships", "/search", "/skills", "/terms",
  // Expansion
  "/opportunities", "/students", "/students/profile", "/insights", "/life-path", "/pipeline",
  "/education/ghana", "/education/africa", "/education/international",
] as const;

export const DYNAMIC_ROUTES = OPPORTUNITY_CATEGORIES.map((c) => `/opportunities/${c.slug}`);

export const ALL_ROUTES: string[] = [...STATIC_ROUTES, ...DYNAMIC_ROUTES];

export const isKnownRoute = (href: string) => {
  const path = href.split(/[?#]/)[0] || "/";
  return ALL_ROUTES.includes(path);
};

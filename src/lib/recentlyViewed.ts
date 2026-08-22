/**
 * Lightweight, device-local "recently viewed" list. Stored in localStorage so
 * it works for signed-out visitors and never costs a database round trip.
 */
export interface RecentItem {
  kind: "university" | "programme" | "career" | "scholarship" | "internship";
  title: string;
  subtitle?: string | undefined;
  path: string;
  at: number;
}

const KEY = "gpf.recentlyViewed";
const LIMIT = 12;

export const readRecent = (): RecentItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as RecentItem[]) : [];
    return Array.isArray(list) ? list.filter((r) => r && r.title && r.path) : [];
  } catch {
    return [];
  }
};

export const pushRecent = (item: Omit<RecentItem, "at">) => {
  if (typeof window === "undefined") return;
  try {
    const next = [{ ...item, at: Date.now() }, ...readRecent().filter((r) => r.path !== item.path)].slice(0, LIMIT);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable , non-critical */
  }
};

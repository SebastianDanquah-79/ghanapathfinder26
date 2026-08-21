export interface RecentItem {
  type: string;
  id: string;
  title: string;
  href: string;
  at: number;
}

const KEY = "gpf:recently-viewed";
const MAX = 8;

export const listRecentlyViewed = (): RecentItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as RecentItem[]) : [];
    return Array.isArray(parsed) ? parsed.filter((i) => i && i.title && i.href) : [];
  } catch {
    return [];
  }
};

export const recordRecentlyViewed = (item: Omit<RecentItem, "at">) => {
  if (typeof window === "undefined" || !item.title || !item.href) return;
  try {
    const next = [
      { ...item, at: Date.now() },
      ...listRecentlyViewed().filter((i) => !(i.type === item.type && i.id === item.id)),
    ].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable , recently viewed is optional */
  }
};

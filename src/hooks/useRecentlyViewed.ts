import { useEffect, useState } from "react";
import { pushRecent, readRecent, type RecentItem } from "@/lib/recentlyViewed";

/** Records a page visit once the entity has loaded. Safe during SSR. */
export const useRecordRecent = (item: Omit<RecentItem, "at"> | null) => {
  const key = item ? `${item.kind}:${item.path}:${item.title}` : null;
  useEffect(() => {
    if (item && key) pushRecent(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
};

/** Reads the device-local recently viewed list after hydration. */
export const useRecentlyViewed = (limit = 4) => {
  const [items, setItems] = useState<RecentItem[]>([]);
  useEffect(() => {
    setItems(readRecent().slice(0, limit));
  }, [limit]);
  return items;
};

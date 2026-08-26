import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RatingSummary {
  average: number;
  count: number;
}

/** Live average rating for the whole site, refreshed instantly via realtime. */
export const useSiteRatingSummary = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["site-rating-summary"],
    queryFn: async (): Promise<RatingSummary> => {
      const { data, error } = await supabase.rpc("site_rating_summary");
      if (error) throw error;
      const raw = (data ?? {}) as { average?: number | string; count?: number | string };
      return { average: Number(raw.average ?? 0), count: Number(raw.count ?? 0) };
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    const channel = supabase
      .channel("site-ratings-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_ratings" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["site-rating-summary"] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

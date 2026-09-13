import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type EmployerProvider = Tables<"internship_providers">;

/** Employers whose internship or graduate programme has been checked against the employer's own page. */
export const useVerifiedEmployers = () =>
  useQuery({
    queryKey: ["verified_employers"],
    queryFn: async (): Promise<EmployerProvider[]> => {
      const { data, error } = await supabase
        .from("internship_providers")
        .select("*")
        .eq("needs_review", false)
        .order("name");
      if (error) throw error;
      return (data ?? []) as EmployerProvider[];
    },
    staleTime: 300_000,
  });

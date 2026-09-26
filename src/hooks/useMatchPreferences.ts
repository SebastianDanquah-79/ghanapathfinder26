import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface MatchPreferences {
  level: string;
  field: string;
  region: string | null;
  need_based: boolean;
  gender: string;
  funding_types: string[];
  min_coverage: string;
  study_abroad: boolean;
}

export const DEFAULT_PREFERENCES: MatchPreferences = {
  level: "Undergraduate",
  field: "Any",
  region: null,
  need_based: true,
  gender: "Prefer not to say",
  funding_types: [],
  min_coverage: "Any",
  study_abroad: false,
};

export const LEVELS = ["Undergraduate", "Postgraduate", "Secondary", "Diploma", "PhD"];
export const FIELDS = [
  "Any", "Technology", "Medicine & Health", "Engineering", "Business", "Law",
  "Education", "Agriculture", "Creative Arts", "Media", "Sciences", "Public Service",
];
export const FUNDING_TYPES = ["Government", "University", "Foundation", "Corporate", "International", "NGO"];
export const COVERAGE_LEVELS = ["Any", "Full scholarship", "Tuition only", "Partial support"];
export const GENDERS = ["Prefer not to say", "Female", "Male"];

export const useMatchPreferences = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["match_preferences", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<MatchPreferences> => {
      const { data, error } = await supabase
        .from("match_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return DEFAULT_PREFERENCES;
      return {
        level: data.level,
        field: data.field,
        region: data.region,
        need_based: data.need_based,
        gender: data.gender,
        funding_types: data.funding_types ?? [],
        min_coverage: data.min_coverage,
        study_abroad: data.study_abroad,
      };
    },
  });
};

export const useSavePreferences = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (prefs: MatchPreferences) => {
      if (!user) throw new Error("Sign in to save preferences");
      const { error } = await supabase
        .from("match_preferences")
        .upsert({ user_id: user.id, ...prefs }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["match_preferences"] });
      toast.success("Match preferences updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

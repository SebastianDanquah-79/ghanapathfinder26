import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const PIPELINE_STAGES = [
  "interested",
  "preparing",
  "applied",
  "interview",
  "offer",
  "rejected",
] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];
export const PIPELINE_LABEL: Record<PipelineStage, string> = {
  interested: "Interested",
  preparing: "Preparing",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Not successful",
};

export interface PipelineInput {
  item_kind: string;
  item_ref: string | null;
  title: string;
  organisation?: string | null;
  url?: string | null;
  deadline_date?: string | null;
}

export const usePipeline = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["opportunity_pipeline", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunity_pipeline")
        .select("*")
        .eq("user_id", user!.id)
        .order("deadline_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useTrackOpportunity = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: PipelineInput) => {
      if (!user) throw new Error("Sign in to track this");
      if (item.item_ref) {
        const { data: existing } = await supabase
          .from("opportunity_pipeline")
          .select("id")
          .eq("user_id", user.id)
          .eq("item_kind", item.item_kind)
          .eq("item_ref", item.item_ref)
          .maybeSingle();
        if (existing) return "exists" as const;
      }
      const { error } = await supabase.from("opportunity_pipeline").insert({
        user_id: user.id,
        item_kind: item.item_kind,
        item_ref: item.item_ref,
        title: item.title.slice(0, 200),
        organisation: item.organisation ?? null,
        url: item.url ?? null,
        deadline_date: item.deadline_date ?? null,
        stage: "interested",
      });
      if (error) throw error;
      return "added" as const;
    },
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["opportunity_pipeline"] });
      toast.success(
        r === "exists" ? "Already in your tracker" : "Added to your tracker",
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdatePipeline = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: {
        stage?: string;
        notes?: string | null;
        deadline_date?: string | null;
      };
    }) => {
      const { error } = await supabase
        .from("opportunity_pipeline")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["opportunity_pipeline"] }),
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeletePipeline = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("opportunity_pipeline")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["opportunity_pipeline"] }),
    onError: (e: Error) => toast.error(e.message),
  });
};

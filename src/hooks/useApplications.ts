import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const APPLICATION_STATUSES = [
  "interested",
  "preparing",
  "submitted",
  "interview",
  "awarded",
  "rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_META: Record<ApplicationStatus, { label: string; tone: string; step: number }> = {
  interested: { label: "Interested", tone: "bg-secondary text-muted-foreground", step: 1 },
  preparing: { label: "Preparing", tone: "bg-primary/15 text-primary", step: 2 },
  submitted: { label: "Submitted", tone: "bg-primary/25 text-primary", step: 3 },
  interview: { label: "Interview", tone: "bg-ghana-gold/20 text-ghana-gold", step: 4 },
  awarded: { label: "Awarded", tone: "bg-emerald-500/20 text-emerald-400", step: 5 },
  rejected: { label: "Not selected", tone: "bg-destructive/15 text-destructive", step: 5 },
};

export interface ApplicationRow {
  id: string;
  user_id: string;
  scholarship_name: string;
  provider: string | null;
  status: string;
  deadline: string | null;
  link: string | null;
  notes: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useApplications = (studentId?: string) => {
  const { user } = useAuth();
  const id = studentId ?? user?.id;

  return useQuery({
    queryKey: ["scholarship_applications", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scholarship_applications")
        .select("*")
        .eq("user_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ApplicationRow[];
    },
  });
};

export interface NewApplication {
  scholarship_name: string;
  provider?: string | null;
  deadline?: string | null;
  link?: string | null;
  status?: ApplicationStatus;
  notes?: string | null;
}

export const useAddApplication = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (app: NewApplication) => {
      if (!user) throw new Error("Sign in to track applications");
      const { error } = await supabase.from("scholarship_applications").upsert(
        {
          user_id: user.id,
          scholarship_name: app.scholarship_name,
          provider: app.provider ?? null,
          deadline: app.deadline ?? null,
          link: app.link ?? null,
          status: app.status ?? "interested",
          notes: app.notes ?? null,
        },
        { onConflict: "user_id,scholarship_name" },
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scholarship_applications"] }),
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUpdateApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<ApplicationRow> }) => {
      const { error } = await supabase.from("scholarship_applications").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scholarship_applications"] }),
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("scholarship_applications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scholarship_applications"] }),
    onError: (e: Error) => toast.error(e.message),
  });
};

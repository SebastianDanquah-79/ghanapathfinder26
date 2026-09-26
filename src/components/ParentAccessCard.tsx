import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Users } from "@/lib/icons";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";


const ParentAccessCard = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: links = [] } = useQuery({
    queryKey: ["parent_links_as_student", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parent_links")
        .select("*")
        .eq("student_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const active = links.find((l) => l.status !== "revoked");

  const generate = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("parent_links")
      .insert({ student_id: user.id, status: "pending" });
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["parent_links_as_student"] });
  };

  const revoke = async (id: string) => {
    await supabase.from("parent_links").update({ status: "revoked" }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["parent_links_as_student"] });
    toast.success("Access revoked");
  };

  return (
    <div className="bg-glass rounded-xl p-5">
      <h2 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" /> Share with a parent
      </h2>
      {active ? (
        <>
          <p className="text-xs text-muted-foreground mb-2">
            {active.status === "accepted"
              ? "A parent is following your scholarship progress (read-only)."
              : "Give this code to your parent , they enter it on the parent page."}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="px-3 py-2 rounded-lg bg-secondary text-foreground font-mono tracking-widest text-sm">
              {active.invite_code}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(active.invite_code);
                toast.success("Code copied");
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-secondary text-xs text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
            <button onClick={() => revoke(active.id)} className="text-xs text-muted-foreground hover:text-destructive">
              Revoke
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-3">
            Parents get a read-only view of your applications, shortlist and deadlines. You can revoke it anytime.
          </p>
          <button
            onClick={generate}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            Generate invite code
          </button>
        </>
      )}
    </div>
  );
};

export default ParentAccessCard;

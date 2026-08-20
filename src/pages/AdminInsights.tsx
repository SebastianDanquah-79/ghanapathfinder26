import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useAdminData";
import {
  useDeleteInsight,
  useInsightReports,
  useModerateInsight,
  useModerationQueue,
} from "@/hooks/useInsights";

const AdminInsights = () => {
  const { user } = useAuth();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin();
  const enabled = !!isAdmin;
  const { data: insights, isLoading } = useModerationQueue(enabled);
  const { data: reports } = useInsightReports(enabled);
  const moderate = useModerateInsight();
  const remove = useDeleteInsight();

  const reportCount = (id: string) =>
    (reports ?? []).filter((r) => r.insight_id === id && r.status === "open").length;

  const act = (id: string, status: string) =>
    moderate.mutate({ id, status }, { onSuccess: () => toast.success(`Marked as ${status}`) });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">Insight moderation</h1>

          {(roleLoading || (!user && !roleLoading)) && (
            <p className="text-sm text-muted-foreground">Checking access…</p>
          )}

          {!roleLoading && user && !isAdmin && (
            <p className="text-sm text-muted-foreground">You don’t have access to this page.</p>
          )}

          {enabled && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {(reports ?? []).filter((r) => r.status === "open").length} open reports ·{" "}
                {(insights ?? []).length} insights
              </p>

              {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

              <div className="space-y-3">
                {(insights ?? []).map((i) => (
                  <article key={i.id} className="bg-glass rounded-xl p-4 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded-full ${
                          i.status === "approved"
                            ? "bg-ghana-green/20 text-ghana-green"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {i.status}
                      </span>
                      <span className="text-muted-foreground">{i.universities?.name}</span>
                      <span className="text-muted-foreground">· {i.category}</span>
                      {reportCount(i.id) > 0 && (
                        <span className="text-destructive">· {reportCount(i.id)} report(s)</span>
                      )}
                      <span className="ml-auto text-muted-foreground">
                        {new Date(i.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{i.body}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {["approved", "hidden", "rejected"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => act(i.id, s)}
                          disabled={moderate.isPending || i.status === s}
                          className="px-3 py-2 rounded-lg bg-secondary text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                        >
                          {s === "approved" ? "Approve" : s === "hidden" ? "Hide" : "Reject"}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete this insight permanently?")) {
                            remove.mutate(i.id, { onSuccess: () => toast.success("Deleted") });
                          }
                        }}
                        className="px-3 py-2 rounded-lg bg-destructive/15 text-xs text-destructive"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminInsights;

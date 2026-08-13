import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { STATUS_META, ApplicationStatus } from "@/hooks/useApplications";
import { daysUntil, urgencyLabel } from "@/lib/scholarshipDates";
import Navbar from "@/components/Navbar";

const card = "bg-glass rounded-xl p-5";
const input =
  "w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

const ParentView = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [code, setCode] = useState("");

  const { data: links = [] } = useQuery({
    queryKey: ["parent_links_as_parent", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parent_links")
        .select("*")
        .eq("parent_id", user!.id)
        .eq("status", "accepted");
      if (error) throw error;
      return data ?? [];
    },
  });

  const studentIds = links.map((l) => l.student_id);

  const { data: students = [] } = useQuery({
    queryKey: ["linked_students", studentIds.join(",")],
    enabled: studentIds.length > 0,
    queryFn: async () => {
      const [profiles, apps, saved, deadlines] = await Promise.all([
        supabase.from("profiles").select("*").in("id", studentIds),
        supabase.from("scholarship_applications").select("*").in("user_id", studentIds),
        supabase.from("saved_items").select("*").in("user_id", studentIds).eq("item_type", "scholarship"),
        supabase.from("deadlines").select("*").in("user_id", studentIds).order("due_date"),
      ]);
      return studentIds.map((id) => ({
        id,
        profile: profiles.data?.find((p) => p.id === id) ?? null,
        apps: (apps.data ?? []).filter((a) => a.user_id === id),
        saved: (saved.data ?? []).filter((s) => s.user_id === id),
        deadlines: (deadlines.data ?? []).filter((d) => d.user_id === id),
      }));
    },
  });

  const link = async () => {
    if (!code.trim()) return;
    const { error } = await supabase.rpc("accept_parent_invite", { _code: code.trim() });
    if (error) return toast.error(error.message);
    setCode("");
    toast.success("Linked — you can now follow their scholarship progress");
    qc.invalidateQueries({ queryKey: ["parent_links_as_parent"] });
  };

  return (
    <div className="min-h-screen bg-background px-4 sm:px-8 lg:px-12 pt-24 pb-16">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Parent view
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            A read-only window into your child's scholarship search — applications, shortlists and deadlines.
          </p>
        </div>

        <div className={`${card} mb-6`}>
          <h2 className="font-display font-semibold text-foreground mb-1">Link to a student</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Ask your child for the invite code on their GhanaPath dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className={input}
              placeholder="Invite code"
              maxLength={24}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && link()}
            />
            <button
              onClick={link}
              className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium shrink-0"
            >
              Link account
            </button>
          </div>
        </div>

        {!students.length && (
          <div className={card}>
            <p className="text-sm text-muted-foreground">
              No linked student yet. Once linked, their scholarship progress appears here.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {students.map((s) => (
            <section key={s.id} className="space-y-4">
              <h2 className="font-display font-semibold text-lg text-foreground">
                {s.profile?.full_name ?? "Student"}
                {s.profile?.target_career && (
                  <span className="text-sm font-normal text-muted-foreground"> · {s.profile.target_career}</span>
                )}
              </h2>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className={card}>
                  <h3 className="font-medium text-foreground mb-3">Applications</h3>
                  <ul className="space-y-2">
                    {s.apps.map((a) => {
                      const meta = STATUS_META[(a.status as ApplicationStatus) ?? "interested"] ?? STATUS_META.interested;
                      return (
                        <li key={a.id} className="flex items-start justify-between gap-2 text-sm">
                          <span className="text-foreground break-words">{a.scholarship_name}</span>
                          <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs ${meta.tone}`}>{meta.label}</span>
                        </li>
                      );
                    })}
                    {!s.apps.length && <li className="text-sm text-muted-foreground">No applications yet.</li>}
                  </ul>
                </div>

                <div className={card}>
                  <h3 className="font-medium text-foreground mb-3">Shortlisted scholarships</h3>
                  <ul className="space-y-2">
                    {s.saved.map((x) => (
                      <li key={x.id} className="text-sm">
                        <p className="text-foreground">{x.title}</p>
                        {x.subtitle && <p className="text-xs text-muted-foreground">{x.subtitle}</p>}
                      </li>
                    ))}
                    {!s.saved.length && <li className="text-sm text-muted-foreground">Nothing shortlisted yet.</li>}
                  </ul>
                </div>

                <div className={card}>
                  <h3 className="font-medium text-foreground mb-3">Upcoming deadlines</h3>
                  <ul className="space-y-2">
                    {s.deadlines.map((d) => {
                      const u = urgencyLabel(daysUntil(d.due_date));
                      return (
                        <li key={d.id} className="flex items-start justify-between gap-2 text-sm">
                          <span className="text-foreground break-words">{d.title}</span>
                          <span className={`text-xs shrink-0 ${u.tone}`}>{u.text}</span>
                        </li>
                      );
                    })}
                    {!s.deadlines.length && <li className="text-sm text-muted-foreground">No deadlines tracked.</li>}
                  </ul>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentView;

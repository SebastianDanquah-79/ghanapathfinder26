import { useMemo } from "react";
import { ArrowRight, CheckCircle2, CircleDollarSign, Compass, GraduationCap, Target, Zap } from "@/lib/icons";
import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdmissionMatches } from "@/hooks/useAdmissionMatch";

type SavedItem = { item_type: string };

export default function PathCommandCenter() {
  const { user } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ["command-center-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("target_career").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: saved = [] } = useQuery<SavedItem[]>({
    queryKey: ["command-center-saved", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_items").select("item_type").eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []) as SavedItem[];
    },
  });

  const { data: results = [] } = useQuery({
    queryKey: ["command-center-results", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("wassce_results").select("id").eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { matches = [] } = useAdmissionMatches();

  const stats = useMemo(() => ({
    universities: saved.filter((item) => item.item_type === "university").length,
    scholarships: saved.filter((item) => item.item_type === "scholarship").length,
    internships: saved.filter((item) => item.item_type === "internship").length,
  }), [saved]);

  const readiness = useMemo(() => {
    let score = 0;
    if (profile?.target_career) score += 25;
    if (results.length) score += 25;
    if (stats.universities >= 2) score += 15;
    if (stats.scholarships) score += 15;
    if (stats.internships) score += 10;
    if (matches.length) score += 10;
    return score;
  }, [profile?.target_career, results.length, stats, matches.length]);

  const nextAction = useMemo(() => {
    if (!results.length) return { eyebrow: "Start here", title: "Add your WASSCE results", text: "Unlock realistic admission matches instead of guessing which programmes fit.", href: "/results" };
    if (!profile?.target_career) return { eyebrow: "Next decision", title: "Choose your target career", text: "A clear destination makes programme, skills and opportunity recommendations more useful.", href: "/careers" };
    if (stats.universities < 2) return { eyebrow: "Build your shortlist", title: "Compare at least two routes", text: "Do not choose a university in isolation. Compare programme fit, cost and alternatives.", href: "/compare" };
    if (!stats.scholarships) return { eyebrow: "Protect your options", title: "Build a funding route", text: "Find scholarships before cost becomes the reason a good option disappears.", href: "/scholarships" };
    if (!stats.internships) return { eyebrow: "Build evidence", title: "Find your first experience", text: "Turn your career goal into evidence through internships, projects or practical opportunities.", href: "/internships" };
    return { eyebrow: "Keep moving", title: "Review your next opportunity", text: "Your path is active. Check applications and opportunities and take the highest-value next step.", href: "/applications" };
  }, [profile?.target_career, results.length, stats, matches.length]);

  return (
    <section className="rounded-2xl border border-border bg-foreground text-background p-5 sm:p-7" aria-label="Path command center">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-background/65 text-xs font-semibold uppercase tracking-[0.16em]
"><Compass className="h-4 w-4" /> Path Command Center</div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mt-3">One screen for the decision that matters next.</h2>
          <p className="text-sm text-background/70 mt-2">GhanaPathFinder should not just show you information. It should help you turn information into a sequence of decisions.</p>
        </div>
        <div className="min-w-[190px] rounded-xl border border-background/15 bg-background/5 p-4">
          <div className="flex items-center justify-between text-xs text-background/65"><span>Path readiness</span><span className="font-semibold text-background">{readiness}%</span></div>
          <div className="h-2 rounded-full bg-background/10 mt-2 overflow-hidden"><div className="h-full rounded-full bg-background transition-all" style={{ width: `${readiness}%` }} /></div>
          <p className="text-[11px] text-background/55 mt-2">Based on the information and actions in your account.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.25fr_.75fr] gap-4 mt-6">
        <div className="rounded-xl border border-background/15 bg-background/5 p-5">
          <div className="flex items-center gap-2 text-background/60 text-xs font-semibold uppercase tracking-wide"><Zap className="h-4 w-4" /> {nextAction.eyebrow}</div>
          <h3 className="font-display text-xl font-bold mt-3">{nextAction.title}</h3>
          <p className="text-sm text-background/70 mt-2 max-w-xl">{nextAction.text}</p>
          <Link to={nextAction.href} className="inline-flex items-center gap-2 mt-5 min-h-[44px] rounded-xl bg-background text-foreground px-4 text-sm font-semibold">Take the next step <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div className="rounded-xl border border-background/15 bg-background/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-background/60">Path signals</p>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="rounded-lg bg-background/5 p-3"><GraduationCap className="h-4 w-4 text-background/65" /><p className="text-lg font-bold mt-2">{stats.universities}</p><p className="text-[11px] text-background/55">saved routes</p></div>
            <div className="rounded-lg bg-background/5 p-3"><CircleDollarSign className="h-4 w-4 text-background/65" /><p className="text-lg font-bold mt-2">{stats.scholarships}</p><p className="text-[11px] text-background/55">funding options</p></div>
            <div className="rounded-lg bg-background/5 p-3"><Target className="h-4 w-4 text-background/65" /><p className="text-lg font-bold mt-2">{matches.length}</p><p className="text-[11px] text-background/55">match signals</p></div>
            <div className="rounded-lg bg-background/5 p-3"><CheckCircle2 className="h-4 w-4 text-background/65" /><p className="text-lg font-bold mt-2">{stats.internships}</p><p className="text-[11px] text-background/55">experience saves</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

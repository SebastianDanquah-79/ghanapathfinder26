import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Link, useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { listOpportunities } from "@/lib/opportunities.functions";
import { deadlineText } from "@/lib/opportunityFormat";
import AdvisorButton from "@/components/AdvisorButton";

/** Related live opportunities, salaries, and an "Add to My Path" action for a career. */
const CareerExplorerExtras = ({
  career,
  steps,
}: {
  career: string;
  steps: { label: string; detail?: string }[];
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const list = useServerFn(listOpportunities);
  const terms = career
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length > 3);

  const { data: opps = [] } = useQuery({
    queryKey: ["career-opps", career],
    queryFn: async () => {
      const r = await list({ data: { limit: 200 } });
      return r.items
        .filter((o) => {
          const hay = [
            o.title,
            o.category,
            ...(o.fields ?? []),
            ...(o.skills ?? []),
          ]
            .join(" ")
            .toLowerCase();
          return terms.some((t) => hay.includes(t));
        })
        .slice(0, 5);
    },
  });

  const { data: salaries = [] } = useQuery({
    queryKey: ["career-salaries", career],
    queryFn: async () => {
      const { data } = await supabase
        .from("occupation_salaries")
        .select("*")
        .ilike("occupation", `%${terms[0] ?? career}%`)
        .limit(5);
      return (data ?? []) as Record<string, unknown>[];
    },
  });

  const addToPath = async () => {
    if (!user) {
      navigate(`/auth?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    const rows = steps.map((s) => ({
      user_id: user.id,
      stage: s.label.slice(0, 80),
      title: `${career}: ${s.label}`.slice(0, 200),
      detail: s.detail?.slice(0, 500) ?? null,
      status: "planned",
    }));
    const { error } = await supabase.from("life_path_items").insert(rows);
    if (error) toast.error(error.message);
    else toast.success("Added to My Path");
  };

  return (
    <>
      {salaries.length > 0 && (
        <section className="rounded-xl border border-border p-4 mb-3">
          <h2 className="font-semibold text-foreground text-sm mb-2">
            Reported salaries
          </h2>
          <ul className="text-sm space-y-1">
            {salaries.map((s, i) => (
              <li key={i} className="text-muted-foreground">
                {String(s["occupation"] ?? "")} (
                {String(s["experience_level"] ?? "")}):{" "}
                {String(s["salary_range"] ?? "")}{" "}
                {String(s["salary_period"] ?? "")} · Source:{" "}
                {String(s["data_source"] ?? "")}
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="rounded-xl border border-border p-4 mb-3">
        <h2 className="font-semibold text-foreground text-sm mb-2">
          Open opportunities in this field
        </h2>
        {opps.length ? (
          <ul className="text-sm space-y-1">
            {opps.map((o) => (
              <li key={o.id} className="flex justify-between gap-2">
                <Link
                  to={`/opportunities/${o.slug}`}
                  className="text-primary truncate"
                >
                  {o.title}
                </Link>
                <span className="text-xs text-muted-foreground shrink-0">
                  {deadlineText(o)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No verified open listings right now.{" "}
            <Link to="/internships" className="text-primary underline">
              See internships
            </Link>
            .
          </p>
        )}
      </section>
      <div className="flex flex-wrap gap-2 mb-3">
        {steps.length > 0 && (
          <button
            type="button"
            onClick={addToPath}
            className="min-h-[40px] px-4 rounded-lg bg-secondary text-foreground text-sm font-medium"
          >
            Add these steps to My Path
          </button>
        )}
        <AdvisorButton
          topic={`The student is exploring the ${career} career path in Ghana`}
        />
      </div>
    </>
  );
};

export default CareerExplorerExtras;

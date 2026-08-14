import { useEffect, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { scholarships, Scholarship } from "@/data/scholarships";
import Navbar from "@/components/Navbar";

const ROWS: { label: string; get: (s: Scholarship) => string }[] = [
  { label: "Provider", get: (s) => s.provider },
  { label: "Type", get: (s) => s.type },
  { label: "Coverage", get: (s) => s.coverage },
  { label: "Level", get: (s) => s.level },
  { label: "Deadline", get: (s) => s.deadline },
  { label: "Eligibility", get: (s) => s.eligibility },
  { label: "How to apply", get: (s) => s.howToApply },
];

const CompareScholarships = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [loading, user, navigate]);

  const { data: saved = [] } = useQuery({
    queryKey: ["saved_items", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_items").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  const savedNames = saved.filter((s) => s.item_type === "scholarship").map((s) => s.title);
  const options = scholarships.filter((s) => savedNames.includes(s.name));
  const pool = options.length ? options : scholarships;
  const selected = pool.filter((s) => picked.includes(s.name));

  const toggle = (name: string) =>
    setPicked((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : prev.length >= 3 ? prev : [...prev, name],
    );

  return (
    <div className="min-h-screen bg-background px-4 sm:px-8 lg:px-12 pt-20 pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <Link to="/scholarships" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to scholarship hub
        </Link>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 mb-2">
          <Scale className="h-6 w-6 text-primary" /> Compare scholarships
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {options.length ? "Pick up to 3 of your saved scholarships." : "You haven't saved any yet — compare from the full list."}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {pool.map((s) => (
            <button
              key={s.name}
              onClick={() => toggle(s.name)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                picked.includes(s.name)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {selected.length ? (
          <div className="hscroll bg-glass rounded-xl p-1">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr>
                  <th className="text-left p-3 text-xs text-muted-foreground font-medium w-32">Detail</th>
                  {selected.map((s) => (
                    <th key={s.name} className="text-left p-3 font-display text-foreground">
                      {s.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.label} className="border-t border-border/60 align-top">
                    <td className="p-3 text-xs text-muted-foreground">{r.label}</td>
                    {selected.map((s) => (
                      <td key={s.name} className="p-3 text-xs text-foreground">
                        {r.get(s)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select scholarships above to see them side by side.</p>
        )}
      </div>
    </div>
  );
};

export default CompareScholarships;

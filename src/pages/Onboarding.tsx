import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const REGIONS = [
  "Greater Accra", "Ashanti", "Central", "Eastern", "Western", "Volta",
  "Northern", "Upper East", "Upper West", "Bono", "Ahafo", "Oti", "Savannah",
  "North East", "Western North", "Bono East",
];

const GRADES = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"];

const CORE_SUBJECTS = ["English Language", "Mathematics", "Integrated Science", "Social Studies"];

const INTERESTS = [
  "Technology", "Medicine & Health", "Engineering", "Business", "Law",
  "Education", "Agriculture", "Creative Arts", "Media", "Public Service",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [school, setSchool] = useState("");
  const [region, setRegion] = useState("");
  const [career, setCareer] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [results, setResults] = useState(
    CORE_SUBJECTS.map((subject) => ({ subject, grade: "" })),
  );

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setFullName((prev) => prev || data?.full_name || ""));
  }, [user]);

  const toggleInterest = (i: string) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          school: school.trim() || null,
          region: region || null,
          target_career: career.trim() || null,
          interests,
          onboarded: true,
        })
        .eq("id", user.id);
      if (error) throw error;

      const rows = results
        .filter((r) => r.subject.trim() && r.grade)
        .map((r) => ({ user_id: user.id, subject: r.subject.trim(), grade: r.grade }));

      await supabase.from("wassce_results").delete().eq("user_id", user.id);
      if (rows.length) {
        const { error: rErr } = await supabase.from("wassce_results").insert(rows);
        if (rErr) throw rErr;
      }

      toast.success("Profile saved");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Let's set up your path
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          This powers your matched programmes, scholarship matches and dashboard.
        </p>

        <div className="space-y-6">
          <div className="bg-glass rounded-xl p-5 space-y-3">
            <h2 className="font-display font-semibold text-foreground">About you</h2>
            <input className={inputClass} placeholder="Full name" value={fullName} maxLength={100} onChange={(e) => setFullName(e.target.value)} />
            <input className={inputClass} placeholder="Senior High School" value={school} maxLength={120} onChange={(e) => setSchool(e.target.value)} />
            <select className={inputClass} value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">Select your region</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <input className={inputClass} placeholder="Target career (e.g. Software Engineer)" value={career} maxLength={100} onChange={(e) => setCareer(e.target.value)} />
          </div>

          <div className="bg-glass rounded-xl p-5">
            <h2 className="font-display font-semibold text-foreground mb-3">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <button
                  key={i}
                  onClick={() => toggleInterest(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    interests.includes(i)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-glass rounded-xl p-5">
            <h2 className="font-display font-semibold text-foreground mb-1">WASSCE results</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Add your best six subjects — we use them to calculate your aggregate.
            </p>
            <div className="space-y-2">
              {results.map((r, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    className={inputClass}
                    placeholder="Subject"
                    value={r.subject}
                    maxLength={60}
                    onChange={(e) =>
                      setResults((prev) => prev.map((x, i) => (i === idx ? { ...x, subject: e.target.value } : x)))
                    }
                  />
                  <select
                    className="px-3 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm w-28"
                    value={r.grade}
                    onChange={(e) =>
                      setResults((prev) => prev.map((x, i) => (i === idx ? { ...x, grade: e.target.value } : x)))
                    }
                  >
                    <option value="">Grade</option>
                    {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <button
                    onClick={() => setResults((prev) => prev.filter((_, i) => i !== idx))}
                    className="p-3 text-muted-foreground hover:text-destructive"
                    aria-label="Remove subject"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setResults((prev) => [...prev, { subject: "", grade: "" }])}
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary font-medium"
            >
              <Plus className="h-4 w-4" /> Add subject
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save and continue
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-3 rounded-lg bg-secondary text-muted-foreground text-sm font-medium"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

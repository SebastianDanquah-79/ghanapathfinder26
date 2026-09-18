import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { Loader2, Plus, Trash2 } from "@/lib/icons";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LANGUAGES, getLanguage, setLanguage, t, type AppLanguage } from "@/lib/i18n";

const REGIONS = [
  "Greater Accra", "Ashanti", "Central", "Eastern", "Western", "Volta",
  "Northern", "Upper East", "Upper West", "Bono", "Ahafo", "Oti", "Savannah",
  "North East", "Western North", "Bono East",
];

const INTERESTS = [
  "Technology", "Medicine & Health", "Engineering", "Business", "Law",
  "Education", "Agriculture", "Creative Arts", "Media", "Public Service",
];

type Qualification = {
  code: string;
  name: string;
  country: string;
  scale: string;
  grades: string[];
  levels?: string[];
  placeholder?: string;
};

const QUALIFICATIONS: Qualification[] = [
  { code: "WASSCE", name: "WASSCE", country: "Ghana", scale: "A1–F9", grades: ["A1","B2","B3","C4","C5","C6","D7","E8","F9"], placeholder: "e.g. Core Mathematics" },
  { code: "IB_DP", name: "IB Diploma Programme", country: "International", scale: "1–7", grades: ["7","6","5","4","3","2","1"], levels: ["Higher Level","Standard Level"], placeholder: "e.g. Mathematics AA" },
  { code: "IGCSE", name: "Cambridge IGCSE", country: "International", scale: "A*–G", grades: ["A*","A","B","C","D","E","F","G"], placeholder: "e.g. Mathematics" },
  { code: "O_LEVEL", name: "Cambridge O Level", country: "International", scale: "A*–E", grades: ["A*","A","B","C","D","E"], placeholder: "e.g. Mathematics" },
  { code: "AS_LEVEL", name: "Cambridge International AS Level", country: "International", scale: "A–E", grades: ["A","B","C","D","E"], placeholder: "e.g. Mathematics" },
  { code: "A_LEVEL", name: "Cambridge International A Level", country: "International", scale: "A*–E", grades: ["A*","A","B","C","D","E"], placeholder: "e.g. Mathematics" },
  { code: "EDEXCEL_IGCSE", name: "Pearson Edexcel International GCSE", country: "International", scale: "9–1 / A*–G", grades: ["9","8","7","6","5","4","3","2","1"], placeholder: "e.g. Mathematics" },
  { code: "EDEXCEL_A_LEVEL", name: "Pearson Edexcel International A Level", country: "International", scale: "A*–E", grades: ["A*","A","B","C","D","E"], placeholder: "e.g. Mathematics" },
  { code: "AP", name: "Advanced Placement (AP)", country: "United States", scale: "1–5", grades: ["5","4","3","2","1"], placeholder: "e.g. Calculus BC" },
  { code: "SAT", name: "SAT", country: "International", scale: "400–1600", grades: [], placeholder: "Section or subject (optional)" },
  { code: "ACT", name: "ACT", country: "International", scale: "1–36", grades: [], placeholder: "Section or subject (optional)" },
  { code: "FRENCH_BAC", name: "French Baccalauréat", country: "Francophone", scale: "0–20", grades: [], placeholder: "e.g. Mathematics" },
  { code: "GERMAN_ABITUR", name: "German Abitur", country: "Germany", scale: "1.0–6.0", grades: [], placeholder: "e.g. Mathematics" },
  { code: "EUROPEAN_BAC", name: "European Baccalaureate", country: "Europe", scale: "0–100", grades: [], placeholder: "e.g. Mathematics" },
  { code: "KCSE", name: "KCSE", country: "Kenya", scale: "A–E", grades: ["A","A-","B+","B","B-","C+","C","C-","D+","D","D-","E"], placeholder: "e.g. Mathematics" },
  { code: "NSC", name: "South African National Senior Certificate", country: "South Africa", scale: "Level 1–7", grades: ["7","6","5","4","3","2","1"], placeholder: "e.g. Mathematics" },
  { code: "WAEC_NIGERIA", name: "WAEC / NECO", country: "Nigeria", scale: "A1–F9", grades: ["A1","B2","B3","C4","C5","C6","D7","E8","F9"], placeholder: "e.g. Mathematics" },
  { code: "CAMBRIDGE_GCE", name: "Cambridge GCE", country: "International", scale: "A*–E", grades: ["A*","A","B","C","D","E"], placeholder: "e.g. Mathematics" },
];

const COUNTRY_OPTIONS = [
  ["DZ","Algeria"],["AO","Angola"],["BJ","Benin"],["BW","Botswana"],["BF","Burkina Faso"],["BI","Burundi"],["CV","Cabo Verde"],["CM","Cameroon"],["CF","Central African Republic"],["TD","Chad"],["KM","Comoros"],["CG","Congo"],["CD","Democratic Republic of the Congo"],["CI","Côte d'Ivoire"],["DJ","Djibouti"],["EG","Egypt"],["GQ","Equatorial Guinea"],["ER","Eritrea"],["SZ","Eswatini"],["ET","Ethiopia"],["GA","Gabon"],["GM","Gambia"],["GH","Ghana"],["GN","Guinea"],["GW","Guinea-Bissau"],["KE","Kenya"],["LS","Lesotho"],["LR","Liberia"],["LY","Libya"],["MG","Madagascar"],["MW","Malawi"],["ML","Mali"],["MR","Mauritania"],["MU","Mauritius"],["MA","Morocco"],["MZ","Mozambique"],["NA","Namibia"],["NE","Niger"],["NG","Nigeria"],["RW","Rwanda"],["ST","São Tomé and Príncipe"],["SN","Senegal"],["SC","Seychelles"],["SL","Sierra Leone"],["SO","Somalia"],["ZA","South Africa"],["SS","South Sudan"],["SD","Sudan"],["TZ","Tanzania"],["TG","Togo"],["TN","Tunisia"],["UG","Uganda"],["ZM","Zambia"],["ZW","Zimbabwe"],["EH","Sahrawi Republic"],["OTHER","Other"],
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [saving, setSaving] = useState(false);\n  const [language, setCurrentLanguage] = useState<AppLanguage>("en");
  const [fullName, setFullName] = useState("");
  const [school, setSchool] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("GH");
  const [career, setCareer] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [qualificationCode, setQualificationCode] = useState("WASSCE");
  const [overallScore, setOverallScore] = useState("");
  const [results, setResults] = useState([{ subject: "", grade: "", level: "" }]);\n\n  useEffect(() => {\n    const sync = () => setCurrentLanguage(getLanguage());\n    sync();\n    window.addEventListener("gp-language-change", sync);\n    return () => window.removeEventListener("gp-language-change", sync);\n  }, []);

  const qualification = useMemo(
    () => QUALIFICATIONS.find((q) => q.code === qualificationCode) ?? QUALIFICATIONS[0],
    [qualificationCode],
  );
  const isWassce = qualification.code === "WASSCE";
  const hasGradeScale = qualification.grades.length > 0;

  useEffect(() => {
    if (!loading && !user) navigate(`/auth?next=${encodeURIComponent(window.location.pathname + window.location.search)}`, { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
      .then(({ data }) => setFullName((prev) => prev || data?.full_name || ""));
  }, [user]);

  const toggleInterest = (interest: string) =>
    setInterests((prev) => prev.includes(interest) ? prev.filter((x) => x !== interest) : [...prev, interest]);

  const changeQualification = (code: string) => {
    setQualificationCode(code);
    setOverallScore("");
    setResults([{ subject: "", grade: "", level: "" }]);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const profilePayload = {
        id: user.id,
        email: user.email ?? null,
        full_name: fullName.trim() || null,
        school: school.trim() || null,
        region: region || null,
        target_career: career.trim() || null,
        interests,
        onboarded: true,
      };
      const { error } = await supabase.from("profiles").upsert(profilePayload, { onConflict: "id" });
      if (error) throw error;

      if (isWassce) {
        const rows = results.filter((r) => r.subject.trim() && r.grade)
          .map((r) => ({ user_id: user.id, subject: r.subject.trim(), grade: r.grade }));
        const { error: dErr } = await supabase.from("wassce_results").delete().eq("user_id", user.id);
        if (dErr) throw dErr;
        if (rows.length) {
          const { error: rErr } = await supabase.from("wassce_results").insert(rows);
          if (rErr) throw rErr;
        }
      }

      // Generic qualification storage keeps international exams separate from the legacy WASSCE engine.
      const db = supabase as any;
      const { data: q, error: qErr } = await db.from("student_qualifications").upsert({
        user_id: user.id,
        country_code: country,
        qualification_code: qualification.code,
        qualification_name: qualification.name,
        grading_scale: qualification.scale,
        overall_score: overallScore.trim() || null,
        metadata: { country_name: COUNTRY_OPTIONS.find(([code]) => code === country)?.[1] ?? "Other" },
      }, { onConflict: "user_id" }).select("id").single();
      if (qErr) throw qErr;

      await db.from("student_qualification_results").delete().eq("qualification_id", q.id);
      const genericRows = results.filter((r) => r.subject.trim() && (r.grade || !hasGradeScale))
        .map((r) => ({
          qualification_id: q.id,
          subject: r.subject.trim(),
          grade: r.grade || overallScore.trim() || "Entered",
          level: r.level || null,
        }));
      if (genericRows.length) {
        const { error: resultErr } = await db.from("student_qualification_results").insert(genericRows);
        if (resultErr) throw resultErr;
      }

      toast.success("Academic profile saved");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save profile";
      console.error("Profile save failed", err);
      toast.error(`Could not save profile: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50";

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">\n        <div className="flex justify-end mb-4">\n          <label className="flex items-center gap-2 text-xs text-muted-foreground">\n            {t("language", language)}\n            <select value={language} onChange={(e) => setLanguage(e.target.value as AppLanguage)} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground">\n              {LANGUAGES.map((item) => <option key={item.code} value={item.code}>{item.nativeName}</option>)}\n            </select>\n          </label>\n        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Let's set up your path</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Tell GhanaPathFinder where you study and which qualification you use. Your academic profile powers Ghana-focused international recommendations.
        </p>

        <div className="space-y-4">
          <div className="bg-glass rounded-xl p-5 space-y-3">
            <h2 className="font-display font-semibold text-foreground">About you</h2>
            <input className={inputClass} placeholder={language === "fr" ? "Nom complet" : "Full name"} value={fullName} maxLength={100} onChange={(e) => setFullName(e.target.value)} />
            <select className={inputClass} value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="">{language === "fr" ? "Sélectionnez votre pays" : "Select your country"}</option>
              {COUNTRY_OPTIONS.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
            </select>
            {country === "GH" && (
              <select className={inputClass} value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="">Select your region</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            )}
            <input className={inputClass} placeholder="School / institution" value={school} maxLength={120} onChange={(e) => setSchool(e.target.value)} />
            <input className={inputClass} placeholder="Target career (e.g. Software Engineer)" value={career} maxLength={100} onChange={(e) => setCareer(e.target.value)} />
          </div>

          <div className="bg-glass rounded-xl p-5">
            <h2 className="font-display font-semibold text-foreground mb-1">Academic qualification</h2>
            <p className="text-xs text-muted-foreground mb-3">WASSCE remains fully supported. International students can now select IB, IGCSE, O Level, A Level, AP, SAT, ACT and other national qualifications.</p>
            <select className={inputClass} value={qualificationCode} onChange={(e) => changeQualification(e.target.value)}>
              {QUALIFICATIONS.map((q) => <option key={q.code} value={q.code}>{q.name} · {q.country}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-xs text-muted-foreground">Grading scale</label>
                <p className="text-sm text-foreground mt-1">{qualification.scale}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{isWassce ? "Qualification" : "Overall score (optional)"}</label>
                {isWassce ? <p className="text-sm text-foreground mt-1">WASSCE</p> : (
                  <input className={inputClass + " mt-1"} placeholder={qualification.scale} value={overallScore} maxLength={30} onChange={(e) => setOverallScore(e.target.value)} />
                )}
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {results.map((r, idx) => (
                <div key={idx} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-2">
                  <input className={inputClass} placeholder={qualification.placeholder ?? "Subject"} value={r.subject} maxLength={80}
                    onChange={(e) => setResults((prev) => prev.map((x, i) => i === idx ? { ...x, subject: e.target.value } : x))} />
                  {hasGradeScale ? (
                    <select className="px-3 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm w-28" value={r.grade}
                      onChange={(e) => setResults((prev) => prev.map((x, i) => i === idx ? { ...x, grade: e.target.value } : x))}>
                      <option value="">Grade</option>
                      {qualification.grades.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  ) : (
                    <input className="px-3 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm w-28" placeholder="Result" value={r.grade}
                      maxLength={20} onChange={(e) => setResults((prev) => prev.map((x, i) => i === idx ? { ...x, grade: e.target.value } : x))} />
                  )}
                  {qualification.levels ? (
                    <select className="px-3 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm w-32" value={r.level}
                      onChange={(e) => setResults((prev) => prev.map((x, i) => i === idx ? { ...x, level: e.target.value } : x))}>
                      <option value="">Level</option>
                      {qualification.levels.map((level) => <option key={level} value={level}>{level}</option>)}
                    </select>
                  ) : <span className="w-8" />}
                  <button onClick={() => setResults((prev) => prev.filter((_, i) => i !== idx))} className="p-3 text-muted-foreground hover:text-destructive" aria-label="Remove subject">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setResults((prev) => [...prev, { subject: "", grade: "", level: "" }])} className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary font-medium">
              <Plus className="h-4 w-4" /> Add subject
            </button>
          </div>

          <div className="bg-glass rounded-xl p-5">
            <h2 className="font-display font-semibold text-foreground mb-3">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <button key={i} onClick={() => toggleInterest(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${interests.includes(i) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save and continue
            </button>
            <button onClick={() => navigate("/dashboard")} className="px-4 py-3 rounded-lg bg-secondary text-muted-foreground text-sm font-medium">Skip</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

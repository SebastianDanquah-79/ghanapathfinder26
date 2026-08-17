import { useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";
import { Award, ArrowLeft, ExternalLink } from "lucide-react";
import { matchScholarships, MatcherAnswers } from "@/lib/scholarshipMatcher";
import SaveButton from "@/components/SaveButton";
import Navbar from "@/components/Navbar";

const FIELDS = ["Any", "Technology", "Medicine", "Engineering", "Business", "Law", "Education", "Agriculture", "Arts"];
const LEVELS = ["Undergraduate", "Postgraduate"];
const REGIONS = ["", "Greater Accra", "Ashanti", "Northern", "Volta", "Western", "Upper East", "Upper West"];

const Matcher = () => {
  const [answers, setAnswers] = useState<MatcherAnswers>({
    level: "Undergraduate",
    field: "Any",
    region: "",
    needBased: true,
    aggregate: null,
    gender: "Prefer not to say",
  });
  const [submitted, setSubmitted] = useState(false);

  const matches = useMemo(() => (submitted ? matchScholarships(answers).slice(0, 8) : []), [submitted, answers]);

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/50";

  return (
    <div className="min-h-screen bg-background px-4 sm:px-8 lg:px-12 pt-20 pb-12">
      <Navbar />
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <Award className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Scholarship Matcher</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Answer six quick questions and we'll rank the funding options that fit you best.
        </p>

        <div className="bg-glass rounded-xl p-5 grid gap-3 sm:grid-cols-2">
          <select className={inputClass} value={answers.level} onChange={(e) => setAnswers({ ...answers, level: e.target.value })}>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select className={inputClass} value={answers.field} onChange={(e) => setAnswers({ ...answers, field: e.target.value })}>
            {FIELDS.map((f) => <option key={f} value={f}>{f === "Any" ? "Any field of study" : f}</option>)}
          </select>
          <select className={inputClass} value={answers.region} onChange={(e) => setAnswers({ ...answers, region: e.target.value })}>
            {REGIONS.map((r) => <option key={r} value={r}>{r || "Any region"}</option>)}
          </select>
          <select className={inputClass} value={answers.gender} onChange={(e) => setAnswers({ ...answers, gender: e.target.value })}>
            {["Prefer not to say", "Female", "Male"].map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <input
            type="number"
            min={6}
            max={54}
            placeholder="WASSCE aggregate (optional)"
            className={inputClass}
            value={answers.aggregate ?? ""}
            onChange={(e) => setAnswers({ ...answers, aggregate: e.target.value ? Number(e.target.value) : null })}
          />
          <label className="flex items-center gap-2 px-4 py-3 rounded-lg bg-secondary text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={answers.needBased}
              onChange={(e) => setAnswers({ ...answers, needBased: e.target.checked })}
            />
            I need financial support
          </label>
          <button
            onClick={() => setSubmitted(true)}
            className="sm:col-span-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
          >
            Find my scholarships
          </button>
        </div>

        {submitted && (
          <div className="mt-6 space-y-4">
            {matches.map(({ scholarship: s, score, reasons, gaps }) => (
              <div key={s.name} className="bg-glass rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{s.name}</h3>
                    <p className="text-xs text-muted-foreground">{s.provider} · {s.coverage}</p>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold">
                    {score}% match
                  </span>
                </div>

                <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                  {reasons.map((r) => <li key={r}> {r}</li>)}
                  {gaps.map((g) => <li key={g} className="text-ghana-gold">! {g}</li>)}
                </ul>

                <p className="text-xs text-muted-foreground mb-3">Deadline: {s.deadline}</p>

                <div className="flex flex-wrap items-center gap-2">
                  <SaveButton
                    item={{
                      item_type: "scholarship",
                      item_key: s.name,
                      title: s.name,
                      subtitle: s.provider,
                      metadata: { deadline: s.deadline, coverage: s.coverage },
                    }}
                  />
                  {s.link && (
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary text-xs text-muted-foreground hover:text-foreground"
                    >
                      Official page <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matcher;

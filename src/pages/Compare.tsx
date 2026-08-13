import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Scale } from "lucide-react";
import { universities } from "@/data/universities";
import SaveButton from "@/components/SaveButton";
import Navbar from "@/components/Navbar";

const Compare = () => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (shortName: string) =>
    setSelected((prev) =>
      prev.includes(shortName)
        ? prev.filter((s) => s !== shortName)
        : prev.length < 3
          ? [...prev, shortName]
          : prev,
    );

  const chosen = universities.filter((u) => selected.includes(u.shortName));

  const rows: { label: string; value: (u: (typeof universities)[number]) => string }[] = [
    { label: "Full name", value: (u) => u.name },
    { label: "Location", value: (u) => u.location },
    { label: "Type", value: (u) => u.type },
    { label: "Tuition", value: (u) => u.tuitionRange },
    { label: "Admission aggregate", value: (u) => u.admissionAggregate },
    { label: "Top programmes", value: (u) => u.topPrograms.join(", ") },
    { label: "Campus life", value: (u) => u.campusVibe },
  ];

  return (
    <div className="min-h-screen bg-background px-4 sm:px-8 lg:px-12 pt-20 pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <Scale className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Compare universities</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Pick up to three schools to see them side by side.</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {universities.map((u) => (
            <button
              key={u.shortName}
              onClick={() => toggle(u.shortName)}
              className={`px-3 min-h-[44px] rounded-full text-xs font-medium transition-colors ${
                selected.includes(u.shortName)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {u.shortName}
            </button>
          ))}
        </div>

        {chosen.length ? (
          <div className="overflow-x-auto bg-glass rounded-xl p-4">
            <table className="w-full text-sm min-w-[540px]">
              <thead>
                <tr>
                  <th className="text-left p-2 text-muted-foreground font-medium w-40">Criteria</th>
                  {chosen.map((u) => (
                    <th key={u.shortName} className="text-left p-2 text-foreground font-display">
                      {u.shortName}
                      <div className="mt-1">
                        <SaveButton
                          item={{
                            item_type: "university",
                            item_key: u.shortName,
                            title: u.name,
                            subtitle: u.location,
                          }}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-t border-border/60 align-top">
                    <td className="p-2 text-muted-foreground">{r.label}</td>
                    {chosen.map((u) => (
                      <td key={u.shortName} className="p-2 text-foreground">{r.value(u)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select a school above to start comparing.</p>
        )}
      </div>
    </div>
  );
};

export default Compare;

import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, GraduationCap, Landmark, Sparkles } from "lucide-react";
import { useProgrammes, useScholarshipRecords, useUniversities } from "@/hooks/useCatalogue";
import { normalizeCareer } from "@/lib/pathEngine";

const careerSearch: Record<string, { programmes: string[]; scholarship: string }> = {
  "AI Engineer": { programmes: ["computer science", "artificial intelligence", "computer engineering"], scholarship: "computer science" },
  "Machine Learning Engineer": { programmes: ["computer science", "artificial intelligence", "software engineering"], scholarship: "technology" },
  "Software Engineer": { programmes: ["computer science", "software engineering", "information technology"], scholarship: "technology" },
  "Robotics Engineer": { programmes: ["computer engineering", "mechatronics", "electrical engineering", "computer science"], scholarship: "engineering" },
  "Data Scientist": { programmes: ["computer science", "statistics", "data science", "mathematics"], scholarship: "data" },
};

export default function PathIntelligence({ targetCareer }: { targetCareer: string }) {
  const career = normalizeCareer(targetCareer);
  const config = careerSearch[career] ?? careerSearch["AI Engineer"];
  const programmeQuery = config.programmes[0];
  const programmes = useProgrammes(undefined, programmeQuery);
  const universities = useUniversities({ search: programmeQuery, pageSize: 8 });
  const scholarships = useScholarshipRecords(config.scholarship);

  const programmeRows = (programmes.data ?? []).slice(0, 6);
  const universityRows = (universities.data?.rows ?? []).slice(0, 4);
  const scholarshipRows = (scholarships.data ?? []).slice(0, 4);

  return (
    <section className="rounded-2xl border border-border bg-background p-5 sm:p-7" aria-label="Path intelligence">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Live path intelligence</p>
          <h2 className="mt-2 text-xl font-bold sm:text-2xl">Turn {career} into real options.</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">These recommendations are pulled from GhanaPathFinder's live catalogue, then narrowed around your destination.</p>
        </div>
        <Sparkles className="hidden h-5 w-5 text-primary sm:block" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /><h3 className="font-semibold">Programmes</h3></div>
          <p className="mt-1 text-xs text-muted-foreground">Relevant study routes</p>
          <div className="mt-4 space-y-2">
            {programmeRows.length ? programmeRows.map(programme => (
              <div key={programme.id} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium">{programme.name}</p>
                {programme.field && <p className="mt-1 text-xs text-muted-foreground">{programme.field}</p>}
              </div>
            )) : <p className="text-sm text-muted-foreground">No catalogue matches loaded yet.</p>}
          </div>
          <Link to="/programmes" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">Explore programmes <ArrowRight className="h-4 w-4" /></Link>
        </article>

        <article className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" /><h3 className="font-semibold">Institutions</h3></div>
          <p className="mt-1 text-xs text-muted-foreground">Places offering related routes</p>
          <div className="mt-4 space-y-2">
            {universityRows.length ? universityRows.map(university => (
              <div key={university.id} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium">{university.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{university.region ?? university.location ?? "Ghana"}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">No catalogue matches loaded yet.</p>}
          </div>
          <Link to="/universities" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">Compare institutions <ArrowRight className="h-4 w-4" /></Link>
        </article>

        <article className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" /><h3 className="font-semibold">Funding</h3></div>
          <p className="mt-1 text-xs text-muted-foreground">Scholarships related to your route</p>
          <div className="mt-4 space-y-2">
            {scholarshipRows.length ? scholarshipRows.map(scholarship => (
              <div key={scholarship.id} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium">{scholarship.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{scholarship.provider ?? "Scholarship provider"}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">No funding matches loaded yet.</p>}
          </div>
          <Link to="/scholarships" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">Find funding <ArrowRight className="h-4 w-4" /></Link>
        </article>
      </div>
    </section>
  );
}

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { careerPaths } from "@/data/careerPaths";
import { employersForMajor } from "@/data/employers";
import { CATEGORY_ORDER, skillById, skillMapForMajor } from "@/data/skillsMap";
import UniversityLogoCard from "@/components/UniversityLogoCard";
import EmployerPhoto from "@/components/EmployerPhoto";
import { isInstitutionGtecExpired2026 } from "@/hooks/useCatalogue";

const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);

function matchCareer(job: string) {
  const q = words(job);
  let best: (typeof careerPaths)[number] | undefined;
  let bestScore = 0;
  for (const c of careerPaths) {
    const hay = `${c.career_name} ${c.major} ${c.entry_level_roles.join(" ")} ${c.related_careers.join(" ")}`.toLowerCase();
    const score = q.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0) + (c.career_name.toLowerCase().includes(job.toLowerCase().trim()) ? 3 : 0);
    if (score > bestScore) { bestScore = score; best = c; }
  }
  return best;
}

export default function DreamJobOpportunities({ dreamJob }: { dreamJob: string }) {
  const career = useMemo(() => matchCareer(dreamJob), [dreamJob]);
  const terms = useMemo(() => (career ? [career.major, ...career.recommended_programmes].slice(0, 4) : [dreamJob]).filter(Boolean), [career, dreamJob]);

  const { data, isLoading } = useQuery({
    queryKey: ["dream-job-opps", terms],
    queryFn: async () => {
      const or = terms.map((t) => `name.ilike.%${t.replace(/[,()%]/g, " ").trim()}%`).join(",");
      const { data: progs } = await supabase.from("programmes").select("id,slug,name,degree_type,university_id,verified").or(or).eq("verified", true).limit(60);
      const ids = Array.from(new Set((progs ?? []).map((p) => p.university_id).filter(Boolean))) as string[];
      const { data: unis } = ids.length
        ? await supabase.from("universities").select("id,slug,name,location,region,google_place_id,accreditation_status,website_url,logo_source_url,logo_url").in("id", ids)
        : { data: [] };
      const accredited = (unis ?? []).filter((u) => !isInstitutionGtecExpired2026(u));
      const okIds = new Set(accredited.map((u) => u.id));
      return { programmes: (progs ?? []).filter((p) => okIds.has(p.university_id as string)).slice(0, 9), universities: accredited.slice(0, 6) };
    },
    staleTime: 300_000,
  });

  const employers = career ? employersForMajor(career.major).slice(0, 6) : [];
  const map = career ? skillMapForMajor(career.major) : undefined;
  const skills = map ? CATEGORY_ORDER.flatMap((c) => map[c] ?? []).map((id) => skillById(id)).filter((s): s is NonNullable<typeof s> => Boolean(s)).slice(0, 12) : [];
  const uniName = (id: string | null) => data?.universities.find((u) => u.id === id)?.name ?? "";

  return (
    <section className="mb-10 space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Real options for {career?.career_name ?? dreamJob}</p>
        <p className="text-sm text-muted-foreground mt-1">Accredited institutions, verified programmes, Ghanaian employers and skills connected to this career.</p>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold mb-3">Accredited universities</h3>
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : data?.universities.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.universities.map((u) => (
              <Link key={u.id} to={`/university/${u.slug}`} className="block rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40">
                <UniversityLogoCard name={u.name} location={u.location ?? u.region} websiteUrl={u.website_url} logoUrl={u.logo_source_url ?? u.logo_url} showMapLink={false} className="rounded-none" />
                <div className="p-3"><p className="text-sm font-semibold">{u.name}</p><p className="text-xs text-muted-foreground">{u.region ?? u.location ?? "Ghana"}</p></div>
              </Link>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">No verified institution matches yet. <Link to="/programmes" className="text-primary underline">Browse all programmes</Link>.</p>}
      </div>

      {!!data?.programmes.length && (
        <div>
          <h3 className="font-display text-lg font-semibold mb-3">Verified programmes</h3>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.programmes.map((p) => (
              <li key={p.id}><Link to={`/programmes/${p.slug}`} className="block rounded-lg border border-border bg-card p-3 hover:border-primary/40"><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground mt-0.5">{[p.degree_type, uniName(p.university_id)].filter(Boolean).join(" · ")}</p></Link></li>
            ))}
          </ul>
        </div>
      )}

      {employers.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-semibold mb-3">Internships & employers</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {employers.map((e) => (
              <Link key={e.id} to={`/internships/${e.id}`} className="block rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40">
                <EmployerPhoto name={e.name} location={e.locations[0]} />
                <div className="p-3"><p className="text-sm font-semibold">{e.name}</p><p className="text-xs text-muted-foreground">{e.sector} · {e.timing}</p></div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-semibold mb-3">Skills to build</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => <Link key={s.id} to={`/skills/${s.id}`} className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-primary hover:text-primary">{s.name}</Link>)}
          </div>
        </div>
      )}
    </section>
  );
}

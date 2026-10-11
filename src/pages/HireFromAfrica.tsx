import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import Navbar from "@/components/Navbar";
import { ArrowUpRight, BriefcaseBusiness, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const card = "border border-border bg-card p-4";

const HireFromAfrica = () => {
  const people = useQuery({
    queryKey: ["hire-africa-people"],
    queryFn: async () => {
      // Use the same consent-based public directory as People Building Africa.
      const { data, error } = await supabase
        .from("talent_directory")
        .select("user_id,full_name,professional_title,years_experience,city,skills,bio,linkedin_url,discoverable,updated_at")
        .eq("discoverable", true)
        .order("updated_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });

  const jobs = useQuery({
    queryKey: ["hire-africa-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("id,title,company_name,organisation,country,city,remote,work_mode,application_url,apply_url,source_url,verified,deadline_date,posted_at")
        .or("is_active.eq.true,published.eq.true")
        .order("posted_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 180_000,
  });

  return (
    <div className="min-h-screen bg-background pt-20 pb-24">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 border-b border-border pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Global connection</p>
          <h1 className="mt-2 text-3xl font-bold">Hire From Africa</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Find professionals who have chosen public visibility, then explore current opportunities and source links. Private profiles are not listed.
          </p>
          <Link to="/people" className="mt-4 inline-flex items-center gap-2 border border-border px-4 py-2.5 text-sm font-semibold">
            Explore People Building Africa <ArrowUpRight className="h-4 w-4" />
          </Link>
        </header>

        <section className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Discoverable professionals</h2>
            <span className="text-xs text-muted-foreground">{people.data?.length ?? 0}</span>
          </div>
          {people.isLoading ? (
            <p className={card + " text-sm text-muted-foreground"}>Loading public professional profiles…</p>
          ) : people.isError ? (
            <p className={card + " text-sm text-destructive"}>We could not load public profiles. Please refresh and try again.</p>
          ) : people.data?.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {people.data.map((person) => (
                <article key={person.user_id} className={card}>
                  <h3 className="font-semibold">{person.full_name || "Professional"}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {person.professional_title || "Professional"}
                    {person.city ? " · " + person.city : ""}
                    {person.years_experience != null ? " · " + person.years_experience + " years experience" : ""}
                  </p>
                  {person.skills?.length > 0 && <p className="mt-3 text-xs leading-5 text-muted-foreground">{person.skills.slice(0, 8).join(" · ")}</p>}
                  {person.bio && <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{person.bio}</p>}
                  {person.linkedin_url && <a href={person.linkedin_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">LinkedIn <ArrowUpRight className="h-3.5 w-3.5" /></a>}
                </article>
              ))}
            </div>
          ) : (
            <div className={card + " border-dashed"}>
              <h3 className="font-semibold">The public talent directory is just getting started</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                There are no opted-in professional profiles yet. We keep this list consent-based. Job seekers can create a profile and choose discoverability; it will be published only after they save that choice.
              </p>
              <Link to="/onboarding?role=employee" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Create a discoverable profile <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <BriefcaseBusiness className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Current work opportunities</h2>
          </div>
          {jobs.isLoading ? (
            <p className={card + " text-sm text-muted-foreground"}>Loading opportunities…</p>
          ) : jobs.isError ? (
            <p className={card + " text-sm text-destructive"}>We could not load opportunities. Please refresh and try again.</p>
          ) : jobs.data?.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {jobs.data.map((job) => (
                <article key={job.id} className={card}>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {job.company_name || job.organisation || "Organisation"} · {[job.city, job.country].filter(Boolean).join(", ") || "Africa"}
                    {job.remote || job.work_mode === "Remote" ? " · Remote" : ""}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">{job.work_mode || "Opportunity"}{job.deadline_date ? " · Deadline " + new Date(job.deadline_date).toLocaleDateString() : ""}</p>
                  {job.verified && <p className="mt-2 text-[11px] font-medium text-primary">Verified source</p>}
                  {(job.apply_url || job.application_url || job.source_url) && (
                    <a href={job.apply_url || job.application_url || job.source_url || "#"} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                      Open opportunity <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className={card + " text-sm text-muted-foreground"}>
              No current opportunities are listed. <Link to="/opportunities" className="font-semibold text-primary">Browse the opportunity directory</Link>.
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HireFromAfrica;

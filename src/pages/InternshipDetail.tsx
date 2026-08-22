import { useEffect, useState } from "react";
import { Link, useParams } from "@/lib/router-compat";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import SaveButton from "@/components/SaveButton";
import OfficialLink from "@/components/OfficialLink";
import { ArrowLeft, Building, Briefcase, GraduationCap } from "@/lib/icons";
import { employerById, qualificationsFor, applyStepsFor, checklistFor, downloadIcs } from "@/lib/internships";

const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="bg-glass rounded-xl p-4 mb-3">
    <h2 className="flex items-center gap-2 font-display font-semibold text-foreground mb-2 text-sm sm:text-base">
      {icon}
      {title}
    </h2>
    {children}
  </section>
);

const InternshipDetail = () => {
  const { id } = useParams<{ id: string }>();
  const employer = employerById(id ?? "");
  const storageKey = `gpf.internship.checklist.${id ?? ""}`;

  const [done, setDone] = useState<string[]>([]);
  const [reminder, setReminder] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      setDone(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setDone([]);
    }
  }, [storageKey]);

  const toggle = (key: string) => {
    setDone((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* storage unavailable , checklist stays in memory */
      }
      return next;
    });
  };

  if (!employer) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 px-4 text-center">
          <h1 className="font-display text-xl font-semibold text-foreground mb-2">
            Opportunity not found
          </h1>
          <Link to="/internships" className="text-sm text-primary">
            Browse all internships and employers
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const items = checklistFor(employer);
  const progress = Math.round((done.length / items.length) * 100);
  const path = `/internships/${employer.id}`;
  const description = `${employer.name} , ${employer.opportunities.join(", ").toLowerCase()} in ${employer.locations.join(", ")}. Required qualifications, how to apply and a checklist for Ghanaian students.`;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${employer.name} Internships & Graduate Opportunities in Ghana | GhanaPathFinder`}
        description={description.slice(0, 155)}
        path={path}
        jsonLd={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Internships", path: "/internships" },
            { name: employer.name, path },
          ]),
        ]}
      />
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/internships"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5"
          >
            <ArrowLeft className="h-4 w-4" /> All internships
          </Link>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {employer.name}
          </h1>
          <p className="text-xs text-muted-foreground mb-3">
            {employer.sector} · {employer.locations.join(", ")}
          </p>
          <p className="text-sm text-muted-foreground mb-4 max-w-3xl">{employer.about}</p>

          <ul className="flex flex-wrap gap-1.5 mb-4">
            {employer.opportunities.map((o) => (
              <li key={o} className="rounded-full bg-primary/10 text-primary px-2.5 py-1 text-[11px]">
                {o}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-2 mb-6">
            <OfficialLink href={employer.url} label="Apply on official page" />
            <SaveButton
              item={{
                item_type: "career",
                item_key: `employer:${employer.id}`,
                title: employer.name,
                subtitle: `${employer.sector} · ${employer.opportunities[0] ?? "Opportunity"}`,
                metadata: { url: employer.url, locations: employer.locations },
              }}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Section title="Required qualifications" icon={<GraduationCap className="h-4 w-4 text-primary" />}>
              <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                {qualificationsFor(employer).map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Guidance based on standard Ghanaian recruitment practice , confirm exact criteria on
                the official page.
              </p>
            </Section>

            <Section title="How to apply" icon={<Briefcase className="h-4 w-4 text-primary" />}>
              <ol className="list-decimal pl-4 text-sm text-muted-foreground space-y-1">
                {applyStepsFor(employer).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <p className="mt-2 text-[11px] text-muted-foreground">{employer.timing}</p>
            </Section>
          </div>

          <Section title="My application checklist">
            <div className="mb-3">
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {done.length} of {items.length} done , saved on this device.
              </p>
            </div>
            <ul className="space-y-2">
              {items.map((item) => {
                const checked = done.includes(item.id);
                return (
                  <li key={item.id}>
                    <label className="flex items-start gap-2.5 text-sm text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(item.id)}
                        className="mt-0.5 h-4 w-4 accent-primary"
                      />
                      <span className={checked ? "line-through opacity-60" : ""}>{item.label}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </Section>

          <Section title="Deadline reminder">
            <p className="text-sm text-muted-foreground mb-2">
              Pick the date you want to be reminded to apply or follow up, then add it to your phone
              or Google Calendar.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                aria-label="Reminder date"
                className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground"
              />
              <button
                type="button"
                onClick={() => {
                  if (!reminder) {
                    toast.info("Pick a date first.");
                    return;
                  }
                  downloadIcs(employer, new Date(`${reminder}T09:00:00`));
                  toast.success("Calendar reminder downloaded , open it to add the event.");
                }}
                className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
              >
                Add calendar reminder
              </button>
            </div>
          </Section>

          <Section title="Related" icon={<Building className="h-4 w-4 text-primary" />}>
            <div className="flex flex-wrap gap-2">
              {employer.majors.map((m) => (
                <Link
                  key={m}
                  to={`/search?q=${encodeURIComponent(m)}`}
                  className="rounded-full bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  {m}
                </Link>
              ))}
            </div>
          </Section>

          <p className="mt-6 text-[11px] text-muted-foreground">
            GhanaPathFinder does not recruit for any organisation and takes no fees. Apply only
            through {employer.name}'s official page.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InternshipDetail;

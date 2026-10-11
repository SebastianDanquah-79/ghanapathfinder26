import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, Plus } from "@/lib/icons";
import { toast } from "sonner";
import PortalShell from "./PortalShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type OpportunityType = "job" | "internship" | "apprenticeship" | "fellowship" | "grant";

const inputClass = "w-full min-h-11 border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
const labelClass = "block text-xs font-medium text-muted-foreground";

export default function EmployerPortal() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [opportunityType, setOpportunityType] = useState<OpportunityType>("job");
  const [organisationName, setOrganisationName] = useState("");
  const [countryCode, setCountryCode] = useState("GH");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [skills, setSkills] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  const employerProfile = useQuery({
    queryKey: ["employer-profile", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("employer_profiles")
        .select("organization_name,organization_type,hiring_focus")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const ownOpportunities = useQuery({
    queryKey: ["employer-own-opportunities", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("opportunities")
        .select("id,title,status,opportunity_type,company_name,posted_at,deadline_date,application_url")
        .eq("posted_by", user.id)
        .order("posted_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data ?? [];
    },
  });

  const submitOpportunity = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      toast.error("Sign in to submit an opportunity.");
      return;
    }
    const cleanTitle = title.trim();
    const cleanOrganisation = organisationName.trim() || employerProfile.data?.organization_name?.trim() || "";
    const cleanDescription = description.trim();
    if (!cleanTitle || !cleanOrganisation || !cleanDescription) {
      toast.error("Add the opportunity title, organisation name and description.");
      return;
    }
    if (applicationUrl.trim()) {
      try {
        const parsed = new URL(applicationUrl.trim());
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("Invalid protocol");
      } catch {
        toast.error("Use a valid HTTPS or HTTP application link.");
        return;
      }
    }

    setSaving(true);
    const deadlineIso = deadline ? new Date(deadline + "T23:59:59Z").toISOString() : null;
    const skillList = skills.split(",").map(value => value.trim()).filter(Boolean).slice(0, 30);
    const { error } = await supabase.from("opportunities").insert({
      title: cleanTitle,
      opportunity_type: opportunityType,
      type: opportunityType,
      company_name: cleanOrganisation,
      organisation: cleanOrganisation,
      country_code: countryCode.trim().toUpperCase() || "GH",
      country: countryCode.trim().toUpperCase() || "GH",
      location: location.trim() || null,
      city: location.trim() || null,
      remote,
      is_remote: remote,
      work_mode: remote ? "remote" : "onsite",
      employment_type: opportunityType === "job" ? employmentType : opportunityType,
      description: cleanDescription,
      requirements: requirements.trim() || null,
      skills: skillList,
      skills_required: skillList,
      application_url: applicationUrl.trim() || null,
      apply_url: applicationUrl.trim() || null,
      deadline: deadlineIso,
      deadline_date: deadlineIso,
      posted_by: user.id,
      posted_at: new Date().toISOString(),
      status: "pending_review",
      is_active: false,
      published: false,
      verified: false,
    });
    setSaving(false);
    if (error) {
      console.error("Opportunity submission failed", error);
      toast.error(error.message.includes("row-level security") ? "Only an active employer account can submit opportunities." : "Your opportunity could not be submitted. Please check the fields and try again.");
      return;
    }
    toast.success("Submitted for review. It will appear publicly after approval.");
    setTitle("");
    setOpportunityType("job");
    setLocation("");
    setRemote(false);
    setEmploymentType("Full-time");
    setDescription("");
    setRequirements("");
    setSkills("");
    setApplicationUrl("");
    setDeadline("");
    await qc.invalidateQueries({ queryKey: ["employer-own-opportunities", user.id] });
    await qc.invalidateQueries({ queryKey: ["opportunity-radar"] });
  };

  return (
    <PortalShell role="employer">
      <section id="post-opportunity" className="mt-6 border border-border bg-card p-5 sm:p-6">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Hiring workspace</p>
          <h2 className="mt-1 text-xl font-bold">Submit an opportunity</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Add a job, internship, apprenticeship, fellowship or grant. New submissions stay private while they are reviewed, then become visible in the public directory after approval.
          </p>
        </div>
        <form onSubmit={submitOpportunity} className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>Opportunity title *
            <input className={inputClass + " mt-1"} required maxLength={140} value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. Junior Data Analyst" />
          </label>
          <label className={labelClass}>Organisation name *
            <input className={inputClass + " mt-1"} required maxLength={140} value={organisationName || employerProfile.data?.organization_name || ""} onChange={event => setOrganisationName(event.target.value)} placeholder="Your organisation" />
          </label>
          <label className={labelClass}>Opportunity type
            <select className={inputClass + " mt-1"} value={opportunityType} onChange={event => setOpportunityType(event.target.value as OpportunityType)}>
              <option value="job">Job</option>
              <option value="internship">Internship</option>
              <option value="apprenticeship">Apprenticeship</option>
              <option value="fellowship">Fellowship</option>
              <option value="grant">Grant</option>
            </select>
          </label>
          <label className={labelClass}>Employment type
            <select className={inputClass + " mt-1"} value={employmentType} onChange={event => setEmploymentType(event.target.value)}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Temporary</option>
              <option>Internship</option>
              <option>Apprenticeship</option>
            </select>
          </label>
          <label className={labelClass}>Country code
            <input className={inputClass + " mt-1"} maxLength={2} value={countryCode} onChange={event => setCountryCode(event.target.value.toUpperCase().replace(/[^A-Z]/g, ""))} placeholder="GH" />
          </label>
          <label className={labelClass}>City or location
            <input className={inputClass + " mt-1"} maxLength={120} value={location} onChange={event => setLocation(event.target.value)} placeholder="e.g. Accra or Remote" />
          </label>
          <label className={labelClass}>Application deadline
            <input className={inputClass + " mt-1"} type="date" value={deadline} onChange={event => setDeadline(event.target.value)} />
          </label>
          <label className={labelClass}>Application link (optional)
            <input className={inputClass + " mt-1"} type="url" maxLength={500} value={applicationUrl} onChange={event => setApplicationUrl(event.target.value)} placeholder="https://..." />
          </label>
          <label className="sm:col-span-2 flex min-h-11 items-center gap-3 border border-border px-3 py-2 text-sm">
            <input type="checkbox" checked={remote} onChange={event => setRemote(event.target.checked)} className="h-4 w-4" />
            Remote opportunity
          </label>
          <label className={labelClass + " sm:col-span-2"}>Description *
            <textarea className={inputClass + " mt-1 min-h-28 py-3"} required maxLength={8000} value={description} onChange={event => setDescription(event.target.value)} placeholder="Explain the role or opportunity, what the person will do, and who should apply." />
          </label>
          <label className={labelClass + " sm:col-span-2"}>Requirements (optional)
            <textarea className={inputClass + " mt-1 min-h-20 py-3"} maxLength={5000} value={requirements} onChange={event => setRequirements(event.target.value)} placeholder="Qualifications, experience or eligibility requirements." />
          </label>
          <label className={labelClass + " sm:col-span-2"}>Skills, comma-separated (optional)
            <input className={inputClass + " mt-1"} maxLength={1000} value={skills} onChange={event => setSkills(event.target.value)} placeholder="e.g. Excel, Python, communication" />
          </label>
          <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="max-w-xl text-xs leading-5 text-muted-foreground">Posting is subject to review. Submissions are not marked as verified and are not public until approved.</p>
            <button type="submit" disabled={saving} className="inline-flex min-h-11 items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {saving ? "Submitting…" : "Submit for review"}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Your submissions</h2>
            <p className="mt-1 text-sm text-muted-foreground">Review your own posts and their publication status.</p>
          </div>
          <button type="button" onClick={() => void ownOpportunities.refetch()} className="border border-border px-3 py-2 text-xs font-medium">Refresh</button>
        </div>
        {ownOpportunities.isLoading ? <p className="mt-4 text-sm text-muted-foreground">Loading your submissions…</p>
        : ownOpportunities.isError ? <p className="mt-4 text-sm text-destructive">Your submissions could not be loaded. Try refreshing.</p>
        : (ownOpportunities.data ?? []).length ? <div className="mt-4 divide-y divide-border">
          {(ownOpportunities.data ?? []).map(item => (
            <article key={item.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
              <div className="min-w-0">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{item.company_name || "Organisation"} · {item.opportunity_type || "Opportunity"}</p>
                {item.deadline_date && <p className="mt-1 text-xs text-muted-foreground">Deadline {new Date(item.deadline_date).toLocaleDateString("en-GB")}</p>}
                {item.application_url && <a href={item.application_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-primary">Application link <ExternalLink className="h-3 w-3" /></a>}
              </div>
              <span className={"border px-2.5 py-1 text-[11px] font-semibold " + (item.status === "active" || item.status === "published" ? "border-primary/40 text-primary" : "border-border text-muted-foreground")}>{item.status === "pending_review" ? "Pending review" : item.status === "active" || item.status === "published" ? "Public" : item.status}</span>
            </article>
          ))}
        </div>
        : <p className="mt-4 text-sm text-muted-foreground">You have not submitted any opportunities yet.</p>}
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <a className="border border-border bg-card p-4 hover:border-primary" href="/people"><p className="font-semibold">Find candidates</p><p className="mt-1 text-xs text-muted-foreground">Discover candidates who have chosen to make their profiles visible.</p></a>
        <a className="border border-border bg-card p-4 hover:border-primary" href="/onboarding?role=employer"><p className="font-semibold">Organisation profile</p><p className="mt-1 text-xs text-muted-foreground">Keep your employer information current.</p></a>
      </section>
    </PortalShell>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, CheckCircle2, Loader2, MessageCircle, ShieldCheck, Users, XCircle } from "lucide-react";
import CommunityComposer from "@/components/CommunityComposer";

type MentorForm = {
  full_name: string;
  institution: string;
  programme: string;
  study_stage: string;
  region: string;
  expertise: string;
  mentorship_modes: string[];
  biography: string;
  public_profile_url: string;
  mentor_confirmed_18_plus: boolean;
};

const initialForm: MentorForm = {
  full_name: "",
  institution: "",
  programme: "",
  study_stage: "tertiary_year_3",
  region: "",
  expertise: "",
  mentorship_modes: ["online"],
  biography: "",
  public_profile_url: "",
  mentor_confirmed_18_plus: false,
};

const fieldClass = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40";
const cardClass = "rounded-xl border border-border bg-card p-5";

const Mentorship = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const db = supabase as any;
  const queryClient = useQueryClient();
  const [form, setForm] = useState<MentorForm>(initialForm);
  const [applying, setApplying] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [adminReviewChecks, setAdminReviewChecks] = useState<Record<string, boolean>>({});

  const rolesQuery = useQuery({
    queryKey: ["mentorship-account-roles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db.from("user_roles").select("role").eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });
  const isAdmin = (rolesQuery.data ?? []).some((row: any) => row.role === "admin");

  const applicationQuery = useQuery({
    queryKey: ["mentor-application", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db.from("mentor_applications").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const mentorQuery = useQuery({
    queryKey: ["verified-mentor-directory"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db.from("mentor_directory")
        .select("user_id,full_name,institution,programme,study_stage,region,expertise,mentorship_modes,biography,verified_at")
        .eq("is_active", true)
        .order("verified_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });

  const requestsQuery = useQuery({
    queryKey: ["mentor-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db.from("mentor_requests")
        .select("id,student_id,mentor_id,topic,message,status,created_at,updated_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  const pendingApplicationsQuery = useQuery({
    queryKey: ["pending-mentor-applications"],
    enabled: !!user && isAdmin,
    queryFn: async () => {
      const { data, error } = await db.from("mentor_applications")
        .select("id,user_id,full_name,institution,programme,study_stage,region,expertise,mentorship_modes,biography,public_profile_url,mentor_confirmed_18_plus,created_at")
        .eq("application_status", "pending")
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  const myMentorProfile = useMemo(
    () => (mentorQuery.data ?? []).find((mentor: any) => mentor.user_id === user?.id),
    [mentorQuery.data, user?.id],
  );
  const myApplication = applicationQuery.data;

  useEffect(() => {
    if (!myApplication) return;
    setForm({
      full_name: myApplication.full_name ?? "",
      institution: myApplication.institution ?? "",
      programme: myApplication.programme ?? "",
      study_stage: myApplication.study_stage ?? "tertiary_year_3",
      region: myApplication.region ?? "",
      expertise: (myApplication.expertise ?? []).join(", "),
      mentorship_modes: myApplication.mentorship_modes ?? ["online"],
      biography: myApplication.biography ?? "",
      public_profile_url: myApplication.public_profile_url ?? "",
      mentor_confirmed_18_plus: Boolean(myApplication.mentor_confirmed_18_plus),
    });
  }, [myApplication]);
  const receivedRequests = (requestsQuery.data ?? []).filter((item: any) => item.mentor_id === user?.id);
  const sentRequests = (requestsQuery.data ?? []).filter((item: any) => item.student_id === user?.id);
  const visibleMentors = (mentorQuery.data ?? []).filter((mentor: any) => mentor.user_id !== user?.id);

  const updateForm = <K extends keyof MentorForm>(key: K, value: MentorForm[K]) => setForm((current) => ({ ...current, [key]: value }));
  const toggleMode = (mode: string) => updateForm("mentorship_modes", form.mentorship_modes.includes(mode) ? form.mentorship_modes.filter((value) => value !== mode) : [...form.mentorship_modes, mode]);
  const invalidateMentorship = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["mentor-application", user?.id] }),
      queryClient.invalidateQueries({ queryKey: ["verified-mentor-directory"] }),
      queryClient.invalidateQueries({ queryKey: ["mentor-requests", user?.id] }),
      queryClient.invalidateQueries({ queryKey: ["pending-mentor-applications"] }),
    ]);
  };

  const submitApplication = async () => {
    if (!user) return;
    if (!form.full_name.trim() || !form.institution.trim() || !form.biography.trim()) {
      toast.error("Add your name, university and a short biography.");
      return;
    }
    if (form.mentorship_modes.length === 0) {
      toast.error("Choose at least one way you can mentor.");
      return;
    }
    if (!form.mentor_confirmed_18_plus) {
      toast.error("The mentor programme is only for applicants aged 18 or older.");
      return;
    }
    setApplying(true);
    try {
      const { error } = await db.from("mentor_applications").upsert({
        user_id: user.id,
        full_name: form.full_name.trim().slice(0, 100),
        institution: form.institution.trim().slice(0, 160),
        programme: form.programme.trim().slice(0, 160) || null,
        study_stage: form.study_stage,
        region: form.region || null,
        expertise: form.expertise.split(",").map((value: string) => value.trim()).filter(Boolean).slice(0, 12),
        mentorship_modes: form.mentorship_modes,
        biography: form.biography.trim().slice(0, 900),
        public_profile_url: null,
        mentor_confirmed_18_plus: form.mentor_confirmed_18_plus,
        application_status: "pending",
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (error) throw error;
      toast.success("Your application has been submitted for review.");
      await invalidateMentorship();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Your application could not be submitted.");
    } finally {
      setApplying(false);
    }
  };

  const sendRequest = async () => {
    if (!user || !selectedMentor) return;
    if (topic.trim().length < 3 || message.trim().length < 10) {
      toast.error("Add a topic and a message of at least 10 characters.");
      return;
    }
    setSending(true);
    try {
      const { error } = await db.from("mentor_requests").insert({
        student_id: user.id,
        mentor_id: selectedMentor.user_id,
        topic: topic.trim().slice(0, 160),
        message: message.trim().slice(0, 1200),
      });
      if (error) throw error;
      setSelectedMentor(null);
      setTopic("");
      setMessage("");
      toast.success("Your mentorship request has been sent.");
      await invalidateMentorship();
    } catch (error) {
      const text = error instanceof Error ? error.message : "Your request could not be sent.";
      toast.error(/duplicate|unique/i.test(text) ? "You have already contacted this mentor." : text);
    } finally {
      setSending(false);
    }
  };

  const respondToRequest = async (id: string, status: "accepted" | "declined") => {
    const { error } = await db.from("mentor_requests").update({ status }).eq("id", id);
    if (error) toast.error("This request could not be updated.");
    else {
      toast.success(status === "accepted" ? "Request accepted." : "Request declined.");
      await invalidateMentorship();
    }
  };

  const reviewApplication = async (id: string, decision: "verified" | "rejected") => {
    const { error } = await db.rpc("admin_review_mentor_application", {
      p_application_id: id,
      p_decision: decision,
    });
    if (error) toast.error(error.message || "The application could not be reviewed.");
    else {
      toast.success(decision === "verified" ? "Mentor verified and added to the directory." : "Application marked as not approved.");
      await invalidateMentorship();
    }
  };

  if (!loading && !user) {
    void navigate("/auth?next=/mentorship", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background px-4 pb-16 pt-20 sm:px-8">
      <Seo title="Verified Local Mentors | GhanaPathFinder" description="Find opted-in, verified university students and fellows for peer-to-peer education and programme guidance." path="/mentorship" />
      <Navbar />
      <main className="mx-auto max-w-5xl">
        <header className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Community · Mentorship</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Learn from people a few steps ahead</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Connect with university students and technology fellows who have opted in and passed GhanaPathFinder's review. They can share experience about programmes, campus life, projects and career preparation. A mentor is not an admissions officer or an official university representative.</p>
          <div className="mt-4 flex flex-wrap gap-2"><Link to="/growth" className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold">Back to Growth OS</Link><Link to="/community" className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold">Student community</Link></div>
        </header>

        <div className="mb-5 flex items-start gap-3 rounded-xl border border-border bg-secondary/40 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-xs leading-5 text-muted-foreground">Only adult mentors (18+) can be listed, and an administrator must independently check identity and current institution or fellowship status before approval. Requests stay inside GhanaPathFinder. Do not share your home address, personal phone number, passwords or private documents. Do not arrange private meetings or move a mentorship conversation off-platform.</p>
        </div>

        <section className={cardClass + " mb-5"}>
          <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><h2 className="font-semibold">Verified local mentors</h2><span className="text-xs text-muted-foreground">{visibleMentors.length}</span></div>
          {mentorQuery.isLoading ? <p className="mt-4 text-sm text-muted-foreground">Loading verified mentors…</p> : mentorQuery.isError ? <p className="mt-4 text-sm text-destructive">Mentor profiles could not be loaded.</p> : visibleMentors.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {visibleMentors.map((mentor: any) => (
                <article key={mentor.user_id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-2"><div><h3 className="font-semibold">{mentor.full_name}</h3><p className="mt-1 text-xs text-muted-foreground">{mentor.institution}{mentor.programme ? ` · ${mentor.programme}` : ""}</p></div><BadgeCheck className="h-5 w-5 shrink-0 text-primary" aria-label="Verified mentor" /></div>
                  <p className="mt-2 text-xs text-muted-foreground">{mentor.study_stage}{mentor.region ? ` · ${mentor.region}` : ""}</p>
                  {mentor.expertise?.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{mentor.expertise.slice(0, 8).map((item: string) => <span key={item} className="rounded-full bg-secondary px-2 py-1 text-[10px] text-muted-foreground">{item}</span>)}</div>}
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{mentor.biography}</p>
                  <div className="mt-3 flex items-center justify-between gap-2"><span className="text-[10px] text-muted-foreground">{(mentor.mentorship_modes ?? []).join(" · ")}</span><button type="button" onClick={() => { setSelectedMentor(mentor); setTopic(""); setMessage(""); }} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"><MessageCircle className="h-3.5 w-3.5" /> Request a match</button></div>
                </article>
              ))}
            </div>
          ) : <div className="mt-4 rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">There are no verified mentors listed yet. Applications are reviewed before profiles become visible. You can still submit an application to be considered as a mentor.</div>}
        </section>

        {selectedMentor && (
          <section className={cardClass + " mb-5"}>
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">Request a mentorship match</h2><p className="mt-1 text-xs text-muted-foreground">To: {selectedMentor.full_name} · {selectedMentor.institution}</p></div><button type="button" onClick={() => setSelectedMentor(null)} className="text-xs text-muted-foreground underline">Close</button></div>
            <div className="mt-4 grid gap-3">
              <label className="text-xs text-muted-foreground">What do you want guidance about?
                <input className={fieldClass + " mt-1"} maxLength={160} value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. Choosing a Computer Science programme" />
              </label>
              <div className="space-y-1">
                <label className="block text-xs text-muted-foreground">Message</label>
                <CommunityComposer
                  value={message}
                  onChange={setMessage}
                  onSubmit={() => void sendRequest()}
                  placeholder="Briefly explain what advice you are looking for. Do not include private contact details."
                  actionLabel="Send mentorship request"
                  helperText="Keep contact details private"
                  canSubmit={topic.trim().length >= 3 && message.trim().length >= 10}
                  isSending={sending}
                  rows={3}
                  maxLength={1200}
                />
              </div>
            </div>
          </section>
        )}

        <section className={cardClass + " mb-5"}>
          <div className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-primary" /><h2 className="font-semibold">My mentorship requests</h2></div>
          {requestsQuery.isLoading ? <p className="mt-3 text-sm text-muted-foreground">Loading requests…</p> : (
            <div className="mt-3 space-y-2">
              {receivedRequests.map((item: any) => <article key={item.id} className="rounded-lg border border-border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">Incoming request · {item.topic}</p><span className="text-xs capitalize text-muted-foreground">{item.status}</span></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.message}</p>{item.status === "pending" && <div className="mt-3 flex gap-2"><button type="button" onClick={() => void respondToRequest(item.id, "accepted")} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Accept</button><button type="button" onClick={() => void respondToRequest(item.id, "declined")} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold">Decline</button></div>}</article>)}
              {sentRequests.map((item: any) => <article key={item.id} className="rounded-lg border border-border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">Sent request · {item.topic}</p><span className="text-xs capitalize text-muted-foreground">{item.status}</span></div><p className="mt-1 text-xs text-muted-foreground">{item.message}</p></article>)}
              {!receivedRequests.length && !sentRequests.length && <p className="text-sm text-muted-foreground">Your requests will appear here.</p>}
            </div>
          )}
        </section>

        {!myMentorProfile && (
          <section className={cardClass + " mb-5"}>
            <div className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-primary" /><h2 className="font-semibold">Apply to become a mentor</h2></div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">For university students, graduates and technology fellows aged 18 or older who can give responsible, practical peer guidance online. Submitting an application does not make a profile public. An administrator must independently check identity, age eligibility and institution or fellowship status before approval.</p>
            {myApplication && <p className="mt-3 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">Application status: <strong className="capitalize text-foreground">{myApplication.application_status}</strong>{myApplication.application_status === "pending" ? " · Awaiting review." : myApplication.application_status === "rejected" ? " · You may revise and resubmit your application." : ""}</p>}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-muted-foreground">Full name<input className={fieldClass + " mt-1"} value={form.full_name} onChange={(event) => updateForm("full_name", event.target.value)} maxLength={100} /></label>
              <label className="text-xs text-muted-foreground">University or fellowship institution<input className={fieldClass + " mt-1"} value={form.institution} onChange={(event) => updateForm("institution", event.target.value)} maxLength={160} /></label>
              <label className="text-xs text-muted-foreground">Programme or area<input className={fieldClass + " mt-1"} value={form.programme} onChange={(event) => updateForm("programme", event.target.value)} maxLength={160} /></label>
              <label className="text-xs text-muted-foreground">Current stage<select className={fieldClass + " mt-1"} value={form.study_stage} onChange={(event) => updateForm("study_stage", event.target.value)}><option value="tertiary_year_2">Tertiary · Year 2</option><option value="tertiary_year_3">Tertiary · Year 3</option><option value="tertiary_year_4">Tertiary · Year 4</option><option value="tertiary_year_5_plus">Tertiary · Year 5+</option><option value="fellow">Technology fellow</option><option value="graduate">Graduate</option></select></label>
              <label className="text-xs text-muted-foreground">Region<input className={fieldClass + " mt-1"} value={form.region} onChange={(event) => updateForm("region", event.target.value)} maxLength={60} placeholder="e.g. Greater Accra" /></label>
              <label className="text-xs text-muted-foreground sm:col-span-2">Areas you can advise on (comma separated)<input className={fieldClass + " mt-1"} value={form.expertise} onChange={(event) => updateForm("expertise", event.target.value)} maxLength={400} placeholder="Programme choices, campus life, software development, scholarships" /></label>
              <label className="text-xs text-muted-foreground sm:col-span-2">Short biography<textarea className={fieldClass + " mt-1 min-h-24 resize-y"} value={form.biography} onChange={(event) => updateForm("biography", event.target.value)} maxLength={900} placeholder="Describe what you study or do and what guidance you can offer." /></label>
            </div>
            <div className="mt-3"><p className="text-xs font-semibold">Mentorship format</p><p className="mt-1 text-xs text-muted-foreground">Online requests and guidance through GhanaPathFinder only.</p></div>
            <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><input type="checkbox" checked={form.mentor_confirmed_18_plus} onChange={(event) => updateForm("mentor_confirmed_18_plus", event.target.checked)} className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]" />I confirm that I am at least 18 years old. I understand that GhanaPathFinder will independently review my identity and institution or fellowship status before any profile can be listed.</label>
            <button type="button" onClick={() => void submitApplication()} disabled={applying || myApplication?.application_status === "pending"} className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">{applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} {myApplication?.application_status === "pending" ? "Application under review" : "Submit for verification"}</button>
          </section>
        )}

        {myMentorProfile && <div className={cardClass + " mb-5"}><p className="flex items-center gap-2 font-semibold"><BadgeCheck className="h-5 w-5 text-primary" /> Your mentor profile is verified and listed.</p><p className="mt-1 text-xs text-muted-foreground">You can receive requests here and accept or decline each request.</p></div>}

        {isAdmin && (
          <section className={cardClass + " mb-5"}>
            <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">Administrator · Mentor verification queue</h2><p className="mt-1 text-xs text-muted-foreground">Check identity, current institution or fellowship status, age eligibility and suitability before approval.</p></div><span className="text-xs text-muted-foreground">{pendingApplicationsQuery.data?.length ?? 0} pending</span></div>
            {pendingApplicationsQuery.isLoading ? <p className="mt-3 text-sm text-muted-foreground">Loading applications…</p> : pendingApplicationsQuery.data?.length ? <div className="mt-3 space-y-3">
              {pendingApplicationsQuery.data.map((application: any) => <article key={application.id} className="rounded-lg border border-border p-4"><h3 className="font-semibold">{application.full_name}</h3><p className="mt-1 text-xs text-muted-foreground">{application.institution}{application.programme ? ` · ${application.programme}` : ""} · {application.study_stage}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{application.biography}</p><p className="mt-2 text-xs text-muted-foreground">Expertise: {(application.expertise ?? []).join(", ") || "Not provided"} · Modes: {(application.mentorship_modes ?? []).join(", ")}</p><label className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><input type="checkbox" checked={Boolean(adminReviewChecks[application.id])} onChange={(event) => setAdminReviewChecks((current) => ({ ...current, [application.id]: event.target.checked }))} className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]" />I independently checked this applicant’s identity, age (18+), and current university or fellowship status using reliable evidence. I will not store identity-document copies here.</label><div className="mt-3 flex gap-2"><button type="button" disabled={!application.mentor_confirmed_18_plus || !adminReviewChecks[application.id]} onClick={() => void reviewApplication(application.id, "verified")} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"><CheckCircle2 className="h-3.5 w-3.5" /> Verify and publish</button><button type="button" onClick={() => void reviewApplication(application.id, "rejected")} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold"><XCircle className="h-3.5 w-3.5" /> Reject</button></div></article>)}
            </div> : <p className="mt-3 text-sm text-muted-foreground">No mentor applications are waiting for review.</p>}
          </section>
        )}
      </main>
    </div>
  );
};

export default Mentorship;

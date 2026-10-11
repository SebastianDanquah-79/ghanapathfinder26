
import { ReactNode, useEffect, useMemo } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { ArrowRight, CheckCircle2, Loader2, RefreshCw, ShieldCheck } from "@/lib/icons";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import AskPanel from "@/components/AskPanel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type PortalRole = "student" | "employee" | "employer" | "founder" | "international-student";

const meta: Record<PortalRole, {title: string; description: string}> = {
  student: { title: "Student Dashboard", description: "Your academic profile, programme matches, scholarships and deadlines." },
  employee: { title: "Job Seeker Dashboard", description: "Your professional profile, skills, applications and work opportunities." },
  employer: { title: "Employer Dashboard", description: "Your organisation profile, hiring needs, opportunities and candidate matches." },
  founder: { title: "Startup Founder Dashboard", description: "Your startup profile, growth resources, grants and founder opportunities." },
  "international-student": { title: "International Student Dashboard", description: "Your qualifications, study destinations, programmes and admissions journey." }
};

function usePortal(role: PortalRole, userId: string | undefined) {
  return useQuery({
    queryKey: ["portal", role, userId],
    enabled: Boolean(userId),
    queryFn: async function() {
      if (!userId) throw new Error("Authentication required");
      const profileResult = await supabase.from("profiles").select("full_name,account_role,onboarding_complete,bio,skills,interests,target_career,preferred_locations,preferred_industries,preferred_opportunity_types,school,region,university,program,graduation_year,company,job_title,location,linkedin_url,github_url,portfolio_url").eq("id", userId).single();
      if (profileResult.error) throw profileResult.error;
      const profile = profileResult.data;
      const result: {profile: typeof profile; items: Array<Record<string, unknown>>; roleComplete: boolean; roleProfile: Record<string, unknown> | null} = { profile, items: [], roleComplete: Boolean(profile.onboarding_complete), roleProfile: null };

      if (role === "student") {
        const results = await Promise.all([
          supabase.from("deadlines").select("id,title,due_date,category").eq("user_id", userId).order("due_date").limit(5),
          supabase.from("scholarships").select("id,name,provider,deadline,description,application_url").order("deadline").limit(8)
        ]);
        if (results[0].error) throw results[0].error;
        if (results[1].error) throw results[1].error;
        result.roleProfile = { school: profile.school, region: profile.region, target_career: profile.target_career, interests: profile.interests };
        result.items = (results[0].data || []).map(function(x){return {...x,kind:"deadline"};}).concat((results[1].data || []).map(function(x){return {...x,kind:"scholarship"};}));
      }

      if (role === "employee") {
        const results = await Promise.all([
          supabase.from("employee_profiles").select("user_id,professional_title,employer_name,years_experience").eq("user_id", userId).maybeSingle(),
          supabase.from("opportunities").select("id,title,description,skills,category,location,remote,opportunity_type,company_name,application_url,deadline,status").in("status", ["active","published"]).order("posted_at", {ascending:false}).limit(50)
        ]);
        if (results[0].error) throw results[0].error;
        if (results[1].error) throw results[1].error;
        result.roleProfile = results[0].data as Record<string, unknown> | null;
        result.roleComplete = result.roleComplete && Boolean(results[0].data && results[0].data.professional_title);
        const terms = (profile.skills || []).concat(profile.interests || []).concat(profile.preferred_industries || []).map(function(x){return x.toLowerCase();});
        result.items = (results[1].data || []).map(function(x){
          const text = [x.title,x.description || "",x.category || "",x.location || ""].concat(x.skills || []).join(" ").toLowerCase();
          const score = terms.reduce(function(total,term){return total + (text.indexOf(term) >= 0 ? 1 : 0);},0);
          return {...x,score};
        }).sort(function(a,b){return Number(b.score || 0)-Number(a.score || 0);}).slice(0,8);
      }

      if (role === "employer") {
        const results = await Promise.all([
          supabase.from("employer_profiles").select("user_id,organization_name,organization_type,hiring_focus").eq("user_id", userId).maybeSingle(),
          supabase.from("directory_profiles").select("user_id,display_name,university,programme,field,skills,interests,portfolio_url,github_url,linkedin_url,open_to_opportunities,visibility").eq("visibility","public").eq("open_to_opportunities",true).limit(40)
        ]);
        if (results[0].error) throw results[0].error;
        if (results[1].error) throw results[1].error;
        result.roleProfile = results[0].data as Record<string, unknown> | null;
        result.roleComplete = result.roleComplete && Boolean(results[0].data && results[0].data.organization_name);
        const needs = (results[0].data?.hiring_focus || []).map(function(x){return x.toLowerCase();});
        result.items = (results[1].data || []).map(function(x){
          const score = (x.skills || []).filter(function(s){return needs.indexOf(s.toLowerCase()) >= 0;}).length;
          return {...x,score};
        }).sort(function(a,b){return Number(b.score || 0)-Number(a.score || 0);}).slice(0,8);
      }

      if (role === "founder") {
        const results = await Promise.all([
          supabase.from("founder_profiles").select("user_id,startup_name,sector,stage,website_url,pitch_url").eq("user_id", userId).maybeSingle(),
          supabase.from("opportunities").select("id,title,description,opportunity_type,application_url,deadline,status").in("status",["active","published"]).in("opportunity_type",["grant","fellowship"]).order("deadline").limit(20)
        ]);
        if (results[0].error) throw results[0].error;
        if (results[1].error) throw results[1].error;
        result.roleProfile = results[0].data as Record<string, unknown> | null;
        result.roleComplete = result.roleComplete && Boolean(results[0].data && results[0].data.startup_name && results[0].data.sector);
        result.items = (results[1].data || []).slice(0,12).map(function(x){return {...x,kind:"funding"};});
      }

      if (role === "international-student") {
        const results = await Promise.all([
          supabase.from("international_students").select("id,user_id,country_code,university_name,programme_name,academic_level,graduation_year,skills,interests,projects,portfolio_url,linkedin_url,github_url,open_to_collaboration,open_to_mentorship,looking_for_opportunities,visible").eq("user_id",userId).maybeSingle(),
          supabase.from("international_students").select("id,user_id,country_code,university_name,programme_name,academic_level,graduation_year,skills,interests,projects,portfolio_url,linkedin_url,github_url,open_to_collaboration,open_to_mentorship,looking_for_opportunities,visible").eq("visible",true).neq("user_id",userId).limit(20),
          supabase.from("international_universities").select("id,name,country_code,city,website_url,admissions_url,description,source_url,verified").eq("verified",true).limit(12),
          supabase.from("embassies").select("id,represents_country,represents_country_code,mission_type,address,official_website,visa_info_url").order("represents_country").limit(12)
        ]);
        for (const query of results) if (query.error) throw query.error;
        result.roleProfile = results[0].data as Record<string, unknown> | null;
        result.items = (results[1].data || []).map(function(x){return {...x,kind:"peer"};})
          .concat((results[2].data || []).map(function(x){return {...x,kind:"university"};}))
          .concat((results[3].data || []).map(function(x){return {...x,kind:"embassy"};}));
      }

      return result;
    }
  });
}

export default function PortalShell(props: {role: PortalRole; children?: ReactNode}) {
  const {user,loading} = useAuth();
  const navigate = useNavigate();
  const q = usePortal(props.role,user?.id);
  const currentMeta = meta[props.role];
  const complete = Boolean(q.data?.profile.onboarding_complete) && Boolean(q.data?.roleComplete);
  const profileKeys: Record<PortalRole, Array<[string, string]>> = {
    student: [["School", "school"], ["Region", "region"], ["Target career", "target_career"]],
    employee: [["Professional title", "professional_title"], ["Experience", "years_experience"], ["Current employer", "employer_name"]],
    employer: [["Organisation", "organization_name"], ["Organisation type", "organization_type"], ["Hiring focus", "hiring_focus"]],
    founder: [["Startup", "startup_name"], ["Sector", "sector"], ["Stage", "stage"], ["Website", "website_url"], ["Pitch deck", "pitch_url"]],
    "international-student": [["Country", "country_code"], ["University", "university_name"], ["Programme", "programme_name"], ["Academic level", "academic_level"], ["Graduation year", "graduation_year"]]
  };
  const roleProfileFields = profileKeys[props.role].map(function(field) {
    const value = q.data?.roleProfile?.[field[1]];
    const display = Array.isArray(value) ? value.join(", ") : value == null ? "" : String(value);
    return { label: field[0], value: display, key: field[1] };
  }).filter(function(field) { return Boolean(field.value); });
  const editRole = props.role === "founder" ? "startup_founder" : props.role === "international-student" ? "international_student" : props.role;
  useEffect(() => {
    const role = q.data?.profile.account_role;
    if (!user || !role || q.isLoading) return;
    const expected = role === "startup_founder" ? "/portal/founder" : role === "international_student" ? "/portal/international-student" : role === "student" || role === "employee" || role === "employer" ? "/portal/" + role : null;
    const current = props.role === "founder" ? "/portal/founder" : "/portal/" + props.role;
    if (expected && expected !== current) navigate(expected, { replace: true });
  }, [user, q.data?.profile.account_role, q.isLoading, props.role, navigate]);
  const askItems = useMemo(function(){
    return (q.data?.items || []).slice(0,8).map(function(item,index){
      return {id:String(item.id || item.user_id || index),title:String(item.title || item.name || item.display_name || "Record"),subtitle:String(item.description || item.company_name || item.university_name || ""),metadata:item};
    });
  },[q.data?.items]);

  if (loading || q.isLoading) return <div className="min-h-dvh grid place-items-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!user) { navigate("/auth",{replace:true}); return null; }
  if (q.isError || !q.data) return <div className="min-h-dvh grid place-items-center px-4 bg-background"><div className="text-center"><p className="font-semibold">Portal data could not be loaded.</p><button type="button" onClick={function(){void q.refetch();}} className="mt-4 inline-flex items-center gap-2 border border-border px-4 py-2 text-sm"><RefreshCw className="h-4 w-4" /> Retry</button></div></div>;

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <Seo title={currentMeta.title + " | GhanaPathFinder"} description={currentMeta.description} path={props.role === "founder" ? "/portal/founder" : "/portal/" + props.role} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        <header className="border-b border-border pb-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary">GhanaPathFinder</p>
              <h1 className="mt-2 text-3xl font-bold">{currentMeta.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{currentMeta.description}</p>
            </div>
            <button type="button" onClick={function(){navigate("/?switchRole=1");}} className="border border-border px-3 py-2 text-sm font-medium hover:border-primary">Change portal</button>
          </div>
        </header>

        {complete && <section className="mt-6 border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-primary">Your profile</p>
              <h2 className="mt-1 text-lg font-semibold">{props.role === "founder" ? "Your startup" : props.role === "international-student" ? "Your study profile" : props.role === "employer" ? "Your organisation" : props.role === "employee" ? "Your professional profile" : "Your student profile"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">This profile shapes the data and recommendations shown in this portal.</p>
            </div>
            <button type="button" onClick={function(){navigate("/onboarding?role=" + editRole);}} className="border border-border px-3 py-2 text-sm font-medium hover:border-primary">Edit profile</button>
          </div>
          {roleProfileFields.length > 0 ? <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roleProfileFields.map(function(field){return <div key={field.key} className="min-w-0 border-t border-border pt-3"><dt className="text-xs text-muted-foreground">{field.label}</dt><dd className="mt-1 break-words text-sm font-medium">{field.key === "website_url" || field.key === "pitch_url" ? <a href={field.value} target="_blank" rel="noreferrer" className="text-primary underline">{field.value}</a> : field.value}</dd></div>;})}
          </dl> : <p className="mt-4 text-sm text-muted-foreground">Add details to personalise this workspace.</p>}
        </section>}

        {!complete ? (
          <section className="mt-7 border border-primary/30 bg-primary/[0.04] p-6">
            <div className="flex gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div><h2 className="font-semibold">Complete your profile before recommendations</h2><p className="mt-2 text-sm text-muted-foreground">Your role-specific profile is the input to matching.</p><button type="button" onClick={function(){navigate("/onboarding?role=" + (props.role === "founder" ? "startup_founder" : props.role));}} className="mt-4 inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Complete profile <ArrowRight className="h-4 w-4" /></button></div>
            </div>
          </section>
        ) : (
          <section className="mt-7 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="border border-border bg-card p-5">
              <div className="flex items-center justify-between"><div><p className="text-xs font-semibold text-primary">Your workspace</p><h2 className="mt-1 text-xl font-semibold">Next useful actions</h2></div><CheckCircle2 className="h-5 w-5 text-primary"/></div>

              {props.role === "student" && <div className="mt-5 grid gap-3 sm:grid-cols-2"><Link to="/matcher" className="border border-border p-4 hover:border-primary"><p className="font-semibold">University matcher</p><p className="mt-1 text-xs text-muted-foreground">Run your admission match.</p></Link><Link to="/scholarships" className="border border-border p-4 hover:border-primary"><p className="font-semibold">Scholarships</p><p className="mt-1 text-xs text-muted-foreground">Find funding and track applications.</p></Link></div>}

              {props.role === "employee" && <div className="mt-5 grid gap-3 sm:grid-cols-2">{q.data.items.map(function(item){return <a key={String(item.id)} href={item.application_url ? String(item.application_url) : "#"} target={item.application_url ? "_blank" : undefined} rel="noreferrer" className="border border-border p-4 hover:border-primary"><p className="font-semibold">{String(item.title)}</p><p className="mt-1 text-xs text-muted-foreground">{String(item.company_name || "")}</p><p className="mt-2 text-xs text-primary">Profile match {String(item.score || 0)}</p></a>;})}</div>}

              {props.role === "employer" && <div className="mt-5 grid gap-3 sm:grid-cols-2">{q.data.items.map(function(item){return <Link key={String(item.user_id)} to="/people" className="border border-border p-4 hover:border-primary"><p className="font-semibold">{String(item.display_name)}</p><p className="mt-1 text-xs text-muted-foreground">{String(item.field || item.programme || "Candidate")}</p><p className="mt-2 text-xs text-primary">Skill fit {String(item.score || 0)}</p></Link>;})}</div>}

              {props.role === "founder" && <div className="mt-5 grid gap-3 sm:grid-cols-2">{q.data.items.map(function(item,index){return <a key={String(item.id || index)} href={item.website_url ? String(item.website_url) : item.application_url ? String(item.application_url) : "#"} target="_blank" rel="noreferrer" className="border border-border p-4 hover:border-primary"><p className="font-semibold">{String(item.name || item.title || "Founder resource")}</p><p className="mt-1 text-xs text-muted-foreground">{String(item.kind || "")}</p></a>;})}</div>}

              {props.role === "international-student" && <div className="mt-5 grid gap-3 sm:grid-cols-2">{q.data.items.filter(function(item){return item.kind !== "embassy";}).slice(0,10).map(function(item,index){return <div key={String(item.id || index)} className="border border-border p-4"><p className="font-semibold">{String(item.name || item.university_name || "International connection")}</p><p className="mt-1 text-xs text-muted-foreground">{String(item.country_code || item.programme_name || "")}</p></div>;})}</div>}

              {q.data.items.length === 0 && <div className="mt-5 border border-dashed border-border p-6 text-sm text-muted-foreground">There are no matching records yet. Check the wider directory and return after the next verified sync.</div>}
            </div>
            <aside className="border border-border bg-card p-4"><h2 className="font-semibold">Ask Africa</h2><p className="mt-1 text-xs text-muted-foreground">Ask about the records already on this portal.</p><div className="mt-4"><AskPanel query={currentMeta.title + ". Profile: " + JSON.stringify(q.data.profile) + ". Records: " + JSON.stringify(q.data.items.slice(0,8))} items={askItems} suggestions={["What should I do next?","Explain these matches","What is missing from my profile?"]} /></div></aside>
          </section>
        )}

        {props.children}
      </main>
    </div>
  );
}

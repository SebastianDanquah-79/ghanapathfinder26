import { useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import { FileText, Plus, Trash2, Download, Save, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";

type CvContent = { fullName:string; email:string; phone:string; location:string; linkedin:string; portfolio:string; summary:string; education:string; experience:string; skills:string; projects:string; certifications:string; };
type CvRecord = { id:string; title:string; target_role:string|null; template:string; content:CvContent; updated_at:string };
const blank: CvContent = { fullName:"",email:"",phone:"",location:"",linkedin:"",portfolio:"",summary:"",education:"",experience:"",skills:"",projects:"",certifications:"" };
const fields: {key:keyof CvContent;label:string;hint:string;multiline?:boolean}[] = [
 {key:"fullName",label:"Full name",hint:"Your name"},{key:"email",label:"Email",hint:"name@example.com"},{key:"phone",label:"Phone",hint:"+233 ..."},{key:"location",label:"Location",hint:"Accra, Ghana"},{key:"linkedin",label:"LinkedIn",hint:"https://linkedin.com/in/..."},{key:"portfolio",label:"Portfolio or GitHub",hint:"https://..."},{key:"summary",label:"Professional summary",hint:"A short introduction focused on the role you want.",multiline:true},{key:"education",label:"Education",hint:"Degree or qualification | Institution | Dates\nRelevant coursework, achievements",multiline:true},{key:"experience",label:"Experience",hint:"Role | Organisation | Dates\nDescribe your contributions and measurable outcomes.",multiline:true},{key:"skills",label:"Skills",hint:"Python, communication, research...",multiline:true},{key:"projects",label:"Projects",hint:"Project | Tools | Dates\nWhat you built and what it does.",multiline:true},{key:"certifications",label:"Certifications and awards",hint:"Certification | Issuer | Year",multiline:true}
];
const cvDb = supabase as any;

export default function CVBuilder() {
 const {user,loading} = useAuth();
 const [cvs,setCvs] = useState<CvRecord[]>([]);
 const [selected,setSelected] = useState<string|null>(null);
 const [title,setTitle] = useState("My CV");
 const [role,setRole] = useState("");
 const [template,setTemplate] = useState("classic");
 const [content,setContent] = useState<CvContent>(blank);
 const [busy,setBusy] = useState(false);
 const [loadingCvs,setLoadingCvs] = useState(true);

 const loadCvs = async () => {
  if(!user) { setCvs([]); setLoadingCvs(false); return; }
  setLoadingCvs(true);
  const {data,error} = await cvDb.from("candidate_cvs").select("id,title,target_role,template,content,updated_at").eq("user_id",user.id).order("updated_at",{ascending:false});
  if(error) toast.error("Could not load your CVs");
  else setCvs((data??[]) as CvRecord[]);
  setLoadingCvs(false);
 };
 useEffect(()=>{ if(!loading) void loadCvs(); },[user?.id,loading]);
 const reset = () => {setSelected(null);setTitle("My CV");setRole("");setTemplate("classic");setContent(blank);};
 const startNew = () => {reset();setSelected("new");};
 const editCv = (cv:CvRecord) => {setSelected(cv.id);setTitle(cv.title);setRole(cv.target_role??"");setTemplate(cv.template??"classic");setContent({...blank,...(cv.content??{})});};
 const save = async () => {
  if(!user) {toast.error("Sign in to save your CV");return;}
  if(!title.trim()) {toast.error("Add a title for this CV");return;}
  setBusy(true);
  const payload={user_id:user.id,title:title.trim(),target_role:role.trim()||null,template,content,updated_at:new Date().toISOString()};
  const result=selected && selected!=="new"
   ? await cvDb.from("candidate_cvs").update(payload).eq("id",selected).eq("user_id",user.id)
   : await cvDb.from("candidate_cvs").insert(payload);
  if(result.error) {
   console.error("CV save failed:", result.error);
   toast.error(result.error.message || "Could not save CV. Please try again.");
  } else {await track("cv_saved");toast.success("CV saved");reset();await loadCvs();}
  setBusy(false);
 };
 const remove = async (id:string) => {
  if(!user || !window.confirm("Delete this CV? This cannot be undone.")) return;
  const {error}=await cvDb.from("candidate_cvs").delete().eq("id",id).eq("user_id",user.id);
  if(error) toast.error("Could not delete CV");
  else {toast.success("CV deleted");if(selected===id)reset();await loadCvs();}
 };
 const exportPdf = () => {
  if(!content.fullName.trim()) {toast.error("Add your name before exporting");return;}
  void track("cv_exported", { refType: "pdf" });
  window.print();
 };
 if(loading) return <div className="min-h-screen bg-background"><Navbar/><div className="mx-auto max-w-5xl p-8 text-muted-foreground">Loading your account...</div></div>;
 if(!user) return <div className="min-h-screen bg-background"><Navbar/><main className="mx-auto max-w-xl px-5 py-20 text-center"><FileText className="mx-auto mb-4 h-10 w-10 text-primary"/><h1 className="text-2xl font-semibold">Build your CV</h1><p className="mt-2 text-muted-foreground">Sign in to create, save and download multiple CVs.</p><Link to="/auth?next=%2Fcv-builder" className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground">Sign in</Link></main></div>;
 return <div className="min-h-screen bg-background text-foreground"><div className="print:hidden"><Navbar/></div>
 <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
  <div className="mb-7 flex flex-wrap items-center justify-between gap-3 print:hidden"><div><p className="text-sm text-muted-foreground">Career tools / CV Builder</p><h1 className="mt-1 text-3xl font-bold tracking-tight">CV Builder</h1><p className="mt-2 text-muted-foreground">Create tailored CVs for different roles and opportunities.</p></div>{selected ? <button onClick={reset} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm"><ArrowLeft className="h-4 w-4"/>All CVs</button>:<button onClick={startNew} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4"/>Create CV</button>}</div>
  {!selected ? <section className="print:hidden"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Your CVs</h2><span className="text-sm text-muted-foreground">{cvs.length} saved</span></div>{loadingCvs?<div className="py-16 text-center text-muted-foreground">Loading saved CVs...</div>:cvs.length===0?<div className="rounded-2xl border border-dashed p-10 text-center"><FileText className="mx-auto mb-3 h-9 w-9 text-muted-foreground"/><h3 className="font-semibold">No CVs yet</h3><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Create a CV for an internship, graduate role, scholarship or a career opportunity. You can keep multiple versions.</p><button onClick={startNew} className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">Create your first CV</button></div>:<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cvs.map(cv=><article key={cv.id} className="rounded-xl border bg-card p-5"><div className="mb-4 flex items-start justify-between gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="h-5 w-5"/></div><button aria-label={`Delete ${cv.title}`} onClick={()=>void remove(cv.id)} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 className="h-4 w-4"/></button></div><h3 className="font-semibold">{cv.title}</h3><p className="mt-1 text-sm text-muted-foreground">{cv.target_role||"General CV"}</p><p className="mt-4 text-xs text-muted-foreground">Updated {new Date(cv.updated_at).toLocaleDateString()}</p><button onClick={()=>editCv(cv)} className="mt-4 w-full rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted">Edit CV</button></article>)}</div>}</section>
  : <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.85fr)] print:block">
   <section className="space-y-5 print:hidden">
    <div className="rounded-xl border bg-card p-5"><h2 className="mb-4 font-semibold">{selected==="new"?"New CV":"Edit CV"}</h2><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">CV title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Software Engineering Internship" className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 font-normal"/></label><label className="text-sm font-medium">Target role<input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Junior Software Engineer" className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 font-normal"/></label><label className="text-sm font-medium sm:col-span-2">Template<select value={template} onChange={e=>setTemplate(e.target.value)} className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 font-normal"><option value="classic">Classic</option><option value="modern">Modern</option></select></label></div></div>
    {fields.map(f=><div key={f.key} className="rounded-xl border bg-card p-5"><label className="block text-sm font-semibold" htmlFor={f.key}>{f.label}</label>{f.multiline?<textarea id={f.key} value={content[f.key]} onChange={e=>setContent(old=>({...old,[f.key]:e.target.value}))} placeholder={f.hint} rows={f.key==="summary"?4:5} className="mt-2 w-full resize-y rounded-lg border bg-background px-3 py-2.5 text-sm font-normal leading-relaxed"/>:<input id={f.key} value={content[f.key]} onChange={e=>setContent(old=>({...old,[f.key]:e.target.value}))} placeholder={f.hint} className="mt-2 w-full rounded-lg border bg-background px-3 py-2.5 text-sm font-normal"/>}</div>)}
    <div className="flex flex-wrap gap-3"><button onClick={()=>void save()} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{busy?<Loader2 className="h-4 w-4 animate-spin"/>:<Save className="h-4 w-4"/>}{busy?"Saving...":"Save CV"}</button><button onClick={exportPdf} className="inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold"><Download className="h-4 w-4"/>Download PDF</button></div>
   </section>
   <section className="min-w-0 lg:sticky lg:top-5 print:static"><div className="mb-2 flex items-center justify-between text-xs text-muted-foreground print:hidden"><span>Live preview</span><span>Use Download PDF, then choose “Save as PDF” in the print dialog.</span></div><article id="cv-print" className={`mx-auto min-h-[800px] w-full max-w-[800px] bg-white p-8 text-slate-800 shadow-lg sm:p-10 print:min-h-0 print:max-w-none print:p-0 print:shadow-none ${template==="modern"?"border-t-8 border-slate-700":""}`}><header className="border-b border-slate-200 pb-5"><h2 className="text-3xl font-bold tracking-tight">{content.fullName||"Your Name"}</h2><p className="mt-1 text-sm font-medium text-slate-600">{role||"Professional Profile"}</p><p className="mt-3 break-words text-xs leading-relaxed text-slate-600">{[content.email,content.phone,content.location,content.linkedin,content.portfolio].filter(Boolean).join("  | ")||"Email | Phone | Location | LinkedIn"}</p></header>{(["summary","education","experience","skills","projects","certifications"] as (keyof CvContent)[]).map(key=>{const labels:Record<string,string>={summary:"Profile",education:"Education",experience:"Experience",skills:"Skills",projects:"Projects",certifications:"Certifications & Awards"};const val=content[key];return <section key={key} className="mt-5 break-inside-avoid"><h3 className="mb-2 border-b border-slate-200 pb-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-700">{labels[key]}</h3><p className="whitespace-pre-line break-words text-sm leading-relaxed text-slate-700">{val||(`Add your ${(labels[key] ?? key).toLowerCase()} here`)}</p></section>})}</article></section>
  </div>}
 </main>
 <style>{`@media print { @page { size: A4; margin: 16mm; } body { background: white !important; } body * { visibility: hidden; } #cv-print, #cv-print * { visibility: visible; } #cv-print { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
 </div>;
}

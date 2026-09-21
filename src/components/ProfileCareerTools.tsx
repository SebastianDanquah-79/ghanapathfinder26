import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Linkedin, Save, Sparkles } from "@/lib/icons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function ProfileCareerTools() {
  const { user } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [cvId, setCvId] = useState<string | null>(null);
  const [cvName, setCvName] = useState("My CV");
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("avatar_url,linkedin_url").eq("id", user.id).maybeSingle().then(({ data }) => {
      setAvatar(data?.avatar_url ?? null);
      setLinkedin(data?.linkedin_url ?? "");
    });
    (supabase.from("cvs" as never) as any).select("id,name,data").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }: any) => {
        if (!data) return;
        setCvId(data.id); setCvName(data.name || "My CV");
        setHeadline(data.data?.headline || ""); setSummary(data.data?.summary || "");
        setSkills(Array.isArray(data.data?.skills) ? data.data.skills.join(", ") : "");
      });
  }, [user]);

  const initials = useMemo(() => {
    const value = user?.user_metadata?.full_name || user?.email || "GP";
    return value.split(/\s+/).slice(0, 2).map((x: string) => x[0]).join("").toUpperCase();
  }, [user]);

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Profile photos must be 5 MB or smaller.");
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = user.id + "/avatar." + ext;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) return toast.error(uploadError.message);
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error } = await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id);
    if (error) return toast.error(error.message);
    setAvatar(data.publicUrl + "?v=" + Date.now()); toast.success("Profile photo updated.");
  };

  const saveWorkspace = async () => {
    if (!user) return;
    setSaving(true);
    const cvData = { headline: headline.trim(), summary: summary.trim(), skills: skills.split(",").map(x => x.trim()).filter(Boolean), linkedin_url: linkedin.trim() };
    const result = cvId
      ? await (supabase.from("cvs" as never) as any).update({ name: cvName.trim() || "My CV", data: cvData, discoverable: true, visibility: "employers" }).eq("id", cvId).eq("user_id", user.id)
      : await (supabase.from("cvs" as never) as any).insert({ user_id: user.id, name: cvName.trim() || "My CV", data: cvData, discoverable: true, visibility: "employers" }).select("id").single();
    const { error: profileError } = await supabase.from("profiles").update({ linkedin_url: linkedin.trim() || null, discoverable_to_recruiters: true, cv_visibility: "employers" }).eq("id", user.id);
    setSaving(false);
    if (result.error || profileError) return toast.error(result.error?.message || profileError?.message || "Could not save.");
    if (!cvId && result.data?.id) setCvId(result.data.id);
    toast.success("CV and employer profile saved.");
  };

  return <section className="rounded-xl border border-border bg-card p-5 space-y-5">
    <div className="flex items-center justify-between gap-3">
      <div><h2 className="font-semibold">Career workspace</h2><p className="text-xs text-muted-foreground mt-1">Build a discoverable profile for employers and keep your CV current.</p></div>
      <div className="relative">
        {avatar ? <img src={avatar} alt="Profile" className="h-14 w-14 rounded-full object-cover border border-border" /> : <div className="h-14 w-14 rounded-full bg-secondary grid place-items-center font-semibold">{initials}</div>}
        <label className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground grid place-items-center cursor-pointer border-2 border-card">
          <ImagePlus className="h-3.5 w-3.5" /><input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
        </label>
      </div>
    </div>
    <div className="grid gap-3 md:grid-cols-2">
      <input value={cvName} onChange={e => setCvName(e.target.value)} placeholder="CV name" className="rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm" />
      <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Professional headline" className="rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm" />
      <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="LinkedIn profile URL" className="rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm md:col-span-2" />
      <textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Professional summary" rows={4} className="rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm md:col-span-2" />
      <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="Skills, comma separated" className="rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm md:col-span-2" />
    </div>
    <div className="flex flex-wrap gap-2">
      <button onClick={saveWorkspace} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Save className="h-4 w-4" />{saving ? "Saving..." : "Save CV profile"}</button>
      {linkedin && <a href={linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm"><Linkedin className="h-4 w-4" />LinkedIn</a>}
    </div>
    <div className="rounded-lg border border-border/70 bg-secondary/30 p-3 text-xs text-muted-foreground flex gap-2"><Sparkles className="h-4 w-4 text-primary shrink-0" />Your discoverable CV can be matched against relevant opportunities in Ghana, Africa and remote markets.</div>
  </section>;
}

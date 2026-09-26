import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { ArrowLeft, Loader2, SlidersHorizontal } from "@/lib/icons";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  COVERAGE_LEVELS,
  DEFAULT_PREFERENCES,
  FIELDS,
  FUNDING_TYPES,
  GENDERS,
  LEVELS,
  MatchPreferences,
  useMatchPreferences,
  useSavePreferences,
} from "@/hooks/useMatchPreferences";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

const REGIONS = [
  "Greater Accra", "Ashanti", "Central", "Eastern", "Western", "Volta",
  "Northern", "Upper East", "Upper West", "Bono", "Ahafo", "Oti", "Savannah",
  "North East", "Western North", "Bono East",
];

const card = "bg-glass rounded-xl p-5";
const input =
  "w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/50";

const initialsFrom = (value?: string | null) => {
  const source = (value ?? "").trim();
  if (!source) return "GP";
  const parts = source.replace(/@.*$/, "").split(/[\s._-]+/).filter(Boolean);
  return (parts.slice(0, 2).map((p) => p[0]).join("") || source[0]!).toUpperCase();
};

const Preferences = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: saved } = useMatchPreferences();
  const savePrefs = useSavePreferences();
  const [prefs, setPrefs] = useState<MatchPreferences>(DEFAULT_PREFERENCES);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate(`/auth?next=${encodeURIComponent(window.location.pathname + window.location.search)}`, { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (saved) setPrefs(saved);
  }, [saved]);

  useEffect(() => {
    if (!user) return;
    setAvatarUrl((user.user_metadata?.["avatar_url"] as string | undefined) ?? null);
    supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      });
  }, [user]);

  const set = <K extends keyof MatchPreferences>(k: K, v: MatchPreferences[K]) =>
    setPrefs((p) => ({ ...p, [k]: v }));

  const toggleFunding = (t: string) =>
    set(
      "funding_types",
      prefs.funding_types.includes(t)
        ? prefs.funding_types.filter((x) => x !== t)
        : [...prefs.funding_types, t],
    );

  const avatarPathFrom = (url: string | null): string | null => {
    if (!url || !user) return null;
    const marker = "/object/public/avatars/";
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    const path = decodeURIComponent(url.slice(idx + marker.length).split("?")[0] ?? "");
    return path.startsWith(`${user.id}/`) ? path : null;
  };

  const avatarErrorMessage = (error: unknown): string => {
    const msg = error instanceof Error ? error.message : String(error ?? "");
    if (/bucket not found/i.test(msg)) return "Photo storage is not set up yet. Please try again later.";
    if (/row-level security|policy|unauthorized|403/i.test(msg)) return "You don't have permission to upload this photo. Please sign in again.";
    if (/payload too large|size/i.test(msg)) return "That photo is too large. Use one under 5 MB.";
    if (/mime|type/i.test(msg)) return "Use a JPG, PNG or WebP image.";
    return msg || "Could not update your profile photo.";
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Use a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile photos must be 5 MB or smaller.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const previousPath = avatarPathFrom(avatarUrl);
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: false, contentType: file.type, cacheControl: "3600" });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data.publicUrl;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);
      if (profileError) throw profileError;

      // Display-only mirror so the navbar updates immediately (never used for authorization).
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

      if (previousPath && previousPath !== path) {
        await supabase.storage.from("avatars").remove([previousPath]);
      }

      setAvatarUrl(publicUrl);
      toast.success("Profile photo updated.");
    } catch (error) {
      console.error("Avatar upload failed", error);
      toast.error(avatarErrorMessage(error));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const removeAvatar = async () => {
    if (!user || !avatarUrl) return;
    setUploadingAvatar(true);
    try {
      const current = avatarPathFrom(avatarUrl);
      const legacy = ["jpg", "png", "webp"].map((ext) => `${user.id}/avatar.${ext}`);
      await supabase.storage.from("avatars").remove(current ? [current, ...legacy] : legacy);
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);
      if (profileError) throw profileError;
      await supabase.auth.updateUser({ data: { avatar_url: null } });
      setAvatarUrl(null);
      toast.success("Profile photo removed.");
    } catch (error) {
      console.error("Avatar removal failed", error);
      toast.error(avatarErrorMessage(error));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const name = (user?.user_metadata?.["full_name"] as string | undefined) ?? user?.email ?? null;
  const initials = initialsFrom(name);

  return (
    <div className="min-h-screen bg-background px-4 sm:px-8 lg:px-12 pt-20 pb-12">
      <Navbar />
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <SlidersHorizontal className="h-6 w-6 text-primary" /> Personalization
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Personalise your GhanaPathFinder account and scholarship matches.
          </p>
        </div>

        <div className={`${card} mb-5`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="h-24 w-24 rounded-full overflow-hidden border border-border bg-primary/10 grid place-items-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Your profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-semibold text-primary">{initials}</span>
                )}
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-background/70 grid place-items-center">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display font-semibold text-foreground">Profile photo</h2>
              <p className="text-xs text-muted-foreground mt-1">Add a photo so your account feels like yours. JPG, PNG or WebP, up to 5 MB.</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadAvatar(file);
                    e.currentTarget.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
                >
                  {avatarUrl ? "Change photo" : "Add photo"}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => void removeAvatar()}
                    disabled={uploadingAvatar}
                    className="px-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className={`${card} grid gap-4 sm:grid-cols-2`}>
            <label className="text-xs text-muted-foreground">
              Level of study
              <select className={`${input} mt-1`} value={prefs.level} onChange={(e) => set("level", e.target.value)}>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
            <label className="text-xs text-muted-foreground">
              Field of study
              <select className={`${input} mt-1`} value={prefs.field} onChange={(e) => set("field", e.target.value)}>
                {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
            <label className="text-xs text-muted-foreground">
              Home region
              <select className={`${input} mt-1`} value={prefs.region ?? ""} onChange={(e) => set("region", e.target.value || null)}>
                <option value="">No preference</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label className="text-xs text-muted-foreground">
              Gender-specific awards
              <select className={`${input} mt-1`} value={prefs.gender} onChange={(e) => set("gender", e.target.value)}>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <label className="text-xs text-muted-foreground sm:col-span-2">
              Minimum coverage you want
              <select className={`${input} mt-1`} value={prefs.min_coverage} onChange={(e) => set("min_coverage", e.target.value)}>
                {COVERAGE_LEVELS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>

          <div className={card}>
            <h2 className="font-display font-semibold text-foreground mb-1">Funding sources</h2>
            <p className="text-xs text-muted-foreground mb-3">Leave all unselected to consider every source.</p>
            <div className="flex flex-wrap gap-2">
              {FUNDING_TYPES.map((t) => (
                <button key={t} onClick={() => toggleFunding(t)} aria-pressed={prefs.funding_types.includes(t)} className={`px-3 py-2 rounded-full text-xs font-medium transition-colors ${prefs.funding_types.includes(t) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className={`${card} space-y-3`}>
            {[
              { key: "need_based" as const, label: "Prioritise need-based funding", hint: "Awards aimed at students with financial need rank higher." },
              { key: "study_abroad" as const, label: "Include study-abroad opportunities", hint: "Show international scholarships alongside Ghanaian ones." },
            ].map((row) => (
              <label key={row.key} className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={prefs[row.key]} onChange={(e) => set(row.key, e.target.checked)} className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]" />
                <span>
                  <span className="block text-sm text-foreground">{row.label}</span>
                  <span className="block text-xs text-muted-foreground">{row.hint}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => savePrefs.mutate(prefs)} disabled={savePrefs.isPending} className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2">
              {savePrefs.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save preferences
            </button>
            <Link to="/scholarships" className="px-4 py-3 rounded-lg bg-secondary text-foreground text-sm font-medium text-center">See my matches</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;

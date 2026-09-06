import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "@/lib/icons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const isValidPhone = (value: string) => {
  const cleaned = value.replace(/[\s()-]/g, "");
  return /^\+?\d{9,15}$/.test(cleaned);
};

/**
 * Existing accounts created before phone numbers were required are asked
 * for a contact number the next time they use the app.
 */
const ContactGate = () => {
  const { user, loading } = useAuth();
  const [needed, setNeeded] = useState(false);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    if (loading || !user) {
      setNeeded(false);
      return;
    }
    void (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      setNeeded(!data?.phone);
    })();
    return () => {
      active = false;
    };
  }, [user, loading]);

  if (!needed) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone(phone)) {
      toast.error("Enter a valid contact number, e.g. 024 123 4567");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ phone: phone.trim() })
      .eq("id", user!.id);
    setSaving(false);
    if (error) {
      toast.error("Could not save your contact number. Please try again.");
      return;
    }
    toast.success("Contact number saved.");
    setNeeded(false);
  };

  return (
    <div className="fixed inset-0 z-100 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4">
      <form onSubmit={save} className="w-full max-w-sm bg-glass rounded-2xl p-5 space-y-3">
        <h2 className="font-display text-lg font-bold text-foreground">Add your contact number</h2>
        <p className="text-sm text-muted-foreground">
          A contact number is now required on every GhanaPathFinder account so we can reach you about
          deadlines and admissions updates.
        </p>
        <input
          type="tel"
          required
          autoFocus
          placeholder="Contact number (e.g. 024 123 4567)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={20}
          className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
        />
        <button
          type="submit"
          disabled={saving}
          className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save and continue
        </button>
      </form>
    </div>
  );
};

export default ContactGate;

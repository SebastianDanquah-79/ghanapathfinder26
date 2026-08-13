import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GraduationCap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: { message: string } | null }>;
};

const oauth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

const OAuthConsent = () => {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  const decide = async (approve: boolean) => {
    setBusy(true);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="flex items-center gap-2 mb-8">
        <GraduationCap className="h-7 w-7 text-primary" />
        <span className="font-display font-bold text-xl text-foreground">
          Ghana<span className="text-primary">Path</span>
        </span>
      </div>

      <div className="w-full max-w-md bg-glass rounded-2xl p-6 sm:p-8 text-center space-y-4">
        {error ? (
          <>
            <h1 className="font-display text-xl font-bold text-foreground">
              Could not load this request
            </h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </>
        ) : !details ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <>
            <h1 className="font-display text-xl font-bold text-foreground">
              Connect {details.client?.name ?? "an app"} to your GhanaPath account
            </h1>
            <p className="text-sm text-muted-foreground">
              This lets {details.client?.name ?? "the app"} read your profile, saved schools and
              scholarships, deadlines and applications, and update your tracker as you.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                disabled={busy}
                onClick={() => decide(false)}
                className="px-4 py-3 rounded-lg bg-secondary text-foreground text-sm font-medium"
              >
                Deny
              </button>
              <button
                disabled={busy}
                onClick={() => decide(true)}
                className="px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
              >
                Approve
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default OAuthConsent;

import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "@/lib/router-compat";
import { Loader2, BrandLogoIcon } from "@/lib/icons";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { TERMS_VERSION } from "@/lib/legal";
import { useEffect } from "react";
import SiteRating from "@/components/SiteRating";

type Mode = "signin" | "signup";

// Only allow same-origin relative paths as a post-login redirect.
const safeNext = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : null;

const Auth = ({ defaultMode = "signin" }: { defaultMode?: Mode }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [accountType, setAccountType] = useState<"student" | "parent">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const recordAcceptance = async (userId: string) => {
    await supabase
      .from("profiles")
      .update({ terms_accepted_at: new Date().toISOString(), terms_version: TERMS_VERSION })
      .eq("id", userId);
  };

  useEffect(() => {
    if (user) {
      if (next) window.location.href = next;
      else navigate("/dashboard", { replace: true });
    }
  }, [user, navigate, next]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      toast.error("Please accept the Terms & Conditions to continue.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!fullName.trim()) throw new Error("Please enter your name");
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: next
              ? `${window.location.origin}/auth?next=${encodeURIComponent(next)}`
              : window.location.origin,
            data: { full_name: fullName.trim(), account_type: accountType },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setEmailSent(true);
          return;
        }
        if (data.user) await recordAcceptance(data.user.id);
        if (next) window.location.href = next;
        else navigate("/onboarding", { replace: true });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.user) await recordAcceptance(data.user.id);
        if (next) window.location.href = next;
        else navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error("Enter your email address first, then tap “Forgot password”.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent , check your email.");
  };

  const handleGoogle = async () => {
    if (!acceptedTerms) {
      toast.error("Please accept the Terms & Conditions to continue.");
      return;
    }

    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: next
        ? `${window.location.origin}/auth?next=${encodeURIComponent(next)}`
        : window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    if (next) window.location.href = next;
    else navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <Link to="/" className="flex items-center gap-2 mb-6">
        <BrandLogoIcon className="h-7 w-7 text-primary" />
        <span className="font-display font-bold text-xl text-foreground">
          Ghana<span className="text-primary">PathFinder</span>
        </span>
      </Link>

      <div className="w-full max-w-md bg-glass rounded-2xl p-5 sm:p-6">
        {emailSent ? (
          <div className="text-center space-y-3">
            <h1 className="font-display text-xl font-bold text-foreground">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              We sent a confirmation link to <span className="text-foreground">{email}</span>. Click
              it to activate your GhanaPathFinder account.
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              {mode === "signin"
                ? "Sign in to your dashboard, saved schools and deadlines."
                : "Save recommendations, scholarships and deadlines in one place."}
            </p>

            <label className="flex items-start gap-3 mb-4 p-3 rounded-xl border border-border bg-secondary/50 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[hsl(var(--primary))]"
                aria-describedby="terms-help"
              />
              <span id="terms-help" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <Link to="/terms" target="_blank" rel="noopener" className="text-primary underline">
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy" target="_blank" rel="noopener" className="text-primary underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <button
              onClick={handleGoogle}
              disabled={loading || !acceptedTerms}
              className="w-full mb-5 px-4 py-3 rounded-lg border border-border bg-secondary text-foreground text-sm font-medium hover:bg-secondary/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {(["student", "parent"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAccountType(t)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                          accountType === t
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        I'm a {t}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    maxLength={100}
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
                  />
                </>
              )}
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="submit"
                disabled={loading || !acceptedTerms}
                className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>

            {mode === "signin" && (
              <p className="text-center text-sm mt-3">
                <button
                  onClick={handleForgotPassword}
                  className="inline-flex items-center justify-center min-h-[44px] px-3 text-muted-foreground hover:text-primary"
                >
                  Forgot password?
                </button>
              </p>
            )}


            <p className="text-center text-sm text-muted-foreground mt-3">
              {mode === "signin" ? "New to GhanaPathFinder?" : "Already have an account?"}{" "}
              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="inline-flex items-center justify-center min-h-[44px] px-2 text-primary font-medium"
              >
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>

          </>
        )}
      </div>
      <SiteRating />
    </div>
  );
};

export default Auth;

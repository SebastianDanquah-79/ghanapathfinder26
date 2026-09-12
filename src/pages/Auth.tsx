import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "@/lib/router-compat";
import { Loader2, BrandLogoIcon } from "@/lib/icons";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TERMS_VERSION } from "@/lib/legal";
import { isValidPhone } from "@/components/ContactGate";
import SiteRating from "@/components/SiteRating";

type Mode = "signin" | "signup";

const safeNext = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : null;

const normalizePhone = (value: string) => {
  const cleaned = value.replace(/[\s()-]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("233")) return `+${cleaned}`;
  if (cleaned.startsWith("0")) return `+233${cleaned.slice(1)}`;
  return `+233${cleaned}`;
};

const Auth = ({ defaultMode = "signin" }: { defaultMode?: Mode }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [accountType, setAccountType] = useState<"student" | "parent">("student");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const recordAcceptance = async (userId: string) => {
    await supabase
      .from("profiles")
      .update({ terms_accepted_at: new Date().toISOString(), terms_version: TERMS_VERSION })
      .eq("id", userId);
  };

  const finishLogin = async (userId: string) => {
    if (mode === "signup") {
      await supabase.auth.updateUser({
        data: { full_name: fullName.trim(), account_type: accountType, phone: normalizePhone(phone) },
      });
      await supabase
        .from("profiles")
        .update({ full_name: fullName.trim(), phone: normalizePhone(phone) })
        .eq("id", userId);
    } else {
      await supabase.from("profiles").update({ phone: normalizePhone(phone) }).eq("id", userId);
    }
    await recordAcceptance(userId);
    if (next) window.location.href = next;
    else navigate(mode === "signup" ? "/onboarding" : "/dashboard", { replace: true });
  };

  useEffect(() => {
    if (user && !otpSent) {
      if (next) window.location.href = next;
      else navigate("/dashboard", { replace: true });
    }
  }, [user, navigate, next, otpSent]);

  const sendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!acceptedTerms) {
      toast.error("Please accept the Terms & Conditions to continue.");
      return;
    }
    if (mode === "signup" && !fullName.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!isValidPhone(phone)) {
      toast.error("Enter a valid Ghana contact number, e.g. 024 123 4567.");
      return;
    }

    const normalized = normalizePhone(phone);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalized,
      options: {
        shouldCreateUser: true,
        data:
          mode === "signup"
            ? { full_name: fullName.trim(), account_type: accountType, phone: normalized }
            : undefined,
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setPhone(normalized);
    setOtpSent(true);
    toast.success(`Verification code sent to ${normalized}.`);
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: normalizePhone(phone),
      token: otp,
      type: "sms",
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    if (data.user) await finishLogin(data.user.id);
    setLoading(false);
  };

  const resendOtp = async () => {
    await sendOtp();
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
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {otpSent
            ? `Enter the verification code sent to ${phone}.`
            : "Use your phone number to sign in or create your GhanaPathFinder account."}
        </p>

        <label className="flex items-start gap-3 mb-4 p-3 rounded-xl border border-border bg-secondary/50 cursor-pointer">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[hsl(var(--primary))]"
          />
          <span className="text-sm text-muted-foreground">
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

        {!otpSent ? (
          <form onSubmit={sendOtp} className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Contact number</label>
              <input
                type="tel"
                required
                autoFocus
                placeholder="024 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-xs text-muted-foreground mt-1.5">We'll send a one-time verification code by SMS.</p>
            </div>

            <button
              type="submit"
              disabled={loading || !acceptedTerms}
              className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Send verification code
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-center text-xl tracking-[0.35em] placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Verify and continue
            </button>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
                className="text-muted-foreground hover:text-primary"
              >
                Change number
              </button>
              <button type="button" onClick={resendOtp} disabled={loading} className="text-primary hover:underline disabled:opacity-50">
                Resend code
              </button>
            </div>
          </form>
        )}

        {!otpSent && (
          <p className="text-center text-sm text-muted-foreground mt-5">
            {mode === "signin" ? "New to GhanaPathFinder?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-primary font-medium hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        )}
      </div>
      <SiteRating />
    </div>
  );
};

export default Auth;

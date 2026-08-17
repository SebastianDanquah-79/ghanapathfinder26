import { useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { Loader2, BrandLogoIcon } from "@/lib/icons";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated. You're signed in.");
    navigate("/dashboard", { replace: true });
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
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Set a new password</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Choose a new password for your GhanaPathFinder account.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            required
            minLength={6}
            placeholder="New password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Update password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

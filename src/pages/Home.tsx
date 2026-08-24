import { useAuth } from "@/hooks/useAuth";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";

/**
 * Landing gate: visitors must create an account (or sign in) before they can
 * reach any of the GhanaPathFinder resources, so "/" renders the signup form
 * until a session exists.
 */
const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background" aria-busy="true" />;
  }

  if (!user) {
    return <Auth defaultMode="signup" />;
  }

  return <Index />;
};

export default Home;

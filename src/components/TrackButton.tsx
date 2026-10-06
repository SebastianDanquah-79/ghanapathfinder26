import { useNavigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { useTrackOpportunity, type PipelineInput } from "@/hooks/usePipeline";

const TrackButton = ({ item, className }: { item: PipelineInput; className?: string }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const track = useTrackOpportunity();
  return (
    <button
      type="button"
      disabled={track.isPending}
      onClick={() => {
        if (!user) {
          navigate(`/auth?next=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        track.mutate(item);
      }}
      className={className ?? "inline-flex items-center min-h-[40px] px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"}
    >
      {user ? "Track this" : "Sign in to track"}
    </button>
  );
};

export default TrackButton;

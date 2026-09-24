import { Check, UserPlus } from "@/lib/icons";
import { toast } from "sonner";
import { useFollow, type FollowEntityType } from "@/hooks/useUserFollows";

export default function FollowButton({ entityType, entityKey, label = "Follow" }: { entityType: FollowEntityType; entityKey: string; label?: string }) {
  const { followed, isLoading, isPending, toggle } = useFollow(entityType, entityKey);
  const handleClick = async () => {
    try { await toggle(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not update follow."); }
  };
  return (
    <button type="button" onClick={() => void handleClick()} disabled={isLoading || isPending} aria-pressed={followed}
      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50">
      {followed ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
      {followed ? "Following" : label}
    </button>
  );
}

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SavedItemInput, useSavedItems, useToggleSaved } from "@/hooks/useSavedItems";

interface Props {
  item: SavedItemInput;
  label?: string;
}

const SaveButton = ({ item, label = "Save" }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: saved } = useSavedItems();
  const toggle = useToggleSaved();

  const isSaved = !!saved?.some(
    (s) => s.item_type === item.item_type && s.item_key === item.item_key,
  );

  return (
    <button
      type="button"
      onClick={() => {
        if (!user) {
          navigate("/auth");
          return;
        }
        toggle.mutate({ item, saved: isSaved });
      }}
      disabled={toggle.isPending}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        isSaved
          ? "bg-primary/15 text-primary"
          : "bg-secondary text-muted-foreground hover:text-foreground"
      }`}
      aria-label={isSaved ? "Remove from saved" : "Save"}
    >
      {isSaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
      {isSaved ? "Saved" : label}
    </button>
  );
};

export default SaveButton;

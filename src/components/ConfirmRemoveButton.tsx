import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  title: string;
  itemLabel: string;
  onConfirm: () => void;
  showLabel?: boolean;
}

/** Trash control with a lightweight confirmation — only removes from the student's saved list. */
const ConfirmRemoveButton = ({ title, itemLabel, onConfirm, showLabel = false }: Props) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <button
        type="button"
        aria-label={`Remove ${title} from saved`}
        title={`Remove ${title} from saved`}
        className="shrink-0 inline-flex items-center gap-1.5 min-h-[44px] min-w-[44px] justify-center px-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
        {showLabel && <span className="hidden sm:inline text-xs font-medium">Remove</span>}
      </button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Remove this {itemLabel} from Saved?</AlertDialogTitle>
        <AlertDialogDescription>
          “{title}” will be removed from your saved list. It stays in the GhanaPath directory, so
          you can save it again anytime.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Remove
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default ConfirmRemoveButton;

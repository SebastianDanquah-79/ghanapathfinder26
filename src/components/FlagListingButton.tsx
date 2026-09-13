import { useState } from "react";
import { toast } from "sonner";
import { useFlagListing } from "@/hooks/useReviewQueue";

interface Props {
  table: string;
  rowId?: string;
  label: string;
}

/** Lets any visitor report something wrong on a listing. */
const FlagListingButton = ({ table, rowId, label }: Props) => {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const flag = useFlagListing();

  const submit = async () => {
    if (note.trim().length < 5) {
      toast.error("Please tell us what looks wrong");
      return;
    }
    try {
      await flag.mutateAsync({ table, ...(rowId ? { id: rowId } : {}), label, note: note.trim() });
      toast.success("Thanks — we'll check this against the official source");
      setNote("");
      setOpen(false);
    } catch {
      toast.error("Could not send that just now");
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Something wrong here? Flag this listing
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-secondary/60 p-3 space-y-2 max-w-md">
      <label htmlFor="flag-note" className="text-xs font-medium text-foreground">
        What looks wrong with {label}?
      </label>
      <textarea
        id="flag-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="e.g. the fees are out of date, or this programme is no longer offered"
        className="w-full rounded-lg bg-background border border-border p-2 text-sm text-foreground"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={flag.isPending}
          className="px-3 min-h-[38px] rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
        >
          {flag.isPending ? "Sending…" : "Send"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 min-h-[38px] rounded-lg border border-border text-xs text-muted-foreground"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default FlagListingButton;

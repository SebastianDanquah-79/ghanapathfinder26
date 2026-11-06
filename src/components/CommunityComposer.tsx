import { useState, type ReactNode } from "react";
import { ArrowRight, Smile } from "lucide-react";

const QUICK_EMOJIS = ["🙂", "🎓", "👏", "❤️", "✨"];

export interface CommunityComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  actionLabel?: string;
  helperText?: string;
  toolbarContent?: ReactNode;
  disabled?: boolean;
  canSubmit?: boolean;
  isSending?: boolean;
  rows?: number;
  maxLength?: number;
  compact?: boolean;
}

const CommunityComposer = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  actionLabel = "Send message",
  helperText,
  toolbarContent,
  disabled = false,
  canSubmit = true,
  isSending = false,
  rows = 4,
  maxLength,
  compact = false,
}: CommunityComposerProps) => {
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const isDisabled = disabled || isSending || !canSubmit || !value.trim();

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-border bg-card shadow-sm transition-colors focus-within:border-ghana-gold/60 focus-within:ring-2 focus-within:ring-ghana-gold/15">
      <textarea
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled || isSending}
        className={`block w-full max-h-60 resize-y border-0 bg-transparent px-4 py-4 text-sm leading-7 text-foreground outline-none placeholder:text-muted-foreground/75 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base ${compact ? "min-h-[76px]" : "min-h-[128px]"}`}
      />
      <div className="mx-2 mb-2 flex min-h-12 items-center gap-1.5 rounded-full bg-navy-deep px-2 py-1.5 sm:mx-3 sm:mb-3 sm:gap-2 sm:px-3">
        <div className="relative shrink-0">
          <button
            type="button"
            disabled={disabled || isSending}
            onClick={() => setEmojiPickerOpen((current) => !current)}
            aria-label="Add an emoji"
            aria-expanded={emojiPickerOpen}
            className="grid size-9 place-items-center rounded-full text-background/80 transition-colors hover:bg-white/10 hover:text-background disabled:opacity-50"
          >
            <Smile className="size-5" />
          </button>
          {emojiPickerOpen && (
            <div
              className="absolute bottom-full left-0 z-30 mb-2 flex gap-1 rounded-xl border border-border bg-popover p-2 shadow-lg"
              role="group"
              aria-label="Quick emoji"
            >
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onChange(`${value}${value.trim() ? " " : ""}${emoji}`);
                    setEmojiPickerOpen(false);
                  }}
                  aria-label={`Insert ${emoji} emoji`}
                  className="grid size-9 place-items-center rounded-full text-lg hover:bg-muted"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        {toolbarContent && (
          <div className="flex min-w-0 items-center gap-1">{toolbarContent}</div>
        )}
        <span className="ml-auto min-w-0 truncate px-1 text-[10px] text-background/60">
          {isSending ? "Sending…" : helperText ?? ""}
        </span>
        <button
          type="button"
          onClick={() => {
            setEmojiPickerOpen(false);
            onSubmit();
          }}
          disabled={isDisabled}
          aria-label={actionLabel}
          title={actionLabel}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-ghana-gold text-navy-deep shadow-sm transition-colors hover:bg-ghana-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ghana-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSending ? (
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <ArrowRight className="size-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default CommunityComposer;

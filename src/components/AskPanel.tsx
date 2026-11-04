import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type FileUIPart, type UIMessage } from "ai";
import { Check, ClipboardCopy, ExternalLink, FileText, Image as ImageIcon, ImagePlus, Paperclip, RotateCcw, X } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { buildAskContext, type AskContextItem } from "@/lib/askContext";

const STORAGE_KEY = "gpf.ask.history.v1";
const MAX_STORED = 40;
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;

const textOf = (message: UIMessage) =>
  message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");

const IMAGE_PROMPT_PREFIX = "IMAGE PROMPT:\n";

const enhanceImagePrompt = (prompt: string) =>
  [
    "Create an original image based on this request:",
    prompt,
    "",
    "Visual guidance:",
    "- Use a clear focal subject and a balanced composition.",
    "- Apply cohesive colours, intentional lighting, and crisp details.",
    "- Keep the scene coherent and avoid unnecessary clutter.",
    "- Preserve any exact text requested. Do not invent extra wording, logos, or watermarks.",
  ].join("\n");

const imagePromptOf = (message: UIMessage): string | null => {
  if (message.role !== "assistant") return null;
  const content = textOf(message);
  return content.startsWith(IMAGE_PROMPT_PREFIX)
    ? content.slice(IMAGE_PROMPT_PREFIX.length).trim()
    : null;
};

const historyWithoutBinaryFiles = (messages: UIMessage[]): UIMessage[] =>
  messages.slice(-MAX_STORED).map((message) => ({
    ...message,
    parts: message.parts.map((part) =>
      part.type === "file"
        ? {
            type: "text" as const,
            text: `[Attached file: ${part.filename || "document"}. Reattach it after reloading to analyse it again.]`,
          }
        : part,
    ),
  }));

const loadHistory = (): UIMessage[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UIMessage[];
    if (!Array.isArray(parsed)) return [];
    const history = parsed.filter((message) => message && Array.isArray(message.parts));
    if (history.length === 1 && history[0]?.id === "gpf-welcome") return [];
    // Never restore large base64 data URLs from local storage.
    return historyWithoutBinaryFiles(history);
  } catch {
    return [];
  }
};

interface AskChatProps {
  initialMessages: UIMessage[];
  contextText: string;
  suggestions: string[];
  onClear: () => void;
}

const AskAttachmentControls = ({ disabled }: { disabled: boolean }) => {
  const attachments = usePromptInputAttachments();

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
      <PromptInputButton
        disabled={disabled}
        onClick={attachments.openFileDialog}
        tooltip="Attach one PDF or image (up to 2 MB)"
        aria-label="Attach a PDF or image"
      >
        <Paperclip className="size-4" />
      </PromptInputButton>
      {attachments.files.map((file) => (
        <div
          key={file.id}
          className="flex min-w-0 max-w-[190px] items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground"
        >
          {file.mediaType?.startsWith("image/") ? (
            <ImageIcon className="size-3.5 shrink-0" />
          ) : (
            <FileText className="size-3.5 shrink-0" />
          )}
          <span className="truncate">{file.filename || "Attached file"}</span>
          <button
            type="button"
            onClick={() => attachments.remove(file.id)}
            aria-label={`Remove ${file.filename || "attachment"}`}
            className="shrink-0 rounded p-0.5 hover:bg-muted"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

const AskChat = ({ initialMessages, contextText, suggestions, onClear }: AskChatProps) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const contextRef = useRef(contextText);
  contextRef.current = contextText;

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, stop, regenerate, setMessages } = useChat({
    messages: initialMessages,
    transport,
    onError: (chatError) => {
      console.error("GhanaPathFinder chat request failed", chatError);
      setError("I couldn't complete that reply. Please try again.");
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(historyWithoutBinaryFiles(messages)));
    } catch {
      /* storage full or unavailable — history is best-effort */
    }
  }, [messages]);

  const ask = useCallback(
    async (text: string, files: FileUIPart[] = []) => {
      const trimmed = text.trim();
      if ((!trimmed && files.length === 0) || isLoading) return;

      setError(null);
      setInput("");

      // Keep only the most recently attached file in the live conversation.
      // This keeps repeated turns within the serverless request-size limit.
      if (files.length > 0) {
        setMessages((current) =>
          current.map((message) => ({
            ...message,
            parts: message.parts.filter((part) => part.type !== "file"),
          })),
        );
      }

      try {
        await sendMessage(
          {
            text: trimmed || "Please analyse the attached file and explain its contents.",
            ...(files.length > 0 ? { files } : {}),
          },
          { body: { context: contextRef.current } },
        );
      } catch (sendError) {
        console.error("GhanaPathFinder could not send the chat message", sendError);
        setError("Your message could not be sent. Check your connection and try again.");
        throw sendError;
      }
    },
    [isLoading, sendMessage, setMessages],
  );

  const createImage = useCallback(
    (text: string, files: FileUIPart[] = []) => {
      const trimmed = text.trim();
      if ((!trimmed && files.length === 0) || isLoading) return;

      if (files.length > 0) {
        setError("Remove the attached file before preparing an image prompt.");
        return;
      }
      if (!trimmed) {
        setError("Describe the image you want to create.");
        return;
      }

      setError(null);
      setInput("");

      const userMessage: UIMessage = {
        id: crypto.randomUUID(),
        role: "user",
        parts: [{ type: "text", text: trimmed }],
      };
      const assistantMessage: UIMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        parts: [{ type: "text", text: `${IMAGE_PROMPT_PREFIX}${enhanceImagePrompt(trimmed)}` }],
      };

      setMessages((current) => [...current, userMessage, assistantMessage]);
    },
    [isLoading, setMessages],
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Ask GhanaPathFinder</p>
          <p className="truncate text-[11px] text-muted-foreground">
            Ask follow-up questions, or attach a PDF or image for analysis.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="min-h-9 rounded-lg border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
          >
            New chat
          </button>
        )}
      </div>

      <Conversation className="max-h-[52vh] min-h-[180px] flex-1">
        <ConversationContent className="gap-4 p-3">
          {messages.length === 0 ? (
            <ConversationEmptyState
              title="What would you like to work on?"
              description="Ask questions in a continuing conversation, understand a topic, or upload a PDF or image for analysis."
            >
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void (imageMode ? createImage(suggestion) : ask(suggestion))}
                    className="min-h-10 rounded-lg border border-border px-3 py-2 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.role === "assistant" ? (
                    (() => {
                      const preparedPrompt = imagePromptOf(message);
                      return preparedPrompt ? (
                        <div className="w-full space-y-3">
                          <p className="text-sm font-medium text-foreground">Your image prompt is ready.</p>
                          <div className="rounded-lg border border-border bg-muted/40 p-3">
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Enhanced prompt
                            </p>
                            <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-foreground">
                              {preparedPrompt}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
                                  await navigator.clipboard.writeText(preparedPrompt);
                                  setCopiedPromptId(message.id);
                                } catch {
                                  setError("Clipboard access is unavailable. Select the prompt above and copy it manually.");
                                }
                              }}
                              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                            >
                              {copiedPromptId === message.id ? (
                                <Check className="size-3.5" />
                              ) : (
                                <ClipboardCopy className="size-3.5" />
                              )}
                              {copiedPromptId === message.id ? "Copied" : "Copy prompt"}
                            </button>
                            <a
                              href="https://designer.microsoft.com/"
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
                            >
                              Open Microsoft Designer
                              <ExternalLink className="size-3.5" />
                            </a>
                          </div>
                          <p className="text-[10px] leading-relaxed text-muted-foreground">
                            In Designer, paste the prompt and select Generate. Download your image there, then return to GhanaPathFinder and attach it in chat mode. Designer is free with monthly credits; a Microsoft account and age or regional eligibility may be required. Microsoft licenses Designer for personal, non-commercial use.
                          </p>
                        </div>
                      ) : (
                        <MessageResponse>{textOf(message)}</MessageResponse>
                      );
                    })()
                  ) : (
                    <>
                      {textOf(message) && (
                        <span className="whitespace-pre-wrap">{textOf(message)}</span>
                      )}
                      {message.parts
                        .filter((part): part is FileUIPart => part.type === "file")
                        .map((file, index) =>
                          file.mediaType?.startsWith("image/") ? (
                            <img
                              key={`${message.id}-file-${index}`}
                              src={file.url}
                              alt={file.filename || "Uploaded image"}
                              className="mt-2 max-h-48 max-w-full rounded-lg border border-border object-contain"
                            />
                          ) : (
                            <a
                              key={`${message.id}-file-${index}`}
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-foreground underline-offset-2 hover:underline"
                            >
                              <FileText className="size-4" />
                              {file.filename || "Open attached PDF"}
                            </a>
                          ),
                        )}
                    </>
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && <Shimmer className="text-sm">Thinking…</Shimmer>}
          {error && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-destructive" role="alert">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  void regenerate();
                }}
                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-foreground hover:bg-muted"
              >
                <RotateCcw className="size-3" />
                Retry
              </button>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="p-3 pt-0">
        <PromptInput
          accept="application/pdf,image/png,image/jpeg,image/webp"
          maxFiles={1}
          maxFileSize={MAX_ATTACHMENT_BYTES}
          onError={(attachmentError) => setError(attachmentError.message)}
          onSubmit={async (message, event) => {
            event.preventDefault();
            if (imageMode) {
              await createImage(message.text || input, message.files);
            } else {
              await ask(message.text || input, message.files);
            }
          }}
        >
          <PromptInputTextarea
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            placeholder={imageMode ? "Describe the image you want to create…" : "Message GhanaPathFinder…"}
          />
          <PromptInputFooter className="justify-between">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <PromptInputButton
                disabled={isLoading}
                onClick={() => {
                  setImageMode((current) => !current);
                  setError(null);
                }}
                tooltip={imageMode ? "Switch back to chat" : "Create an image"}
                aria-label={imageMode ? "Switch back to chat" : "Create an image"}
                aria-pressed={imageMode}
              >
                <ImagePlus className="size-4" />
                <span className="hidden text-xs sm:inline">{imageMode ? "Chat mode" : "Create image"}</span>
              </PromptInputButton>
              <AskAttachmentControls disabled={isLoading || imageMode} />
            </div>
            <PromptInputSubmit
              status={status}
              disabled={isLoading}
              onStop={stop}
            />
          </PromptInputFooter>
        </PromptInput>
        <p className="mt-2 text-[10px] text-muted-foreground">
          {imageMode
            ? "GhanaPathFinder prepares your prompt for an external image creator. No paid image-generation API is used by this chatbot."
            : "Upload one PDF or image at a time, up to 2 MB. File contents are not saved in chat history."}
        </p>
      </div>
    </div>
  );
};

export interface AskPanelProps {
  query: string;
  items: AskContextItem[];
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  "Which of these should I apply to first?",
  "What WASSCE grades do I need?",
  "Any scholarships that fit me?",
];

const AskPanel = ({ query, items, suggestions }: AskPanelProps) => {
  const [session, setSession] = useState(0);
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(null);

  useEffect(() => {
    setInitialMessages(loadHistory());
  }, []);

  const contextText = useMemo(() => buildAskContext(query, items), [query, items]);

  if (initialMessages === null) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground shadow-sm">
        Loading Ask GhanaPathFinder…
      </div>
    );
  }

  return (
    <AskChat
      key={session}
      initialMessages={session === 0 ? initialMessages : []}
      contextText={contextText}
      suggestions={suggestions ?? DEFAULT_SUGGESTIONS}
      onClear={() => {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        setSession((current) => current + 1);
      }}
    />
  );
};

export default AskPanel;

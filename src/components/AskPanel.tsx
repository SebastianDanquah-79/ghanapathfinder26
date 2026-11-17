import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type FileUIPart, type UIMessage } from "ai";
import { ArrowRight, Check, ClipboardCopy, Cpu, ExternalLink, FileText, Image as ImageIcon, ImagePlus, Paperclip, RotateCcw, Smile, X } from "lucide-react";
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
import {
  buildLocalAIMessages,
  checkLocalAIAvailability,
  isLocalAIReady,
  loadLocalAI,
  streamLocalAIResponse,
  unloadLocalAI,
} from "@/lib/ai/local-webllm";

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

const loadHistory = (storageKey: string): UIMessage[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
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

type AskMode = "general" | "personal-tutor" | "cofounder";

interface AskChatProps {
  initialMessages: UIMessage[];
  contextText: string;
  suggestions: string[];
  mode: AskMode;
  storageKey: string;
  title: string;
  description: string;
  sourceFiles: FileUIPart[];
  onClear: () => void;
}

const AskAttachmentControls = ({ disabled, tutor }: { disabled: boolean; tutor?: boolean }) => {
  const attachments = usePromptInputAttachments();

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
      <PromptInputButton
        className="text-background/80 hover:bg-white/10 hover:text-background"
        disabled={disabled}
        onClick={attachments.openFileDialog}
        tooltip={tutor ? "Attach up to 3 source files (2 MB total)" : "Attach one PDF or image (up to 2 MB)"}
        aria-label={tutor ? "Attach study sources" : "Attach a PDF or image"}
      >
        <Paperclip className="size-4" />
      </PromptInputButton>
      {attachments.files.map((file) => (
        <div
          key={file.id}
          className="flex min-w-0 max-w-[190px] items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-2 py-1 text-[10px] text-background/80"
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
            className="shrink-0 rounded p-0.5 hover:bg-white/10"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

const AskChat = ({ initialMessages, contextText, suggestions, mode, storageKey, title, description, sourceFiles, onClear }: AskChatProps) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [imageMode, setImageMode] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [localAiEnabled, setLocalAiEnabled] = useState(false);
  const [localAiLoading, setLocalAiLoading] = useState(false);
  const [localAiProgress, setLocalAiProgress] = useState({ progress: 0, text: "" });
  const [localAiReady, setLocalAiReady] = useState(false);
  const [localAiError, setLocalAiError] = useState<string | null>(null);
  const [localGenerating, setLocalGenerating] = useState(false);
  const localAbortControllerRef = useRef<AbortController | null>(null);
  const contextRef = useRef(contextText);
  contextRef.current = contextText;

  useEffect(() => {
    try {
      setLocalAiEnabled(window.localStorage.getItem("gpf.on-device-ai.enabled") === "true");
    } catch {
      setLocalAiEnabled(false);
    }
  }, []);

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const showChatError = useCallback((cause: unknown) => {
    const message = cause instanceof Error ? cause.message : String(cause ?? "");
    if (/credits_exhausted|no credits remaining|insufficient_quota|provider quota has been exhausted/i.test(message)) {
      setCanRetry(false);
      setError("AI replies are unavailable because GhanaPathFinder's AI provider quota has been exhausted. Your previous messages are saved. AI generation can resume only when the platform owner restores an authorised provider quota.");
      return;
    }
    if (/project owner or administrator|provider account setup|valid credit card on file|configuration_error/i.test(message)) {
      setCanRetry(false);
      setError("GhanaPathFinder's AI provider is not configured to complete this request. Your previous messages are saved.");
      return;
    }
    if (/rate limit|capacity|too many requests|temporarily at capacity/i.test(message)) {
      setCanRetry(true);
      setError("GhanaPathFinder AI is temporarily rate-limited. Your previous messages are saved; wait briefly, then retry.");
      return;
    }
    if (/timeout|timed out|aborterror|network|fetch/i.test(message)) {
      setCanRetry(true);
      setError("The request could not finish. Your previous messages are saved; check your connection and retry.");
      return;
    }
    setCanRetry(false);
    setError("I couldn't complete that reply. Your previous messages are preserved. Try again later.");
  }, []);

  const { messages, sendMessage, status, stop, regenerate, setMessages } = useChat({
    messages: initialMessages,
    transport,
    onError: (chatError) => {
      showChatError(chatError);
    },
  });

  const isLoading = status === "submitted" || status === "streaming" || localAiLoading || localGenerating;

  const enableOnDeviceAI = useCallback(async () => {
    const confirmed = window.confirm(
      "Enable on-device AI? This downloads a large language model once, may use around 1 GB of GPU memory, and requires a compatible WebGPU browser and an internet connection for the download. Prompts are then processed on this device, not sent to a cloud AI provider. Continue?",
    );
    if (!confirmed) return;

    setLocalAiError(null);
    setError(null);
    setLocalAiLoading(true);
    setLocalAiProgress({ progress: 0, text: "Checking this browser and device…" });
    try {
      const availability = await checkLocalAIAvailability();
      if (!availability.available) {
        throw new Error(availability.reason || "This device cannot run the on-device model.");
      }
      await loadLocalAI((progress) => setLocalAiProgress(progress));
      setLocalAiReady(true);
      setLocalAiEnabled(true);
      try {
        window.localStorage.setItem("gpf.on-device-ai.enabled", "true");
      } catch {
        /* Local mode remains enabled for this component session. */
      }
      setLocalAiProgress({ progress: 1, text: "On-device AI is ready on this device." });
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : "The local model could not be loaded.";
      setLocalAiError(detail);
      setLocalAiEnabled(false);
      try {
        window.localStorage.removeItem("gpf.on-device-ai.enabled");
      } catch {
        /* ignore */
      }
    } finally {
      setLocalAiLoading(false);
    }
  }, []);

  const disableOnDeviceAI = useCallback(async () => {
    localAbortControllerRef.current?.abort();
    setLocalAiEnabled(false);
    setLocalAiReady(false);
    setLocalAiError(null);
    try {
      window.localStorage.removeItem("gpf.on-device-ai.enabled");
    } catch {
      /* ignore */
    }
    await unloadLocalAI();
  }, []);

  const stopAllGeneration = useCallback(() => {
    localAbortControllerRef.current?.abort();
    stop();
  }, [stop]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(historyWithoutBinaryFiles(messages)));
    } catch {
      /* storage full or unavailable — history is best-effort */
    }
  }, [messages, storageKey]);

  const ask = useCallback(
    async (text: string, files: FileUIPart[] = []) => {
      const trimmed = text.trim();
      const filesToSend = mode === "personal-tutor" ? [...sourceFiles, ...files] : files;
      if ((!trimmed && filesToSend.length === 0) || isLoading) return;

      if (mode === "personal-tutor" && filesToSend.length > 0) {
        const approximateBytes = filesToSend.reduce((total, file) => {
          const encoded = typeof file.url === "string" ? file.url.split(",").pop() ?? "" : "";
          const padding = encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0;
          return total + Math.max(0, Math.floor((encoded.length * 3) / 4) - padding);
        }, 0);
        if (filesToSend.length > 3 || approximateBytes > MAX_ATTACHMENT_BYTES) {
          setError("Use up to 3 study sources with 2 MB total. Remove a source or select smaller files.");
          return;
        }
      }

      setError(null);
      setCanRetry(false);
      setInput("");

      // Keep only the latest source pack in live history. The notebook library
      // preserves uploaded sources while each request remains tightly bounded.
      if (filesToSend.length > 0) {
        setMessages((current) =>
          current.map((message) => ({
            ...message,
            parts: message.parts.filter((part) => part.type !== "file"),
          })),
        );
      }

      if (localAiEnabled) {
        if (filesToSend.length > 0) {
          setError("On-device AI currently supports text chat only. Remove PDF/image attachments to continue locally. Your files have not been sent to an AI provider.");
          return;
        }

        const promptText = trimmed;
        if (!promptText) return;

        const userMessage: UIMessage = {
          id: crypto.randomUUID(),
          role: "user",
          parts: [{ type: "text", text: promptText }],
        };
        const assistantId = crypto.randomUUID();
        const assistantMessage: UIMessage = {
          id: assistantId,
          role: "assistant",
          parts: [{ type: "text", text: "" }],
        };
        const history = [...messages, userMessage].map((message) => ({
          role: message.role as "user" | "assistant",
          text: textOf(message),
        }));
        const localMessages = buildLocalAIMessages({
          mode,
          contextText: contextRef.current,
          history,
        });

        setMessages((current) => [...current, userMessage, assistantMessage]);
        setLocalGenerating(true);
        const controller = new AbortController();
        localAbortControllerRef.current = controller;
        let responseText = "";

        try {
          if (!localAiReady || !isLocalAIReady()) {
            setLocalAiLoading(true);
            await loadLocalAI((progress) => setLocalAiProgress(progress));
            setLocalAiReady(true);
            setLocalAiLoading(false);
          }

          await streamLocalAIResponse({
            messages: localMessages,
            signal: controller.signal,
            maxTokens: mode === "personal-tutor" ? 520 : 420,
            onToken: (token) => {
              responseText += token;
              setMessages((current) => current.map((message) =>
                message.id === assistantId
                  ? { ...message, parts: [{ type: "text", text: responseText }] }
                  : message,
              ));
            },
          });

          if (!responseText.trim()) {
            throw new Error("The on-device model returned an empty response. Try a shorter question.");
          }
          setLocalAiProgress({ progress: 1, text: "On-device AI is active on this device." });
        } catch (cause) {
          setMessages((current) => current.filter((message) => message.id !== assistantId));
          if (!(cause instanceof Error && cause.name === "AbortError")) {
            const detail = cause instanceof Error ? cause.message : "Local generation failed.";
            setLocalAiError(detail);
            setError(`On-device AI could not complete this reply: ${detail}`);
          }
        } finally {
          setLocalGenerating(false);
          setLocalAiLoading(false);
          localAbortControllerRef.current = null;
        }
        return;
      }

      try {
        await sendMessage(
          {
            text: trimmed || (mode === "personal-tutor"
              ? "Please study these uploaded sources and help me understand their contents."
              : "Please analyse the attached file and explain its contents."),
            ...(filesToSend.length > 0 ? { files: filesToSend } : {}),
          },
          { body: { context: contextRef.current, mode } },
        );
      } catch (sendError) {
        showChatError(sendError);
        throw sendError;
      }
    },
    [isLoading, sendMessage, setMessages, mode, sourceFiles, showChatError, localAiEnabled, localAiReady, messages],
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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="truncate text-[11px] text-muted-foreground">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => void (localAiEnabled ? disableOnDeviceAI() : enableOnDeviceAI())}
            disabled={localAiLoading || localGenerating}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[10px] font-semibold text-foreground hover:bg-muted disabled:opacity-60 sm:px-3"
            title="Runs a small language model on this device; no cloud API credits are used."
          >
            <Cpu className="size-3.5" />
            <span>{localAiLoading ? "Preparing…" : localAiEnabled ? "On-device AI on" : "Enable local AI"}</span>
          </button>
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
      </div>

      {localAiLoading && (
        <div className="space-y-1 border-b border-border px-3 py-2" role="status" aria-live="polite">
          <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <span className="truncate">{localAiProgress.text || "Preparing local model…"}</span>
            <span>{Math.round(localAiProgress.progress * 100)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.round(localAiProgress.progress * 100)}%` }} />
          </div>
        </div>
      )}
      {localAiEnabled && (
        <div className="border-b border-border bg-muted/20 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
          On-device AI is selected. Chat prompts stay in this browser; no cloud AI provider is called. This small text model can be less accurate than a larger hosted model. PDF and image analysis are not available in local mode.
        </div>
      )}
      {localAiError && (
        <div className="border-b border-destructive/20 bg-destructive/5 px-3 py-2 text-[11px] text-destructive" role="status">
          {localAiError}
        </div>
      )}

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
                              href="https://gemini.google.com/app"
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
                            >
                              Open Gemini
                              <ExternalLink className="size-3.5" />
                            </a>
                          </div>
                          <p className="text-[10px] leading-relaxed text-muted-foreground">
                            In Gemini, paste the prompt and ask it to create an image. Download the result, then return to GhanaPathFinder and attach it in chat mode. Image-generation access and usage limits depend on your Google account, age eligibility, and region.
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
          {(status === "submitted" || localGenerating) && <Shimmer className="text-sm">{localGenerating ? "Generating on this device…" : "Thinking…"}</Shimmer>}
          {error && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-destructive" role="alert">
              <span>{error}</span>
              {!localAiEnabled && !localAiLoading && /quota has been exhausted|provider quota/i.test(error) && (
                <button
                  type="button"
                  onClick={() => void enableOnDeviceAI()}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 font-semibold text-primary-foreground hover:opacity-90"
                >
                  <Cpu className="size-3.5" />
                  Enable on-device AI
                </button>
              )}
              {canRetry && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setCanRetry(false);
                    void regenerate();
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-foreground hover:bg-muted"
                >
                  <RotateCcw className="size-3" />
                  Retry
                </button>
              )}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border/70 bg-muted/20 p-3 sm:p-4">
        <PromptInput
          className="w-full [&_[data-slot=input-group]]:flex-col [&_[data-slot=input-group]]:items-stretch [&_[data-slot=input-group]]:gap-3 [&_[data-slot=input-group]]:rounded-[24px] [&_[data-slot=input-group]]:border-border/80 [&_[data-slot=input-group]]:bg-card [&_[data-slot=input-group]]:p-3 [&_[data-slot=input-group]]:shadow-sm [&_[data-slot=input-group]]:transition-colors [&_[data-slot=input-group]]:focus-within:border-ghana-gold/60 [&_[data-slot=input-group]]:focus-within:ring-2 [&_[data-slot=input-group]]:focus-within:ring-ghana-gold/15"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          maxFiles={mode === "personal-tutor" ? 3 : 1}
          maxFileSize={MAX_ATTACHMENT_BYTES}
          onError={(attachmentError) => setError(attachmentError.message)}
          onSubmit={async (message, event) => {
            event.preventDefault();
            setEmojiPickerOpen(false);
            if (imageMode) {
              await createImage(message.text || input, message.files);
            } else {
              await ask(message.text || input, message.files);
            }
          }}
        >
          <PromptInputTextarea
            className="min-h-[112px] max-h-60 resize-y px-4 py-4 text-[15px] leading-7 text-foreground placeholder:text-muted-foreground/75 sm:min-h-[132px] sm:text-base"
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            placeholder={imageMode ? "Describe the image you want to create…" : "Message GhanaPathFinder…"}
          />
          <PromptInputFooter className="!w-full !flex-nowrap !items-center !justify-between !gap-2 !rounded-full !bg-navy-deep !px-2 !py-2 sm:!px-3">
            <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
              <div className="relative shrink-0">
                <PromptInputButton
                  className="text-background/80 hover:bg-white/10 hover:text-background"
                  disabled={isLoading}
                  onClick={() => setEmojiPickerOpen((current) => !current)}
                  tooltip="Add an emoji"
                  aria-label="Add an emoji"
                  aria-expanded={emojiPickerOpen}
                >
                  <Smile className="size-5" />
                </PromptInputButton>
                {emojiPickerOpen && (
                  <div
                    className="absolute bottom-full left-0 z-30 mb-2 flex gap-1 rounded-xl border border-border bg-popover p-2 shadow-lg"
                    role="group"
                    aria-label="Quick emoji"
                  >
                    {["🙂", "🎓", "👏", "❤️", "✨"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setInput((current) => `${current}${current.trim() ? " " : ""}${emoji}`);
                          setEmojiPickerOpen(false);
                        }}
                        className="grid size-9 place-items-center rounded-full text-lg hover:bg-muted"
                        aria-label={`Insert ${emoji} emoji`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <PromptInputButton
                className="shrink-0 text-background/80 hover:bg-white/10 hover:text-background"
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
              <AskAttachmentControls disabled={isLoading || imageMode || localAiEnabled} tutor={mode === "personal-tutor"} />
            </div>
            <PromptInputSubmit
              status={isLoading ? "streaming" : status}
              disabled={isLoading}
              onStop={stopAllGeneration}
              className="!size-11 !shrink-0 !rounded-full !bg-ghana-gold !text-navy-deep hover:!bg-ghana-gold-light disabled:!opacity-60"
            >
              {isLoading ? <span className="size-2.5 rounded-sm bg-current" /> : <ArrowRight className="size-5" />}
            </PromptInputSubmit>
          </PromptInputFooter>
        </PromptInput>
        <p className="mt-2 px-1 text-[10px] leading-relaxed text-muted-foreground">
          {imageMode
            ? "GhanaPathFinder prepares your prompt for an external image creator. No paid image-generation API is used by this chatbot."
            : localAiEnabled
              ? "On-device mode uses a small model cached in your browser. The first download requires network access and compatible WebGPU hardware; your prompts are processed on this device."
              : mode === "personal-tutor"
                ? "Attach up to 3 PDF or image sources with 2 MB total. Source files stay in this active chat only and must be reattached after a reload."
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
  mode?: AskMode;
  sourceFiles?: FileUIPart[];
}

const DEFAULT_SUGGESTIONS = [
  "Which of these should I apply to first?",
  "What WASSCE grades do I need?",
  "Any scholarships that fit me?",
];

const AskPanel = ({ query, items, suggestions, mode = "general", sourceFiles = [] }: AskPanelProps) => {
  const [session, setSession] = useState(0);
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(null);
  const storageKey = mode === "general" ? STORAGE_KEY : `${STORAGE_KEY}.${mode}`;
  const panelTitle = mode === "personal-tutor"
    ? "Personal AI Tutor"
    : mode === "cofounder"
      ? "AI Co-Founder"
      : "Ask GhanaPathFinder";
  const panelDescription = mode === "personal-tutor"
    ? "Ask questions grounded in your uploaded study sources."
    : mode === "cofounder"
      ? "Pressure-test decisions, customers, products and execution."
      : "Ask follow-up questions, or attach a PDF or image for analysis.";

  useEffect(() => {
    setInitialMessages(loadHistory(storageKey));
  }, [storageKey]);

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
      key={`${mode}:${session}`}
      initialMessages={session === 0 ? initialMessages : []}
      contextText={contextText}
      suggestions={suggestions ?? DEFAULT_SUGGESTIONS}
      mode={mode}
      sourceFiles={sourceFiles}
      storageKey={storageKey}
      title={panelTitle}
      description={panelDescription}
      onClear={() => {
        try {
          window.localStorage.removeItem(storageKey);
        } catch {
          /* ignore */
        }
        setSession((current) => current + 1);
      }}
    />
  );
};

export default AskPanel;

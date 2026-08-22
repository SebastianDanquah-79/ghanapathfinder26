import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { buildAskContext, type AskContextItem } from "@/lib/askContext";

const STORAGE_KEY = "gpf.ask.history.v1";
const MAX_STORED = 40;

const textOf = (m: UIMessage) =>
  m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");

const loadHistory = (): UIMessage[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UIMessage[];
    return Array.isArray(parsed) ? parsed.filter((m) => m && Array.isArray(m.parts)) : [];
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

const AskChat = ({ initialMessages, contextText, suggestions, onClear }: AskChatProps) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const contextRef = useRef(contextText);
  contextRef.current = contextText;

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, stop } = useChat({
    messages: initialMessages,
    transport,
    onError: (e) => setError(e.message || "Something went wrong. Please try again."),
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Keep a clean, capped conversation history on the device.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch {
      /* storage full or unavailable — history is best-effort */
    }
  }, [messages]);

  const ask = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;
      setError(null);
      setInput("");
      void sendMessage({ text: trimmed }, { body: { context: contextRef.current } });
    },
    [isLoading, sendMessage],
  );

  return (
    <div className="rounded-xl border border-border bg-glass overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Ask GhanaPathFinder</p>
          <p className="text-[11px] text-muted-foreground truncate">
            Answers use the results currently on your screen.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] px-2 py-1 rounded-md border border-border text-muted-foreground hover:text-foreground"
          >
            New chat
          </button>
        )}
      </div>

      <Conversation className="max-h-[52vh] min-h-[180px]">
        <ConversationContent className="gap-4 p-3">
          {messages.length === 0 ? (
            <ConversationEmptyState
              title="Ask a question"
              description="Compare universities, check WASSCE requirements or plan a scholarship application."
            >
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className="text-[11px] px-2.5 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((m) => (
              <Message from={m.role} key={m.id}>
                <MessageContent>
                  {m.role === "assistant" ? (
                    <MessageResponse>{textOf(m)}</MessageResponse>
                  ) : (
                    <span className="whitespace-pre-wrap">{textOf(m)}</span>
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && <Shimmer className="text-sm">Thinking…</Shimmer>}
          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="p-3 pt-0">
        <PromptInput
          onSubmit={(message, event) => {
            event.preventDefault();
            ask(message.text || input);
          }}
        >
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="e.g. Which universities fit an aggregate of 12 for nursing?"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit
              status={status}
              disabled={!input.trim() && !isLoading}
              onStop={stop}
            />
          </PromptInputFooter>
        </PromptInput>
        <p className="text-[10px] text-muted-foreground mt-2">
          AI answers can be wrong. Always confirm details on the official website.
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

  // Load persisted history after hydration so SSR and client markup match.
  useEffect(() => {
    setInitialMessages(loadHistory());
  }, []);

  const contextText = useMemo(() => buildAskContext(query, items), [query, items]);

  if (initialMessages === null) {
    return (
      <div className="rounded-xl border border-border bg-glass p-4 text-xs text-muted-foreground">
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
        setSession((s) => s + 1);
      }}
    />
  );
};

export default AskPanel;

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "@/lib/router-compat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, CheckCircle2, Clock3, Loader2, MessageCircle, RotateCcw, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type StudyMode = "learn" | "quiz" | "revision" | "guided";
type ChatMessage = { role: "user" | "assistant"; content: string };
type StudySession = { id: string; activity: string; minutes: number; notes: string | null; created_at: string };

const modes: Array<{ id: StudyMode; label: string; description: string; instruction: string }> = [
  { id: "learn", label: "Explain", description: "Understand a topic", instruction: "Teach this topic clearly in small steps. Begin with the core idea, a simple example, then check my understanding with one short question. Avoid unnecessary jargon." },
  { id: "quiz", label: "Quiz me", description: "Practise recall", instruction: "Act as a patient tutor. Ask one question at a time, wait for my answer, explain why it is right or wrong, and adapt the next question to my response. Do not reveal the answer before I try." },
  { id: "revision", label: "Revision plan", description: "Make a realistic study plan", instruction: "Create a realistic revision plan using my available time. Break it into focused blocks, active recall, practice and breaks. State assumptions and ask for missing details rather than inventing them." },
  { id: "guided", label: "Work through it", description: "Hints before solutions", instruction: "Help me solve the problem step by step. Give a hint or guiding question first, let me attempt the next step, and only show a full solution when I ask or it is useful to explain a mistake." },
];

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return [hours > 0 ? String(hours).padStart(2, "0") : null, String(minutes).padStart(2, "0"), String(remainder).padStart(2, "0")].filter(Boolean).join(":");
}

async function readFunctionError(error: unknown) {
  const fallback = error instanceof Error ? error.message : "The AI tutor could not complete the request.";
  const context = error && typeof error === "object" ? (error as { context?: Response }).context : undefined;
  if (!context || typeof context.clone !== "function") return fallback;
  try {
    const body = await context.clone().json() as { error?: string };
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

export default function StudyCoachPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<StudyMode>("learn");
  const [subject, setSubject] = useState("Computer Science");
  const [level, setLevel] = useState("Early university");
  const [topic, setTopic] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [focusStartedAt, setFocusStartedAt] = useState<number | null>(null);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [savingSession, setSavingSession] = useState(false);

  const sessionsQuery = useQuery({
    queryKey: ["cru-study-sessions", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<StudySession[]> => {
      const { data, error } = await supabase.from("cru_study_sessions")
        .select("id,activity,minutes,notes,created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data ?? []) as StudySession[];
    },
  });

  useEffect(() => {
    if (focusStartedAt === null) return;
    const timer = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [focusStartedAt]);

  const elapsedSeconds = focusStartedAt === null ? 0 : Math.max(0, Math.floor((clockNow - focusStartedAt) / 1000));
  const focusLabel = useMemo(() => formatDuration(elapsedSeconds), [elapsedSeconds]);
  const activeMode = modes.find((item) => item.id === mode) ?? modes[0];

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!user) {
      toast.info("Sign in to use the AI Study Coach and keep your private study history.");
      return;
    }
    if (!text || busy) return;

    const prompt = messages.length === 0
      ? `Study mode: ${activeMode.label}. Subject: ${subject}. Level: ${level}. Topic or question: ${topic.trim() || text}.\n\nTutor approach: ${activeMode.instruction}\n\nStart the session in this mode. Keep the first response useful and focused.${topic.trim() && topic.trim().toLowerCase() !== text.toLowerCase() ? `\n\nMy specific request: ${text}` : ""}`
      : text;
    const previousMessages = messages;
    const nextMessages = [...messages, { role: "user" as const, content: prompt }].slice(-40);
    setMessages(nextMessages);
    setInput("");
    setRequestError(null);
    setBusy(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-professor", {
        body: { messages: nextMessages },
      });
      if (error) throw new Error(await readFunctionError(error));
      const response = data as { output_text?: string; choices?: Array<{ message?: { content?: string } }>; error?: string; configured?: boolean } | null;
      if (response?.error) throw new Error(response.error);
      const answer = response?.output_text || response?.choices?.[0]?.message?.content || "";
      if (!answer.trim()) throw new Error("The AI tutor returned an empty answer. Please try again.");
      setMessages([...nextMessages, { role: "assistant", content: answer }].slice(-40));
      if (!topic.trim() && messages.length === 0) setTopic(text.slice(0, 160));
    } catch (error) {
      setMessages(previousMessages);
      setInput(text);
      const message = error instanceof Error ? error.message : "The AI tutor could not complete the request.";
      setRequestError(message);
    } finally {
      setBusy(false);
    }
  }

  async function finishFocusSession() {
    if (!user || focusStartedAt === null || savingSession) return;
    const minutes = Math.floor((Date.now() - focusStartedAt) / 60_000);
    if (minutes < 1) {
      toast.info("Keep the focus timer running for at least one minute before saving the session.");
      return;
    }
    setSavingSession(true);
    const activity = `AI Study Coach · ${activeMode.label} · ${subject.trim() || "Study"}`.slice(0, 180);
    const { error } = await supabase.from("cru_study_sessions").insert({
      user_id: user.id,
      activity,
      minutes,
      notes: topic.trim().slice(0, 500) || null,
    });
    if (error) {
      toast.error("The study session could not be saved. Your timer is still running.");
    } else {
      setFocusStartedAt(null);
      setClockNow(Date.now());
      toast.success(`${minutes} study minute${minutes === 1 ? "" : "s"} saved.`);
      await queryClient.invalidateQueries({ queryKey: ["cru-study-sessions", user.id] });
    }
    setSavingSession(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.8fr)]">
      <section className="min-w-0 border border-border bg-card">
        <div className="border-b border-border p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center border border-border bg-background text-primary"><Sparkles className="h-5 w-5" /></span>
              <div>
                <h2 className="font-semibold">Your AI Study Coach</h2>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">Learn at your pace. Practise actively. Ask follow-up questions.</p>
              </div>
            </div>
            {messages.length > 0 && <button type="button" onClick={() => { setMessages([]); setRequestError(null); }} className="inline-flex items-center gap-1.5 border border-border px-2.5 py-1.5 text-xs font-semibold"><RotateCcw className="h-3.5 w-3.5" /> New session</button>}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Study mode">
            {modes.map((item) => (
              <button key={item.id} type="button" onClick={() => setMode(item.id)} aria-pressed={mode === item.id} disabled={busy || messages.length > 0} className={`border px-3 py-2 text-left transition ${mode === item.id ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/50"} disabled:cursor-not-allowed disabled:opacity-70`}>
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">{item.description}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="text-xs font-medium text-muted-foreground">Subject
              <input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={100} disabled={messages.length > 0 || busy} className="mt-1 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground disabled:opacity-70" />
            </label>
            <label className="text-xs font-medium text-muted-foreground">Your level
              <select value={level} onChange={(event) => setLevel(event.target.value)} disabled={messages.length > 0 || busy} className="mt-1 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground disabled:opacity-70">
                <option>Junior High School</option><option>Senior High School</option><option>Early university</option><option>University advanced</option><option>Professional development</option>
              </select>
            </label>
          </div>
          <label className="mt-3 block text-xs font-medium text-muted-foreground">What are you learning today?
            <input value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={160} disabled={messages.length > 0 || busy} placeholder="e.g. Linear algebra, Python loops, chemistry stoichiometry" className="mt-1 w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground disabled:opacity-70" />
          </label>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          {messages.length === 0 ? (
            <div className="border border-dashed border-border p-4">
              <p className="text-sm font-medium">Ready when you are.</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{activeMode.instruction}</p>
              {!user && <p className="mt-3 text-sm"><Link to="/auth?next=%2Fask-africa" className="font-semibold text-primary underline">Sign in</Link> to start a private study session and save your progress.</p>}
            </div>
          ) : (
            <div className="max-h-[52vh] space-y-4 overflow-y-auto" aria-live="polite">
              {messages.map((message, index) => (
                <article key={`${index}-${message.role}`} className={`border p-3 sm:p-4 ${message.role === "assistant" ? "border-border bg-background" : "border-primary/25 bg-primary/[0.04]"}`}>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{message.role === "assistant" ? "Study Coach" : "You"}</p>
                  <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                </article>
              ))}
              {busy && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Thinking through it…</p>}
            </div>
          )}
          {requestError && <div role="alert" className="border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"><p className="font-semibold">The AI tutor could not respond.</p><p className="mt-1 break-words">{requestError}</p></div>}
          <form onSubmit={sendMessage} className="space-y-2">
            <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={3} maxLength={4000} disabled={!user || busy} placeholder={messages.length === 0 ? "Ask a question or enter a problem to work on…" : "Answer the tutor's question or ask a follow-up…"} className="w-full resize-y border border-border bg-background px-3 py-3 text-sm disabled:opacity-60" />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-muted-foreground">Your study chat stays in this page session; only topic and timer duration are saved to your study history.</p>
              <button type="submit" disabled={!user || !input.trim() || busy} className="inline-flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {messages.length ? "Send" : "Start learning"}</button>
            </div>
          </form>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-primary" /><h2 className="font-semibold">Focus timer</h2></div>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">Track time you actually spend studying. It does not assume your session is complete.</p>
          <p className="my-4 text-center font-mono text-4xl font-semibold tabular-nums">{focusLabel}</p>
          {focusStartedAt === null ? (
            <button type="button" disabled={!user} onClick={() => { setClockNow(Date.now()); setFocusStartedAt(Date.now()); }} className="w-full border border-primary bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">Start focus session</button>
          ) : (
            <div className="space-y-2">
              <button type="button" disabled={savingSession || elapsedSeconds < 60} onClick={() => void finishFocusSession()} className="w-full border border-primary bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{savingSession ? "Saving…" : "Finish and save session"}</button>
              <button type="button" disabled={savingSession} onClick={() => { setFocusStartedAt(null); setClockNow(Date.now()); }} className="w-full border border-border px-3 py-2.5 text-sm font-semibold disabled:opacity-50">Cancel timer</button>
              {elapsedSeconds < 60 && <p className="text-center text-xs text-muted-foreground">One full minute is required to save a session.</p>}
            </div>
          )}
        </section>

        <section className="border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2"><h2 className="font-semibold">Recent study sessions</h2><BookOpen className="h-4 w-4 text-primary" /></div>
          {!user ? <p className="mt-3 text-sm text-muted-foreground">Sign in to keep a private study history.</p>
            : sessionsQuery.isLoading ? <p className="mt-3 text-sm text-muted-foreground">Loading your history…</p>
            : sessionsQuery.isError ? <p className="mt-3 text-sm text-destructive">Study history could not be loaded.</p>
            : !sessionsQuery.data?.length ? <p className="mt-3 text-sm leading-5 text-muted-foreground">Completed focus sessions will appear here. No sample data is added.</p>
            : <div className="mt-3 space-y-3">{sessionsQuery.data.map((session) => <article key={session.id} className="border-t border-border pt-3"><div className="flex items-start justify-between gap-2"><p className="text-sm font-medium">{session.activity}</p><span className="shrink-0 text-xs font-semibold">{session.minutes}m</span></div>{session.notes && <p className="mt-1 text-xs text-muted-foreground">{session.notes}</p>}<p className="mt-1 text-[11px] text-muted-foreground">{new Date(session.created_at).toLocaleDateString("en-GH")}</p></article>)}</div>
          }
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Your history is restricted to your account.</p>
        </section>
        <p className="px-1 text-xs leading-5 text-muted-foreground">Use the tutor to learn, not to submit work you do not understand. Verify high-stakes academic requirements against your lecturer or institution.</p>
      </aside>
    </div>
  );
}

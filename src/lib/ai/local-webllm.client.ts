export const LOCAL_AI_MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";
export const LOCAL_AI_MODEL_MEMORY_NOTE = "This small model may need around 1 GB of GPU memory. The first model download is large and will be cached by your browser.";

export type LocalAIMode = "general" | "personal-tutor" | "cofounder";

export type LocalAIProgress = {
  progress: number;
  text: string;
};

export type LocalAIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type LocalStreamChunk = {
  choices?: Array<{
    delta?: {
      content?: string | null;
    };
  }>;
};

type LocalEngine = {
  chat: {
    completions: {
      create: (options: {
        messages: LocalAIMessage[];
        stream: true;
        temperature: number;
        max_tokens: number;
      }) => Promise<AsyncIterable<LocalStreamChunk>>;
    };
  };
  interruptGenerate?: () => Promise<void> | void;
};

type NavigatorWithGPU = Navigator & {
  gpu?: {
    requestAdapter?: () => Promise<unknown | null>;
  };
};

let localEngine: LocalEngine | null = null;
let enginePromise: Promise<LocalEngine> | null = null;
let modelWorker: Worker | null = null;

export async function checkLocalAIAvailability(): Promise<{
  available: boolean;
  reason?: string;
}> {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { available: false, reason: "On-device AI is available in a modern browser, not during server rendering." };
  }

  const gpu = (navigator as NavigatorWithGPU).gpu;
  if (!gpu?.requestAdapter) {
    return {
      available: false,
      reason: "This browser does not expose WebGPU. Open GhanaPathFinder in a current WebGPU-compatible browser on a supported device.",
    };
  }

  try {
    const adapter = await gpu.requestAdapter();
    if (!adapter) {
      return {
        available: false,
        reason: "WebGPU is present, but this device did not provide a compatible GPU adapter. Use a supported device or continue browsing the catalogues.",
      };
    }
  } catch {
    return {
      available: false,
      reason: "The browser could not initialise WebGPU on this device. Continue using the catalogue features.",
    };
  }

  return { available: true };
}

export async function loadLocalAI(
  onProgress?: (progress: LocalAIProgress) => void,
): Promise<void> {
  if (localEngine) return;
  if (enginePromise) return enginePromise.then(() => undefined);

  const availability = await checkLocalAIAvailability();
  if (!availability.available) {
    throw new Error(availability.reason || "This device cannot run the on-device model.");
  }

  enginePromise = (async () => {
    const webllm = await import("@mlc-ai/web-llm");
    const modelExists = webllm.prebuiltAppConfig.model_list.some(
      (record) => record.model_id === LOCAL_AI_MODEL_ID,
    );
    if (!modelExists) {
      throw new Error("The selected on-device model is not present in the installed WebLLM model catalogue.");
    }

    modelWorker = new Worker(
      new URL("./local-webllm.worker.ts", import.meta.url),
      { type: "module", name: "ghanapathfinder-local-ai" },
    );

    try {
      const engine = await webllm.CreateWebWorkerMLCEngine(
        modelWorker,
        LOCAL_AI_MODEL_ID,
        {
          initProgressCallback: (report) => {
            onProgress?.({
              progress: Math.max(0, Math.min(1, Number(report.progress) || 0)),
              text: String(report.text || "Preparing the on-device model…"),
            });
          },
        },
      );
      localEngine = engine as unknown as LocalEngine;
      return localEngine;
    } catch (error) {
      modelWorker?.terminate();
      modelWorker = null;
      throw error;
    }
  })();

  try {
    await enginePromise;
  } catch (error) {
    enginePromise = null;
    throw error;
  }
}

export function isLocalAIReady(): boolean {
  return localEngine !== null;
}

export function buildLocalAIMessages(input: {
  mode: LocalAIMode;
  contextText: string;
  history: Array<{ role: "user" | "assistant"; text: string }>;
}): LocalAIMessage[] {
  const modeInstructions: Record<LocalAIMode, string> = {
    general: "You are GhanaPathFinder's on-device assistant. Help with education and platform questions. Use clear, simple English. Do not invent university requirements, cut-off points, fees, scholarship deadlines, vacancies, salaries or current facts. Say when you are unsure and advise checking official sources for time-sensitive information.",
    "personal-tutor": "You are GhanaPathFinder's on-device personal tutor. Teach in small steps with simple explanations, precise terms and examples. Prioritise the course context supplied below. Ask one short question to check understanding. Do not claim mastery until the learner demonstrates it. If unsure about a fact, say so. The local model cannot read attachments in this mode.",
    cofounder: "You are GhanaPathFinder's on-device AI co-founder. Be direct, practical and intellectually honest. Challenge weak assumptions, separate facts from estimates, suggest testable next actions, and do not invent market sizes, customer interviews, financial figures or traction. State uncertainty clearly.",
  };

  const context = input.contextText.trim().slice(0, 2_400);
  const system = [
    modeInstructions[input.mode],
    context ? `Platform and page context (treat as supplied reference material, not as proof of current external facts):\n${context}` : "",
    "Never claim you accessed the internet, university portals or live databases during this local response. Do not fabricate citations. Keep answers proportionate to the small on-device model's capabilities.",
  ].filter(Boolean).join("\n\n");

  const history = input.history
    .filter((message) => message.text.trim())
    .slice(-7)
    .map((message) => ({
      role: message.role,
      content: message.text.trim().slice(0, 1_200),
    }));

  return [{ role: "system", content: system }, ...history];
}

export async function streamLocalAIResponse(input: {
  messages: LocalAIMessage[];
  onToken: (token: string) => void;
  signal?: AbortSignal;
  maxTokens?: number;
}): Promise<string> {
  if (!localEngine) {
    throw new Error("On-device AI is not loaded. Select Enable on-device AI first.");
  }

  const stream = await localEngine.chat.completions.create({
    messages: input.messages,
    stream: true,
    temperature: 0.35,
    max_tokens: Math.min(600, Math.max(80, input.maxTokens ?? 480)),
  });

  let response = "";
  for await (const chunk of stream) {
    if (input.signal?.aborted) {
      await localEngine.interruptGenerate?.();
      throw new DOMException("Generation stopped.", "AbortError");
    }
    const token = chunk.choices?.[0]?.delta?.content;
    if (typeof token === "string" && token.length > 0) {
      response += token;
      input.onToken(token);
    }
  }

  return response.trim();
}

export async function unloadLocalAI(): Promise<void> {
  try {
    await localEngine?.interruptGenerate?.();
  } finally {
    modelWorker?.terminate();
    modelWorker = null;
    localEngine = null;
    enginePromise = null;
  }
}

import { useEffect } from "react";
import { getLanguage, type AppLanguage } from "@/lib/i18n";
import { resolveBackend } from "@/lib/backend-routing";

const ENDPOINT = "https://api.mymemory.translated.net/get";
const CACHE_KEY = "gpf-translation-cache-v1";
const LANGUAGE_MAP: Record<AppLanguage, string> = {
  en: "en",
  fr: "fr",
  sw: "sw",
  ar: "ar",
  pt: "pt",
  es: "es",
  ha: "ha",
  am: "am",
  yo: "yo",
  ig: "ig",
  wo: "wo",
  tw: "ak",
  ee: "ee",
};

const PROTECTED = new Set([
  "GhanaPathFinder",
  "WASSCE",
  "WAEC",
  "NECO",
  "IB",
  "IGCSE",
  "KCSE",
  "UACE",
  "UCE",
  "NSC",
  "SAT",
  "ACT",
  "AP",
  "HTML",
  "URL",
  "PDF",
  "AI",
  "GCTU",
  "KNUST",
  "UG",
]);

const originalText = new WeakMap<Text, string>();
const appliedLanguage = new WeakMap<Text, AppLanguage>();

function cacheRead(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function cacheWrite(cache: Record<string, string>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Translation remains functional without persistent caching.
  }
}

function shouldTranslate(node: Text) {
  const parent = node.parentElement;
  if (!parent) return false;
  const tag = parent.tagName.toLowerCase();
  if (["script", "style", "code", "pre", "svg", "noscript"].includes(tag)) return false;
  if (parent.closest("[data-no-translate='true']")) return false;

  const value = node.nodeValue?.trim() || "";
  if (value.length < 2 || !/[A-Za-zÀ-ÿЀ-ӿ]/u.test(value)) return false;
  if (PROTECTED.has(value)) return false;
  if (/^(https?:\/\/|www\.)/i.test(value)) return false;
  if (/^[A-Z0-9_./:-]{2,20}$/.test(value)) return false;
  return true;
}

function getTextNodes(root: Node): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    const node = current as Text;
    if (shouldTranslate(node)) nodes.push(node);
    current = walker.nextNode();
  }
  return nodes;
}

async function translateText(text: string, source: AppLanguage, target: AppLanguage) {
  if (source === target) return text;

  const cache = cacheRead();
  const key = `${source}|${target}|${text}`;
  if (cache[key]) return cache[key];

  const url = new URL(ENDPOINT);
  url.searchParams.set("q", text.slice(0, 500));
  url.searchParams.set("langpair", `${LANGUAGE_MAP[source]}|${LANGUAGE_MAP[target]}`);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Translation request failed");
  const data = await response.json();
  const translated = data?.responseData?.translatedText;
  if (!translated || translated === text) return text;

  cache[key] = translated;
  cacheWrite(cache);
  return translated;
}

async function translateDocument(target: AppLanguage) {
  await resolveBackend(target).catch(() => null);
  if (target === "en") return;

  const nodes = getTextNodes(document.body);
  const unique = new Map<string, Text[]>();

  for (const node of nodes) {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue || "");
    const sourceText = originalText.get(node) || "";
    if (!sourceText.trim() || appliedLanguage.get(node) === target) continue;
    const bucket = unique.get(sourceText) || [];
    bucket.push(node);
    unique.set(sourceText, bucket);
  }

  const entries = [...unique.entries()];
  for (let i = 0; i < entries.length; i += 6) {
    const batch = entries.slice(i, i + 6);
    await Promise.all(batch.map(async ([sourceText, nodesForText]) => {
      try {
        const translated = await translateText(sourceText, "en", target);
        for (const node of nodesForText) {
          if (node.isConnected) {
            const leading = sourceText.match(/^\s*/)?.[0] || "";
            const trailing = sourceText.match(/\s*$/)?.[0] || "";
            node.nodeValue = `${leading}${translated.trim()}${trailing}`;
            appliedLanguage.set(node, target);
          }
        }
      } catch {
        // Keep the original English text if a segment cannot be translated.
      }
    }));
  }
}

export default function AutoTranslate() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let timer: number | undefined;
    const run = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => void translateDocument(getLanguage()), 120);
    };

    run();
    window.addEventListener("gp-language-change", run);

    const observer = new MutationObserver((mutations) => {
      if (getLanguage() === "en") return;
      if (mutations.some((mutation) => mutation.addedNodes.length > 0)) run();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("gp-language-change", run);
      observer.disconnect();
    };
  }, []);

  return null;
}

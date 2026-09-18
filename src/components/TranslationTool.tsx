import { useMemo, useState } from "react";
import { Languages, Loader2, ArrowRightLeft, Copy, Check } from "@/lib/icons";
import { LANGUAGES, getLanguage, setLanguage, t, type AppLanguage } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TranslationTool = () => {
  const current = getLanguage();
  const [source, setSource] = useState<AppLanguage>(current);
  const [target, setTarget] = useState<AppLanguage>(current === "en" ? "fr" : "en");
  const [textValue, setTextValue] = useState("");
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const sourceName = useMemo(() => LANGUAGES.find((x) => x.code === source)?.nativeName ?? source, [source]);
  const targetName = useMemo(() => LANGUAGES.find((x) => x.code === target)?.nativeName ?? target, [target]);

  const translate = async () => {
    const text = textValue.trim();
    if (!text || source === target) {
      setTranslated(text);
      return;
    }
    setLoading(true);
    setTranslated("");
    try {
      const url = new URL("https://api.mymemory.translated.net/get");
      url.searchParams.set("q", text);
      url.searchParams.set("langpair", `${source}|${target}`);
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Translation request failed");
      const data = await response.json();
      const result = data?.responseData?.translatedText;
      if (!result) throw new Error("No translation returned");
      setTranslated(result);
    } catch {
      setTranslated("Translation is temporarily unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const swap = () => {
    setSource(target);
    setTarget(source);
    setTextValue(translated);
    setTranslated(textValue);
  };

  const copyResult = async () => {
    if (!translated || translated.startsWith("Translation is temporarily")) return;
    await navigator.clipboard.writeText(translated);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-secondary transition-colors" aria-label="Open translation tool">
          <Languages className="h-4 w-4" />
          <span className="hidden lg:inline">Translate</span>
        </button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("translation_tool", current)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">From</label>
              <Select value={source} onValueChange={(v) => setSource(v as AppLanguage)}>
                <SelectTrigger><SelectValue>{sourceName}</SelectValue></SelectTrigger>
                <SelectContent>{LANGUAGES.map((item) => <SelectItem key={item.code} value={item.code}>{item.nativeName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button type="button" variant="outline" size="icon" onClick={swap} aria-label="Swap languages"><ArrowRightLeft className="h-4 w-4" /></Button>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">To</label>
              <Select value={target} onValueChange={(v) => setTarget(v as AppLanguage)}>
                <SelectTrigger><SelectValue>{targetName}</SelectValue></SelectTrigger>
                <SelectContent>{LANGUAGES.map((item) => <SelectItem key={item.code} value={item.code}>{item.nativeName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Textarea value={textValue} onChange={(e) => setTextValue(e.target.value)} placeholder="Enter text to translate..." className="min-h-32 resize-y" />
          <Button type="button" onClick={translate} disabled={loading || !textValue.trim()} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Translating..." : "Translate"}
          </Button>
          <div className="relative">
            <Textarea readOnly value={translated} placeholder="Translation will appear here..." className="min-h-32 resize-y pr-12" dir={LANGUAGES.find((x) => x.code === target)?.rtl ? "rtl" : "ltr"} />
            {translated && !translated.startsWith("Translation is temporarily") && (
              <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2" onClick={copyResult} aria-label="Copy translation">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Supports every language currently available in GhanaPathFinder. University names, grades, URLs and other structured data remain unchanged.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TranslationTool;

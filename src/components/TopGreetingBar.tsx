import { useEffect, useState } from "react";
import UsageCounter from "@/components/UsageCounter";

const thanks = [
  { lang: "Twi", text: "Yɛda wo ase sɛ wode GhanaPath adi dwuma" },
  { lang: "Ewe", text: "Akpe na wò be nèzã GhanaPath" },
  { lang: "Ga", text: "Oyiwaladɔŋŋ akɛ okɛ GhanaPath tsu nii" },
];

const TopGreetingBar = () => {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % thanks.length), 4000);
    return () => clearInterval(t);
  }, []);

  const current = thanks[i]!;

  return (
    <div className="border-b border-border/40 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between gap-3 overflow-hidden">
        <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
          <span className="text-primary font-medium">{current.lang}:</span> {current.text}
        </p>
        <UsageCounter className="shrink-0 !text-[11px] sm:!text-xs" />
      </div>
    </div>
  );
};

export default TopGreetingBar;

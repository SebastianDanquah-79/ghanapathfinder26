import { useEffect, useMemo, useState } from "react";

const symbols = [
  { name: "Gye Nyame", glyph: "✦", meaning: "supremacy of God", x: "7%", y: "17%", size: 56, delay: "0s", duration: "13s" },
  { name: "Sankofa", glyph: "↶", meaning: "learn from the past", x: "88%", y: "22%", size: 54, delay: "-4s", duration: "15s" },
  { name: "Nyame Dua", glyph: "♧", meaning: "presence and protection", x: "11%", y: "66%", size: 48, delay: "-7s", duration: "16s" },
  { name: "Dwennimmen", glyph: "⌁", meaning: "strength and humility", x: "91%", y: "69%", size: 52, delay: "-2s", duration: "14s" },
  { name: "Mpatapo", glyph: "∞", meaning: "reconciliation", x: "20%", y: "31%", size: 34, delay: "-9s", duration: "18s" },
  { name: "Nkyim", glyph: "◈", meaning: "initiative and versatility", x: "79%", y: "44%", size: 38, delay: "-6s", duration: "17s" },
  { name: "Adinkrahene", glyph: "◉", meaning: "leadership and charisma", x: "5%", y: "86%", size: 38, delay: "-11s", duration: "19s" },
  { name: "Fawohodie", glyph: "⌇", meaning: "independence", x: "95%", y: "88%", size: 35, delay: "-5s", duration: "16s" },
];

export function AdinkraFloat() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const visibleSymbols = useMemo(() => symbols, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] hidden overflow-hidden md:block"
    >
      {visibleSymbols.map((symbol, index) => (
        <div
          key={symbol.name}
          title={`${symbol.name}: ${symbol.meaning}`}
          className="absolute select-none"
          style={{ left: symbol.x, top: symbol.y }}
        >
          <div
            className="adinkra-float rounded-full border border-[#b08a3c]/25 bg-white/55 p-2 text-[#b08a3c]/55 shadow-[0_8px_30px_rgba(15,34,58,0.06)] backdrop-blur-[2px]"
            style={{
              width: symbol.size,
              height: symbol.size,
              animation: reducedMotion
                ? "none"
                : `adinkra-drift ${symbol.duration} ease-in-out ${symbol.delay} infinite`,
              animationDirection: index % 2 ? "reverse" : "normal",
            }}
          >
            <span
              className="flex h-full w-full items-center justify-center font-serif text-2xl leading-none"
              style={{ fontSize: Math.max(22, symbol.size * 0.42) }}
            >
              {symbol.glyph}
            </span>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes adinkra-drift {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-4deg); }
          25% { transform: translate3d(7px, -13px, 0) rotate(3deg); }
          50% { transform: translate3d(-3px, -22px, 0) rotate(7deg); }
          75% { transform: translate3d(-9px, -8px, 0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";

const motifs = [
  ["Gye Nyame", "https://commons.wikimedia.org/wiki/Special:Redirect/file/Gye%20Nyame%20(Adinkra%20Symbol).svg"],
  ["Nyame Dua", "https://commons.wikimedia.org/wiki/Special:Redirect/file/Nyame_dua.png"],
  ["Sankofa", "https://commons.wikimedia.org/wiki/Special:Redirect/file/Sankofa%20dua.png"],
  ["Dwennimmen", "https://commons.wikimedia.org/wiki/Special:Redirect/file/Dwennimmen.svg"],
  ["Adinkrahene", "https://commons.wikimedia.org/wiki/Special:Redirect/file/Adinkrahene%20dua%20(Adinkra%20card).svg"],
];

const positions = [
  [4, 15], [15, 32], [29, 11], [45, 18], [62, 8], [78, 17], [91, 12],
  [8, 57], [21, 76], [36, 63], [52, 78], [68, 57], [83, 76], [94, 61],
  [12, 88], [30, 92], [57, 91], [76, 88], [89, 94],
];

const AdinkraFloatLayer = () => {
  const pointerX = useMotionValue(-1000);
  const pointerY = useMotionValue(-1000);
  const springX = useSpring(pointerX, { stiffness: 90, damping: 20 });
  const springY = useSpring(pointerY, { stiffness: 90, damping: 20 });
  const [burst, setBurst] = useState({ x: -1000, y: -1000, key: 0 });

  useEffect(() => {
    const move = (event: PointerEvent) => {
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [pointerX, pointerY]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-auto overflow-hidden select-none"
      onPointerDown={(event) => setBurst({ x: event.clientX, y: event.clientY, key: Date.now() })}
    >
      {positions.map(([left, top], index) => {
        const [name, src] = motifs[index % motifs.length];
        const size = 30 + ((index * 13) % 32);
        const drift = 10 + (index % 5) * 4;
        const angle = index % 2 === 0 ? 5 : -5;
        return (
          <motion.div
            key={`${name}-${index}`}
            className="absolute pointer-events-none"
            style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
            animate={{
              x: [-drift, drift, -drift],
              y: [drift, -drift, drift],
              rotate: [-angle, angle, -angle],
            }}
            transition={{
              duration: 12 + (index % 7) * 2,
              delay: (index % 9) * 0.45,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.img
              src={src}
              alt=""
              className="h-full w-full object-contain grayscale opacity-[0.08]"
              loading="lazy"
              referrerPolicy="no-referrer"
              style={{
                x: useTransform(springX, (x) => (x - (window.innerWidth * left) / 100) * -0.012),
                y: useTransform(springY, (y) => (y - (window.innerHeight * top) / 100) * -0.012),
              }}
            />
          </motion.div>
        );
      })}
      <motion.div
        key={burst.key}
        className="fixed pointer-events-none rounded-full border border-[#c9a227]/25"
        initial={{ width: 0, height: 0, opacity: 0.35, x: burst.x, y: burst.y }}
        animate={{ width: 240, height: 240, opacity: 0, x: burst.x - 120, y: burst.y - 120 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      />
    </div>
  );
};

export default AdinkraFloatLayer;

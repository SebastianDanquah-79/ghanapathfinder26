import { motion } from "framer-motion";

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

const Motif = ({ left, top, index }: { left: number; top: number; index: number }) => {
  const [, src] = motifs[index % motifs.length];
  const size = 30 + ((index * 13) % 32);
  const duration = 12 + (index % 7) * 2;
  const delay = -((index * 2.7) % duration);
  const drift = 18 + (index % 5) * 7;
  const rotation = index % 2 === 0 ? 10 : -10;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
      animate={{
        y: ["-125vh", "125vh"],
        x: [-drift, drift, -drift],
        rotate: [-rotation, rotation, -rotation],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
        times: [0, 0.5, 1],
      }}
    >
      <motion.img
        src={src}
        alt=""
        className="h-full w-full object-contain grayscale opacity-[0.10]"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </motion.div>
  );
};

const AdinkraFloatLayer = () => (
  <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
    {positions.map(([left, top], index) => (
      <Motif key={`${index}-${left}-${top}`} left={left} top={top} index={index} />
    ))}
  </div>
);

export default AdinkraFloatLayer;

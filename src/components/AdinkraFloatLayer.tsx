import { motion } from "framer-motion";

const motifs = [
  {
    name: "Gye Nyame",
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Gye%20Nyame%20(Adinkra%20Symbol).svg",
    className: "left-[4%] top-[18%]",
    delay: 0,
    duration: 18,
  },
  {
    name: "Nyame Dua",
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Nyame_dua.png",
    className: "right-[7%] top-[27%]",
    delay: 2,
    duration: 22,
  },
  {
    name: "Sankofa",
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Sankofa%20dua.png",
    className: "left-[10%] top-[58%]",
    delay: 4,
    duration: 20,
  },
  {
    name: "Dwennimmen",
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Dwennimmen.svg",
    className: "right-[4%] top-[67%]",
    delay: 1,
    duration: 24,
  },
  {
    name: "Adinkrahene",
    src: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Adinkrahene%20dua%20(Adinkra%20card).svg",
    className: "left-[45%] top-[9%]",
    delay: 3,
    duration: 26,
  },
];

const AdinkraFloatLayer = () => (
  <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
    {motifs.map((motif) => (
      <motion.div
        key={motif.name}
        className={`absolute ${motif.className} w-10 h-10 sm:w-12 sm:h-12 opacity-[0.07]`}
        animate={{
          y: [-8, 10, -8],
          x: [-5, 7, -5],
          rotate: [-4, 4, -4],
        }}
        transition={{
          duration: motif.duration,
          delay: motif.delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <img
          src={motif.src}
          alt=""
          className="w-full h-full object-contain grayscale"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </motion.div>
    ))}
  </div>
);

export default AdinkraFloatLayer;

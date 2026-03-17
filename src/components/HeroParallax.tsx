import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface HeroParallaxProps {
  imageSrc: string;
  imageAlt: string;
  line1: string;
  line2: string;
  ctaHref: string;
  ctaLabel: string;
}

export default function HeroParallax({
  imageSrc,
  imageAlt,
  line1,
  line2,
  ctaHref,
  ctaLabel,
}: HeroParallaxProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100vh] items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Image de fond avec parallaxe */}
      <motion.div className="absolute inset-0 z-0" style={{ y }}>
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-[130%] w-full object-cover object-center"
          fetchPriority="high"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            const next = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
            if (next) next.classList.remove("hidden");
          }}
        />
        {/* Fallback si image absente (coller hero.jpg dans public/) */}
        <div
          className="hidden absolute inset-0 bg-gradient-to-b from-stone-300 to-stone-500"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[#1C1917]/40"
          aria-hidden="true"
        />
      </motion.div>

      {/* Contenu centré */}
      <motion.div
        className="relative z-10 mx-auto max-w-5xl px-4 text-center"
        style={{ opacity }}
      >
        <h1 className="font-serif text-5xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-6xl md:text-7xl">
          <span className="block">{line1}</span>
          <span className="block mt-2">{line2}</span>
        </h1>
        <p className="mt-8 text-lg leading-relaxed text-white/90 sm:text-xl">
          Fabrication et pose d'escaliers sur mesure dans le Sundgau depuis 33 ans.
        </p>
        <a
          href={ctaHref}
          className="mt-10 inline-block border border-white/90 bg-white/10 px-8 py-4 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white hover:text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
        >
          {ctaLabel}
        </a>
      </motion.div>
    </section>
  );
}

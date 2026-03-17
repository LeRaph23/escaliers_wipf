import {
  Zap,
  ShieldCheck,
  Wrench,
  Lightbulb,
  Thermometer,
  AirVent,
  Video,
  Lock,
  Smartphone,
  Server,
  Leaf,
} from "lucide-react";
import { interventions } from "../config/interventions";

const iconMap = {
  Zap,
  ShieldCheck,
  Wrench,
  Lightbulb,
  Thermometer,
  AirVent,
  Video,
  Lock,
  Smartphone,
  Server,
  Leaf,
};

const phone = "tel:+33672045106";

export default function BentoInterventions() {
  return (
    <section
      className="px-4 py-24 sm:px-6 sm:py-32"
      aria-labelledby="bento-heading"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="bento-heading"
          className="text-left text-2xl font-bold text-[#121212] sm:text-3xl"
        >
          Nos interventions
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {interventions.map((item) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            return (
              <article
                key={item.title}
                className="intervention-card scroll-reveal flex flex-col overflow-hidden rounded-2xl border border-[#121212]/10 bg-[#F8F9FA]/80"
              >
                {item.image && (
                  <div className="relative h-48 w-full shrink-0 overflow-hidden bg-[#121212]/5 sm:h-52">
                    <img
                      src={`/${encodeURI(item.image)}`}
                      alt={`${item.title} — électricien Helfrantzkirch Haut-Rhin`}
                      className="h-full w-full object-cover scale-[1.15]"
                      style={{ objectPosition: "68% 26%" }}
                      loading="lazy"
                      width={400}
                      height={300}
                    />
                    {Icon && (
                      <span className="absolute right-3 top-3 rounded-md border border-[#121212]/10 bg-[#F8F9FA] p-2 text-[#121212]/70">
                        <Icon className="h-4 w-4" strokeWidth={1.5} />
                      </span>
                    )}
                  </div>
                )}
                {!item.image && Icon && (
                  <div className="flex h-44 w-full shrink-0 items-center justify-center bg-[#121212]/5 sm:h-48">
                    <span className="rounded-md border border-[#121212]/10 bg-[#F8F9FA] p-3 text-[#121212]/70">
                      <Icon className="h-8 w-8" strokeWidth={1.5} />
                    </span>
                  </div>
                )}
                <div className="flex min-h-[7rem] flex-1 flex-col p-5">
                  <h3 className="text-lg font-semibold text-[#121212]">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-[#121212]/70">
                    {item.description}
                  </p>
                  <a
                    href={phone}
                    className="mt-4 inline-block text-sm font-medium text-[var(--accent)] hover:underline"
                  >
                    Appeler →
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

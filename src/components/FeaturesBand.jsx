import { Feather, HandHeart, Truck } from 'lucide-react';
import { Reveal } from './motion/Reveal';
import { useContent } from '../context/ContentContext';

const ICONS = [Feather, HandHeart, Truck];

export const FeaturesBand = () => {
  const { content } = useContent();
  const items = content.features ?? [];

  return (
    <section className="border-y border-white/[0.05] bg-charcoal/40" aria-label="مزایای روژینا">
      <div className="container-lux grid grid-cols-1 gap-5 py-12 sm:grid-cols-3 md:py-16">
        {items.map(({ title, text }, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <Reveal key={i} delay={i * 100}>
              <div className="group flex h-full items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.03] p-6 transition-[transform,border-color,background-color] duration-500 hover:-translate-y-1 hover:border-gold/25 hover:bg-gold/[0.03]">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/[0.08] text-gold shadow-dot-glow transition-transform duration-500 group-hover:scale-105">
                  <Icon size={22} strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-pearl">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-taupe">{text}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
};
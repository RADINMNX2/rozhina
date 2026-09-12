import { ArrowUpLeft } from 'lucide-react';
import { toFa } from '../utils/format';
import { withImageFallback } from '../utils/imageFallback';
import { useContent } from '../context/ContentContext';
import { Reveal, Stagger, StaggerItem } from './motion/Reveal';

const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const SHOT_IMAGES = [
  photo('photo-1539109136881-3be0616acf4b'),
  photo('photo-1517841905240-472988babdf9'),
  photo('photo-1544005313-94ddf0286df2'),
  photo('photo-1469334031218-e382a71b716b'),
];

export const Lookbook = () => {
  const { content } = useContent();
  const shots = content.lookbook.shots ?? [];

  return (
  <section
    id="lookbook"
    className="relative scroll-mt-24 overflow-hidden border-y border-white/[0.05] bg-charcoal/50 py-20 md:py-28"
  >
    <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_bottom,rgba(226,201,151,0.05),transparent_65%)]" />
    <div className="container-lux relative">
      <Reveal>
        <div className="flex flex-col items-center text-center">
          <span className="eyebrow inline-flex items-center gap-3">
            <span className="h-px w-8 bg-gold shadow-[0_0_8px_rgba(226,201,151,0.5)]" />
            LOOKBOOK
            <span className="h-px w-8 bg-gold shadow-[0_0_8px_rgba(226,201,151,0.5)]" />
          </span>
          <h2 className="mt-4 text-2xl font-bold text-pearl md:text-4xl">{content.lookbook.title}</h2>
          <p className="mt-3 max-w-xl text-sm leading-8 text-taupe">
            {content.lookbook.subtitle}
          </p>
        </div>
      </Reveal>

      <Stagger className="mt-12 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {shots.map((shot, i) => (
          <StaggerItem
            key={i}
            className={i === 0 ? 'lg:mt-6' : i === 3 ? 'lg:-mt-6' : ''}
          >
            <a
              href="#collection"
              className="group relative block overflow-hidden rounded-xl border border-white/5 transition-all duration-500 hover:border-gold/25 hover:shadow-gold-glow"
            >
              <div className="aspect-[3/4] overflow-hidden will-change-transform">
                <img
                  src={shot.src || SHOT_IMAGES[i % SHOT_IMAGES.length]}
                  alt={shot.label}
                  loading="lazy"
                  className="h-full w-full object-cover brightness-[0.85] transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                  onError={withImageFallback}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/10 to-transparent opacity-85 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="font-serif text-[9px] tracking-widest text-gold" dir="ltr">
                  LOOK {toFa(i + 1)}
                </span>
                <h3 className="mt-1.5 text-sm font-bold text-pearl">{shot.label}</h3>
                <p className="mt-0.5 text-[11px] text-pearl/70">{shot.sub}</p>
              </div>
              <ArrowUpLeft
                size={18}
                strokeWidth={1.5}
                className="absolute left-4 top-4 -translate-x-2 -translate-y-2 text-gold opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
              />
            </a>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  </section>
  );
};
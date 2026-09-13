import { useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { toFa } from '../utils/format';
import { withImageFallback } from '../utils/imageFallback';
import { useContent } from '../context/ContentContext';
import { useReducedMotion } from '../hooks/useReducedMotion';

const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1800&q=80`;

const SLIDES = [
  photo('photo-1524504388940-b1c1722653e1'),
  photo('photo-1487222477894-8943e31ef7b2'),
  photo('photo-1445205170230-053b83016050'),
];

export const Hero = () => {
  const { content } = useContent();
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced) return undefined;
    const timer = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, [reduced]);

  return (
    <section
      id="home"
      className="relative flex min-h-dvh-safe flex-col overflow-hidden md:min-h-[86svh] md:min-h-[620px]"
    >
      {SLIDES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden={active !== i}
          loading={i === 0 ? 'eager' : 'lazy'}
          onError={withImageFallback}
          className={`absolute inset-0 h-full w-full scale-105 object-cover object-top brightness-[0.6] saturate-[0.85] transition-opacity duration-[1200ms] ease-out ${
            active === i ? 'animate-zoom-slow opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Ambient gold light orbiting the fabric */}
      <div className="animate-ambient pointer-events-none absolute right-[6%] top-1/2 h-[58vmin] w-[58vmin] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(226,201,151,0.16),transparent_62%)]" />
      <div
        className="pointer-events-none absolute bottom-[8%] right-[42%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(196,164,124,0.12),transparent_65%)]"
        style={{ animationDelay: '-4s' }}
      />

      <div className="absolute inset-y-0 right-0 w-full bg-gradient-to-l from-obsidian via-obsidian/[0.82] to-transparent sm:w-[74%]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />

      <div className="container-lux relative flex h-full flex-1 flex-col justify-end py-16 md:justify-center md:py-0">
        <div className="max-w-2xl">
          <span className="animate-fade-up inline-flex items-center gap-3 rounded-full border border-gold/20 bg-gold/[0.07] px-4 py-2">
            <span className="h-px w-5 bg-gold shadow-[0_0_8px_rgba(226,201,151,0.6)]" />
            <span className="font-serif text-[10px] font-semibold uppercase tracking-widest2 text-gold">
              {content.hero.eyebrow}
            </span>
          </span>

          <h1
            className="animate-fade-up mt-6 text-balance text-4xl font-extrabold leading-[1.25] text-pearl sm:text-5xl md:mt-7 md:text-[62px] md:leading-[1.22]"
            style={{ animationDelay: '120ms' }}
          >
            {content.hero.title1}
            <br />
            <span className="gold-text font-extrabold">{content.hero.title2}</span>
          </h1>

          <p
            className="animate-fade-up mt-5 max-w-xl text-base leading-8 text-taupe md:mt-6 md:text-lg"
            style={{ animationDelay: '240ms' }}
          >
            {content.hero.subtitle}
          </p>

          <div
            className="animate-fade-up mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 md:mt-9"
            style={{ animationDelay: '360ms' }}
          >
            <a href="#collection" className="btn-gold animate-float w-full min-h-12 sm:w-auto">
              {content.hero.ctaPrimary}
              <ArrowDown size={17} strokeWidth={2} aria-hidden />
            </a>
            <a href="#lookbook" className="btn-outline w-full min-h-12 sm:w-auto">
              {content.hero.ctaSecondary}
            </a>
          </div>
        </div>
      </div>

      <div className="container-lux absolute inset-x-0 bottom-7 z-10 hidden items-center justify-between md:flex">
        <div className="flex items-center gap-2.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`اسلاید ${toFa(i + 1)}`}
              onClick={() => setActive(i)}
              className={`h-[3px] w-9 origin-right rounded-full transition-transform duration-500 active:scale-95 ${
                active === i
                  ? 'scale-x-100 bg-gold shadow-[0_0_12px_rgba(226,201,151,0.7)]'
                  : 'scale-x-[0.39] bg-white/20 hover:bg-white/45'
              }`}
            />
          ))}
        </div>
        <span className="font-serif text-xs tracking-widest text-taupe" dir="ltr">
          0{toFa(active + 1)} — 0{toFa(SLIDES.length)}
        </span>
      </div>
    </section>
  );
};
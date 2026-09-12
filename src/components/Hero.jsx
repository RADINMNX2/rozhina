import { useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { toFa } from '../utils/format';
import { withImageFallback } from '../utils/imageFallback';
import { useContent } from '../context/ContentContext';

const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1800&q=80`;

const SLIDES = [
  photo('photo-1524504388940-b1c1722653e1'),
  photo('photo-1487222477894-8943e31ef7b2'),
  photo('photo-1445205170230-053b83016050'),
];

export const Hero = () => {
  const { content } = useContent();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="home" className="relative h-[88svh] max-h-[820px] min-h-[580px] overflow-hidden">
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
      <div className="ambient-still animate-ambient pointer-events-none absolute right-[6%] top-1/2 h-[58vmin] w-[58vmin] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(226,201,151,0.16),transparent_62%)] blur-2xl" />
      <div
        className="ambient-still pointer-events-none absolute bottom-[8%] right-[42%] h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(196,164,124,0.12),transparent_65%)] blur-xl"
        style={{ animationDelay: '-4s' }}
      />

      <div className="absolute inset-y-0 right-0 w-full bg-gradient-to-l from-obsidian via-obsidian/[0.78] to-transparent sm:w-[74%]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />

      <div className="container-lux relative flex h-full flex-col justify-center">
        <div className="max-w-2xl">
          <span className="animate-fade-up inline-flex items-center gap-3 rounded-full border border-gold/20 bg-gold/[0.07] px-4 py-2 backdrop-blur-md">
            <span className="h-px w-5 bg-gold shadow-[0_0_8px_rgba(226,201,151,0.6)]" />
            <span className="font-serif text-[10px] font-semibold uppercase tracking-widest2 text-gold">
              {content.hero.eyebrow}
            </span>
          </span>

          <h1
            className="animate-fade-up mt-7 text-balance text-4xl font-extrabold leading-[1.25] text-pearl sm:text-5xl md:text-[62px] md:leading-[1.22]"
            style={{ animationDelay: '120ms' }}
          >
            {content.hero.title1}
            <br />
            <span className="gold-text font-extrabold">{content.hero.title2}</span>
          </h1>

          <p
            className="animate-fade-up mt-6 max-w-xl text-base leading-8 text-taupe md:text-lg"
            style={{ animationDelay: '240ms' }}
          >
            {content.hero.subtitle}
          </p>

          <div
            className="animate-fade-up mt-9 flex flex-wrap items-center gap-4"
            style={{ animationDelay: '360ms' }}
          >
            <a href="#collection" className="btn-gold animate-float">
              {content.hero.ctaPrimary}
              <ArrowDown size={17} strokeWidth={2} aria-hidden />
            </a>
            <a href="#lookbook" className="btn-outline">
              {content.hero.ctaSecondary}
            </a>
          </div>
        </div>
      </div>

      <div className="container-lux absolute inset-x-0 bottom-7 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`اسلاید ${toFa(i + 1)}`}
              onClick={() => setActive(i)}
              className={`h-[3px] rounded-full transition-all duration-500 active:scale-95 ${
                active === i
                  ? 'w-9 bg-gold shadow-[0_0_12px_rgba(226,201,151,0.7)]'
                  : 'w-3.5 bg-white/20 hover:bg-white/45'
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
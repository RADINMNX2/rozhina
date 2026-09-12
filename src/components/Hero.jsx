import { useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { toFa } from '../utils/format';
import { withImageFallback } from '../utils/imageFallback';

const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1800&q=80`;

const SLIDES = [
  photo('photo-1524504388940-b1c1722653e1'),
  photo('photo-1487222477894-8943e31ef7b2'),
  photo('photo-1445205170230-053b83016050'),
];

export const Hero = () => {
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
          className={`absolute inset-0 h-full w-full scale-105 object-cover object-top transition-opacity duration-[1200ms] ease-out ${
            active === i ? 'animate-zoom-slow opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      <div className="absolute inset-y-0 right-0 w-full bg-gradient-to-l from-alabaster via-alabaster/[0.72] to-transparent sm:w-[72%]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-alabaster/90 to-transparent" />

      <div className="container-lux relative flex h-full flex-col justify-center">
        <div className="max-w-2xl">
          <span className="eyebrow animate-fade-up inline-flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            کالکشن ۲۰۲۶ — فصل پاییز
          </span>

          <h1
            className="animate-fade-up mt-6 text-balance text-4xl font-extrabold leading-[1.2] text-espresso sm:text-5xl md:text-[64px] md:leading-[1.15]"
            style={{ animationDelay: '120ms' }}
          >
            شکوه و ظرافت در استایل شما
            <br />
            با <span className="text-gold">روژینا</span>
          </h1>

          <p
            className="animate-fade-up mt-6 max-w-xl text-base leading-8 text-taupe md:text-lg"
            style={{ animationDelay: '240ms' }}
          >
            کالکشن منحصربه‌فرد شال و روسری‌های دست‌دوز و پارچه‌های وارداتی
          </p>

          <div
            className="animate-fade-up mt-9 flex flex-wrap items-center gap-4"
            style={{ animationDelay: '360ms' }}
          >
            <a href="#collection" className="btn-gold animate-float">
              کشف کالکشن جدید
              <ArrowDown size={17} strokeWidth={2} aria-hidden />
            </a>
            <a href="#lookbook" className="btn-outline">
              مشاهده لوک‌بوک
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
              className={`h-[3px] rounded-full transition-all duration-500 ${
                active === i ? 'w-9 bg-gold' : 'w-3.5 bg-espresso/25 hover:bg-espresso/45'
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
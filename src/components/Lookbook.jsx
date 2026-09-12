import { ArrowUpLeft } from 'lucide-react';
import { withImageFallback } from '../utils/imageFallback';

const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const SHOTS = [
  {
    src: photo('photo-1539109136881-3be0616acf4b'),
    label: 'استایل روزمره',
    sub: 'تلفیق ظرافت و راحتی',
  },
  {
    src: photo('photo-1517841905240-472988babdf9'),
    label: 'پوشش مجلسی',
    sub: 'برای شب‌های خاص',
  },
  {
    src: photo('photo-1544005313-94ddf0286df2'),
    label: 'مینیمالیسم',
    sub: 'خطوط ساده، بافت غنی',
  },
  {
    src: photo('photo-1469334031218-e382a71b716b'),
    label: 'استایل شهری',
    sub: 'شال پاییزه در شهر',
  },
];

export const Lookbook = () => (
  <section id="lookbook" className="scroll-mt-24 bg-espresso py-20 md:py-28">
    <div className="container-lux">
      <div className="flex flex-col items-center text-center">
        <span className="eyebrow">LOOKBOOK</span>
        <h2 className="mt-4 text-2xl font-bold text-alabaster md:text-4xl">الهام از روژینا</h2>
        <p className="mt-3 max-w-xl text-sm leading-8 text-alabaster/60">
          هر شال یک روایت است؛ روایت‌هایی از استایل روزمره تا مجالس باشکوه.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {SHOTS.map((shot, i) => (
          <a
            key={shot.src}
            href="#collection"
            className={`group relative overflow-hidden ${i === 0 ? 'lg:mt-6' : i === 3 ? 'lg:-mt-6' : ''}`}
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={shot.src}
                alt={shot.label}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                onError={withImageFallback}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <span className="font-serif text-[9px] tracking-widest text-gold" dir="ltr">
                LOOK {i + 1}
              </span>
              <h3 className="mt-1.5 text-sm font-bold text-alabaster">{shot.label}</h3>
              <p className="mt-0.5 text-[11px] text-alabaster/70">{shot.sub}</p>
            </div>
            <ArrowUpLeft
              size={18}
              strokeWidth={1.5}
              className="absolute left-4 top-4 -translate-x-2 -translate-y-2 text-alabaster opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
            />
          </a>
        ))}
      </div>
    </div>
  </section>
);
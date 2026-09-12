import { Feather, HandHeart, Truck } from 'lucide-react';
import { Reveal } from './motion/Reveal';

const FEATURES = [
  {
    icon: Feather,
    title: 'الیاف طبیعی و اصیل',
    text: 'ابریشم، لنین و کشمیر انتخابی',
  },
  {
    icon: HandHeart,
    title: 'دست‌دوزی هنرمندانه',
    text: 'هر قطعه با وسواس دوخته می‌شود',
  },
  {
    icon: Truck,
    title: 'ارسال به سراسر کشور',
    text: 'بسته‌بندی لوکس و سریع',
  },
];

export const FeaturesBand = () => (
  <section className="border-y border-white/[0.05] bg-charcoal/40" aria-label="مزایای روژینا">
    <div className="container-lux grid grid-cols-1 gap-5 py-12 sm:grid-cols-3 md:py-16">
      {FEATURES.map(({ icon: Icon, title, text }, i) => (
        <Reveal key={title} delay={i * 100}>
          <div className="group flex h-full items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-500 hover:border-gold/25 hover:bg-gold/[0.03]">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold/25 bg-gold/[0.08] text-gold shadow-dot-glow transition-transform duration-500 group-hover:scale-105">
              <Icon size={22} strokeWidth={1.5} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-pearl">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-taupe">{text}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
);
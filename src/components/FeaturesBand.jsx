import { Feather, HandHeart, Truck } from 'lucide-react';

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
  <section className="border-b border-espresso/[0.07] bg-alabaster" aria-label="مزایای روژینا">
    <div className="container-lux grid grid-cols-1 gap-8 py-12 sm:grid-cols-3 md:py-14">
      {FEATURES.map(({ icon: Icon, title, text }) => (
        <div key={title} className="flex items-center gap-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
            <Icon size={22} strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-espresso">{title}</h3>
            <p className="mt-1 text-xs leading-5 text-taupe">{text}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);
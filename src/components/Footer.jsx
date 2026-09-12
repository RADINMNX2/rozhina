import { Instagram, MapPin, Phone } from 'lucide-react';
import { Logo } from './Logo';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../data/constants';

const QUICK_LINKS = [
  { label: 'کالکشن جدید', href: '#collection' },
  { label: 'شال ابریشم', href: '#collection' },
  { label: 'روسی مینی اسکارف', href: '#collection' },
  { label: 'شال پاییزه', href: '#collection' },
  { label: 'لوک‌بوک', href: '#lookbook' },
];

const HELP_LINKS = ['راهنمای انتخاب سایز', 'روش‌های ارسال', 'سیاست بازگشت کالا', 'همکاری با ما'];

export const Footer = () => (
  <footer className="border-t border-white/[0.05] bg-[#0A0909] text-pearl">
    <div className="container-lux grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
      <div>
        <Logo />
        <p className="mt-5 max-w-sm text-sm leading-8 text-pearl/55">
          گالری شال و روسری روژینا؛ خانه‌ی شال‌ و روسری‌های دست‌دوز از الیاف طبیعی و پارچه‌های
          وارداتی. ظرافت را به استایل خود بیاورید.
        </p>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-gold/25 bg-gold/[0.06] px-5 py-2.5 text-xs font-semibold text-gold backdrop-blur-xl transition-all duration-300 hover:bg-gold hover:text-obsidian hover:shadow-gold-cta active:scale-[0.98]"
        >
          <Instagram size={15} strokeWidth={1.6} />
          {INSTAGRAM_HANDLE}
        </a>
      </div>

      <nav aria-label="دسترسی سریع">
        <h3 className="font-serif text-[10px] font-semibold uppercase tracking-widest2 text-gold">
          دسترسی سریع
        </h3>
        <ul className="mt-5 space-y-3">
          {QUICK_LINKS.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="text-sm text-pearl/60 transition-colors duration-300 hover:text-gold"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div>
        <h3 className="font-serif text-[10px] font-semibold uppercase tracking-widest2 text-gold">
          راهنمای خرید
        </h3>
        <ul className="mt-5 space-y-3">
          {HELP_LINKS.map((label) => (
            <li key={label}>
              <a
                href="#collection"
                className="text-sm text-pearl/60 transition-colors duration-300 hover:text-gold"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-serif text-[10px] font-semibold uppercase tracking-widest2 text-gold">
          تماس با گالری
        </h3>
        <ul className="mt-5 space-y-4 text-sm text-pearl/60">
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
              <Phone size={13} strokeWidth={1.6} className="text-gold" />
            </span>
            <span dir="ltr">۰۹۱۲ ۳۴۵ ۶۷۸۹</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
              <Instagram size={13} strokeWidth={1.6} className="text-gold" />
            </span>
            <span>{INSTAGRAM_HANDLE}</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
              <MapPin size={13} strokeWidth={1.6} className="text-gold" />
            </span>
            <span>تهران، خیابان ولیعصر، گالری روژینا</span>
          </li>
        </ul>
      </div>
    </div>

    <div className="border-t border-white/[0.06]">
      <div className="container-lux flex flex-col items-center justify-between gap-3 py-6 text-center text-xs text-pearl/40 md:flex-row">
        <p>© ۱۴۰۵ گالری شال و روسری روژینا — تمامی حقوق محفوظ است.</p>
        <p className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-gold shadow-[0_0_6px_rgba(226,201,151,0.7)]" />
          طراحی با ظرافت برای عاشقان استایل
          <span className="h-1 w-1 rounded-full bg-gold shadow-[0_0_6px_rgba(226,201,151,0.7)]" />
        </p>
      </div>
    </div>
  </footer>
);
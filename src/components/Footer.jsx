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
  <footer className="bg-espresso text-alabaster">
    <div className="container-lux grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
      <div>
        <Logo light />
        <p className="mt-5 max-w-sm text-sm leading-8 text-alabaster/60">
          گالری شال و روسری روژینا؛ خانه‌ی شال‌ و روسری‌های دست‌دوز از الیاف طبیعی و پارچه‌های
          وارداتی. ظرافت را به استایل خود بیاورید.
        </p>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2.5 border border-gold/30 bg-gold/[0.06] px-5 py-2.5 text-xs font-semibold text-gold transition-all duration-300 hover:bg-gold hover:text-espresso"
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
              <a href={l.href} className="text-sm text-alabaster/65 transition-colors duration-300 hover:text-gold">
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
              <a href="#collection" className="text-sm text-alabaster/65 transition-colors duration-300 hover:text-gold">
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
        <ul className="mt-5 space-y-4 text-sm text-alabaster/65">
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-alabaster/15">
              <Phone size={13} strokeWidth={1.6} className="text-gold" />
            </span>
            <span dir="ltr">۰۹۱۲ ۳۴۵ ۶۷۸۹</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-alabaster/15">
              <Instagram size={13} strokeWidth={1.6} className="text-gold" />
            </span>
            <span>{INSTAGRAM_HANDLE}</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-alabaster/15">
              <MapPin size={13} strokeWidth={1.6} className="text-gold" />
            </span>
            <span>تهران، خیابان ولیعصر، گالری روژینا</span>
          </li>
        </ul>
      </div>
    </div>

    <div className="border-t border-alabaster/10">
      <div className="container-lux flex flex-col items-center justify-between gap-3 py-6 text-center text-xs text-alabaster/45 md:flex-row">
        <p>© ۱۴۰۵ گالری شال و روسری روژینا — تمامی حقوق محفوظ است.</p>
        <p className="flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-gold" />
          طراحی با ظرافت برای عاشقان استایل
          <span className="h-1 w-1 rounded-full bg-gold" />
        </p>
      </div>
    </div>
  </footer>
);
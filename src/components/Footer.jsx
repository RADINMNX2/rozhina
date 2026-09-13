import { ChevronDown, Instagram, Lock, MapPin, Phone } from 'lucide-react';
import { Logo } from './Logo';
import { useSettings } from '../context/SettingsContext';
import { useContent } from '../context/ContentContext';

const openAdmin = () => {
  window.location.hash = '#/admin';
};

const LinkGroup = ({ heading, links }) => (
  <nav aria-label={heading}>
    <h3 className="font-serif text-[10px] font-semibold uppercase tracking-widest2 text-gold">
      {heading}
    </h3>
    <ul className="mt-5 space-y-3">
      {links.map((l) => (
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
);

export const Footer = () => {
  const { settings } = useSettings();
  const { content } = useContent();
  const c = content.footer ?? {};
  const quick = c.quickLinks ?? [];
  const help = c.helpLinks ?? [];
  return (
    <footer className="border-t border-white/[0.05] bg-[#0A0909] text-pearl">
      <div className="container-lux grid gap-10 py-14 md:grid-cols-2 md:gap-12 md:py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-8 text-pearl/55">
            {c.description}
          </p>
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="focus-ring mt-6 inline-flex items-center gap-2.5 rounded-full border border-gold/25 bg-gold/[0.06] px-5 py-2.5 text-xs font-semibold text-gold transition-[background-color,box-shadow,transform] duration-300 hover:bg-gold hover:text-obsidian hover:shadow-gold-cta active:scale-[0.98]"
          >
            <Instagram size={15} strokeWidth={1.6} />
            {settings.instagramHandle}
          </a>
        </div>

        {/* Mobile: native accordions */}
        <div className="space-y-3 md:hidden">
          <details className="group border-b border-white/[0.06] pb-3">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-bold text-pearl">
              {c.headingQuick}
              <ChevronDown
                size={16}
                strokeWidth={1.8}
                className="text-gold transition-transform duration-300 group-open:rotate-180"
              />
            </summary>
            <ul className="mt-3 space-y-2.5">
              {quick.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-pearl/60 transition-colors hover:text-gold">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </details>
          <details className="group border-b border-white/[0.06] pb-6">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-bold text-pearl">
              {c.headingHelp}
              <ChevronDown
                size={16}
                strokeWidth={1.8}
                className="text-gold transition-transform duration-300 group-open:rotate-180"
              />
            </summary>
            <ul className="mt-3 space-y-2.5">
              {help.map((l) => (
                <li key={l.label}>
                  <a href={l.href ?? '#collection'} className="text-sm text-pearl/60 transition-colors hover:text-gold">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </div>

        {/* Tablet / desktop: side-by-side columns */}
        <div className="hidden md:block">
          <LinkGroup heading={c.headingQuick} links={quick} />
        </div>
        <div className="hidden md:block">
          <LinkGroup heading={c.headingHelp} links={help} />
        </div>

        <div>
          <h3 className="font-serif text-[10px] font-semibold uppercase tracking-widest2 text-gold">
            {c.headingContact}
          </h3>
          <ul className="mt-5 space-y-4 text-sm text-pearl/60">
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                <Phone size={13} strokeWidth={1.6} className="text-gold" />
              </span>
              <span dir="ltr">{settings.phone}</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                <Instagram size={13} strokeWidth={1.6} className="text-gold" />
              </span>
              <span>{settings.instagramHandle}</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                <Lock size={13} strokeWidth={1.6} className="text-gold" />
              </span>
              <span>{c.supportLabel} {settings.supportId}</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                <MapPin size={13} strokeWidth={1.6} className="text-gold" />
              </span>
              <span>{c.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="container-lux flex flex-col items-center justify-between gap-3 py-6 text-center text-xs text-pearl/40 md:flex-row">
          <p>{c.copyright}</p>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-gold shadow-[0_0_6px_rgba(226,201,151,0.7)]" />
              {c.tagline}
              <span className="h-1 w-1 rounded-full bg-gold shadow-[0_0_6px_rgba(226,201,151,0.7)]" />
            </p>
            <button
              type="button"
              onClick={openAdmin}
              aria-label="پنل مدیریت فروشگاه"
              title="مدیریت"
              className="focus-ring flex h-7 w-7 items-center justify-center rounded-full text-pearl/25 transition-[background-color,color,transform] duration-300 hover:bg-gold/10 hover:text-gold active:scale-90"
            >
              <Lock size={12} strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
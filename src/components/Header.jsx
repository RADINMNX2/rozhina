import { useEffect, useState } from 'react';
import { Heart, Instagram, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSettings } from '../context/SettingsContext';
import { useContent } from '../context/ContentContext';
import { toFa } from '../utils/format';

const Badge = ({ count, onClick }) => (
  <span
    key={count}
    onClick={onClick}
    className="flex h-4 min-w-4 animate-badge-pop items-center justify-center rounded-full bg-gradient-to-b from-gold to-bronze px-1 text-[10px] font-bold leading-none text-obsidian shadow-dot-glow"
  >
    {toFa(count)}
  </span>
);

const IconButton = ({ label, onClick, children }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="relative flex h-10 w-10 items-center justify-center rounded-full text-pearl/75 transition-all duration-300 hover:bg-white/[0.06] hover:text-gold active:scale-[0.94]"
  >
    {children}
  </button>
);

export const Header = ({ onOpenCart, onOpenSearch }) => {
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { settings } = useSettings();
  const { content } = useContent();
  const navLinks = content.nav ?? [];
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-lg transition-all duration-500 ${
          scrolled
            ? 'border-white/[0.06] bg-obsidian/85 shadow-nav-float'
            : 'border-white/[0.04] bg-obsidian/55'
        }`}
      >
        <div className="container-lux">
          <div className="relative flex h-16 items-center justify-between gap-2 md:h-[76px]">
            <nav className="hidden items-center gap-7 xl:flex" aria-label="ناوبری اصلی">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="lux-link">
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="xl:hidden">
              <IconButton label="باز کردن منو" onClick={() => setMobileOpen(true)}>
                <Menu size={20} strokeWidth={1.5} />
              </IconButton>
            </div>

            <a href="#home" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Logo compact />
            </a>

            <div className="flex items-center gap-0.5 sm:gap-1">
              <IconButton label="جستجو" onClick={onOpenSearch}>
                <Search size={20} strokeWidth={1.5} />
              </IconButton>

              <IconButton label="علاقه‌مندی‌ها">
                <Heart
                  size={20}
                  strokeWidth={1.5}
                  className={`transition-all duration-300 ${
                    wishlistCount > 0
                      ? 'fill-gold stroke-gold drop-shadow-[0_0_8px_rgba(226,201,151,0.5)]'
                      : 'text-pearl/75'
                  }`}
                />
                {wishlistCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5">
                    <Badge count={wishlistCount} />
                  </span>
                )}
              </IconButton>

              <IconButton label="سبد خرید" onClick={onOpenCart}>
                <ShoppingBag size={20} strokeWidth={1.5} />
                {/* eslint-disable-next-line react/no-array-index-key */}
                {totalItems > 0 && (
                  <span className="absolute -right-0.5 -top-0.5">
                    <Badge count={totalItems} />
                  </span>
                )}
              </IconButton>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-50 xl:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-obsidian/70 backdrop-blur-md transition-opacity duration-500 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col border-l border-white/[0.06] bg-[#0F0E0D]/95 backdrop-blur-xl shadow-nav-float transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
            <Logo compact />
            <button
              type="button"
              aria-label="بستن منو"
              onClick={() => setMobileOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-pearl/70 transition-colors hover:bg-white/5 hover:text-pearl"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          <nav className="flex flex-col gap-1 px-4 pt-4" aria-label="منوی موبایل">
            {navLinks.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="animate-fade-up border-b border-white/[0.06] px-3 py-4 text-[15px] font-medium text-pearl/85 transition-colors hover:text-gold"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-auto border-t border-white/[0.06] px-6 py-6">
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-sm text-pearl/75 transition-colors hover:text-gold"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/20 bg-gold/[0.08] text-gold">
                <Instagram size={18} strokeWidth={1.5} />
              </span>
              {settings.instagramHandle}
            </a>
            <p className="mt-3 text-xs leading-6 text-taupe">
              {content.menu.shippingNote}
            </p>
          </div>
        </aside>
      </div>
    </>
  );
};
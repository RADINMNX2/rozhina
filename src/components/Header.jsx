import { useEffect, useState } from 'react';
import { Heart, Instagram, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toFa } from '../utils/format';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../data/constants';

const NAV_LINKS = [
  { label: 'کالکشن جدید', href: '#collection' },
  { label: 'شال ابریشم', href: '#collection' },
  { label: 'روسی مینی اسکارف', href: '#collection' },
  { label: 'شال پاییزه', href: '#collection' },
  { label: 'لوک‌بوک', href: '#lookbook' },
];

const Badge = ({ count, onClick }) => (
  <span
    key={count}
    onClick={onClick}
    className="flex h-4 min-w-4 animate-badge-pop items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold leading-none text-espresso"
  >
    {toFa(count)}
  </span>
);

const IconButton = ({ label, onClick, children }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="relative flex h-10 w-10 items-center justify-center rounded-full text-espresso transition-all duration-300 hover:bg-espresso/[0.06] hover:text-espresso"
  >
    {children}
  </button>
);

export const Header = ({ onOpenCart, onOpenSearch }) => {
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
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
        className={`sticky top-0 z-40 border-b transition-all duration-500 ${
          scrolled
            ? 'border-espresso/10 bg-alabaster/[0.92] shadow-[0_10px_40px_-16px_rgba(28,25,23,0.14)] backdrop-blur-md'
            : 'border-transparent bg-alabaster'
        }`}
      >
        <div className="container-lux">
          <div className="relative flex h-16 items-center justify-between gap-2 md:h-[76px]">
            <nav className="hidden items-center gap-7 xl:flex" aria-label="ناوبری اصلی">
              {NAV_LINKS.map((link) => (
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
                  className={`transition-colors duration-300 ${
                    wishlistCount > 0 ? 'fill-terracotta stroke-terracotta' : 'text-espresso'
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
          className={`absolute inset-0 bg-espresso/40 backdrop-blur-sm transition-opacity duration-500 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-alabaster shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-espresso/10 px-6 py-5">
            <Logo compact />
            <button
              type="button"
              aria-label="بستن منو"
              onClick={() => setMobileOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-espresso/5"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          <nav className="flex flex-col gap-1 px-4 pt-4" aria-label="منوی موبایل">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="animate-fade-up border-b border-espresso/[0.07] px-3 py-4 text-[15px] font-medium text-espresso/85 transition-colors hover:text-gold"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-auto border-t border-espresso/10 px-6 py-6">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-sm text-espresso/70 transition-colors hover:text-gold"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-espresso text-gold">
                <Instagram size={18} strokeWidth={1.5} />
              </span>
            {INSTAGRAM_HANDLE}
            </a>
            <p className="mt-3 text-xs leading-6 text-taupe">
              ارسال رایگان به سراسر کشور برای خریدهای بالای ۱ میلیون تومان
            </p>
          </div>
        </aside>
      </div>
    </>
  );
};
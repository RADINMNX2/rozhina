import { useEffect, useState } from 'react';
import { Heart, Menu, Search, ShoppingBag } from 'lucide-react';
import { Logo } from './Logo';
import { MobileNavDrawer } from './MobileNavDrawer';
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
    className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-full text-pearl/75 transition-[background-color,color,transform] duration-300 hover:bg-white/[0.06] hover:text-gold active:scale-[0.94]"
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
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 12);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-500 ${
          scrolled
            ? 'border-white/[0.06] bg-[#0F0E0D]/95 shadow-nav-float'
            : 'border-white/[0.04] bg-[#0F0E0D]/85'
        }`}
      >
        <div className="container-lux">
          <div className="relative flex h-16 items-center justify-between gap-2 md:h-[72px] lg:h-[76px]">
            <nav className="hidden items-center gap-7 lg:flex" aria-label="ناوبری اصلی">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="lux-link">
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="lg:hidden">
              <IconButton label="باز کردن منو" onClick={() => setMobileOpen(true)}>
                <Menu size={20} strokeWidth={1.5} />
              </IconButton>
            </div>

            <a href="#home" className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Logo compact />
            </a>

            <div className="flex items-center gap-0.5 sm:gap-1">
              <IconButton label="جستجو" onClick={onOpenSearch}>
                <Search size={20} strokeWidth={1.5} />
              </IconButton>

              <span className="hidden lg:inline-flex">
                <IconButton label="علاقه‌مندی‌ها">
                  <Heart
                    size={20}
                    strokeWidth={1.5}
                    className={`transition-[fill,color] duration-300 ${
                      wishlistCount > 0
                        ? 'fill-gold stroke-gold drop-shadow-[0_0_8px_rgba(226,201,151,0.5)]'
                        : 'text-pearl/75'
                    }`}
                  />
                  {wishlistCount > 0 && (
                    <span className="absolute -end-0.5 -top-0.5">
                      <Badge count={wishlistCount} />
                    </span>
                  )}
                </IconButton>
              </span>

              <IconButton label="سبد خرید" onClick={onOpenCart}>
                <ShoppingBag size={20} strokeWidth={1.5} />
                {/* eslint-disable-next-line react/no-array-index-key */}
                {totalItems > 0 && (
                  <span className="absolute -end-0.5 -top-0.5">
                    <Badge count={totalItems} />
                  </span>
                )}
              </IconButton>
            </div>
          </div>
        </div>
      </header>

      <MobileNavDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
};
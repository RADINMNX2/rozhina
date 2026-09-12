import { Instagram } from 'lucide-react';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../data/constants';

const ITEM = (
  <>
    <span className="whitespace-nowrap px-6 text-[11px] font-medium tracking-wide text-pearl/80 sm:text-xs">
      ارسال رایگان به سراسر کشور برای خریدهای بالای ۱ میلیون تومان
    </span>
    <span className="text-gold drop-shadow-[0_0_8px_rgba(226,201,151,0.7)]">✦</span>
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 whitespace-nowrap px-6 text-[11px] font-medium tracking-wide text-pearl/65 transition-colors hover:text-gold sm:text-xs"
    >
      <Instagram size={12} className="text-gold drop-shadow-[0_0_6px_rgba(226,201,151,0.6)]" aria-hidden />
      {INSTAGRAM_HANDLE}
    </a>
    <span className="text-gold drop-shadow-[0_0_8px_rgba(226,201,151,0.7)]">✦</span>
  </>
);

export const AnnouncementBar = () => (
  <div className="border-b border-white/[0.05] bg-[#0B0A09] text-pearl/85" aria-hidden="true">
    <div dir="ltr" className="overflow-hidden py-2">
      <div className="flex w-max animate-marquee whitespace-nowrap">
        <div className="flex items-center" aria-hidden="false">
          {ITEM}
          {ITEM}
          {ITEM}
        </div>
        <div className="flex items-center">
          {ITEM}
          {ITEM}
          {ITEM}
        </div>
      </div>
    </div>
  </div>
);
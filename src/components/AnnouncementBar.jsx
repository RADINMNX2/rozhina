import { Instagram } from 'lucide-react';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../data/constants';

const ITEM = (
  <>
    <span className="whitespace-nowrap px-6 text-[11px] font-medium tracking-wide sm:text-xs">
      ارسال رایگان به سراسر کشور برای خریدهای بالای ۱ میلیون تومان
    </span>
    <span className="text-gold">✦</span>
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 whitespace-nowrap px-6 text-[11px] font-medium tracking-wide transition-colors hover:text-gold sm:text-xs"
    >
      <Instagram size={12} className="text-gold" aria-hidden />
      {INSTAGRAM_HANDLE}
    </a>
    <span className="text-gold">✦</span>
  </>
);

export const AnnouncementBar = () => (
  <div className="bg-espresso text-alabaster/85" aria-hidden="true">
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
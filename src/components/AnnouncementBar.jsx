import { Instagram } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const AnnouncementBar = () => {
  const { settings } = useSettings();
  const ITEM = (
    <>
      <span className="whitespace-nowrap px-6 text-[11px] font-medium tracking-wide text-pearl/80 sm:text-xs">
        {settings.announcementText}
      </span>
      <span className="text-gold drop-shadow-[0_0_8px_rgba(226,201,151,0.7)]">✦</span>
      <a
        href={settings.instagramUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 whitespace-nowrap px-6 text-[11px] font-medium tracking-wide text-pearl/65 transition-colors hover:text-gold sm:text-xs"
      >
        <Instagram size={12} className="text-gold drop-shadow-[0_0_6px_rgba(226,201,151,0.6)]" aria-hidden />
        {settings.instagramHandle}
      </a>
      <span className="text-gold drop-shadow-[0_0_8px_rgba(226,201,151,0.7)]">✦</span>
    </>
  );

  return (
    <div className="border-b border-white/[0.05] bg-[#0B0A09] text-pearl/85" aria-hidden="true">
      <div dir="ltr" className="overflow-hidden py-2">
        <div className="flex w-max animate-marquee whitespace-nowrap motion-reduce:animate-none hover:[animation-play-state:paused]">
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
};
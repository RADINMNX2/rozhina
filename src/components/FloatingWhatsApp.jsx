import { useSettings } from '../context/SettingsContext';
import { useContent } from '../context/ContentContext';
import { buildWhatsAppLink } from '../utils/whatsapp';

export const FloatingWhatsApp = () => {
  const { settings } = useSettings();
  const { content } = useContent();
  return (
    <a
      href={buildWhatsAppLink(
        content.whatsapp.floatingPrefill ?? 'سلام به گالری روژینا، از سایت با شما آشنا شدم و سوال داشتم.',
        settings.whatsapp,
      )}
      target="_blank"
      rel="noreferrer"
      aria-label="ارتباط با واتس‌اپ روژینا"
      className="group fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-[#25D366] p-3.5 text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-8px_rgba(37,211,102,0.55)] active:scale-95"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.83 14.12c-.25.7-1.45 1.33-2.02 1.42-.52.08-1.17.11-1.89-.12-1.54-.49-3.52-1.64-5.72-3.79-2.13-2.1-3.13-3.91-3.59-5.15-.24-.65-.06-1.4.36-1.88.3-.33.69-.51 1.11-.51h.8c.26 0 .61-.04.94.73.35.82 1.14 2.53 1.23 2.71.14.29.18.63.03.94-.4.82-.87 1.08-.76 1.37.6 1.44 1.66 2.52 2.9 3.31.35.22.62.14.9-.14.33-.34.83-.86.95-1.16.13-.3.18-.52-.03-.88-.21-.36-.94-.94-1.34-1.24-.25-.19-.42-.46-.14-.99.27-.52.66-1.14.92-1.62.14-.3.08-.59-.07-.79-.15-.18-.75-1.11-.92-1.39-.26-.41-.53-.38-1-.38h-.38c-.25 0-.65.09-.99.46-1.14 1.11-1.66 2.93-.61 4.05 1.55 2.09 3.22 3.52 5.13 4.43.67.31 1.19.5 1.6.63.66.22 1.26.19 1.73.12.53-.08 1.64-.67 1.87-1.32z" />
      </svg>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold transition-all duration-500 group-hover:ml-1 group-hover:max-w-[150px]">
        {settings.instagramHandle}
      </span>
    </a>
  );
};
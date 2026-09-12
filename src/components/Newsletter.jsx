import { useState } from 'react';
import { MailCheck } from 'lucide-react';
import { Reveal } from './motion/Reveal';
import { useContent } from '../context/ContentContext';

export const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const { content } = useContent();
  const c = content.newsletter ?? {};

  const submit = (e) => {
    e.preventDefault();
    if (email.trim()) setDone(true);
  };

  return (
    <section
      className="relative overflow-hidden border-b border-white/[0.05] py-20 md:py-24"
      aria-label="خبرنامه"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(226,201,151,0.05),transparent_62%)]" />
      <div className="container-lux relative flex flex-col items-center justify-between gap-8 lg:flex-row lg:gap-14">
        <Reveal className="max-w-xl text-center lg:text-right">
          <span className="eyebrow inline-flex items-center gap-3">
            <span className="h-px w-8 bg-gold shadow-[0_0_8px_rgba(226,201,151,0.5)]" />
            NEWSLETTER
            <span className="h-px w-8 bg-gold shadow-[0_0_8px_rgba(226,201,151,0.5)]" />
          </span>
          <h2 className="mt-4 text-2xl font-extrabold leading-snug text-pearl md:text-4xl">
            {c.title}
          </h2>
          <p className="mt-3 text-sm leading-8 text-taupe">
            {c.subtitle}
          </p>
        </Reveal>

        <Reveal delay={120} className="w-full max-w-md">
          <form onSubmit={submit}>
            {done ? (
              <div className="flex items-center gap-3 border border-gold/25 bg-gold/[0.06] px-5 py-4 backdrop-blur-xl">
                <MailCheck size={20} className="shrink-0 text-gold" strokeWidth={1.5} />
                <p className="text-sm font-medium text-pearl">
                  {c.success}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="lux-input flex-1 !text-left"
                />
                <button type="submit" className="btn-gold btn-shimmer !px-6">
                  {c.button}
                </button>
              </div>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
};
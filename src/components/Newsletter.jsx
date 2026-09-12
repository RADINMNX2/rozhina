import { useState } from 'react';
import { MailCheck } from 'lucide-react';

export const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (email.trim()) setDone(true);
  };

  return (
    <section className="border-b border-espresso/10 bg-gold/[0.06] py-20 md:py-24" aria-label="خبرنامه">
      <div className="container-lux flex flex-col items-center justify-between gap-8 lg:flex-row lg:gap-14">
        <div className="max-w-xl text-center lg:text-right">
          <span className="eyebrow inline-flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            NEWSLETTER
            <span className="h-px w-8 bg-gold" />
          </span>
          <h2 className="mt-4 text-2xl font-extrabold leading-snug md:text-4xl">
            از کالکشن‌های جدید زودتر باخبر شوید
          </h2>
          <p className="mt-3 text-sm leading-8 text-taupe">
            عضو خبرنامه روژینا شوید تا اولین نفر از رونمایی کلکسیون‌های محدود و کدهای تخفیف ویژه باشید.
          </p>
        </div>

        <form onSubmit={submit} className="w-full max-w-md">
          {done ? (
            <div className="flex items-center gap-3 border border-gold/40 bg-alabaster px-5 py-4">
              <MailCheck size={20} className="shrink-0 text-gold" strokeWidth={1.5} />
              <p className="text-sm font-medium text-espresso">
                عضویت شما ثبت شد؛ به‌زودی از کالکشن جدید روژینا مطلع خواهید شد.
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
              <button type="submit" className="btn-gold !px-6">
                عضویت
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ClipboardCopy,
  CloudCog,
  Download,
  Github,
  ImageIcon,
  Lock,
  Package,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';
import { useSettings } from '../../context/SettingsContext';
import { formatPrice, toFa } from '../../utils/format';

const ADMIN_PIN = 'Rozhina8962';
const GH_STORAGE_KEY = 'rozhina.admin.gh';
const UNLOCK_KEY = 'rozhina.admin.unlocked';

const GH_API = 'https://api.github.com';
const GH_HEADERS = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };

const PRESET_BADGES = ['دست‌دوز', 'کالکشن جدید', 'تعداد محدود'];

/* ---------------- base64 helpers ---------------- */
const encodeB64 = (str) => {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => bin += String.fromCharCode(b));
  return btoa(bin);
};

/* ---------------- code serializers ---------------- */
const imgIdOf = (url) => {
  const m = /images\.unsplash\.com\/(photo-[a-zA-Z0-9_-]+)/.exec(url ?? '');
  return m ? m[1] : null;
};

const imageRef = (url) => {
  const id = imgIdOf(url);
  return id ? `photo(${JSON.stringify(id)})` : JSON.stringify(url);
};

const q = (v) => JSON.stringify(String(v ?? ''));

const serializeColors = (products) => {
  const seen = new Set();
  const list = [];
  for (const p of products) {
    for (const c of p.colors ?? []) {
      const hex = (c.hex || '').toUpperCase();
      if (hex && !seen.has(hex)) {
        seen.add(hex);
        list.push({ label: c.label, hex: c.hex });
      }
    }
  }
  return list;
};

const serializeFabrics = (products) => {
  const seen = new Set();
  const list = [];
  for (const p of products) {
    const f = (p.fabric || '').trim();
    if (f && !seen.has(f)) {
      seen.add(f);
      list.push(f);
    }
  }
  return list;
};

export const serializeProducts = (products) => {
  const body = products
    .map((p) => {
      const colors = `colors: [${(p.colors ?? [])
        .map((c) => `{ label: ${q(c.label)}, hex: ${q(c.hex || '#E2C997')} }`)
        .join(', ')}]`;
      const badges = `badges: [${(p.badges ?? []).map(q).join(', ')}]`;
      const images = `images: [${(p.images ?? []).map(imageRef).join(', ')}]`;
      const qty = p.inStock ? Math.max(1, p.quantity || 1) : 0;
      return [
        '  {',
        `    id: ${p.id},`,
        `    name: ${q(p.name)},`,
        `    enName: ${q(p.enName)},`,
        `    fabric: ${q(p.fabric)},`,
        `    dimensions: ${q(p.dimensions)},`,
        `    ${colors},`,
        `    price: ${Number(p.price) || 0},`,
        `    oldPrice: ${p.oldPrice ? Number(p.oldPrice) : 'null'},`,
        `    quantity: ${qty},`,
        `    badges: ${badges},`,
        `    description: ${q(p.description)},`,
        `    images: ${images},`,
        '  }',
      ].join('\n');
    })
    .join(',\n');

  const fabricsList = serializeFabrics(products);
  const colorsList = serializeColors(products);

  return [
    "const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;",
    '',
    "export const PLACEHOLDER_IMAGE = photo('photo-1520006403909-838d6b92c22e');",
    '',
    `export const FABRICS = ${JSON.stringify(fabricsList, null, 2)};`,
    '',
    `export const COLORS = ${JSON.stringify(colorsList, null, 2)
      .replace(/"label"/g, 'label')
      .replace(/"hex"/g, 'hex')};`,
    '',
    "const BADGE_STYLES = {\n  'دست‌دوز': 'bg-gold text-espresso',\n  'کالکشن جدید': 'bg-espresso text-alabaster',\n  'تنها': 'bg-terracotta text-alabaster',\n};",
    '',
    "export const badgeStyle = (label) =>\n  BADGE_STYLES[Object.keys(BADGE_STYLES).find((key) => label.includes(key))] || 'bg-espresso text-alabaster';",
    '',
    'export const PRODUCTS = [',
    body,
    '];',
    '',
    'export default PRODUCTS;',
  ].join('\n');
};

export const serializeConstants = (s) => [
  `export const WHATSAPP_NUMBER = ${q(s.whatsapp)};`,
  '',
  `export const INSTAGRAM_HANDLE = ${q(s.instagramHandle)};`,
  '',
  `export const INSTAGRAM_URL = ${q(s.instagramUrl)};`,
  '',
  `export const FREE_SHIPPING_THRESHOLD = ${Number(s.freeShippingThreshold) || 0};`,
  '',
  `export const ANNOUNCEMENT_TEXT = ${q(s.announcementText)};`,
  '',
  `export const PHONE_NUMBER = ${q(s.phone)};`,
  '',
  `export const SUPPORT_ID = ${q(s.supportId)};`,
].join('\n');

/* ---------------- GitHub REST ---------------- */
async function ghGetFile(pat, owner, repo, path, branch) {
  const url = `${GH_API}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const res = await fetch(url, { headers: { ...GH_HEADERS, Authorization: `Bearer ${pat}` } });
  if (!res.ok) {
    if (res.status === 404) return null;
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `خطای ${res.status} در دریافت فایل`);
  }
  const json = await res.json();
  return json.sha ?? null;
}

async function ghPutFile(pat, owner, repo, path, content, message, branch) {
  const sha = await ghGetFile(pat, owner, repo, path, branch);
  const url = `${GH_API}/repos/${owner}/${repo}/contents/${path}`;
  const body = { message, content: encodeB64(content), branch };
  if (sha) body.sha = sha;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...GH_HEADERS, Authorization: `Bearer ${pat}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `خطای ${res.status} در انتشار فایل ${path}`);
  }
  return res.json();
}

/* ---------------- tiny primitives ---------------- */
const Field = ({ label, hint, children }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[11px] font-semibold text-pearl/70">{label}</span>
    {children}
    {hint && <span className="text-[10px] text-taupe/70">{hint}</span>}
  </label>
);

const TextInput = (props) => <input {...props} className="lux-input !py-2.5 text-sm" />;

const PILL_BTN =
  'inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold transition-all duration-300 active:scale-[0.97]';

const Panel = ({ title, icon: Icon, children, actions }) => (
  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 backdrop-blur-xl">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 text-sm font-bold text-pearl">
        {Icon && <Icon size={15} className="text-gold" strokeWidth={1.7} />}
        {title}
      </h3>
      {actions}
    </div>
    {children}
  </div>
);

/* ---------------- toasts ---------------- */
const ToastHost = ({ toasts }) => (
  <div className="pointer-events-none fixed inset-x-0 top-4 z-[99] flex flex-col items-center gap-2 px-4">
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: -14, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', damping: 24, stiffness: 320 }}
          className={`pointer-events-auto flex items-center gap-2.5 rounded-full border px-5 py-3 text-xs font-bold shadow-[0_14px_40px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl ${
            t.type === 'error'
              ? 'border-terracotta/40 bg-[#24120F]/95 text-[#F0B8A0]'
              : 'border-gold/30 bg-[#141210]/95 text-gold'
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/15">
            {t.type === 'error' ? <X size={11} strokeWidth={2.5} /> : <Check size={11} strokeWidth={3} />}
          </span>
          {t.msg}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

/* ---------------- pin gate ---------------- */
const PinGate = ({ onSuccess }) => {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  const submit = () => {
    if (!pin) return;
    if (pin === ADMIN_PIN) {
      onSuccess();
    } else {
      setShake(true);
      window.setTimeout(() => {
        setShake(false);
        setPin('');
      }, 500);
    }
  };

  return (
    <div className="flex min-h-[52dvh] flex-col items-center justify-center gap-6 py-10">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/25 bg-gold/[0.07] text-gold">
        <Lock size={24} strokeWidth={1.5} />
      </span>
      <div className="text-center">
        <h2 className="text-lg font-extrabold text-pearl">پنل مدیریت روژینا</h2>
        <p className="mt-1 text-xs text-taupe">رمز ورود را وارد کنید ({toFa(ADMIN_PIN.length)} کاراکتر)</p>
      </div>

      <motion.div
        animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : {}}
        transition={{ duration: 0.45 }}
        className="w-full max-w-xs"
      >
        <input
          type="password"
          dir="ltr"
          value={pin}
          autoFocus
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="•••••••••••"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-lg font-bold tracking-[0.5em] text-gold placeholder:text-pearl/20 focus:border-gold/50 focus:outline-none"
        />
        <p className="mt-2 text-center text-xs text-taupe">{toFa(pin.length)} / {toFa(ADMIN_PIN.length)}</p>
      </motion.div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={submit} className={`${PILL_BTN} btn-gold-modern !px-6 !py-2.5 !text-sm`}>
          ورود
        </button>
        <button
          type="button"
          onClick={() => setPin('')}
          className={`${PILL_BTN} border-white/10 text-pearl/60 hover:border-white/30 hover:text-pearl`}
        >
          پاک کردن
        </button>
      </div>
    </div>
  );
};

/* ---------------- product editor ---------------- */
const EMPTY_DRAFT = {
  name: '',
  enName: '',
  fabric: '',
  dimensions: '',
  price: '',
  oldPrice: '',
  quantity: '1',
  inStock: true,
  description: '',
  badges: [],
  colors: [{ label: 'کرم', hex: '#F3E9DA' }],
  images: ['', ''],
};

const ProductEditor = ({ product, onClose, onSave }) => {
  const [draft, setDraft] = useState(() =>
    product
      ? {
          name: product.name,
          enName: product.enName,
          fabric: product.fabric,
          dimensions: product.dimensions,
          price: String(product.price ?? ''),
          oldPrice: product.oldPrice ? String(product.oldPrice) : '',
          quantity: String(product.quantity ?? '1'),
          inStock: product.inStock !== false && product.quantity > 0,
          description: product.description,
          badges: [...(product.badges ?? [])],
          colors: (product.colors ?? []).map((c) => ({ ...c })),
          images: [...(product.images ?? []).slice(0, 2), ''].slice(0, 2),
        }
      : { ...EMPTY_DRAFT, colors: EMPTY_DRAFT.colors.map((c) => ({ ...c })) },
  );
  const [error, setError] = useState('');

  const set = (key, val) => setDraft((d) => ({ ...d, [key]: val }));

  const toggleBadge = (b) =>
    set('badges', draft.badges.includes(b) ? draft.badges.filter((x) => x !== b) : [...draft.badges, b]);

  const setColor = (i, key, val) =>
    set(
      'colors',
      draft.colors.map((c, idx) => (idx === i ? { ...c, [key]: val } : c)),
    );

  const setImage = (i, val) =>
    set('images', draft.images.map((url, idx) => (idx === i ? val : url)));

  const save = () => {
    if (!draft.name.trim()) return setError('عنوان محصول الزامی است.');
    if (!draft.price || Number(draft.price) < 0) return setError('قیمت معتبری وارد کنید.');
    if (!draft.images[0]?.trim() && !draft.images[1]?.trim()) {
      return setError('حداقل یک آدرس عکس وارد کنید.');
    }
    onSave({
      name: draft.name.trim(),
      enName: draft.enName.trim(),
      fabric: draft.fabric.trim() || 'ابریشم',
      dimensions: draft.dimensions.trim(),
      price: Number(draft.price) || 0,
      oldPrice: draft.oldPrice ? Number(draft.oldPrice) : null,
      quantity: draft.inStock ? Math.max(1, Number(draft.quantity) || 1) : 0,
      inStock: draft.inStock,
      description: draft.description.trim(),
      badges: draft.badges,
      colors: draft.colors.filter((c) => c.label.trim() || c.hex.trim()),
      images: draft.images.filter((u) => u.trim()),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 16 }}
      transition={{ type: 'spring', damping: 26, stiffness: 280 }}
      className="qvs-sheet fixed inset-0 z-[96] flex items-end justify-center overflow-y-auto md:items-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={product ? `ویرایش ${product.name}` : 'افزودن محصول جدید'}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-md" />
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-t-3xl border border-white/10 bg-[#100F0E] shadow-[0_25px_60px_rgba(0,0,0,0.9)] md:rounded-3xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.06] bg-[#100F0E]/95 px-5 py-4 backdrop-blur-xl">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-pearl">
            <Package size={15} className="text-gold" strokeWidth={1.7} />
            {product ? 'ویرایش محصول' : 'افزودن محصول جدید'}
          </h3>
          <button
            type="button"
            aria-label="بستن"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-pearl/70 transition-all duration-300 hover:rotate-90 hover:border-gold/40 hover:text-gold active:scale-90"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <div className="max-h-[calc(90dvh-4rem)] space-y-5 overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="عنوان محصول *">
              <TextInput
                value={draft.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="مثلاً شال ابریشم توییل"
                dir="rtl"
              />
            </Field>
            <Field label="عنوان انگلیسی (اختیاری)">
              <TextInput
                value={draft.enName}
                onChange={(e) => set('enName', e.target.value)}
                placeholder="Twilly Silk"
                dir="ltr"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="جنس پارچه">
              <TextInput
                list="admin-fabrics"
                value={draft.fabric}
                onChange={(e) => set('fabric', e.target.value)}
                placeholder="ابریشم، موهر…"
                dir="rtl"
              />
              <datalist id="admin-fabrics">
                {['ابریشم', 'ابریشم ژاکارد', 'نخ ابریشم', 'کشمیر و موهر', 'نخ لنین', 'کرپ حریر', 'موهر', 'نخی'].map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </Field>
            <Field label="ابعاد و قواره">
              <TextInput
                value={draft.dimensions}
                onChange={(e) => set('dimensions', e.target.value)}
                placeholder="۱۴۰×۱۴۰ سانتیمتر"
                dir="rtl"
              />
            </Field>
            <Field label="موجودی (عدد)">
              <div className="flex items-center gap-2">
                <TextInput
                  type="number"
                  min="0"
                  max="99"
                  value={draft.quantity}
                  onChange={(e) => set('quantity', e.target.value)}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => {
                    set('inStock', !draft.inStock);
                    if (!draft.inStock && draft.quantity === '0') set('quantity', '1');
                  }}
                  className={`flex h-full shrink-0 items-center gap-1.5 rounded-full border px-3 py-2.5 text-[11px] font-bold transition-all ${
                    draft.inStock
                      ? 'border-gold/40 bg-gold/10 text-gold'
                      : 'border-terracotta/40 bg-terracotta/10 text-[#F0A888]'
                  }`}
                >
                  {draft.inStock ? 'موجود' : 'ناموجود'}
                </button>
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="قیمت اصلی (تومان) *">
              <TextInput
                type="number"
                min="0"
                value={draft.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="۲۸۵۰۰۰۰"
                dir="ltr"
              />
            </Field>
            <Field label="قیمت قبل از تخفیف (اختیاری)" hint="اگر خالی بماند، تخفیف نمایش داده نمی‌شود">
              <TextInput
                type="number"
                min="0"
                value={draft.oldPrice}
                onChange={(e) => set('oldPrice', e.target.value)}
                placeholder="۳۴۰۰۰۰۰"
                dir="ltr"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <Field key={i} label={i === 0 ? 'آدرس عکس اصلی' : 'آدرس عکس استایل (مدل)'}>
                <div className="flex items-center gap-2.5">
                  <TextInput
                    value={draft.images[i]}
                    onChange={(e) => setImage(i, e.target.value)}
                    placeholder="https://…"
                    dir="ltr"
                  />
                  <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
                    {draft.images[i]?.trim() ? (
                      <img
                        src={draft.images[i]}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = draft.images[i === 0 ? 1 : 0];
                        }}
                      />
                    ) : (
                      <ImageIcon size={14} className="absolute inset-0 m-auto text-taupe/50" />
                    )}
                  </span>
                </div>
              </Field>
            ))}
          </div>

          <Field label="توضیحات محصول (اختیاری)">
            <textarea
              value={draft.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="چند خط دربارهٔ بافت، لطافت و کاربرد…"
              className="lux-input resize-none text-sm"
              dir="rtl"
            />
          </Field>

          <Field label="رنگ‌بندی">
            <div className="flex flex-wrap items-center gap-2">
              {draft.colors
                .filter((c) => c.label.trim() || c.hex.trim())
                .map((c) => (
                  <span
                    key={`${c.label}-${c.hex}`}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 py-1 pl-2 pr-1 text-[11px] text-pearl/80"
                  >
                    <span className="h-4 w-4 rounded-full ring-1 ring-inset ring-white/15" style={{ backgroundColor: c.hex }} />
                    {c.label || '—'}
                  </span>
                ))}
            </div>
            <div className="mt-3 space-y-2">
              {draft.colors.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <TextInput
                    value={c.label}
                    onChange={(e) => setColor(i, 'label', e.target.value)}
                    placeholder="نام رنگ (مثلاً زمردی)"
                    className="lux-input !py-2 text-sm"
                  />
                  <input
                    type="color"
                    value={/^#([0-9a-fA-F]{6})$/.test(c.hex) ? c.hex : '#E2C997'}
                    onChange={(e) => setColor(i, 'hex', e.target.value.toUpperCase())}
                    className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-white/10 bg-white/[0.03]"
                    aria-label="کد هگز رنگ"
                  />
                  <button
                    type="button"
                    aria-label="حذف رنگ"
                    onClick={() =>
                      draft.colors.length > 1 &&
                      set('colors', draft.colors.filter((_, idx) => idx !== i))
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-taupe/60 transition-colors hover:bg-terracotta/10 hover:text-terracotta active:scale-90"
                  >
                    <X size={14} strokeWidth={1.8} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => set('colors', [...draft.colors, { label: '', hex: '#E2C997' }])}
              className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-gold transition-colors hover:text-pearl"
            >
              <Plus size={12} strokeWidth={2.5} />
              افزودن رنگ جدید
            </button>
          </Field>

          <Field label="برچسب‌های اختصاصی">
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_BADGES.map((b) => {
                const on = draft.badges.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBadge(b)}
                    className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-all active:scale-95 ${
                      on
                        ? 'bg-gradient-to-b from-gold to-bronze text-obsidian shadow-gold-cta'
                        : 'border border-white/10 text-pearl/60 hover:border-gold/40 hover:text-pearl'
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
              {draft.badges
                .filter((b) => !PRESET_BADGES.includes(b))
                .map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBadge(b)}
                    className="flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-[11px] font-bold text-gold active:scale-95"
                  >
                    {b}
                    <X size={11} strokeWidth={2.5} />
                  </button>
                ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <TextInput
                placeholder="برچسب سفارشی (مثلاً هدیه ویژه)"
                dir="rtl"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    toggleBadge(e.target.value.trim());
                    e.target.value = '';
                  }
                }}
                className="lux-input !py-2 text-sm"
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling;
                  if (input?.value?.trim()) {
                    toggleBadge(input.value.trim());
                    input.value = '';
                  }
                }}
                className="h-10 shrink-0 rounded-full border border-white/10 px-4 text-[11px] font-bold text-pearl/70 hover:border-gold/40 hover:text-gold"
              >
                + اضافه
              </button>
            </div>
          </Field>

          {error && (
            <p className="rounded-xl border border-terracotta/40 bg-terracotta/10 px-4 py-2.5 text-xs font-bold text-[#F0A888]">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2.5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1 sm:flex-row sm:justify-end sm:pb-1">
            <button
              type="button"
              onClick={onClose}
              className={`${PILL_BTN} border-white/10 text-pearl/60 hover:border-white/30 hover:text-pearl`}
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={save}
              className={`${PILL_BTN} btn-gold-modern !px-6 !py-2.5 !text-xs`}
            >
              <Save size={13} strokeWidth={2} />
              ذخیرهٔ محصول
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ---------------- confirm dialog ---------------- */
const ConfirmDialog = ({ title, message, confirmLabel = 'حذف شود', onCancel, onConfirm }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[97] flex items-center justify-center bg-obsidian/80 p-4 backdrop-blur-md"
    onClick={onCancel}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 12 }}
      transition={{ type: 'spring', damping: 26, stiffness: 300 }}
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#131110] p-6 text-center shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
    >
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-terracotta/30 bg-terracotta/10 text-terracotta">
        <Trash2 size={18} strokeWidth={1.7} />
      </span>
      <h3 className="mt-4 text-base font-extrabold text-pearl">{title}</h3>
      <p className="mt-2 text-xs leading-6 text-taupe">{message}</p>
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onCancel}
          className={`${PILL_BTN} border-white/10 text-pearl/60 hover:border-white/30 hover:text-pearl`}
        >
          انصراف
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex items-center justify-center gap-2 rounded-full border border-terracotta/50 bg-gradient-to-b from-[#D4603F] to-[#A03F22] px-5 py-2.5 text-xs font-extrabold text-[#FFE8DD] shadow-[0_12px_30px_-12px_rgba(188,88,64,0.6)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
        >
          <Trash2 size={13} strokeWidth={2.2} />
          {confirmLabel}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

/* ---------------- tabs ---------------- */
const ProductsTab = ({ pushRef }) => {
  const { products, addProduct, updateProduct, deleteProduct, resetToDefaults } = useProducts();
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const filtered = useMemo(() => {
    const qText = query.trim().toLowerCase();
    if (!qText) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(qText) ||
        (p.enName || '').toLowerCase().includes(qText) ||
        (p.fabric || '').toLowerCase().includes(qText),
    );
  }, [products, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در محصولات…"
            className="lux-input !py-2.5 text-sm"
            dir="rtl"
          />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="whitespace-nowrap text-xs text-taupe">{toFa(products.length)} محصول</span>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('بازنشانی کالکشن به محصولات پیش‌فرض؟')) {
                resetToDefaults();
                pushRef?.current?.('success', 'کالکشن به حالت پیش‌فرض بازگشت');
              }
            }}
            className={`${PILL_BTN} border-white/10 text-pearl/60 hover:border-white/30 hover:text-pearl`}
          >
            <RotateCcw size={12} strokeWidth={2} />
            بازنشانی
          </button>
          <button
            type="button"
            onClick={() => setEditor({ mode: 'add' })}
            className="btn-gold-modern !rounded-full !px-5 !py-2.5 !text-xs"
          >
            <Plus size={14} strokeWidth={2.5} />
            افزودن محصول جدید
          </button>
        </div>
      </div>

      <ul className="space-y-2.5">
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-sm text-taupe">
            محصولی یافت نشد.
          </li>
        )}
        {filtered.map((p) => (
          <li
            key={p.id}
            className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 backdrop-blur-xl transition-colors hover:border-gold/20 sm:flex-row sm:items-center"
          >
            <span className="relative h-20 w-14 shrink-0 self-start overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.03]">
              <img
                src={p.images[0]}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-[13px] font-extrabold text-pearl">{p.name}</h4>
                {p.badges?.slice(0, 2).map((b) => (
                  <span key={b} className="rounded-full bg-gold/10 px-2 py-0.5 text-[9px] font-bold text-gold">
                    {b}
                  </span>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-taupe" dir="ltr">
                {p.enName}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                <span className="font-extrabold text-gold">
                  {formatPrice(p.price)} <span className="font-normal text-taupe">تومان</span>
                </span>
                {p.oldPrice && (
                  <span className="text-taupe/60 line-through">{formatPrice(p.oldPrice)}</span>
                )}
                <span className={`font-bold ${p.inStock !== false && p.quantity > 0 ? 'text-pearl/70' : 'text-terracotta'}`}>
                  {p.inStock !== false && p.quantity > 0 ? `${toFa(p.quantity)} عدد` : 'ناموجود'}
                </span>
                <span className="text-taupe/60">{p.fabric}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setEditor({ mode: 'edit', product: p })}
                className={`${PILL_BTN} !px-3.5 !py-2 border-white/10 text-pearl/70 hover:border-gold/40 hover:text-gold`}
              >
                <Settings2 size={12} strokeWidth={2} />
                ویرایش
              </button>
              <button
                type="button"
                aria-label={`حذف ${p.name}`}
                onClick={() => setToDelete(p)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-taupe/60 transition-all hover:border-terracotta/50 hover:text-terracotta active:scale-90"
              >
                <Trash2 size={13} strokeWidth={1.8} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {editor && (
          <ProductEditor
            product={editor.mode === 'edit' ? editor.product : null}
            onClose={() => setEditor(null)}
            onSave={(data) => {
              if (editor.mode === 'edit') {
                updateProduct(editor.product.id, data);
                pushRef?.current?.('success', 'تغییرات محصول ذخیره شد');
              } else {
                addProduct(data);
                pushRef?.current?.('success', 'محصول جدید اضافه شد');
              }
              setEditor(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toDelete && (
          <ConfirmDialog
            title="حذف محصول"
            message={`آیا از حذف «${toDelete.name}» مطمئن هستید؟ این تغییر بلافاصله در سایت اعمال می‌شود.`}
            onCancel={() => setToDelete(null)}
            onConfirm={() => {
              deleteProduct(toDelete.id);
              pushRef?.current?.('success', 'محصول حذف شد');
              setToDelete(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---------------- settings tab ---------------- */
const SettingsTab = ({ pushRef }) => {
  const { settings, updateSettings, resetToDefaults } = useSettings();
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    setDraft({ ...settings });
  }, [settings]);

  if (!draft) return null;

  const set = (key, val) => setDraft((d) => ({ ...d, [key]: val }));

  return (
    <div className="space-y-4">
      <Panel title="تنظیمات عمومی فروشگاه" icon={Settings2}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="متن نوار اعلان بالای سایت">
              <TextInput value={draft.announcementText} onChange={(e) => set('announcementText', e.target.value)} dir="rtl" />
            </Field>
          </div>
          <Field label="شماره تماس فروشگاه" hint="متن نمایشی در فوتر">
            <TextInput value={draft.phone} onChange={(e) => set('phone', e.target.value)} dir="ltr" />
          </Field>
          <Field label="شماره واتس‌اپ (برای ارسال پیش‌فاکتور)" hint="فقط ارقام، با کد کشور، مثلاً 989123456789">
            <TextInput value={draft.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} dir="ltr" />
          </Field>
          <Field label="حداقل مبلغ ارسال رایگان (تومان)">
            <TextInput
              type="number"
              min="0"
              value={draft.freeShippingThreshold}
              onChange={(e) => set('freeShippingThreshold', e.target.value)}
              dir="ltr"
            />
          </Field>
          <Field label="آیدی پشتیبانی">
            <TextInput value={draft.supportId} onChange={(e) => set('supportId', e.target.value)} dir="ltr" />
          </Field>
          <Field label="آیدی اینستاگرام">
            <TextInput
              value={draft.instagramHandle}
              onChange={(e) => {
                const v = e.target.value.trim();
                set('instagramHandle', v);
                set('instagramUrl', v ? `https://instagram.com/${v.replace(/^@/, '')}` : '');
              }}
              dir="ltr"
            />
          </Field>
          <Field label="لینک اینستاگرام">
            <TextInput value={draft.instagramUrl} onChange={(e) => set('instagramUrl', e.target.value)} dir="ltr" />
          </Field>
        </div>
      </Panel>

      <div className="flex flex-col gap-2.5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => {
            resetToDefaults();
            pushRef?.current?.('success', 'تنظیمات به پیش‌فرض بازگشت');
          }}
          className={`${PILL_BTN} border-white/10 text-pearl/60 hover:border-white/30 hover:text-pearl`}
        >
          <RotateCcw size={12} strokeWidth={2} />
          بازنشانی به پیش‌فرض
        </button>
        <button
          type="button"
          onClick={() => {
            updateSettings(draft);
            pushRef?.current?.('success', 'تنظیمات ذخیره شد و در همان لحظه اعمال شد');
          }}
          className="btn-gold-modern !rounded-full !px-6 !py-2.5 !text-xs"
        >
          <Save size={13} strokeWidth={2} />
          ذخیرهٔ تنظیمات
        </button>
      </div>
    </div>
  );
};

/* ---------------- github tab ---------------- */
const readGhMeta = () => {
  try {
    const raw = localStorage.getItem(GH_STORAGE_KEY);
    return raw
      ? { owner: 'RADINMNX2', repo: 'rozhina', branch: 'main', pat: '', ...JSON.parse(raw) }
      : { owner: 'RADINMNX2', repo: 'rozhina', branch: 'main', pat: '' };
  } catch {
    return { owner: 'RADINMNX2', repo: 'rozhina', branch: 'main', pat: '' };
  }
};

const GithubTab = ({ pushRef }) => {
  const { products } = useProducts();
  const { settings } = useSettings();
  const [meta, setMeta] = useState(readGhMeta);
  const [status, setStatus] = useState('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const restoreRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(GH_STORAGE_KEY, JSON.stringify(meta));
    } catch {
      /* ignore */
    }
  }, [meta]);

  const set = (key, val) => setMeta((m) => ({ ...m, [key]: val }));

  const sync = async () => {
    if (!meta.pat.trim()) {
      pushRef?.current?.('error', 'ابتدا توکن GitHub را وارد کنید');
      return;
    }
    setStatus('syncing');
    setStatusMsg('در حال انتشار روی گیت‌هاب…');
    try {
      await ghPutFile(
        meta.pat, meta.owner, meta.repo, 'src/data/productsData.js',
        serializeProducts(products),
        'chore(content): sync products from Rozhina Admin Studio', meta.branch,
      );
      await ghPutFile(
        meta.pat, meta.owner, meta.repo, 'src/data/constants.js',
        serializeConstants(settings),
        'chore(content): sync store settings from Rozhina Admin Studio', meta.branch,
      );
      setStatus('ok');
      setStatusMsg('منتشر شد! دیپلوی خودکار در حال اجراست…');
      pushRef?.current?.('success', 'تغییرات در GitHub منتشر شد — سایت به‌زودی بروزرسانی می‌شود');
    } catch (err) {
      setStatus('error');
      setStatusMsg(String(err?.message || err));
      pushRef?.current?.('error', `خطا در انتشار: ${String(err?.message || err).slice(0, 80)}`);
    }
  };

  const downloadBackup = () => {
    const payload = {
      version: 1,
      savedAt: new Date().toISOString(),
      products,
      settings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rozhina-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    pushRef?.current?.('success', 'فایل پشتیبان دانلود شد');
  };

  const copyCode = async () => {
    const code = serializeProducts(products);
    try {
      await navigator.clipboard.writeText(code);
      pushRef?.current?.('success', 'کد دیتا در کلیپ‌بورد کپی شد');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      pushRef?.current?.('success', 'کد دیتا در کلیپ‌بورد کپی شد');
    }
  };

  const restore = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (Array.isArray(data.products)) {
          window.dispatchEvent(
            new CustomEvent('rozhina:restore', { detail: { products: data.products, settings: data.settings } }),
          );
          pushRef?.current?.('success', `پشتیبان بازیابی شد (${toFa(data.products.length)} محصول)`);
        } else {
          throw new Error('ساختار فایل پشتیبان نامعتبر است');
        }
      } catch (err) {
        pushRef?.current?.('error', `خطا در خواندن پشتیبان: ${String(err.message || err)}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <Panel title="انتشار روی گیت‌هاب (دیپلوی خودکار)" icon={Github}>
        <p className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[11px] leading-6 text-taupe">
          با یک کلیک، فایل‌های <span dir="ltr">productsData.js</span> و <span dir="ltr">constants.js</span> مستقیماً
          در مخزن به‌روزرسانی و کامیت می‌شوند و GitHub Actions به‌صورت خودکار سایت را دیپلوی می‌کند.
          توکن فقط در مرورگر خودتان (localStorage) ذخیره می‌شود.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="توکن دسترسی شخصی (PAT)" hint="نیازمند دسترسی repo/contents:write">
              <TextInput
                type="password"
                value={meta.pat}
                onChange={(e) => set('pat', e.target.value)}
                placeholder="ghp_…"
                dir="ltr"
              />
            </Field>
          </div>
          <Field label="Owner">
            <TextInput value={meta.owner} onChange={(e) => set('owner', e.target.value)} dir="ltr" />
          </Field>
          <Field label="Repository">
            <TextInput value={meta.repo} onChange={(e) => set('repo', e.target.value)} dir="ltr" />
          </Field>
          <Field label="Branch">
            <TextInput value={meta.branch} onChange={(e) => set('branch', e.target.value)} dir="ltr" />
          </Field>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={sync}
            disabled={status === 'syncing'}
            className="btn-gold-modern !rounded-full !px-7 !py-3 !text-[13px] w-full disabled:opacity-60 sm:w-auto"
          >
            <CloudCog size={15} strokeWidth={2} className={status === 'syncing' ? 'animate-spin' : ''} />
            {status === 'syncing' ? 'در حال انتشار…' : 'انتشار نهایی تغییرات روی سایت'}
          </button>
          {statusMsg && (
            <p
              className={`mt-3 text-[11px] leading-6 ${
                status === 'error' ? 'text-terracotta' : status === 'ok' ? 'text-gold' : 'text-taupe'
              }`}
              dir="auto"
            >
              {statusMsg}
            </p>
          )}
        </div>
      </Panel>

      <Panel title="پشتیبان‌گیری و انتقال" icon={Download}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={downloadBackup}
            className={`${PILL_BTN} !py-3 border-white/10 text-pearl/75 hover:border-gold/40 hover:text-gold`}
          >
            <Download size={13} strokeWidth={2} />
            دانلود پشتیبان JSON
          </button>
          <button
            type="button"
            onClick={copyCode}
            className={`${PILL_BTN} !py-3 border-white/10 text-pearl/75 hover:border-gold/40 hover:text-gold`}
          >
            <ClipboardCopy size={13} strokeWidth={2} />
            کپی کد دیتای جدید
          </button>
          <button
            type="button"
            onClick={() => restoreRef.current?.click()}
            className={`${PILL_BTN} !py-3 border-white/10 text-pearl/75 hover:border-gold/40 hover:text-gold`}
          >
            <Upload size={13} strokeWidth={2} />
            بازیابی از پشتیبان
          </button>
          <input
            ref={restoreRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) restore(f);
              e.target.value = '';
            }}
          />
        </div>
      </Panel>
    </div>
  );
};

/* ---------------- shell ---------------- */
const TABS = [
  { key: 'products', label: 'محصولات', icon: Package },
  { key: 'settings', label: 'تنظیمات سایت', icon: Settings2 },
  { key: 'github', label: 'تنظیمات گیت‌هاب', icon: Github },
];

export const AdminStudio = () => {
  const { importProducts } = useProducts();
  const { replaceSettings } = useSettings();
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState('products');
  const [toasts, setToasts] = useState([]);
  const pushRef = useRef(null);

  const push = useCallback((type, msg) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((t) => [...t, { id, type, msg }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);
  pushRef.current = push;

  const openAdmin = useCallback(() => {
    setOpen(true);
    setUnlocked(sessionStorage.getItem(UNLOCK_KEY) === '1');
  }, []);

  const closeAdmin = useCallback(() => {
    setOpen(false);
    if (window.location.hash === '#admin') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        openAdmin();
      }
    };
    const onHash = () => {
      if (window.location.hash === '#admin') openAdmin();
    };
    const onCustom = () => openAdmin();
    window.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('rozhina:open-admin', onCustom);
    window.addEventListener('rozhina:restore', (e) => {
      importProducts(e.detail?.products);
      if (e.detail?.settings) replaceSettings(e.detail.settings);
    });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('rozhina:open-admin', onCustom);
    };
  }, [openAdmin, importProducts, replaceSettings]);

  const unlock = useCallback(() => {
    sessionStorage.setItem(UNLOCK_KEY, '1');
    setUnlocked(true);
    push('success', 'به پنل مدیریت خوش آمدید');
  }, [push]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <ToastHost toasts={toasts} />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[85] overflow-y-auto bg-[#0C0B0A]/97 backdrop-blur-2xl"
            role="dialog"
            aria-label="پنل مدیریت روژینا"
          >
            <div className="container-lux mx-auto min-h-full max-w-4xl py-6 md:py-10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/25 bg-gold/[0.07] text-gold shadow-gold-glow">
                    <Lock size={18} strokeWidth={1.6} />
                  </span>
                  <div>
                    <h1 className="text-base font-extrabold text-pearl md:text-lg">
                      استودیو مدیریت روژینا
                    </h1>
                    <p className="text-[11px] text-taupe">
                      مدیریت محصولات و سایت بدون کدنویسی
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="بستن پنل مدیریت"
                  onClick={closeAdmin}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-pearl/70 transition-all duration-300 hover:rotate-90 hover:border-gold/40 hover:text-gold active:scale-90"
                >
                  <X size={18} strokeWidth={1.8} />
                </button>
              </div>

              {unlocked ? (
                <>
                  <div
                    className="no-scrollbar mt-6 flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-white/[0.07] bg-white/[0.02] p-1.5 backdrop-blur-xl"
                    role="tablist"
                    aria-label="بخش‌های پنل مدیریت"
                  >
                    {TABS.map((t) => {
                      const Icon = t.icon;
                      const active = tab === t.key;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setTab(t.key)}
                          className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-300 active:scale-[0.97] ${
                            active
                              ? 'bg-gradient-to-b from-gold to-bronze text-obsidian shadow-gold-cta'
                              : 'text-pearl/60 hover:bg-white/[0.04] hover:text-pearl'
                          }`}
                        >
                          <Icon size={14} strokeWidth={1.9} />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5">
                    {tab === 'products' && <ProductsTab pushRef={pushRef} />}
                    {tab === 'settings' && <SettingsTab pushRef={pushRef} />}
                    {tab === 'github' && <GithubTab pushRef={pushRef} />}
                  </div>
                </>
              ) : (
                <PinGate onSuccess={unlock} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
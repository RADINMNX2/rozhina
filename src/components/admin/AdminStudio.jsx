import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  CloudCog,
  Download,
  Github,
  ImageIcon,
  Lock,
  Package,
  PenLine,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  Trash2,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';
import { useSettings } from '../../context/SettingsContext';
import { useContent } from '../../context/ContentContext';
import { formatPrice, toFa } from '../../utils/format';
import { remoteReadyFlag, whenRemoteReady } from '../../utils/remote';
import { CATEGORIES } from '../../data/productsData';

const ADMIN_PIN = 'Rozhina8962';

let ghMetaStore = { owner: 'RADINMNX2', repo: 'rozhina', branch: 'main', pat: '' };
const getGhMeta = () => ({ ...ghMetaStore });
const setGhMeta = (patch) => {
  ghMetaStore = { ...ghMetaStore, ...patch };
};

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

const serializeCategories = (products) => {
  const seen = new Set(['شال و روسری', 'کیف و اکسسوری', 'لباس', 'شلوار']);
  const list = [];
  for (const p of products) {
    const c = (p.category || '').trim();
    if (c && !seen.has(c)) {
      seen.add(c);
      list.push(c);
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
        `    code: ${q(p.code)},`,
        `    category: ${q(p.category)},`,
        `    fabric: ${q(p.fabric)},`,
        `    dimensions: ${q(p.dimensions)},`,
        `    ${colors},`,
        `    price: ${Number(p.price) || 0},`,
        `    oldPrice: ${p.oldPrice ? Number(p.oldPrice) : 'null'},`,
        `    quantity: ${qty},`,
        `    ${badges},`,
        `    description: ${q(p.description)},`,
        `    ${images},`,
        '  }',
      ].join('\n');
    })
    .join(',\n');

  const fabricsList = serializeFabrics(products);
  const colorsList = serializeColors(products);
  const categoriesList = serializeCategories(products);

  return [
    "const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;",
    '',
    "export const PLACEHOLDER_IMAGE = photo('photo-1520006403909-838d6b92c22e');",
    '',
    `export const CATEGORIES = ${JSON.stringify(categoriesList, null, 2)};`,
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
  '',
  `export const PAYMENT_URL = ${q(s.paymentUrl)};`,
].join('\n');

export const serializeContent = (c) =>
  [`export const CONTENT = ${JSON.stringify(c, null, 2)};`, '', 'export default CONTENT;'].join('\n');

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
  for (let attempt = 0; attempt < 5; attempt += 1) {
    if (attempt > 0) await new Promise((r) => window.setTimeout(r, 600 * attempt));
    const sha = await ghGetFile(pat, owner, repo, path, branch);
    const url = `${GH_API}/repos/${owner}/${repo}/contents/${path}`;
    const body = { message, content: encodeB64(content), branch };
    if (sha) body.sha = sha;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { ...GH_HEADERS, Authorization: `Bearer ${pat}` },
      body: JSON.stringify(body),
    });
    if (res.status === 409 || res.status === 422) {
      continue; // هم‌زمان با انتشار دیگری برخورد کرد؛ عکس تازه بگیر و دوباره تلاش کن
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `خطای ${res.status} در انتشار فایل ${path}`);
    }
    return res.json();
  }
  throw new Error(`هم‌زمانی انتشار ${path}; لحظاتی بعد دوباره تلاش می‌شود`);
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
  'inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold transition-[transform,background-color,border-color,color] duration-300 active:scale-[0.97]';

const Panel = ({ title, icon: Icon, children, actions }) => (
  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3.5 sm:p-5">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
          className={`pointer-events-auto flex items-center gap-2.5 rounded-full border px-5 py-3 text-xs font-bold shadow-[0_14px_40px_-12px_rgba(0,0,0,0.7)] ${
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
  code: '',
  category: 'شال و روسری',
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

/* ---------------- image upload ---------------- */
const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const readRaw = () =>
      new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.onerror = () => rej(new Error('read failed'));
        reader.readAsDataURL(file);
      });
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      try {
        const MAX = 1000;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        if (scale >= 1) {
          URL.revokeObjectURL(objectUrl);
          resolve(await readRaw());
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch {
        URL.revokeObjectURL(objectUrl);
        resolve(await readRaw());
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      readRaw().then(resolve).catch(reject);
    };
    img.src = objectUrl;
  });

const ProductEditor = ({ product, onClose, onSave }) => {
  const [draft, setDraft] = useState(() =>
    product
      ? {
          name: product.name,
          enName: product.enName,
          code: product.code ?? '',
          category: product.category ?? 'شال و روسری',
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
      code: draft.code.trim(),
      category: draft.category,
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[96] flex items-end justify-center md:items-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={product ? `ویرایش ${product.name}` : 'افزودن محصول جدید'}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-obsidian/90"
      />
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
        className="relative flex max-h-full w-full flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#121110] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)] md:max-h-[92dvh] md:rounded-[2rem]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 rounded-t-[inherit] bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(226,201,151,0.16),transparent_60%)]" />
        <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-gradient-to-b from-white/[0.045] to-transparent px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10 text-gold shadow-[0_0_24px_-6px_rgba(226,201,151,0.55)]">
              <Package size={17} strokeWidth={1.7} />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-pearl">{product ? 'ویرایش محصول' : 'افزودن محصول جدید'}</h3>
              <p className="mt-0.5 text-[10px] font-medium text-taupe">
                {product ? product.enName || product.fabric : 'کالکشن جدید روژینا'}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="بستن"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-pearl/70 transition-[transform,background-color,border-color,color] duration-300 hover:rotate-90 hover:border-gold/40 hover:bg-gold/10 hover:text-gold active:scale-90"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <div className="relative flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5">
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
            <Field label="کد محصول (اختیاری)" hint="مثلاً برای «روسری فلان» کد xx-x بگذارید">
              <TextInput
                value={draft.code}
                onChange={(e) => set('code', e.target.value)}
                placeholder="مثلاً RS-204"
                dir="ltr"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Field label="دسته‌بندی">
              <select
                value={draft.category}
                onChange={(e) => set('category', e.target.value)}
                className="lux-input appearance-none !py-2.5"
                dir="rtl"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="جنس پارچه">
              <TextInput
                list="admin-fabrics"
                value={draft.fabric}
                onChange={(e) => set('fabric', e.target.value)}
                placeholder="ابریشم، چرم، کتان…"
                dir="rtl"
              />
              <datalist id="admin-fabrics">
                {['ابریشم', 'ابریشم ژاکارد', 'نخ ابریشم', 'کشمیر و موهر', 'نخ لنین', 'کرپ حریر', 'موهر', 'نخی', 'چرم', 'کتان', 'جین', 'مخمل'].map((f) => (
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
                  className={`flex h-full shrink-0 items-center gap-1.5 rounded-full border px-3 py-2.5 text-[11px] font-bold transition-[transform,background-color,border-color,color] ${
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                <div className="relative aspect-[4/3] overflow-hidden bg-white/[0.03]">
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-taupe/60">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-white/15">
                        <ImageIcon size={20} strokeWidth={1.5} />
                      </span>
                      <span className="text-[10px] font-bold">عکسی انتخاب نشده</span>
                    </div>
                  )}
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-obsidian/70 px-2.5 py-1 text-[9px] font-extrabold text-gold backdrop-blur-md">
                    {i === 0 ? 'عکس اصلی' : 'استایل / مدل'}
                  </span>
                  {draft.images[i]?.trim() && (
                    <button
                      type="button"
                      aria-label="حذف عکس"
                      onClick={() => setImage(i, '')}
                      className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-obsidian/70 text-pearl/80 backdrop-blur-md transition-colors hover:text-terracotta"
                    >
                      <X size={12} strokeWidth={2.2} />
                    </button>
                  )}
                  {draft.images[i]?.startsWith('data:image') && (
                    <span className="absolute bottom-2.5 right-2.5 rounded-full bg-obsidian/70 px-2 py-0.5 text-[8px] font-bold text-taupe backdrop-blur-md">
                      آپلود‌شده
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 p-2.5">
                  <label className="relative flex-1 cursor-pointer">
                    <span className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/25 bg-gold/10 px-3 py-2 text-[11px] font-extrabold text-gold transition-colors hover:bg-gold/20 active:scale-[0.98]">
                      <Upload size={12} strokeWidth={2.2} />
                      آپلود عکس
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="pointer-events-none absolute h-0 w-0 opacity-0"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2.5 * 1024 * 1024) {
                            window.alert('حجم عکس بیشتر از ۲.۵ مگابایت است.');
                          } else {
                            readFileAsDataURL(file).then((url) => setImage(i, url));
                          }
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setImage(i, '')}
                    className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-[11px] font-bold text-taupe/70 transition-colors hover:border-white/30 hover:text-pearl"
                  >
                    پاک‌کردن
                  </button>
                </div>
                <TextInput
                  value={draft.images[i]}
                  onChange={(e) => setImage(i, e.target.value)}
                  placeholder="یا لینک تصویر: https://…"
                  dir="ltr"
                />
              </div>
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
                    className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-[transform,background-color,border-color,color] active:scale-95 ${
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
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-2xl border border-terracotta/40 bg-terracotta/10 px-4 py-3 text-xs font-bold text-[#F0A888]"
            >
              <X size={12} strokeWidth={2.5} />
              {error}
            </motion.p>
          )}
        </div>

        <div className="relative z-10 flex shrink-0 items-center gap-2.5 border-t border-white/[0.06] bg-gradient-to-t from-[#0E0D0C] to-[#141312] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={onClose}
            className={`${PILL_BTN} flex-1 border-white/10 bg-white/[0.03] text-pearl/70 hover:border-white/30 hover:text-pearl sm:flex-none`}
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={save}
            className="btn-gold-modern flex-1 !rounded-full !px-6 !py-3 !text-xs sm:flex-none sm:!px-10 sm:!py-3"
          >
            <Save size={14} strokeWidth={2} />
            ذخیرهٔ محصول
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ---------------- confirm dialog ---------------- */
const ConfirmDialog = ({ title, message, confirmLabel = 'تأیید شود', onCancel, onConfirm }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[97] flex items-end justify-center bg-obsidian/90 p-0 sm:items-center sm:p-4"
    onClick={onCancel}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 24 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-sm overflow-hidden rounded-t-3xl border border-white/10 bg-[#141211] pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-7 text-center shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95)] sm:rounded-3xl"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(120%_80%_at_50%_-20%,rgba(212,96,63,0.18),transparent_60%)]" />
      <div className="relative px-6">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, type: 'spring', damping: 18, stiffness: 300 }}
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-terracotta/30 bg-gradient-to-b from-terracotta/20 to-terracotta/5 text-terracotta shadow-[0_16px_40px_-16px_rgba(188,88,64,0.8)]"
        >
          <Trash2 size={20} strokeWidth={1.7} />
        </motion.span>
        <h3 className="mt-4 text-base font-extrabold text-pearl">{title}</h3>
        <p className="mx-auto mt-2 max-w-xs text-xs leading-6 text-taupe">{message}</p>
        <div className="mx-auto mt-6 flex max-w-xs flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            className={`${PILL_BTN} flex-1 border-white/10 bg-white/[0.03] text-pearl/70 hover:border-white/30 hover:text-pearl`}
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#D4603F] to-[#A03F22] px-5 py-2.5 text-xs font-extrabold text-[#FFE8DD] shadow-[0_14px_36px_-14px_rgba(188,88,64,0.9)] transition-[transform,background-color,border-color,color] duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
          >
            <Trash2 size={13} strokeWidth={2.2} />
            {confirmLabel}
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

/* ---------------- tabs ---------------- */
const ProductsTab = ({ pushRef }) => {
  const { products, addProduct, updateProduct, deleteProduct, resetToDefaults } = useProducts();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('همه');
  const [editor, setEditor] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const filtered = useMemo(() => {
    let list = products;
    const qText = query.trim().toLowerCase();
    if (qText) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(qText) ||
          (p.enName || '').toLowerCase().includes(qText) ||
          (p.fabric || '').toLowerCase().includes(qText) ||
          (p.category || '').toLowerCase().includes(qText),
      );
    }
    if (cat !== 'همه') list = list.filter((p) => p.category === cat);
    return list;
  }, [products, query, cat]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row">
          <div className="relative flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو در محصولات…"
              className="lux-input !py-2.5 text-sm"
              dir="rtl"
            />
          </div>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="lux-input appearance-none !py-2.5 text-sm"
            dir="rtl"
            aria-label="فیلتر دسته‌بندی"
          >
            <option value="همه">همه دسته‌ها</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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
className={`${PILL_BTN} whitespace-nowrap border-white/10 text-pearl/60 hover:border-white/30 hover:text-pearl`}
          >
            <RotateCcw size={12} strokeWidth={2} />
            بازنشانی
          </button>
          <button
            type="button"
            onClick={() => setEditor({ mode: 'add' })}
            className="btn-gold-modern whitespace-nowrap !rounded-full !px-5 !py-2.5 !text-xs"
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
            className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-colors hover:border-gold/20 sm:flex-row sm:items-center"
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
                {p.category && (
                  <span className="whitespace-nowrap rounded-full bg-white/[0.05] px-2 py-0.5 text-[9px] font-bold text-pearl/50">
                    {p.category}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-taupe" dir="ltr">
                {p.enName}
                {p.code && (
                  <span className="mr-2 rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-pearl/45" dir="ltr">
                    کد {p.code}
                  </span>
                )}
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
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`کاهش موجودی ${p.name}`}
                    onClick={() => {
                      const nq = Math.max(0, (Number(p.quantity) || 0) - 1);
                      updateProduct(p.id, { quantity: nq, inStock: nq > 0 });
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 text-pearl/70 transition-[transform,background-color,border-color,color] hover:border-terracotta/50 hover:text-terracotta active:scale-90"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    aria-label={`افزایش موجودی ${p.name}`}
                    onClick={() => {
                      const nq = Math.min(99, (Number(p.quantity) || 0) + 1);
                      updateProduct(p.id, { quantity: nq, inStock: nq > 0 });
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 text-pearl/70 transition-[transform,background-color,border-color,color] hover:border-gold/40 hover:text-gold active:scale-90"
                  >
                    +
                  </button>
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
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-taupe/60 transition-[transform,background-color,border-color,color] hover:border-terracotta/50 hover:text-terracotta active:scale-90"
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
          <Field label="آدرس درگاه پرداخت 🛡️" hint="آدرس Worker کلادفلر بعد از استقرار، مثل https://rozhina-pay.اسم-شما.workers.dev — تا زمانی که خالی باشد، دکمه پرداخت آنلاین نمایش داده نمی‌شود">
            <TextInput
              value={draft.paymentUrl}
              onChange={(e) => set('paymentUrl', e.target.value)}
              placeholder="https://rozhina-pay…workers.dev"
              dir="ltr"
            />
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

/* ---------------- content tab ---------------- */
const CField = ({ label, hint, value, onChange, type = 'text', dir = 'auto' }) => (
  <Field label={label} hint={hint}>
    {type === 'area' ? (
      <textarea
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        dir={dir}
        className="lux-input resize-none text-sm leading-6"
      />
    ) : (
      <TextInput value={value ?? ''} onChange={(e) => onChange(e.target.value)} dir={dir} />
    )}
  </Field>
);

const CListEditor = ({ items, onList, fields, imageKey }) => {
  const move = (i, d) => {
    const next = [...items];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onList(next);
  };

  const setField = (i, key, value) =>
    onList(items.map((it, x) => (x === i ? { ...it, [key]: value } : it)));

  return (
    <div className="space-y-2.5">
      {items.map((item, i) => {
        const img = item?.[imageKey]?.trim() ?? '';
        return (
          <div key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
            {imageKey && (
              <div className="mb-3 flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.opacity = 0.15;
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-taupe/50">
                      <ImageIcon size={16} strokeWidth={1.5} />
                    </div>
                  )}
                  {img.startsWith('data:image') && (
                    <span className="absolute bottom-1 right-1 rounded-full bg-obsidian/80 px-1.5 py-0.5 text-[8px] font-bold text-taupe backdrop-blur-md">
                      آپلود‌شده
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <label className="relative cursor-pointer">
                    <span className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/25 bg-gold/10 px-3 py-2 text-[10px] font-extrabold text-gold transition-colors hover:bg-gold/20 active:scale-[0.98]">
                      <Upload size={11} strokeWidth={2.2} />
                      آپلود عکس
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="pointer-events-none absolute h-0 w-0 opacity-0"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2.5 * 1024 * 1024) {
                            window.alert('حجم عکس بیشتر از ۲.۵ مگابایت است.');
                          } else {
                            readFileAsDataURL(file).then((url) => setField(i, imageKey, url));
                          }
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <TextInput
                    value={item?.[imageKey] ?? ''}
                    onChange={(e) => setField(i, imageKey, e.target.value)}
                    dir="ltr"
                    placeholder="https://… (لینک عکس یا آپلود)"
                  />
                  {img && (
                    <button
                      type="button"
                      onClick={() => setField(i, imageKey, '')}
                      className="self-start rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-bold text-taupe/70 transition-colors hover:border-white/30 hover:text-pearl"
                    >
                      پاک کردن تصویر
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {fields.map((f) => (
                <Field key={f.key} label={f.label}>
                  <TextInput
                    value={item?.[f.key] ?? ''}
                    onChange={(e) => setField(i, f.key, e.target.value)}
                    dir={f.dir ?? 'rtl'}
                    placeholder={f.placeholder}
                  />
                </Field>
              ))}
            </div>
            <div className="mt-2.5 flex items-center gap-1.5">
              <button
                type="button"
                aria-label="بالا بردن"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                className="lux-chip !px-2.5 !py-1.5 disabled:opacity-30"
              >
                <ChevronUp size={12} />
              </button>
              <button
                type="button"
                aria-label="پایین بردن"
                disabled={i === items.length - 1}
                onClick={() => move(i, 1)}
                className="lux-chip !px-2.5 !py-1.5 disabled:opacity-30"
              >
                <ChevronDown size={12} />
              </button>
              <button
                type="button"
                aria-label="حذف مورد"
                onClick={() => onList(items.filter((_, x) => x !== i))}
                className="lux-chip !px-2.5 !py-1.5 hover:!border-terracotta/40 hover:!text-[#F0A888]"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => onList([...items, {}])}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-2.5 text-[11px] font-bold text-pearl/60 transition-[transform,background-color,border-color,color] duration-300 hover:border-gold/40 hover:text-gold active:scale-[0.99]"
      >
        <Plus size={12} strokeWidth={2.2} />
        افزودن مورد جدید
      </button>
    </div>
  );
};

const ContentTab = ({ pushRef }) => {
  const { content, updateContent, resetContent } = useContent();

  const set = (key, patch) => updateContent({ [key]: patch });
  const setIn = (objKey, fieldKey, v) => set(objKey, { ...content[objKey], [fieldKey]: v });

  const Sub = ({ label }) => (
    <p className="mb-2.5 mt-5 flex items-center gap-2 text-[11px] font-extrabold text-gold/85 first:mt-0">
      <span className="h-px w-4 bg-gold/40" />
      {label}
    </p>
  );

  return (
    <div className="space-y-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <Panel
        title="متن‌های کل سایت"
        icon={PenLine}
        actions={
          <button
            type="button"
            onClick={() => {
              resetContent();
              pushRef?.current?.('success', 'همهٔ متن‌ها به پیش‌فرض بازگشت');
            }}
            className={`${PILL_BTN} !px-3 !py-1.5 !text-[10px] border-white/10 text-pearl/60 hover:border-gold/40 hover:text-gold`}
          >
            <Wand2 size={11} strokeWidth={2} />
            بازنشانی همه
          </button>
        }
      >
        <p className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[11px] leading-6 text-taupe">
          هر متنی که تغییر دهید همان لحظه در سایت اعمال می‌شود و چند ثانیه بعد به‌صورت خودکار روی گیت‌هاب منتشر شده و
          سایت بروزرسانی می‌شود. مکان‌نماهای{' '}
          <b className="font-mono text-gold/85" dir="ltr">
            {`{n}، {total}، {q}، {code}`}
          </b>{' '}
          به‌صورت خودکار با عدد/متن مرتبط پر می‌شوند.
        </p>

        <Sub label="بنر اصلی سایت" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="متن کوچک بالای بنر" value={content.hero?.eyebrow} onChange={(v) => setIn('hero', 'eyebrow', v)} />
          <CField label="تیتر بزرگ — خط اول" value={content.hero?.title1} onChange={(v) => setIn('hero', 'title1', v)} />
          <CField label="تیتر بزرگ — خط دوم (زرین)" value={content.hero?.title2} onChange={(v) => setIn('hero', 'title2', v)} />
          <div className="sm:col-span-2">
            <CField label="زیرتیتر بنر" type="area" value={content.hero?.subtitle} onChange={(v) => setIn('hero', 'subtitle', v)} />
          </div>
          <CField label="متن دکمه اصلی" value={content.hero?.ctaPrimary} onChange={(v) => setIn('hero', 'ctaPrimary', v)} />
          <CField label="متن دکمه دوم" value={content.hero?.ctaSecondary} onChange={(v) => setIn('hero', 'ctaSecondary', v)} />
        </div>

        <Sub label="بخش کالکشن" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="برچسب لاتین" hint="متن‌های انگلیسی یا خلاصهٔ بالای عنوان" dir="ltr" value={content.collection?.eyebrow} onChange={(v) => setIn('collection', 'eyebrow', v)} />
          <CField label="عنوان کالکشن" value={content.collection?.title} onChange={(v) => setIn('collection', 'title', v)} />
          <div className="sm:col-span-2">
            <CField label="زیرعنوان کالکشن" type="area" value={content.collection?.subtitle} onChange={(v) => setIn('collection', 'subtitle', v)} />
          </div>
        </div>

        <Sub label="متن پیام «محصولی یافت نشد»" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="عنوان" value={content.productGrid?.emptyTitle} onChange={(v) => setIn('productGrid', 'emptyTitle', v)} />
          <CField label="توضیح" type="area" value={content.productGrid?.emptyText} onChange={(v) => setIn('productGrid', 'emptyText', v)} />
        </div>
      </Panel>

      <Panel title="مزایا (کارت‌های بالای فروشگاه)" icon={PenLine}>
        <CListEditor
          items={content.features ?? []}
          onList={(next) => set('features', next)}
          fields={[
            { key: 'title', label: 'عنوان مزیت' },
            { key: 'text', label: 'توضیح مزیت' },
          ]}
        />
      </Panel>

      <Panel title="کارت محصول در کالکشن" icon={PenLine}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="متن دکمه «افزودن به سبد»" value={content.card?.addToCart} onChange={(v) => setIn('card', 'addToCart', v)} />
          <CField label="نشان موفقیت افزودن" value={content.card?.addedToCart} onChange={(v) => setIn('card', 'addedToCart', v)} />
          <CField label="نشان کد محصول" hint="با «{code}» مقدار کد محصول جایگزین می‌شود" value={content.card?.codeLabel} onChange={(v) => setIn('card', 'codeLabel', v)} />
          <CField label="نشان موجودی کم" hint="با «{n}» عدد جایگزین می‌شود" value={content.card?.lowStock} onChange={(v) => setIn('card', 'lowStock', v)} />
          <CField label="تعداد رنگ‌ها" hint="با «{n}» تعداد جایگزین می‌شود" value={content.card?.colorsCount} onChange={(v) => setIn('card', 'colorsCount', v)} />
        </div>
      </Panel>

      <Panel title="پنجرهٔ نمایش سریع محصول" icon={PenLine}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="برچسب کد محصول" hint="با «{code}» جایگزین می‌شود" value={content.quickView?.codeLabel} onChange={(v) => setIn('quickView', 'codeLabel', v)} />
          <CField label="برچسب «ابعاد»" value={content.quickView?.dimensionsLabel} onChange={(v) => setIn('quickView', 'dimensionsLabel', v)} />
          <CField label="برچسب «رنگ»" value={content.quickView?.colorLabel} onChange={(v) => setIn('quickView', 'colorLabel', v)} />
          <CField label="برچسب «موجودی انبار»" value={content.quickView?.stockLabel} onChange={(v) => setIn('quickView', 'stockLabel', v)} />
          <CField label="متن موجودی کم" hint="با «{n}» جایگزین می‌شود" value={content.quickView?.lowStock} onChange={(v) => setIn('quickView', 'lowStock', v)} />
          <CField label="متن موجودی عادی" hint="با «{n}» جایگزین می‌شود" value={content.quickView?.inStock} onChange={(v) => setIn('quickView', 'inStock', v)} />
          <CField label="متن دکمه افزودن" value={content.quickView?.addToCart} onChange={(v) => setIn('quickView', 'addToCart', v)} />
          <CField label="نشان موفقیت افزودن" value={content.quickView?.addedToCart} onChange={(v) => setIn('quickView', 'addedToCart', v)} />
          <div className="sm:col-span-2">
            <CField label="یادداشت ارسال رایگان" type="area" value={content.quickView?.shippingNote} onChange={(v) => setIn('quickView', 'shippingNote', v)} />
          </div>
        </div>
      </Panel>

      <Panel title="سبد خرید و پیام افزودن" icon={PenLine}>
        <Sub label="سبد خرید" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="عنوان سبد" value={content.cart?.title} onChange={(v) => setIn('cart', 'title', v)} />
          <CField label="عنوان سبد خالی" value={content.cart?.emptyTitle} onChange={(v) => setIn('cart', 'emptyTitle', v)} />
          <CField label="زیرعنوان سبد خالی" value={content.cart?.emptySubtitle} onChange={(v) => setIn('cart', 'emptySubtitle', v)} />
          <CField label="دکمه «مشاهده کالکشن»" value={content.cart?.viewCollection} onChange={(v) => setIn('cart', 'viewCollection', v)} />
          <CField label="پیام تا ارسال رایگان" hint="با «{total}» مبلغ جایگزین می‌شود" value={content.cart?.freeShippingLeft} onChange={(v) => setIn('cart', 'freeShippingLeft', v)} />
          <CField label="پیام ارسال رایگان فعال" value={content.cart?.freeShippingActive} onChange={(v) => setIn('cart', 'freeShippingActive', v)} />
          <CField label="برچسب مجموع فاکتور" value={content.cart?.subtotal} onChange={(v) => setIn('cart', 'subtotal', v)} />
          <CField label="یادداشت پایین سبد" type="area" value={content.cart?.checkoutNote} onChange={(v) => setIn('cart', 'checkoutNote', v)} />
          <CField label="دکمه سفارش واتس‌اپ" value={content.cart?.checkoutButton} onChange={(v) => setIn('cart', 'checkoutButton', v)} />
          <CField label="نشان اعتماد ۱" value={content.cart?.trustBadge1} onChange={(v) => setIn('cart', 'trustBadge1', v)} />
          <CField label="نشان اعتماد ۲" value={content.cart?.trustBadge2} onChange={(v) => setIn('cart', 'trustBadge2', v)} />
        </div>
        <Sub label="پیام افزودن به سبد (popup)" />
        <CField label="متن پیام" value={content.cartToast?.title} onChange={(v) => setIn('cartToast', 'title', v)} />
      </Panel>

      <Panel title="منوی بالای سایت" icon={PenLine}>
        <CListEditor
          items={content.nav ?? []}
          onList={(next) => set('nav', next)}
          fields={[
            { key: 'label', label: 'عنوان منو' },
            { key: 'href', label: 'لینک', dir: 'ltr', placeholder: '#collection' },
          ]}
        />
        <Sub label="نکتهٔ ارسال رایگان در منوی موبایل" />
        <CField label="متن نکته" type="area" value={content.menu?.shippingNote} onChange={(v) => setIn('menu', 'shippingNote', v)} />
      </Panel>

      <Panel title="لوک‌بوک و خبرنامه" icon={PenLine}>
        <Sub label="لوک‌بوک" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="عنوان بخش" value={content.lookbook?.title} onChange={(v) => setIn('lookbook', 'title', v)} />
          <div className="sm:col-span-2">
            <CField label="زیرعنوان" type="area" value={content.lookbook?.subtitle} onChange={(v) => setIn('lookbook', 'subtitle', v)} />
          </div>
        </div>
        <div className="mt-4">
          <Sub label="سبک‌های لوک‌بوک (عکس + متن)" />
          <p className="mb-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[11px] leading-6 text-taupe">
            برای هر استایل می‌توانید عکس آپلود کنید یا لینک آن را وارد کنید. اگر عکسی نباشد، تصویر
            پیش‌فرض نمایش داده می‌شود و عنوان و زیرعنوان نیز قابل تغییرند.
          </p>
          <div className="mt-2.5">
            <CListEditor
              items={content.lookbook?.shots ?? []}
              onList={(next) => set('lookbook', { ...content.lookbook, shots: next })}
              imageKey="src"
              fields={[
                { key: 'label', label: 'عنوان استایل' },
                { key: 'sub', label: 'زیرعنوان' },
              ]}
            />
          </div>
        </div>
        <Sub label="خبرنامه" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="عنوان" type="area" value={content.newsletter?.title} onChange={(v) => setIn('newsletter', 'title', v)} />
          <CField label="زیرعنوان" type="area" value={content.newsletter?.subtitle} onChange={(v) => setIn('newsletter', 'subtitle', v)} />
          <CField label="پیام موفقیت" type="area" value={content.newsletter?.success} onChange={(v) => setIn('newsletter', 'success', v)} />
          <CField label="متن دکمه" value={content.newsletter?.button} onChange={(v) => setIn('newsletter', 'button', v)} />
        </div>
      </Panel>

      <Panel title="فوتر (پایین سایت)" icon={PenLine}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <CField label="توضیح برند" type="area" value={content.footer?.description} onChange={(v) => setIn('footer', 'description', v)} />
          </div>
          <CField label="آدرس فروشگاه" type="area" value={content.footer?.address} onChange={(v) => setIn('footer', 'address', v)} />
          <CField label="متن کپی‌رایت" value={content.footer?.copyright} onChange={(v) => setIn('footer', 'copyright', v)} />
          <CField label="شعار پایانی" value={content.footer?.tagline} onChange={(v) => setIn('footer', 'tagline', v)} />
          <CField label="عنوان ستون «دسترسی سریع»" value={content.footer?.headingQuick} onChange={(v) => setIn('footer', 'headingQuick', v)} />
          <CField label="عنوان ستون «راهنمای خرید»" value={content.footer?.headingHelp} onChange={(v) => setIn('footer', 'headingHelp', v)} />
          <CField label="عنوان ستون «تماس با گالری»" value={content.footer?.headingContact} onChange={(v) => setIn('footer', 'headingContact', v)} />
        </div>
        <Sub label="لینک‌های دسترسی سریع" />
        <CListEditor
          items={content.footer?.quickLinks ?? []}
          onList={(next) => set('footer', { ...content.footer, quickLinks: next })}
          fields={[
            { key: 'label', label: 'عنوان لینک' },
            { key: 'href', label: 'لینک', dir: 'ltr', placeholder: '#collection' },
          ]}
        />
        <Sub label="لینک‌های راهنمای خرید" />
        <CListEditor
          items={content.footer?.helpLinks ?? []}
          onList={(next) => set('footer', { ...content.footer, helpLinks: next })}
          fields={[
            { key: 'label', label: 'عنوان لینک' },
            { key: 'href', label: 'لینک', dir: 'ltr', placeholder: '#collection' },
          ]}
        />
      </Panel>

      <Panel title="جستجو و پیام‌های واتس‌اپ" icon={PenLine}>
        <Sub label="جستجو" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="متن راهنما در کادر جستجو" value={content.search?.placeholder} onChange={(v) => setIn('search', 'placeholder', v)} />
          <CField label="راهنمای قبل از تایپ" type="area" value={content.search?.hint} onChange={(v) => setIn('search', 'hint', v)} />
          <CField label="متن «نتیجه‌ای یافت نشد»" hint="با «{q}» عبارت جستجو جایگزین می‌شود" value={content.search?.noResults} onChange={(v) => setIn('search', 'noResults', v)} />
          <CField label="متن شمارندهٔ محصولات" hint="با «{n}» تعداد جایگزین می‌شود" value={content.search?.resultCount} onChange={(v) => setIn('search', 'resultCount', v)} />
        </div>
        <Sub label="پیام‌های واتس‌اپ" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="متن پیام سفارش — شروع" value={content.whatsapp?.orderGreeting} onChange={(v) => setIn('whatsapp', 'orderGreeting', v)} />
          <CField label="متن جمع فاکتور" hint="با «{total}» مبلغ جایگزین می‌شود" value={content.whatsapp?.orderTotal} onChange={(v) => setIn('whatsapp', 'orderTotal', v)} />
          <CField label="متن پیام سفارش — پایان" type="area" value={content.whatsapp?.orderFooter} onChange={(v) => setIn('whatsapp', 'orderFooter', v)} />
          <CField label="متن پیش‌نمایش پیام واتس‌اپ شناور" type="area" value={content.whatsapp?.floatingPrefill} onChange={(v) => setIn('whatsapp', 'floatingPrefill', v)} />
        </div>
      </Panel>
    </div>
  );
};

/* ---------------- github tab ---------------- */
const GithubTab = ({ pushRef }) => {
  const { products } = useProducts();
  const { settings } = useSettings();
  const { content } = useContent();
  const [meta, setMeta] = useState(getGhMeta);
  const [status, setStatus] = useState('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const restoreRef = useRef(null);

  const set = (key, val) => {
    setGhMeta({ [key]: val });
    setMeta((m) => ({ ...m, [key]: val }));
  };

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
      await ghPutFile(
        meta.pat, meta.owner, meta.repo, 'src/data/content.js',
        serializeContent(content),
        'chore(content): sync site texts from Rozhina Admin Studio', meta.branch,
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
      content,
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
            new CustomEvent('rozhina:restore', {
              detail: { products: data.products, settings: data.settings, content: data.content },
            }),
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
          هر تغییری که در پنل ایجاد کنید (محصولات یا تنظیمات)، به‌صورت خودکار و پس از چند ثانیه به‌شکل
          کامیت روی فایل‌های <span dir="ltr">productsData.js</span> و <span dir="ltr">constants.js</span> منتشر می‌شود
          و GitHub Actions سایت را بروزرسانی می‌کند. دکمهٔ زیر برای انتشار فوری و همزمان هر دو فایل است.
          توکن فقط در حافظهٔ همین صفحه نگه داشته می‌شود (هیچ‌چیز در localStorage ذخیره نمی‌شود) و با بستن
          صفحه پاک می‌شود.
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

/* ---------------- auto publisher ---------------- */
const AutoPublisher = ({ pushRef }) => {
  const { products } = useProducts();
  const { settings } = useSettings();
  const { content } = useContent();
  const timer = useRef(null);
  const inflight = useRef(false);
  const sizeBlocked = useRef('');
  const lastPushed = useRef('');
  const baselineSet = useRef(false);

  const currentPayload = useCallback(
    () =>
      `${serializeProducts(products)}\n___\n${serializeConstants(settings)}\n___\n${serializeContent(content)}`,
    [products, settings, content],
  );

  const publish = useCallback(async () => {
    const meta = getGhMeta();
    if (!meta.pat.trim() || !meta.owner.trim() || !meta.repo.trim()) return;
    if (inflight.current) return;
    inflight.current = true;
    try {
      const payload = currentPayload();
      if (payload.length > 900 * 1024) {
        sizeBlocked.current = payload;
        pushRef?.current?.('error', 'حجم داده‌ها زیاد است؛ از لینک تصویر به‌جای آپلود استفاده کنید.');
        return;
      }
      sizeBlocked.current = '';
      await ghPutFile(
        meta.pat, meta.owner, meta.repo, 'src/data/productsData.js',
        serializeProducts(products),
        'chore(content): auto-sync products from Rozhina Admin Studio', meta.branch,
      );
      await ghPutFile(
        meta.pat, meta.owner, meta.repo, 'src/data/constants.js',
        serializeConstants(settings),
        'chore(content): auto-sync settings from Rozhina Admin Studio', meta.branch,
      );
      await ghPutFile(
        meta.pat, meta.owner, meta.repo, 'src/data/content.js',
        serializeContent(content),
        'chore(content): auto-sync site texts from Rozhina Admin Studio', meta.branch,
      );
      lastPushed.current = payload;
      pushRef?.current?.('success', 'تغییرات خودکار روی سرور منتشر شد — سایت در حال بروزرسانی است');
    } catch (err) {
      pushRef?.current?.('error', `انتشار خودکار ناموفق: ${String(err?.message || err).slice(0, 60)}`);
    } finally {
      inflight.current = false;
    }
    const pending = currentPayload();
    if (
      pending !== lastPushed.current &&
      pending !== sizeBlocked.current &&
      getGhMeta().pat.trim()
    ) {
      timer.current = window.setTimeout(publish, 1500);
    }
  }, [currentPayload, products, settings, content, pushRef]);

  useEffect(() => {
    let alive = true;
    whenRemoteReady().then(() => {
      if (!alive || baselineSet.current) return;
      baselineSet.current = true;
      lastPushed.current = currentPayload();
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPayload]);

  useEffect(() => {
    const meta = getGhMeta();
    if (!meta.pat.trim() || !meta.owner.trim() || !meta.repo.trim()) return;
    if (!remoteReadyFlag()) return;
    if (lastPushed.current && currentPayload() !== lastPushed.current) {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(publish, 1500);
    }
  }, [products, settings, content, currentPayload, publish]);

  return null;
};

/* ---------------- shell ---------------- */
const TABS = [
  { key: 'products', label: 'محصولات', icon: Package },
  { key: 'content', label: 'متن‌های سایت', icon: PenLine },
  { key: 'settings', label: 'تنظیمات سایت', icon: Settings2 },
  { key: 'github', label: 'تنظیمات گیت‌هاب', icon: Github },
];

export const AdminStudio = () => {
  const { importProducts } = useProducts();
  const { replaceSettings } = useSettings();
  const { replaceContent } = useContent();
  const [open, setOpen] = useState(() => window.location.hash === '#/admin' || window.location.hash === '#admin');
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
    setUnlocked(false);
  }, []);

  const closeAdmin = useCallback(() => {
    setOpen(false);
    if (window.location.hash === '#/admin' || window.location.hash === '#admin') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
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
      if (e.detail?.content) replaceContent(e.detail.content);
    });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('rozhina:open-admin', onCustom);
    };
  }, [openAdmin, importProducts, replaceSettings, replaceContent]);

  const unlock = useCallback(() => {
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
      <AutoPublisher pushRef={pushRef} />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[85] overflow-y-auto bg-[#0C0B0A]/97"
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
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-pearl/70 transition-[transform,background-color,border-color,color] duration-300 hover:rotate-90 hover:border-gold/40 hover:text-gold active:scale-90"
                >
                  <X size={18} strokeWidth={1.8} />
                </button>
              </div>

              {unlocked ? (
                <>
                  <div
                    className="no-scrollbar sticky top-2 z-30 mt-6 grid grid-cols-2 gap-1.5 rounded-2xl border border-white/[0.07] bg-[#100F0E]/95 p-1.5 backdrop-blur-md sm:flex sm:flex-wrap sm:items-center"
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
                          className={`flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-[transform,background-color,border-color,color] duration-300 active:scale-[0.97] ${
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
                    {tab === 'content' && <ContentTab pushRef={pushRef} />}
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
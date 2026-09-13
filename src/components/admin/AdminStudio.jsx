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

const ADMIN_PIN = 'Rozhina8962';

let ghMetaStore = { owner: 'RADINMNX2', repo: 'rozhina', branch: 'main', pat: '' };
const getGhMeta = () => ({ ...ghMetaStore });
const setGhMeta = (patch) => {
  ghMetaStore = { ...ghMetaStore, ...patch };
};

const GH_API = 'https://api.github.com';
const GH_HEADERS = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };

const PRESET_BADGES = ['Ø¯Ø³Øªâ€ŒØ¯ÙˆØ²', 'Ú©Ø§Ù„Ú©Ø´Ù† Ø¬Ø¯ÛŒØ¯', 'ØªØ¹Ø¯Ø§Ø¯ Ù…Ø­Ø¯ÙˆØ¯'];

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
        `    code: ${q(p.code)},`,
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
    "const BADGE_STYLES = {\n  'Ø¯Ø³Øªâ€ŒØ¯ÙˆØ²': 'bg-gold text-espresso',\n  'Ú©Ø§Ù„Ú©Ø´Ù† Ø¬Ø¯ÛŒØ¯': 'bg-espresso text-alabaster',\n  'ØªÙ†Ù‡Ø§': 'bg-terracotta text-alabaster',\n};",
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
    throw new Error(err.message || `Ø®Ø·Ø§ÛŒ ${res.status} Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª ÙØ§ÛŒÙ„`);
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
      continue; // Ù‡Ù…â€ŒØ²Ù…Ø§Ù† Ø¨Ø§ Ø§Ù†ØªØ´Ø§Ø± Ø¯ÛŒÚ¯Ø±ÛŒ Ø¨Ø±Ø®ÙˆØ±Ø¯ Ú©Ø±Ø¯Ø› Ø¹Ú©Ø³ ØªØ§Ø²Ù‡ Ø¨Ú¯ÛŒØ± Ùˆ Ø¯ÙˆØ¨Ø§Ø±Ù‡ ØªÙ„Ø§Ø´ Ú©Ù†
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Ø®Ø·Ø§ÛŒ ${res.status} Ø¯Ø± Ø§Ù†ØªØ´Ø§Ø± ÙØ§ÛŒÙ„ ${path}`);
    }
    return res.json();
  }
  throw new Error(`Ù‡Ù…â€ŒØ²Ù…Ø§Ù†ÛŒ Ø§Ù†ØªØ´Ø§Ø± ${path}; Ù„Ø­Ø¸Ø§ØªÛŒ Ø¨Ø¹Ø¯ Ø¯ÙˆØ¨Ø§Ø±Ù‡ ØªÙ„Ø§Ø´ Ù…ÛŒâ€ŒØ´ÙˆØ¯`);
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
        <h2 className="text-lg font-extrabold text-pearl">Ù¾Ù†Ù„ Ù…Ø¯ÛŒØ±ÛŒØª Ø±ÙˆÚ˜ÛŒÙ†Ø§</h2>
        <p className="mt-1 text-xs text-taupe">Ø±Ù…Ø² ÙˆØ±ÙˆØ¯ Ø±Ø§ ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯ ({toFa(ADMIN_PIN.length)} Ú©Ø§Ø±Ø§Ú©ØªØ±)</p>
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
          placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-lg font-bold tracking-[0.5em] text-gold placeholder:text-pearl/20 focus:border-gold/50 focus:outline-none"
        />
        <p className="mt-2 text-center text-xs text-taupe">{toFa(pin.length)} / {toFa(ADMIN_PIN.length)}</p>
      </motion.div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={submit} className={`${PILL_BTN} btn-gold-modern !px-6 !py-2.5 !text-sm`}>
          ÙˆØ±ÙˆØ¯
        </button>
        <button
          type="button"
          onClick={() => setPin('')}
          className={`${PILL_BTN} border-white/10 text-pearl/60 hover:border-white/30 hover:text-pearl`}
        >
          Ù¾Ø§Ú© Ú©Ø±Ø¯Ù†
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
  fabric: '',
  dimensions: '',
  price: '',
  oldPrice: '',
  quantity: '1',
  inStock: true,
  description: '',
  badges: [],
  colors: [{ label: 'Ú©Ø±Ù…', hex: '#F3E9DA' }],
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
    if (!draft.name.trim()) return setError('Ø¹Ù†ÙˆØ§Ù† Ù…Ø­ØµÙˆÙ„ Ø§Ù„Ø²Ø§Ù…ÛŒ Ø§Ø³Øª.');
    if (!draft.price || Number(draft.price) < 0) return setError('Ù‚ÛŒÙ…Øª Ù…Ø¹ØªØ¨Ø±ÛŒ ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯.');
    if (!draft.images[0]?.trim() && !draft.images[1]?.trim()) {
      return setError('Ø­Ø¯Ø§Ù‚Ù„ ÛŒÚ© Ø¢Ø¯Ø±Ø³ Ø¹Ú©Ø³ ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯.');
    }
    onSave({
      name: draft.name.trim(),
      enName: draft.enName.trim(),
      code: draft.code.trim(),
      fabric: draft.fabric.trim() || 'Ø§Ø¨Ø±ÛŒØ´Ù…',
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
      aria-label={product ? `ÙˆÛŒØ±Ø§ÛŒØ´ ${product.name}` : 'Ø§ÙØ²ÙˆØ¯Ù† Ù…Ø­ØµÙˆÙ„ Ø¬Ø¯ÛŒØ¯'}
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
              <h3 className="text-sm font-extrabold text-pearl">{product ? 'ÙˆÛŒØ±Ø§ÛŒØ´ Ù…Ø­ØµÙˆÙ„' : 'Ø§ÙØ²ÙˆØ¯Ù† Ù…Ø­ØµÙˆÙ„ Ø¬Ø¯ÛŒØ¯'}</h3>
              <p className="mt-0.5 text-[10px] font-medium text-taupe">
                {product ? product.enName || product.fabric : 'Ú©Ø§Ù„Ú©Ø´Ù† Ø¬Ø¯ÛŒØ¯ Ø±ÙˆÚ˜ÛŒÙ†Ø§'}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Ø¨Ø³ØªÙ†"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-pearl/70 transition-[transform,background-color,border-color,color] duration-300 hover:rotate-90 hover:border-gold/40 hover:bg-gold/10 hover:text-gold active:scale-90"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <div className="relative flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Ø¹Ù†ÙˆØ§Ù† Ù…Ø­ØµÙˆÙ„ *">
              <TextInput
                value={draft.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Ù…Ø«Ù„Ø§Ù‹ Ø´Ø§Ù„ Ø§Ø¨Ø±ÛŒØ´Ù… ØªÙˆÛŒÛŒÙ„"
                dir="rtl"
              />
            </Field>
            <Field label="Ø¹Ù†ÙˆØ§Ù† Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒ (Ø§Ø®ØªÛŒØ§Ø±ÛŒ)">
              <TextInput
                value={draft.enName}
                onChange={(e) => set('enName', e.target.value)}
                placeholder="Twilly Silk"
                dir="ltr"
              />
            </Field>
            <Field label="Ú©Ø¯ Ù…Ø­ØµÙˆÙ„ (Ø§Ø®ØªÛŒØ§Ø±ÛŒ)" hint="Ù…Ø«Ù„Ø§Ù‹ Ø¨Ø±Ø§ÛŒ Â«Ø±ÙˆØ³Ø±ÛŒ ÙÙ„Ø§Ù†Â» Ú©Ø¯ xx-x Ø¨Ú¯Ø°Ø§Ø±ÛŒØ¯">
              <TextInput
                value={draft.code}
                onChange={(e) => set('code', e.target.value)}
                placeholder="Ù…Ø«Ù„Ø§Ù‹ RS-204"
                dir="ltr"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Ø¬Ù†Ø³ Ù¾Ø§Ø±Ú†Ù‡">
              <TextInput
                list="admin-fabrics"
                value={draft.fabric}
                onChange={(e) => set('fabric', e.target.value)}
                placeholder="Ø§Ø¨Ø±ÛŒØ´Ù…ØŒ Ù…ÙˆÙ‡Ø±â€¦"
                dir="rtl"
              />
              <datalist id="admin-fabrics">
                {['Ø§Ø¨Ø±ÛŒØ´Ù…', 'Ø§Ø¨Ø±ÛŒØ´Ù… Ú˜Ø§Ú©Ø§Ø±Ø¯', 'Ù†Ø® Ø§Ø¨Ø±ÛŒØ´Ù…', 'Ú©Ø´Ù…ÛŒØ± Ùˆ Ù…ÙˆÙ‡Ø±', 'Ù†Ø® Ù„Ù†ÛŒÙ†', 'Ú©Ø±Ù¾ Ø­Ø±ÛŒØ±', 'Ù…ÙˆÙ‡Ø±', 'Ù†Ø®ÛŒ'].map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </Field>
            <Field label="Ø§Ø¨Ø¹Ø§Ø¯ Ùˆ Ù‚ÙˆØ§Ø±Ù‡">
              <TextInput
                value={draft.dimensions}
                onChange={(e) => set('dimensions', e.target.value)}
                placeholder="Û±Û´Û°Ã—Û±Û´Û° Ø³Ø§Ù†ØªÛŒÙ…ØªØ±"
                dir="rtl"
              />
            </Field>
            <Field label="Ù…ÙˆØ¬ÙˆØ¯ÛŒ (Ø¹Ø¯Ø¯)">
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
                  {draft.inStock ? 'Ù…ÙˆØ¬ÙˆØ¯' : 'Ù†Ø§Ù…ÙˆØ¬ÙˆØ¯'}
                </button>
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Ù‚ÛŒÙ…Øª Ø§ØµÙ„ÛŒ (ØªÙˆÙ…Ø§Ù†) *">
              <TextInput
                type="number"
                min="0"
                value={draft.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="Û²Û¸ÛµÛ°Û°Û°Û°"
                dir="ltr"
              />
            </Field>
            <Field label="Ù‚ÛŒÙ…Øª Ù‚Ø¨Ù„ Ø§Ø² ØªØ®ÙÛŒÙ (Ø§Ø®ØªÛŒØ§Ø±ÛŒ)" hint="Ø§Ú¯Ø± Ø®Ø§Ù„ÛŒ Ø¨Ù…Ø§Ù†Ø¯ØŒ ØªØ®ÙÛŒÙ Ù†Ù…Ø§ÛŒØ´ Ø¯Ø§Ø¯Ù‡ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯">
              <TextInput
                type="number"
                min="0"
                value={draft.oldPrice}
                onChange={(e) => set('oldPrice', e.target.value)}
                placeholder="Û³Û´Û°Û°Û°Û°Û°"
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
                      <span className="text-[10px] font-bold">Ø¹Ú©Ø³ÛŒ Ø§Ù†ØªØ®Ø§Ø¨ Ù†Ø´Ø¯Ù‡</span>
                    </div>
                  )}
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-obsidian/70 px-2.5 py-1 text-[9px] font-extrabold text-gold backdrop-blur-md">
                    {i === 0 ? 'Ø¹Ú©Ø³ Ø§ØµÙ„ÛŒ' : 'Ø§Ø³ØªØ§ÛŒÙ„ / Ù…Ø¯Ù„'}
                  </span>
                  {draft.images[i]?.trim() && (
                    <button
                      type="button"
                      aria-label="Ø­Ø°Ù Ø¹Ú©Ø³"
                      onClick={() => setImage(i, '')}
                      className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-obsidian/70 text-pearl/80 backdrop-blur-md transition-colors hover:text-terracotta"
                    >
                      <X size={12} strokeWidth={2.2} />
                    </button>
                  )}
                  {draft.images[i]?.startsWith('data:image') && (
                    <span className="absolute bottom-2.5 right-2.5 rounded-full bg-obsidian/70 px-2 py-0.5 text-[8px] font-bold text-taupe backdrop-blur-md">
                      Ø¢Ù¾Ù„ÙˆØ¯â€ŒØ´Ø¯Ù‡
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 p-2.5">
                  <label className="relative flex-1 cursor-pointer">
                    <span className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/25 bg-gold/10 px-3 py-2 text-[11px] font-extrabold text-gold transition-colors hover:bg-gold/20 active:scale-[0.98]">
                      <Upload size={12} strokeWidth={2.2} />
                      Ø¢Ù¾Ù„ÙˆØ¯ Ø¹Ú©Ø³
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="pointer-events-none absolute h-0 w-0 opacity-0"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2.5 * 1024 * 1024) {
                            window.alert('Ø­Ø¬Ù… Ø¹Ú©Ø³ Ø¨ÛŒØ´ØªØ± Ø§Ø² Û².Ûµ Ù…Ú¯Ø§Ø¨Ø§ÛŒØª Ø§Ø³Øª.');
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
                    Ù¾Ø§Ú©â€ŒÚ©Ø±Ø¯Ù†
                  </button>
                </div>
                <TextInput
                  value={draft.images[i]}
                  onChange={(e) => setImage(i, e.target.value)}
                  placeholder="ÛŒØ§ Ù„ÛŒÙ†Ú© ØªØµÙˆÛŒØ±: https://â€¦"
                  dir="ltr"
                />
              </div>
            ))}
          </div>

          <Field label="ØªÙˆØ¶ÛŒØ­Ø§Øª Ù…Ø­ØµÙˆÙ„ (Ø§Ø®ØªÛŒØ§Ø±ÛŒ)">
            <textarea
              value={draft.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="Ú†Ù†Ø¯ Ø®Ø· Ø¯Ø±Ø¨Ø§Ø±Ù‡Ù” Ø¨Ø§ÙØªØŒ Ù„Ø·Ø§ÙØª Ùˆ Ú©Ø§Ø±Ø¨Ø±Ø¯â€¦"
              className="lux-input resize-none text-sm"
              dir="rtl"
            />
          </Field>

          <Field label="Ø±Ù†Ú¯â€ŒØ¨Ù†Ø¯ÛŒ">
            <div className="flex flex-wrap items-center gap-2">
              {draft.colors
                .filter((c) => c.label.trim() || c.hex.trim())
                .map((c) => (
                  <span
                    key={`${c.label}-${c.hex}`}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 py-1 pl-2 pr-1 text-[11px] text-pearl/80"
                  >
                    <span className="h-4 w-4 rounded-full ring-1 ring-inset ring-white/15" style={{ backgroundColor: c.hex }} />
                    {c.label || 'â€”'}
                  </span>
                ))}
            </div>
            <div className="mt-3 space-y-2">
              {draft.colors.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <TextInput
                    value={c.label}
                    onChange={(e) => setColor(i, 'label', e.target.value)}
                    placeholder="Ù†Ø§Ù… Ø±Ù†Ú¯ (Ù…Ø«Ù„Ø§Ù‹ Ø²Ù…Ø±Ø¯ÛŒ)"
                    className="lux-input !py-2 text-sm"
                  />
                  <input
                    type="color"
                    value={/^#([0-9a-fA-F]{6})$/.test(c.hex) ? c.hex : '#E2C997'}
                    onChange={(e) => setColor(i, 'hex', e.target.value.toUpperCase())}
                    className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-white/10 bg-white/[0.03]"
                    aria-label="Ú©Ø¯ Ù‡Ú¯Ø² Ø±Ù†Ú¯"
                  />
                  <button
                    type="button"
                    aria-label="Ø­Ø°Ù Ø±Ù†Ú¯"
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
              Ø§ÙØ²ÙˆØ¯Ù† Ø±Ù†Ú¯ Ø¬Ø¯ÛŒØ¯
            </button>
          </Field>

          <Field label="Ø¨Ø±Ú†Ø³Ø¨â€ŒÙ‡Ø§ÛŒ Ø§Ø®ØªØµØ§ØµÛŒ">
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
                placeholder="Ø¨Ø±Ú†Ø³Ø¨ Ø³ÙØ§Ø±Ø´ÛŒ (Ù…Ø«Ù„Ø§Ù‹ Ù‡Ø¯ÛŒÙ‡ ÙˆÛŒÚ˜Ù‡)"
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
                + Ø§Ø¶Ø§ÙÙ‡
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
            Ø§Ù†ØµØ±Ø§Ù
          </button>
          <button
            type="button"
            onClick={save}
            className="btn-gold-modern flex-1 !rounded-full !px-6 !py-3 !text-xs sm:flex-none sm:!px-10 sm:!py-3"
          >
            <Save size={14} strokeWidth={2} />
            Ø°Ø®ÛŒØ±Ù‡Ù” Ù…Ø­ØµÙˆÙ„
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ---------------- confirm dialog ---------------- */
const ConfirmDialog = ({ title, message, confirmLabel = 'ØªØ£ÛŒÛŒØ¯ Ø´ÙˆØ¯', onCancel, onConfirm }) => (
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
            Ø§Ù†ØµØ±Ø§Ù
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
            placeholder="Ø¬Ø³ØªØ¬Ùˆ Ø¯Ø± Ù…Ø­ØµÙˆÙ„Ø§Øªâ€¦"
            className="lux-input !py-2.5 text-sm"
            dir="rtl"
          />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="whitespace-nowrap text-xs text-taupe">{toFa(products.length)} Ù…Ø­ØµÙˆÙ„</span>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Ø¨Ø§Ø²Ù†Ø´Ø§Ù†ÛŒ Ú©Ø§Ù„Ú©Ø´Ù† Ø¨Ù‡ Ù…Ø­ØµÙˆÙ„Ø§Øª Ù¾ÛŒØ´â€ŒÙØ±Ø¶ØŸ')) {
                resetToDefaults();
                pushRef?.current?.('success', 'Ú©Ø§Ù„Ú©Ø´Ù† Ø¨Ù‡ Ø­Ø§Ù„Øª Ù¾ÛŒØ´â€ŒÙØ±Ø¶ Ø¨Ø§Ø²Ú¯Ø´Øª');
              }
            }}
            className={`${PILL_BTN} border-white/10 text-pearl/60 hover:border-white/30 hover:text-pearl`}
          >
            <RotateCcw size={12} strokeWidth={2} />
            Ø¨Ø§Ø²Ù†Ø´Ø§Ù†ÛŒ
          </button>
          <button
            type="button"
            onClick={() => setEditor({ mode: 'add' })}
            className="btn-gold-modern !rounded-full !px-5 !py-2.5 !text-xs"
          >
            <Plus size={14} strokeWidth={2.5} />
            Ø§ÙØ²ÙˆØ¯Ù† Ù…Ø­ØµÙˆÙ„ Ø¬Ø¯ÛŒØ¯
          </button>
        </div>
      </div>

      <ul className="space-y-2.5">
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-sm text-taupe">
            Ù…Ø­ØµÙˆÙ„ÛŒ ÛŒØ§ÙØª Ù†Ø´Ø¯.
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
              </div>
              <p className="mt-1 text-[11px] text-taupe" dir="ltr">
                {p.enName}
                {p.code && (
                  <span className="mr-2 rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-pearl/45" dir="ltr">
                    Ú©Ø¯ {p.code}
                  </span>
                )}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                <span className="font-extrabold text-gold">
                  {formatPrice(p.price)} <span className="font-normal text-taupe">ØªÙˆÙ…Ø§Ù†</span>
                </span>
                {p.oldPrice && (
                  <span className="text-taupe/60 line-through">{formatPrice(p.oldPrice)}</span>
                )}
                <span className={`font-bold ${p.inStock !== false && p.quantity > 0 ? 'text-pearl/70' : 'text-terracotta'}`}>
                  {p.inStock !== false && p.quantity > 0 ? `${toFa(p.quantity)} Ø¹Ø¯Ø¯` : 'Ù†Ø§Ù…ÙˆØ¬ÙˆØ¯'}
                </span>
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Ú©Ø§Ù‡Ø´ Ù…ÙˆØ¬ÙˆØ¯ÛŒ ${p.name}`}
                    onClick={() => {
                      const nq = Math.max(0, (Number(p.quantity) || 0) - 1);
                      updateProduct(p.id, { quantity: nq, inStock: nq > 0 });
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 text-pearl/70 transition-[transform,background-color,border-color,color] hover:border-terracotta/50 hover:text-terracotta active:scale-90"
                  >
                    âˆ’
                  </button>
                  <button
                    type="button"
                    aria-label={`Ø§ÙØ²Ø§ÛŒØ´ Ù…ÙˆØ¬ÙˆØ¯ÛŒ ${p.name}`}
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
                ÙˆÛŒØ±Ø§ÛŒØ´
              </button>
              <button
                type="button"
                aria-label={`Ø­Ø°Ù ${p.name}`}
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
                pushRef?.current?.('success', 'ØªØºÛŒÛŒØ±Ø§Øª Ù…Ø­ØµÙˆÙ„ Ø°Ø®ÛŒØ±Ù‡ Ø´Ø¯');
              } else {
                addProduct(data);
                pushRef?.current?.('success', 'Ù…Ø­ØµÙˆÙ„ Ø¬Ø¯ÛŒØ¯ Ø§Ø¶Ø§ÙÙ‡ Ø´Ø¯');
              }
              setEditor(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toDelete && (
          <ConfirmDialog
            title="Ø­Ø°Ù Ù…Ø­ØµÙˆÙ„"
            message={`Ø¢ÛŒØ§ Ø§Ø² Ø­Ø°Ù Â«${toDelete.name}Â» Ù…Ø·Ù…Ø¦Ù† Ù‡Ø³ØªÛŒØ¯ØŸ Ø§ÛŒÙ† ØªØºÛŒÛŒØ± Ø¨Ù„Ø§ÙØ§ØµÙ„Ù‡ Ø¯Ø± Ø³Ø§ÛŒØª Ø§Ø¹Ù…Ø§Ù„ Ù…ÛŒâ€ŒØ´ÙˆØ¯.`}
            onCancel={() => setToDelete(null)}
            onConfirm={() => {
              deleteProduct(toDelete.id);
              pushRef?.current?.('success', 'Ù…Ø­ØµÙˆÙ„ Ø­Ø°Ù Ø´Ø¯');
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
      <Panel title="ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø¹Ù…ÙˆÙ…ÛŒ ÙØ±ÙˆØ´Ú¯Ø§Ù‡" icon={Settings2}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Ù…ØªÙ† Ù†ÙˆØ§Ø± Ø§Ø¹Ù„Ø§Ù† Ø¨Ø§Ù„Ø§ÛŒ Ø³Ø§ÛŒØª">
              <TextInput value={draft.announcementText} onChange={(e) => set('announcementText', e.target.value)} dir="rtl" />
            </Field>
          </div>
          <Field label="Ø´Ù…Ø§Ø±Ù‡ ØªÙ…Ø§Ø³ ÙØ±ÙˆØ´Ú¯Ø§Ù‡" hint="Ù…ØªÙ† Ù†Ù…Ø§ÛŒØ´ÛŒ Ø¯Ø± ÙÙˆØªØ±">
            <TextInput value={draft.phone} onChange={(e) => set('phone', e.target.value)} dir="ltr" />
          </Field>
          <Field label="Ø´Ù…Ø§Ø±Ù‡ ÙˆØ§ØªØ³â€ŒØ§Ù¾ (Ø¨Ø±Ø§ÛŒ Ø§Ø±Ø³Ø§Ù„ Ù¾ÛŒØ´â€ŒÙØ§Ú©ØªÙˆØ±)" hint="ÙÙ‚Ø· Ø§Ø±Ù‚Ø§Ù…ØŒ Ø¨Ø§ Ú©Ø¯ Ú©Ø´ÙˆØ±ØŒ Ù…Ø«Ù„Ø§Ù‹ 989123456789">
            <TextInput value={draft.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} dir="ltr" />
          </Field>
          <Field label="Ø­Ø¯Ø§Ù‚Ù„ Ù…Ø¨Ù„Øº Ø§Ø±Ø³Ø§Ù„ Ø±Ø§ÛŒÚ¯Ø§Ù† (ØªÙˆÙ…Ø§Ù†)">
            <TextInput
              type="number"
              min="0"
              value={draft.freeShippingThreshold}
              onChange={(e) => set('freeShippingThreshold', e.target.value)}
              dir="ltr"
            />
          </Field>
          <Field label="Ø¢ÛŒØ¯ÛŒ Ù¾Ø´ØªÛŒØ¨Ø§Ù†ÛŒ">
            <TextInput value={draft.supportId} onChange={(e) => set('supportId', e.target.value)} dir="ltr" />
          </Field>
          <Field label="Ø¢Ø¯Ø±Ø³ Ø¯Ø±Ú¯Ø§Ù‡ Ù¾Ø±Ø¯Ø§Ø®Øª ðŸ›¡ï¸" hint="Ø¢Ø¯Ø±Ø³ Worker Ú©Ù„Ø§Ø¯ÙÙ„Ø± Ø¨Ø¹Ø¯ Ø§Ø² Ø§Ø³ØªÙ‚Ø±Ø§Ø±ØŒ Ù…Ø«Ù„ https://rozhina-pay.Ø§Ø³Ù…-Ø´Ù…Ø§.workers.dev â€” ØªØ§ Ø²Ù…Ø§Ù†ÛŒ Ú©Ù‡ Ø®Ø§Ù„ÛŒ Ø¨Ø§Ø´Ø¯ØŒ Ø¯Ú©Ù…Ù‡ Ù¾Ø±Ø¯Ø§Ø®Øª Ø¢Ù†Ù„Ø§ÛŒÙ† Ù†Ù…Ø§ÛŒØ´ Ø¯Ø§Ø¯Ù‡ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯">
            <TextInput
              value={draft.paymentUrl}
              onChange={(e) => set('paymentUrl', e.target.value)}
              placeholder="https://rozhina-payâ€¦workers.dev"
              dir="ltr"
            />
          </Field>
          <Field label="Ø¢ÛŒØ¯ÛŒ Ø§ÛŒÙ†Ø³ØªØ§Ú¯Ø±Ø§Ù…">
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
          <Field label="Ù„ÛŒÙ†Ú© Ø§ÛŒÙ†Ø³ØªØ§Ú¯Ø±Ø§Ù…">
            <TextInput value={draft.instagramUrl} onChange={(e) => set('instagramUrl', e.target.value)} dir="ltr" />
          </Field>
        </div>
      </Panel>

      <div className="flex flex-col gap-2.5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => {
            resetToDefaults();
            pushRef?.current?.('success', 'ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø¨Ù‡ Ù¾ÛŒØ´â€ŒÙØ±Ø¶ Ø¨Ø§Ø²Ú¯Ø´Øª');
          }}
          className={`${PILL_BTN} border-white/10 text-pearl/60 hover:border-white/30 hover:text-pearl`}
        >
          <RotateCcw size={12} strokeWidth={2} />
          Ø¨Ø§Ø²Ù†Ø´Ø§Ù†ÛŒ Ø¨Ù‡ Ù¾ÛŒØ´â€ŒÙØ±Ø¶
        </button>
        <button
          type="button"
          onClick={() => {
            updateSettings(draft);
            pushRef?.current?.('success', 'ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø°Ø®ÛŒØ±Ù‡ Ø´Ø¯ Ùˆ Ø¯Ø± Ù‡Ù…Ø§Ù† Ù„Ø­Ø¸Ù‡ Ø§Ø¹Ù…Ø§Ù„ Ø´Ø¯');
          }}
          className="btn-gold-modern !rounded-full !px-6 !py-2.5 !text-xs"
        >
          <Save size={13} strokeWidth={2} />
          Ø°Ø®ÛŒØ±Ù‡Ù” ØªÙ†Ø¸ÛŒÙ…Ø§Øª
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
                      Ø¢Ù¾Ù„ÙˆØ¯â€ŒØ´Ø¯Ù‡
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <label className="relative cursor-pointer">
                    <span className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/25 bg-gold/10 px-3 py-2 text-[10px] font-extrabold text-gold transition-colors hover:bg-gold/20 active:scale-[0.98]">
                      <Upload size={11} strokeWidth={2.2} />
                      Ø¢Ù¾Ù„ÙˆØ¯ Ø¹Ú©Ø³
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="pointer-events-none absolute h-0 w-0 opacity-0"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2.5 * 1024 * 1024) {
                            window.alert('Ø­Ø¬Ù… Ø¹Ú©Ø³ Ø¨ÛŒØ´ØªØ± Ø§Ø² Û².Ûµ Ù…Ú¯Ø§Ø¨Ø§ÛŒØª Ø§Ø³Øª.');
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
                    placeholder="https://â€¦ (Ù„ÛŒÙ†Ú© Ø¹Ú©Ø³ ÛŒØ§ Ø¢Ù¾Ù„ÙˆØ¯)"
                  />
                  {img && (
                    <button
                      type="button"
                      onClick={() => setField(i, imageKey, '')}
                      className="self-start rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-bold text-taupe/70 transition-colors hover:border-white/30 hover:text-pearl"
                    >
                      Ù¾Ø§Ú© Ú©Ø±Ø¯Ù† ØªØµÙˆÛŒØ±
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
                aria-label="Ø¨Ø§Ù„Ø§ Ø¨Ø±Ø¯Ù†"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                className="lux-chip !px-2.5 !py-1.5 disabled:opacity-30"
              >
                <ChevronUp size={12} />
              </button>
              <button
                type="button"
                aria-label="Ù¾Ø§ÛŒÛŒÙ† Ø¨Ø±Ø¯Ù†"
                disabled={i === items.length - 1}
                onClick={() => move(i, 1)}
                className="lux-chip !px-2.5 !py-1.5 disabled:opacity-30"
              >
                <ChevronDown size={12} />
              </button>
              <button
                type="button"
                aria-label="Ø­Ø°Ù Ù…ÙˆØ±Ø¯"
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
        Ø§ÙØ²ÙˆØ¯Ù† Ù…ÙˆØ±Ø¯ Ø¬Ø¯ÛŒØ¯
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
        title="Ù…ØªÙ†â€ŒÙ‡Ø§ÛŒ Ú©Ù„ Ø³Ø§ÛŒØª"
        icon={PenLine}
        actions={
          <button
            type="button"
            onClick={() => {
              resetContent();
              pushRef?.current?.('success', 'Ù‡Ù…Ù‡Ù” Ù…ØªÙ†â€ŒÙ‡Ø§ Ø¨Ù‡ Ù¾ÛŒØ´â€ŒÙØ±Ø¶ Ø¨Ø§Ø²Ú¯Ø´Øª');
            }}
            className={`${PILL_BTN} !px-3 !py-1.5 !text-[10px] border-white/10 text-pearl/60 hover:border-gold/40 hover:text-gold`}
          >
            <Wand2 size={11} strokeWidth={2} />
            Ø¨Ø§Ø²Ù†Ø´Ø§Ù†ÛŒ Ù‡Ù…Ù‡
          </button>
        }
      >
        <p className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[11px] leading-6 text-taupe">
          Ù‡Ø± Ù…ØªÙ†ÛŒ Ú©Ù‡ ØªØºÛŒÛŒØ± Ø¯Ù‡ÛŒØ¯ Ù‡Ù…Ø§Ù† Ù„Ø­Ø¸Ù‡ Ø¯Ø± Ø³Ø§ÛŒØª Ø§Ø¹Ù…Ø§Ù„ Ù…ÛŒâ€ŒØ´ÙˆØ¯ Ùˆ Ú†Ù†Ø¯ Ø«Ø§Ù†ÛŒÙ‡ Ø¨Ø¹Ø¯ Ø¨Ù‡â€ŒØµÙˆØ±Øª Ø®ÙˆØ¯Ú©Ø§Ø± Ø±ÙˆÛŒ Ú¯ÛŒØªâ€ŒÙ‡Ø§Ø¨ Ù…Ù†ØªØ´Ø± Ø´Ø¯Ù‡ Ùˆ
          Ø³Ø§ÛŒØª Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ù…ÛŒâ€ŒØ´ÙˆØ¯. Ù…Ú©Ø§Ù†â€ŒÙ†Ù…Ø§Ù‡Ø§ÛŒ{' '}
          <b className="font-mono text-gold/85" dir="ltr">
            {`{n}ØŒ {total}ØŒ {q}ØŒ {code}`}
          </b>{' '}
          Ø¨Ù‡â€ŒØµÙˆØ±Øª Ø®ÙˆØ¯Ú©Ø§Ø± Ø¨Ø§ Ø¹Ø¯Ø¯/Ù…ØªÙ† Ù…Ø±ØªØ¨Ø· Ù¾Ø± Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯.
        </p>

        <Sub label="Ø¨Ù†Ø± Ø§ØµÙ„ÛŒ Ø³Ø§ÛŒØª" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="Ù…ØªÙ† Ú©ÙˆÚ†Ú© Ø¨Ø§Ù„Ø§ÛŒ Ø¨Ù†Ø±" value={content.hero?.eyebrow} onChange={(v) => setIn('hero', 'eyebrow', v)} />
          <CField label="ØªÛŒØªØ± Ø¨Ø²Ø±Ú¯ â€” Ø®Ø· Ø§ÙˆÙ„" value={content.hero?.title1} onChange={(v) => setIn('hero', 'title1', v)} />
          <CField label="ØªÛŒØªØ± Ø¨Ø²Ø±Ú¯ â€” Ø®Ø· Ø¯ÙˆÙ… (Ø²Ø±ÛŒÙ†)" value={content.hero?.title2} onChange={(v) => setIn('hero', 'title2', v)} />
          <div className="sm:col-span-2">
            <CField label="Ø²ÛŒØ±ØªÛŒØªØ± Ø¨Ù†Ø±" type="area" value={content.hero?.subtitle} onChange={(v) => setIn('hero', 'subtitle', v)} />
          </div>
          <CField label="Ù…ØªÙ† Ø¯Ú©Ù…Ù‡ Ø§ØµÙ„ÛŒ" value={content.hero?.ctaPrimary} onChange={(v) => setIn('hero', 'ctaPrimary', v)} />
          <CField label="Ù…ØªÙ† Ø¯Ú©Ù…Ù‡ Ø¯ÙˆÙ…" value={content.hero?.ctaSecondary} onChange={(v) => setIn('hero', 'ctaSecondary', v)} />
        </div>

        <Sub label="Ø¨Ø®Ø´ Ú©Ø§Ù„Ú©Ø´Ù†" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="Ø¨Ø±Ú†Ø³Ø¨ Ù„Ø§ØªÛŒÙ†" hint="Ù…ØªÙ†â€ŒÙ‡Ø§ÛŒ Ø§Ù†Ú¯Ù„ÛŒØ³ÛŒ ÛŒØ§ Ø®Ù„Ø§ØµÙ‡Ù” Ø¨Ø§Ù„Ø§ÛŒ Ø¹Ù†ÙˆØ§Ù†" dir="ltr" value={content.collection?.eyebrow} onChange={(v) => setIn('collection', 'eyebrow', v)} />
          <CField label="Ø¹Ù†ÙˆØ§Ù† Ú©Ø§Ù„Ú©Ø´Ù†" value={content.collection?.title} onChange={(v) => setIn('collection', 'title', v)} />
          <div className="sm:col-span-2">
            <CField label="Ø²ÛŒØ±Ø¹Ù†ÙˆØ§Ù† Ú©Ø§Ù„Ú©Ø´Ù†" type="area" value={content.collection?.subtitle} onChange={(v) => setIn('collection', 'subtitle', v)} />
          </div>
        </div>

        <Sub label="Ù…ØªÙ† Ù¾ÛŒØ§Ù… Â«Ù…Ø­ØµÙˆÙ„ÛŒ ÛŒØ§ÙØª Ù†Ø´Ø¯Â»" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="Ø¹Ù†ÙˆØ§Ù†" value={content.productGrid?.emptyTitle} onChange={(v) => setIn('productGrid', 'emptyTitle', v)} />
          <CField label="ØªÙˆØ¶ÛŒØ­" type="area" value={content.productGrid?.emptyText} onChange={(v) => setIn('productGrid', 'emptyText', v)} />
        </div>
      </Panel>

      <Panel title="Ù…Ø²Ø§ÛŒØ§ (Ú©Ø§Ø±Øªâ€ŒÙ‡Ø§ÛŒ Ø¨Ø§Ù„Ø§ÛŒ ÙØ±ÙˆØ´Ú¯Ø§Ù‡)" icon={PenLine}>
        <CListEditor
          items={content.features ?? []}
          onList={(next) => set('features', next)}
          fields={[
            { key: 'title', label: 'Ø¹Ù†ÙˆØ§Ù† Ù…Ø²ÛŒØª' },
            { key: 'text', label: 'ØªÙˆØ¶ÛŒØ­ Ù…Ø²ÛŒØª' },
          ]}
        />
      </Panel>

      <Panel title="Ú©Ø§Ø±Øª Ù…Ø­ØµÙˆÙ„ Ø¯Ø± Ú©Ø§Ù„Ú©Ø´Ù†" icon={PenLine}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="Ù…ØªÙ† Ø¯Ú©Ù…Ù‡ Â«Ø§ÙØ²ÙˆØ¯Ù† Ø¨Ù‡ Ø³Ø¨Ø¯Â»" value={content.card?.addToCart} onChange={(v) => setIn('card', 'addToCart', v)} />
          <CField label="Ù†Ø´Ø§Ù† Ù…ÙˆÙÙ‚ÛŒØª Ø§ÙØ²ÙˆØ¯Ù†" value={content.card?.addedToCart} onChange={(v) => setIn('card', 'addedToCart', v)} />
          <CField label="Ù†Ø´Ø§Ù† Ú©Ø¯ Ù…Ø­ØµÙˆÙ„" hint="Ø¨Ø§ Â«{code}Â» Ù…Ù‚Ø¯Ø§Ø± Ú©Ø¯ Ù…Ø­ØµÙˆÙ„ Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Ù…ÛŒâ€ŒØ´ÙˆØ¯" value={content.card?.codeLabel} onChange={(v) => setIn('card', 'codeLabel', v)} />
          <CField label="Ù†Ø´Ø§Ù† Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ú©Ù…" hint="Ø¨Ø§ Â«{n}Â» Ø¹Ø¯Ø¯ Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Ù…ÛŒâ€ŒØ´ÙˆØ¯" value={content.card?.lowStock} onChange={(v) => setIn('card', 'lowStock', v)} />
          <CField label="ØªØ¹Ø¯Ø§Ø¯ Ø±Ù†Ú¯â€ŒÙ‡Ø§" hint="Ø¨Ø§ Â«{n}Â» ØªØ¹Ø¯Ø§Ø¯ Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Ù…ÛŒâ€ŒØ´ÙˆØ¯" value={content.card?.colorsCount} onChange={(v) => setIn('card', 'colorsCount', v)} />
        </div>
      </Panel>

      <Panel title="Ù¾Ù†Ø¬Ø±Ù‡Ù” Ù†Ù…Ø§ÛŒØ´ Ø³Ø±ÛŒØ¹ Ù…Ø­ØµÙˆÙ„" icon={PenLine}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="Ø¨Ø±Ú†Ø³Ø¨ Ú©Ø¯ Ù…Ø­ØµÙˆÙ„" hint="Ø¨Ø§ Â«{code}Â» Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Ù…ÛŒâ€ŒØ´ÙˆØ¯" value={content.quickView?.codeLabel} onChange={(v) => setIn('quickView', 'codeLabel', v)} />
          <CField label="Ø¨Ø±Ú†Ø³Ø¨ Â«Ø§Ø¨Ø¹Ø§Ø¯Â»" value={content.quickView?.dimensionsLabel} onChange={(v) => setIn('quickView', 'dimensionsLabel', v)} />
          <CField label="Ø¨Ø±Ú†Ø³Ø¨ Â«Ø±Ù†Ú¯Â»" value={content.quickView?.colorLabel} onChange={(v) => setIn('quickView', 'colorLabel', v)} />
          <CField label="Ø¨Ø±Ú†Ø³Ø¨ Â«Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ø§Ù†Ø¨Ø§Ø±Â»" value={content.quickView?.stockLabel} onChange={(v) => setIn('quickView', 'stockLabel', v)} />
          <CField label="Ù…ØªÙ† Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ú©Ù…" hint="Ø¨Ø§ Â«{n}Â» Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Ù…ÛŒâ€ŒØ´ÙˆØ¯" value={content.quickView?.lowStock} onChange={(v) => setIn('quickView', 'lowStock', v)} />
          <CField label="Ù…ØªÙ† Ù…ÙˆØ¬ÙˆØ¯ÛŒ Ø¹Ø§Ø¯ÛŒ" hint="Ø¨Ø§ Â«{n}Â» Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Ù…ÛŒâ€ŒØ´ÙˆØ¯" value={content.quickView?.inStock} onChange={(v) => setIn('quickView', 'inStock', v)} />
          <CField label="Ù…ØªÙ† Ø¯Ú©Ù…Ù‡ Ø§ÙØ²ÙˆØ¯Ù†" value={content.quickView?.addToCart} onChange={(v) => setIn('quickView', 'addToCart', v)} />
          <CField label="Ù†Ø´Ø§Ù† Ù…ÙˆÙÙ‚ÛŒØª Ø§ÙØ²ÙˆØ¯Ù†" value={content.quickView?.addedToCart} onChange={(v) => setIn('quickView', 'addedToCart', v)} />
          <div className="sm:col-span-2">
            <CField label="ÛŒØ§Ø¯Ø¯Ø§Ø´Øª Ø§Ø±Ø³Ø§Ù„ Ø±Ø§ÛŒÚ¯Ø§Ù†" type="area" value={content.quickView?.shippingNote} onChange={(v) => setIn('quickView', 'shippingNote', v)} />
          </div>
        </div>
      </Panel>

      <Panel title="Ø³Ø¨Ø¯ Ø®Ø±ÛŒØ¯ Ùˆ Ù¾ÛŒØ§Ù… Ø§ÙØ²ÙˆØ¯Ù†" icon={PenLine}>
        <Sub label="Ø³Ø¨Ø¯ Ø®Ø±ÛŒØ¯" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="Ø¹Ù†ÙˆØ§Ù† Ø³Ø¨Ø¯" value={content.cart?.title} onChange={(v) => setIn('cart', 'title', v)} />
          <CField label="Ø¹Ù†ÙˆØ§Ù† Ø³Ø¨Ø¯ Ø®Ø§Ù„ÛŒ" value={content.cart?.emptyTitle} onChange={(v) => setIn('cart', 'emptyTitle', v)} />
          <CField label="Ø²ÛŒØ±Ø¹Ù†ÙˆØ§Ù† Ø³Ø¨Ø¯ Ø®Ø§Ù„ÛŒ" value={content.cart?.emptySubtitle} onChange={(v) => setIn('cart', 'emptySubtitle', v)} />
          <CField label="Ø¯Ú©Ù…Ù‡ Â«Ù…Ø´Ø§Ù‡Ø¯Ù‡ Ú©Ø§Ù„Ú©Ø´Ù†Â»" value={content.cart?.viewCollection} onChange={(v) => setIn('cart', 'viewCollection', v)} />
          <CField label="Ù¾ÛŒØ§Ù… ØªØ§ Ø§Ø±Ø³Ø§Ù„ Ø±Ø§ÛŒÚ¯Ø§Ù†" hint="Ø¨Ø§ Â«{total}Â» Ù…Ø¨Ù„Øº Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Ù…ÛŒâ€ŒØ´ÙˆØ¯" value={content.cart?.freeShippingLeft} onChange={(v) => setIn('cart', 'freeShippingLeft', v)} />
          <CField label="Ù¾ÛŒØ§Ù… Ø§Ø±Ø³Ø§Ù„ Ø±Ø§ÛŒÚ¯Ø§Ù† ÙØ¹Ø§Ù„" value={content.cart?.freeShippingActive} onChange={(v) => setIn('cart', 'freeShippingActive', v)} />
          <CField label="Ø¨Ø±Ú†Ø³Ø¨ Ù…Ø¬Ù…ÙˆØ¹ ÙØ§Ú©ØªÙˆØ±" value={content.cart?.subtotal} onChange={(v) => setIn('cart', 'subtotal', v)} />
          <CField label="ÛŒØ§Ø¯Ø¯Ø§Ø´Øª Ù¾Ø§ÛŒÛŒÙ† Ø³Ø¨Ø¯" type="area" value={content.cart?.checkoutNote} onChange={(v) => setIn('cart', 'checkoutNote', v)} />
          <CField label="Ø¯Ú©Ù…Ù‡ Ø³ÙØ§Ø±Ø´ ÙˆØ§ØªØ³â€ŒØ§Ù¾" value={content.cart?.checkoutButton} onChange={(v) => setIn('cart', 'checkoutButton', v)} />
          <CField label="Ù†Ø´Ø§Ù† Ø§Ø¹ØªÙ…Ø§Ø¯ Û±" value={content.cart?.trustBadge1} onChange={(v) => setIn('cart', 'trustBadge1', v)} />
          <CField label="Ù†Ø´Ø§Ù† Ø§Ø¹ØªÙ…Ø§Ø¯ Û²" value={content.cart?.trustBadge2} onChange={(v) => setIn('cart', 'trustBadge2', v)} />
        </div>
        <Sub label="Ù¾ÛŒØ§Ù… Ø§ÙØ²ÙˆØ¯Ù† Ø¨Ù‡ Ø³Ø¨Ø¯ (popup)" />
        <CField label="Ù…ØªÙ† Ù¾ÛŒØ§Ù…" value={content.cartToast?.title} onChange={(v) => setIn('cartToast', 'title', v)} />
      </Panel>

      <Panel title="Ù…Ù†ÙˆÛŒ Ø¨Ø§Ù„Ø§ÛŒ Ø³Ø§ÛŒØª" icon={PenLine}>
        <CListEditor
          items={content.nav ?? []}
          onList={(next) => set('nav', next)}
          fields={[
            { key: 'label', label: 'Ø¹Ù†ÙˆØ§Ù† Ù…Ù†Ùˆ' },
            { key: 'href', label: 'Ù„ÛŒÙ†Ú©', dir: 'ltr', placeholder: '#collection' },
          ]}
        />
        <Sub label="Ù†Ú©ØªÙ‡Ù” Ø§Ø±Ø³Ø§Ù„ Ø±Ø§ÛŒÚ¯Ø§Ù† Ø¯Ø± Ù…Ù†ÙˆÛŒ Ù…ÙˆØ¨Ø§ÛŒÙ„" />
        <CField label="Ù…ØªÙ† Ù†Ú©ØªÙ‡" type="area" value={content.menu?.shippingNote} onChange={(v) => setIn('menu', 'shippingNote', v)} />
      </Panel>

      <Panel title="Ù„ÙˆÚ©â€ŒØ¨ÙˆÚ© Ùˆ Ø®Ø¨Ø±Ù†Ø§Ù…Ù‡" icon={PenLine}>
        <Sub label="Ù„ÙˆÚ©â€ŒØ¨ÙˆÚ©" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="Ø¹Ù†ÙˆØ§Ù† Ø¨Ø®Ø´" value={content.lookbook?.title} onChange={(v) => setIn('lookbook', 'title', v)} />
          <div className="sm:col-span-2">
            <CField label="Ø²ÛŒØ±Ø¹Ù†ÙˆØ§Ù†" type="area" value={content.lookbook?.subtitle} onChange={(v) => setIn('lookbook', 'subtitle', v)} />
          </div>
        </div>
        <div className="mt-4">
          <Sub label="Ø³Ø¨Ú©â€ŒÙ‡Ø§ÛŒ Ù„ÙˆÚ©â€ŒØ¨ÙˆÚ© (Ø¹Ú©Ø³ + Ù…ØªÙ†)" />
          <p className="mb-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[11px] leading-6 text-taupe">
            Ø¨Ø±Ø§ÛŒ Ù‡Ø± Ø§Ø³ØªØ§ÛŒÙ„ Ù…ÛŒâ€ŒØªÙˆØ§Ù†ÛŒØ¯ Ø¹Ú©Ø³ Ø¢Ù¾Ù„ÙˆØ¯ Ú©Ù†ÛŒØ¯ ÛŒØ§ Ù„ÛŒÙ†Ú© Ø¢Ù† Ø±Ø§ ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯. Ø§Ú¯Ø± Ø¹Ú©Ø³ÛŒ Ù†Ø¨Ø§Ø´Ø¯ØŒ ØªØµÙˆÛŒØ±
            Ù¾ÛŒØ´â€ŒÙØ±Ø¶ Ù†Ù…Ø§ÛŒØ´ Ø¯Ø§Ø¯Ù‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯ Ùˆ Ø¹Ù†ÙˆØ§Ù† Ùˆ Ø²ÛŒØ±Ø¹Ù†ÙˆØ§Ù† Ù†ÛŒØ² Ù‚Ø§Ø¨Ù„ ØªØºÛŒÛŒØ±Ù†Ø¯.
          </p>
          <div className="mt-2.5">
            <CListEditor
              items={content.lookbook?.shots ?? []}
              onList={(next) => set('lookbook', { ...content.lookbook, shots: next })}
              imageKey="src"
              fields={[
                { key: 'label', label: 'Ø¹Ù†ÙˆØ§Ù† Ø§Ø³ØªØ§ÛŒÙ„' },
                { key: 'sub', label: 'Ø²ÛŒØ±Ø¹Ù†ÙˆØ§Ù†' },
              ]}
            />
          </div>
        </div>
        <Sub label="Ø®Ø¨Ø±Ù†Ø§Ù…Ù‡" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="Ø¹Ù†ÙˆØ§Ù†" type="area" value={content.newsletter?.title} onChange={(v) => setIn('newsletter', 'title', v)} />
          <CField label="Ø²ÛŒØ±Ø¹Ù†ÙˆØ§Ù†" type="area" value={content.newsletter?.subtitle} onChange={(v) => setIn('newsletter', 'subtitle', v)} />
          <CField label="Ù¾ÛŒØ§Ù… Ù…ÙˆÙÙ‚ÛŒØª" type="area" value={content.newsletter?.success} onChange={(v) => setIn('newsletter', 'success', v)} />
          <CField label="Ù…ØªÙ† Ø¯Ú©Ù…Ù‡" value={content.newsletter?.button} onChange={(v) => setIn('newsletter', 'button', v)} />
        </div>
      </Panel>

      <Panel title="ÙÙˆØªØ± (Ù¾Ø§ÛŒÛŒÙ† Ø³Ø§ÛŒØª)" icon={PenLine}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <CField label="ØªÙˆØ¶ÛŒØ­ Ø¨Ø±Ù†Ø¯" type="area" value={content.footer?.description} onChange={(v) => setIn('footer', 'description', v)} />
          </div>
          <CField label="Ø¢Ø¯Ø±Ø³ ÙØ±ÙˆØ´Ú¯Ø§Ù‡" type="area" value={content.footer?.address} onChange={(v) => setIn('footer', 'address', v)} />
          <CField label="Ù…ØªÙ† Ú©Ù¾ÛŒâ€ŒØ±Ø§ÛŒØª" value={content.footer?.copyright} onChange={(v) => setIn('footer', 'copyright', v)} />
          <CField label="Ø´Ø¹Ø§Ø± Ù¾Ø§ÛŒØ§Ù†ÛŒ" value={content.footer?.tagline} onChange={(v) => setIn('footer', 'tagline', v)} />
          <CField label="Ø¹Ù†ÙˆØ§Ù† Ø³ØªÙˆÙ† Â«Ø¯Ø³ØªØ±Ø³ÛŒ Ø³Ø±ÛŒØ¹Â»" value={content.footer?.headingQuick} onChange={(v) => setIn('footer', 'headingQuick', v)} />
          <CField label="Ø¹Ù†ÙˆØ§Ù† Ø³ØªÙˆÙ† Â«Ø±Ø§Ù‡Ù†Ù…Ø§ÛŒ Ø®Ø±ÛŒØ¯Â»" value={content.footer?.headingHelp} onChange={(v) => setIn('footer', 'headingHelp', v)} />
          <CField label="Ø¹Ù†ÙˆØ§Ù† Ø³ØªÙˆÙ† Â«ØªÙ…Ø§Ø³ Ø¨Ø§ Ú¯Ø§Ù„Ø±ÛŒÂ»" value={content.footer?.headingContact} onChange={(v) => setIn('footer', 'headingContact', v)} />
        </div>
        <Sub label="Ù„ÛŒÙ†Ú©â€ŒÙ‡Ø§ÛŒ Ø¯Ø³ØªØ±Ø³ÛŒ Ø³Ø±ÛŒØ¹" />
        <CListEditor
          items={content.footer?.quickLinks ?? []}
          onList={(next) => set('footer', { ...content.footer, quickLinks: next })}
          fields={[
            { key: 'label', label: 'Ø¹Ù†ÙˆØ§Ù† Ù„ÛŒÙ†Ú©' },
            { key: 'href', label: 'Ù„ÛŒÙ†Ú©', dir: 'ltr', placeholder: '#collection' },
          ]}
        />
        <Sub label="Ù„ÛŒÙ†Ú©â€ŒÙ‡Ø§ÛŒ Ø±Ø§Ù‡Ù†Ù…Ø§ÛŒ Ø®Ø±ÛŒØ¯" />
        <CListEditor
          items={content.footer?.helpLinks ?? []}
          onList={(next) => set('footer', { ...content.footer, helpLinks: next })}
          fields={[
            { key: 'label', label: 'Ø¹Ù†ÙˆØ§Ù† Ù„ÛŒÙ†Ú©' },
            { key: 'href', label: 'Ù„ÛŒÙ†Ú©', dir: 'ltr', placeholder: '#collection' },
          ]}
        />
      </Panel>

      <Panel title="Ø¬Ø³ØªØ¬Ùˆ Ùˆ Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§ÛŒ ÙˆØ§ØªØ³â€ŒØ§Ù¾" icon={PenLine}>
        <Sub label="Ø¬Ø³ØªØ¬Ùˆ" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="Ù…ØªÙ† Ø±Ø§Ù‡Ù†Ù…Ø§ Ø¯Ø± Ú©Ø§Ø¯Ø± Ø¬Ø³ØªØ¬Ùˆ" value={content.search?.placeholder} onChange={(v) => setIn('search', 'placeholder', v)} />
          <CField label="Ø±Ø§Ù‡Ù†Ù…Ø§ÛŒ Ù‚Ø¨Ù„ Ø§Ø² ØªØ§ÛŒÙ¾" type="area" value={content.search?.hint} onChange={(v) => setIn('search', 'hint', v)} />
          <CField label="Ù…ØªÙ† Â«Ù†ØªÛŒØ¬Ù‡â€ŒØ§ÛŒ ÛŒØ§ÙØª Ù†Ø´Ø¯Â»" hint="Ø¨Ø§ Â«{q}Â» Ø¹Ø¨Ø§Ø±Øª Ø¬Ø³ØªØ¬Ùˆ Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Ù…ÛŒâ€ŒØ´ÙˆØ¯" value={content.search?.noResults} onChange={(v) => setIn('search', 'noResults', v)} />
          <CField label="Ù…ØªÙ† Ø´Ù…Ø§Ø±Ù†Ø¯Ù‡Ù” Ù…Ø­ØµÙˆÙ„Ø§Øª" hint="Ø¨Ø§ Â«{n}Â» ØªØ¹Ø¯Ø§Ø¯ Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Ù…ÛŒâ€ŒØ´ÙˆØ¯" value={content.search?.resultCount} onChange={(v) => setIn('search', 'resultCount', v)} />
        </div>
        <Sub label="Ù¾ÛŒØ§Ù…â€ŒÙ‡Ø§ÛŒ ÙˆØ§ØªØ³â€ŒØ§Ù¾" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CField label="Ù…ØªÙ† Ù¾ÛŒØ§Ù… Ø³ÙØ§Ø±Ø´ â€” Ø´Ø±ÙˆØ¹" value={content.whatsapp?.orderGreeting} onChange={(v) => setIn('whatsapp', 'orderGreeting', v)} />
          <CField label="Ù…ØªÙ† Ø¬Ù…Ø¹ ÙØ§Ú©ØªÙˆØ±" hint="Ø¨Ø§ Â«{total}Â» Ù…Ø¨Ù„Øº Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ† Ù…ÛŒâ€ŒØ´ÙˆØ¯" value={content.whatsapp?.orderTotal} onChange={(v) => setIn('whatsapp', 'orderTotal', v)} />
          <CField label="Ù…ØªÙ† Ù¾ÛŒØ§Ù… Ø³ÙØ§Ø±Ø´ â€” Ù¾Ø§ÛŒØ§Ù†" type="area" value={content.whatsapp?.orderFooter} onChange={(v) => setIn('whatsapp', 'orderFooter', v)} />
          <CField label="Ù…ØªÙ† Ù¾ÛŒØ´â€ŒÙ†Ù…Ø§ÛŒØ´ Ù¾ÛŒØ§Ù… ÙˆØ§ØªØ³â€ŒØ§Ù¾ Ø´Ù†Ø§ÙˆØ±" type="area" value={content.whatsapp?.floatingPrefill} onChange={(v) => setIn('whatsapp', 'floatingPrefill', v)} />
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
      pushRef?.current?.('error', 'Ø§Ø¨ØªØ¯Ø§ ØªÙˆÚ©Ù† GitHub Ø±Ø§ ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯');
      return;
    }
    setStatus('syncing');
    setStatusMsg('Ø¯Ø± Ø­Ø§Ù„ Ø§Ù†ØªØ´Ø§Ø± Ø±ÙˆÛŒ Ú¯ÛŒØªâ€ŒÙ‡Ø§Ø¨â€¦');
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
      setStatusMsg('Ù…Ù†ØªØ´Ø± Ø´Ø¯! Ø¯ÛŒÙ¾Ù„ÙˆÛŒ Ø®ÙˆØ¯Ú©Ø§Ø± Ø¯Ø± Ø­Ø§Ù„ Ø§Ø¬Ø±Ø§Ø³Øªâ€¦');
      pushRef?.current?.('success', 'ØªØºÛŒÛŒØ±Ø§Øª Ø¯Ø± GitHub Ù…Ù†ØªØ´Ø± Ø´Ø¯ â€” Ø³Ø§ÛŒØª Ø¨Ù‡â€ŒØ²ÙˆØ¯ÛŒ Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ù…ÛŒâ€ŒØ´ÙˆØ¯');
    } catch (err) {
      setStatus('error');
      setStatusMsg(String(err?.message || err));
      pushRef?.current?.('error', `Ø®Ø·Ø§ Ø¯Ø± Ø§Ù†ØªØ´Ø§Ø±: ${String(err?.message || err).slice(0, 80)}`);
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
    pushRef?.current?.('success', 'ÙØ§ÛŒÙ„ Ù¾Ø´ØªÛŒØ¨Ø§Ù† Ø¯Ø§Ù†Ù„ÙˆØ¯ Ø´Ø¯');
  };

  const copyCode = async () => {
    const code = serializeProducts(products);
    try {
      await navigator.clipboard.writeText(code);
      pushRef?.current?.('success', 'Ú©Ø¯ Ø¯ÛŒØªØ§ Ø¯Ø± Ú©Ù„ÛŒÙ¾â€ŒØ¨ÙˆØ±Ø¯ Ú©Ù¾ÛŒ Ø´Ø¯');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      pushRef?.current?.('success', 'Ú©Ø¯ Ø¯ÛŒØªØ§ Ø¯Ø± Ú©Ù„ÛŒÙ¾â€ŒØ¨ÙˆØ±Ø¯ Ú©Ù¾ÛŒ Ø´Ø¯');
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
          pushRef?.current?.('success', `Ù¾Ø´ØªÛŒØ¨Ø§Ù† Ø¨Ø§Ø²ÛŒØ§Ø¨ÛŒ Ø´Ø¯ (${toFa(data.products.length)} Ù…Ø­ØµÙˆÙ„)`);
        } else {
          throw new Error('Ø³Ø§Ø®ØªØ§Ø± ÙØ§ÛŒÙ„ Ù¾Ø´ØªÛŒØ¨Ø§Ù† Ù†Ø§Ù…Ø¹ØªØ¨Ø± Ø§Ø³Øª');
        }
      } catch (err) {
        pushRef?.current?.('error', `Ø®Ø·Ø§ Ø¯Ø± Ø®ÙˆØ§Ù†Ø¯Ù† Ù¾Ø´ØªÛŒØ¨Ø§Ù†: ${String(err.message || err)}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <Panel title="Ø§Ù†ØªØ´Ø§Ø± Ø±ÙˆÛŒ Ú¯ÛŒØªâ€ŒÙ‡Ø§Ø¨ (Ø¯ÛŒÙ¾Ù„ÙˆÛŒ Ø®ÙˆØ¯Ú©Ø§Ø±)" icon={Github}>
        <p className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[11px] leading-6 text-taupe">
          Ù‡Ø± ØªØºÛŒÛŒØ±ÛŒ Ú©Ù‡ Ø¯Ø± Ù¾Ù†Ù„ Ø§ÛŒØ¬Ø§Ø¯ Ú©Ù†ÛŒØ¯ (Ù…Ø­ØµÙˆÙ„Ø§Øª ÛŒØ§ ØªÙ†Ø¸ÛŒÙ…Ø§Øª)ØŒ Ø¨Ù‡â€ŒØµÙˆØ±Øª Ø®ÙˆØ¯Ú©Ø§Ø± Ùˆ Ù¾Ø³ Ø§Ø² Ú†Ù†Ø¯ Ø«Ø§Ù†ÛŒÙ‡ Ø¨Ù‡â€ŒØ´Ú©Ù„
          Ú©Ø§Ù…ÛŒØª Ø±ÙˆÛŒ ÙØ§ÛŒÙ„â€ŒÙ‡Ø§ÛŒ <span dir="ltr">productsData.js</span> Ùˆ <span dir="ltr">constants.js</span> Ù…Ù†ØªØ´Ø± Ù…ÛŒâ€ŒØ´ÙˆØ¯
          Ùˆ GitHub Actions Ø³Ø§ÛŒØª Ø±Ø§ Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ù…ÛŒâ€ŒÚ©Ù†Ø¯. Ø¯Ú©Ù…Ù‡Ù” Ø²ÛŒØ± Ø¨Ø±Ø§ÛŒ Ø§Ù†ØªØ´Ø§Ø± ÙÙˆØ±ÛŒ Ùˆ Ù‡Ù…Ø²Ù…Ø§Ù† Ù‡Ø± Ø¯Ùˆ ÙØ§ÛŒÙ„ Ø§Ø³Øª.
          ØªÙˆÚ©Ù† ÙÙ‚Ø· Ø¯Ø± Ø­Ø§ÙØ¸Ù‡Ù” Ù‡Ù…ÛŒÙ† ØµÙØ­Ù‡ Ù†Ú¯Ù‡ Ø¯Ø§Ø´ØªÙ‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯ (Ù‡ÛŒÚ†â€ŒÚ†ÛŒØ² Ø¯Ø± localStorage Ø°Ø®ÛŒØ±Ù‡ Ù†Ù…ÛŒâ€ŒØ´ÙˆØ¯) Ùˆ Ø¨Ø§ Ø¨Ø³ØªÙ†
          ØµÙØ­Ù‡ Ù¾Ø§Ú© Ù…ÛŒâ€ŒØ´ÙˆØ¯.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="ØªÙˆÚ©Ù† Ø¯Ø³ØªØ±Ø³ÛŒ Ø´Ø®ØµÛŒ (PAT)" hint="Ù†ÛŒØ§Ø²Ù…Ù†Ø¯ Ø¯Ø³ØªØ±Ø³ÛŒ repo/contents:write">
              <TextInput
                type="password"
                value={meta.pat}
                onChange={(e) => set('pat', e.target.value)}
                placeholder="ghp_â€¦"
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
            {status === 'syncing' ? 'Ø¯Ø± Ø­Ø§Ù„ Ø§Ù†ØªØ´Ø§Ø±â€¦' : 'Ø§Ù†ØªØ´Ø§Ø± Ù†Ù‡Ø§ÛŒÛŒ ØªØºÛŒÛŒØ±Ø§Øª Ø±ÙˆÛŒ Ø³Ø§ÛŒØª'}
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

      <Panel title="Ù¾Ø´ØªÛŒØ¨Ø§Ù†â€ŒÚ¯ÛŒØ±ÛŒ Ùˆ Ø§Ù†ØªÙ‚Ø§Ù„" icon={Download}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={downloadBackup}
            className={`${PILL_BTN} !py-3 border-white/10 text-pearl/75 hover:border-gold/40 hover:text-gold`}
          >
            <Download size={13} strokeWidth={2} />
            Ø¯Ø§Ù†Ù„ÙˆØ¯ Ù¾Ø´ØªÛŒØ¨Ø§Ù† JSON
          </button>
          <button
            type="button"
            onClick={copyCode}
            className={`${PILL_BTN} !py-3 border-white/10 text-pearl/75 hover:border-gold/40 hover:text-gold`}
          >
            <ClipboardCopy size={13} strokeWidth={2} />
            Ú©Ù¾ÛŒ Ú©Ø¯ Ø¯ÛŒØªØ§ÛŒ Ø¬Ø¯ÛŒØ¯
          </button>
          <button
            type="button"
            onClick={() => restoreRef.current?.click()}
            className={`${PILL_BTN} !py-3 border-white/10 text-pearl/75 hover:border-gold/40 hover:text-gold`}
          >
            <Upload size={13} strokeWidth={2} />
            Ø¨Ø§Ø²ÛŒØ§Ø¨ÛŒ Ø§Ø² Ù¾Ø´ØªÛŒØ¨Ø§Ù†
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
        pushRef?.current?.('error', 'Ø­Ø¬Ù… Ø¯Ø§Ø¯Ù‡â€ŒÙ‡Ø§ Ø²ÛŒØ§Ø¯ Ø§Ø³ØªØ› Ø§Ø² Ù„ÛŒÙ†Ú© ØªØµÙˆÛŒØ± Ø¨Ù‡â€ŒØ¬Ø§ÛŒ Ø¢Ù¾Ù„ÙˆØ¯ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ú©Ù†ÛŒØ¯.');
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
      pushRef?.current?.('success', 'ØªØºÛŒÛŒØ±Ø§Øª Ø®ÙˆØ¯Ú©Ø§Ø± Ø±ÙˆÛŒ Ø³Ø±ÙˆØ± Ù…Ù†ØªØ´Ø± Ø´Ø¯ â€” Ø³Ø§ÛŒØª Ø¯Ø± Ø­Ø§Ù„ Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø§Ø³Øª');
    } catch (err) {
      pushRef?.current?.('error', `Ø§Ù†ØªØ´Ø§Ø± Ø®ÙˆØ¯Ú©Ø§Ø± Ù†Ø§Ù…ÙˆÙÙ‚: ${String(err?.message || err).slice(0, 60)}`);
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
  { key: 'products', label: 'Ù…Ø­ØµÙˆÙ„Ø§Øª', icon: Package },
  { key: 'content', label: 'Ù…ØªÙ†â€ŒÙ‡Ø§ÛŒ Ø³Ø§ÛŒØª', icon: PenLine },
  { key: 'settings', label: 'ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø³Ø§ÛŒØª', icon: Settings2 },
  { key: 'github', label: 'ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ú¯ÛŒØªâ€ŒÙ‡Ø§Ø¨', icon: Github },
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
    push('success', 'Ø¨Ù‡ Ù¾Ù†Ù„ Ù…Ø¯ÛŒØ±ÛŒØª Ø®ÙˆØ´ Ø¢Ù…Ø¯ÛŒØ¯');
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
            aria-label="Ù¾Ù†Ù„ Ù…Ø¯ÛŒØ±ÛŒØª Ø±ÙˆÚ˜ÛŒÙ†Ø§"
          >
            <div className="container-lux mx-auto min-h-full max-w-4xl py-6 md:py-10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/25 bg-gold/[0.07] text-gold shadow-gold-glow">
                    <Lock size={18} strokeWidth={1.6} />
                  </span>
                  <div>
                    <h1 className="text-base font-extrabold text-pearl md:text-lg">
                      Ø§Ø³ØªÙˆØ¯ÛŒÙˆ Ù…Ø¯ÛŒØ±ÛŒØª Ø±ÙˆÚ˜ÛŒÙ†Ø§
                    </h1>
                    <p className="text-[11px] text-taupe">
                      Ù…Ø¯ÛŒØ±ÛŒØª Ù…Ø­ØµÙˆÙ„Ø§Øª Ùˆ Ø³Ø§ÛŒØª Ø¨Ø¯ÙˆÙ† Ú©Ø¯Ù†ÙˆÛŒØ³ÛŒ
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Ø¨Ø³ØªÙ† Ù¾Ù†Ù„ Ù…Ø¯ÛŒØ±ÛŒØª"
                  onClick={closeAdmin}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-pearl/70 transition-[transform,background-color,border-color,color] duration-300 hover:rotate-90 hover:border-gold/40 hover:text-gold active:scale-90"
                >
                  <X size={18} strokeWidth={1.8} />
                </button>
              </div>

              {unlocked ? (
                <>
                  <div
                    className="no-scrollbar sticky top-2 z-30 mt-6 flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-white/[0.07] bg-[#100F0E]/95 p-1.5 backdrop-blur-md"
                    role="tablist"
                    aria-label="Ø¨Ø®Ø´â€ŒÙ‡Ø§ÛŒ Ù¾Ù†Ù„ Ù…Ø¯ÛŒØ±ÛŒØª"
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
                          className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-[transform,background-color,border-color,color] duration-300 active:scale-[0.97] ${
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
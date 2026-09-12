const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const FABRICS = ['ابریشم ژاکارد', 'نخ لنین', 'نخ ابریشم', 'کشمیر و موهر', 'کرپ حریر'];

export const COLORS = [
  { label: 'کرم', hex: '#F3E9DA' },
  { label: 'نسکافه‌ای', hex: '#B08968' },
  { label: 'مشکی زغالی', hex: '#3C3A39' },
  { label: 'سبز زمردی', hex: '#14432B' },
  { label: 'آجری', hex: '#BC5840' },
];

const BADGE_STYLES = {
  'دست‌دوز': 'bg-gold text-espresso',
  'کالکشن جدید': 'bg-espresso text-alabaster',
  'تنها': 'bg-terracotta text-alabaster',
};

export const badgeStyle = (label) =>
  BADGE_STYLES[Object.keys(BADGE_STYLES).find((key) => label.includes(key))] || 'bg-espresso text-alabaster';

export const PRODUCTS = [
  {
    id: 1,
    name: 'شال ابریشم توییل طرح هرمس',
    enName: 'Twilly Silk · Hermès Heritage',
    fabric: 'نخ ابریشم',
    colors: [
      { label: 'کرم', hex: '#F3E9DA' },
      { label: 'نسکافه‌ای', hex: '#B08968' },
    ],
    price: 2850000,
    oldPrice: 3400000,
    quantity: 8,
    badges: ['دست‌دوز', 'کالکشن جدید'],
    description:
      'ابریشم توییل دو‌رو با چاپ هدینگ کلاسیک؛ بافت نرم و سبک، انتخابی برای مجالس و استایل‌های روزمرهٔ شیک.',
    images: [photo('photo-1489987707025-afc232f7ea0f'), photo('photo-1520006403909-838d6b92c22e')],
  },
  {
    id: 2,
    name: 'مینی اسکارف ژاکارد روژینا',
    enName: 'Signature Jacquard Mini Scarf',
    fabric: 'ابریشم ژاکارد',
    colors: [
      { label: 'سبز زمردی', hex: '#14432B' },
      { label: 'کرم', hex: '#F3E9DA' },
    ],
    price: 1450000,
    oldPrice: null,
    quantity: 14,
    badges: ['کالکشن جدید', 'دست‌دوز'],
    description:
      'مینی‌اسکارف ژاکارد با طرح امضای برند روژینا؛ تلفیق هنر بافندگی و رنگین‌کمان الیاف طبیعی.',
    images: [photo('photo-1556905055-8f358a7a47b2'), photo('photo-1469334031218-e382a71b716b')],
  },
  {
    id: 3,
    name: 'شال نخی مزونی وال',
    enName: 'Mousseline Cotton Shawl',
    fabric: 'نخ لنین',
    colors: [
      { label: 'نسکافه‌ای', hex: '#B08968' },
      { label: 'کرم', hex: '#F3E9DA' },
    ],
    price: 980000,
    oldPrice: 1150000,
    quantity: 20,
    badges: [],
    description:
      'لنین نخی مزونی با حس خنک و رگه‌های بافت طبیعی؛ انتخابی مینیمال برای روزهای گرم تا سردِ آستانهٔ فصل.',
    images: [photo('photo-1434389677669-e08b4cac3105'), photo('photo-1496747611176-843222e1e57c')],
  },
  {
    id: 4,
    name: 'شال کشمیر و موهر پاییزه',
    enName: 'Cashmere & Mohair Autumn Wrap',
    fabric: 'کشمیر و موهر',
    colors: [
      { label: 'آجری', hex: '#BC5840' },
      { label: 'نسکافه‌ای', hex: '#B08968' },
    ],
    price: 3650000,
    oldPrice: null,
    quantity: 2,
    badges: ['تنها ۲ عدد باقی‌مانده'],
    description:
      'تولید محدود از نخ کشمیر و موهر؛ لطافت ابری و گرمای سلطنتی برای استایل پاییز و زمستان.',
    images: [photo('photo-1542060748-10c28b62716f'), photo('photo-1558769132-cb1aea458c5e')],
  },
  {
    id: 5,
    name: 'کرپ حریر دست‌دوز روژینا',
    enName: 'Hand-Embroidered Silk Crepe',
    fabric: 'کرپ حریر',
    colors: [
      { label: 'مشکی زغالی', hex: '#3C3A39' },
      { label: 'کرم', hex: '#F3E9DA' },
    ],
    price: 1890000,
    oldPrice: 2200000,
    quantity: 6,
    badges: ['دست‌دوز'],
    description:
      'کرپ حریر با دوخت‌های دستی ظریف و حاشیهٔ لبه‌دوزی؛ لوکس‌ترین انتخاب برای هدیهٔ مجلسی.',
    images: [photo('photo-1445205170230-053b83016050'), photo('photo-1509631179647-0177331693ae')],
  },
  {
    id: 6,
    name: 'شال ابریشم ژاکارد زمردی',
    enName: 'Emerald Jacquard Silk Shawl',
    fabric: 'ابریشم ژاکارد',
    colors: [
      { label: 'سبز زمردی', hex: '#14432B' },
      { label: 'مشکی زغالی', hex: '#3C3A39' },
    ],
    price: 2480000,
    oldPrice: null,
    quantity: 4,
    badges: ['کالکشن جدید'],
    description:
      'ژاکارد ابریشمی در سبز زمردی با درخشش مخملی؛ بیانیهٔ نهایی ظرافت و رنگ برای روژینا.',
    images: [photo('photo-1441986300917-64674bd600d8'), photo('photo-1539109136881-3be0616acf4b')],
  },
];

export default PRODUCTS;
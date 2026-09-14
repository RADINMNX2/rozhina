const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const PLACEHOLDER_IMAGE = photo('photo-1520006403909-838d6b92c22e');

export const FABRICS = [
  "ابریشم"
];

export const COLORS = [
  {
    label: "کلاسیک",
    hex: "#E2C997"
  }
];

export const CATEGORIES = ['شال و روسری', 'کیف و اکسسوری', 'لباس', 'شلوار'];

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
    name: "شال ابریشم توییل",
    enName: "Twilly Silk",
    code: "RS-204",
    category: "شال و روسری",
    fabric: "ابریشم",
    dimensions: "140X140",
    colors: [{ label: "کلاسیک", hex: "#E2C997" }],
    price: 4750000,
    oldPrice: 5000000,
    quantity: 7,
    badges: ["کالکشن جدید"],
    description: "شال ابریشم توییل کیفیت بشدت خوب.",
    images: [photo("photo-1520006403909-838d6b92c22e")],
  },
  {
    id: 2,
    name: "شال کشمیر پاییزه",
    enName: "Autumn Cashmere Shawl",
    code: "RS-301",
    category: "شال و روسری",
    fabric: "کشمیر و موهر",
    dimensions: "180X70",
    colors: [{ label: "زمردی", hex: "#1F4D3A" }],
    price: 5200000,
    oldPrice: null,
    quantity: 5,
    badges: ["دست‌دوز"],
    description: "شال کشمیر پاییزه با بافت نرم و گرم برای روزهای سرد.",
    images: [photo("photo-1539109136881-3be0616acf4b")],
  },
  {
    id: 3,
    name: "کیف چرم دست‌دوز",
    enName: "Handcrafted Leather Bag",
    code: "BG-101",
    category: "کیف و اکسسوری",
    fabric: "چرم",
    dimensions: "۳۰×۲۵ سانتیمتر",
    colors: [{ label: "قهوه‌ای", hex: "#6B4A2F" }],
    price: 6800000,
    oldPrice: 7200000,
    quantity: 3,
    badges: ["تعداد محدود"],
    description: "کیف چرم طبیعی با دوخت دست و یراق‌آلات طلایی.",
    images: [photo("photo-1548036328-c9fa89d128fa")],
  },
  {
    id: 4,
    name: "پیراهن مجلسی حریر",
    enName: "Silk Evening Dress",
    code: "CL-205",
    category: "لباس",
    fabric: "کرپ حریر",
    dimensions: "سایز M",
    colors: [{ label: "شب", hex: "#1A1A2E" }],
    price: 8900000,
    oldPrice: null,
    quantity: 2,
    badges: ["کالکشن جدید"],
    description: "پیراهن مجلسی از حریر طبیعی با برش ظریف و دامن پلیسه.",
    images: [photo("photo-1566174053879-31528523f8ae")],
  },
  {
    id: 5,
    name: "شلوار کتان کلاسیک",
    enName: "Classic Linen Trousers",
    code: "TR-310",
    category: "شلوار",
    fabric: "نخ لنین",
    dimensions: "سایز ۴۰ تا ۴۴",
    colors: [{ label: "شنی", hex: "#D8CBB8" }],
    price: 3900000,
    oldPrice: 4300000,
    quantity: 6,
    badges: [],
    description: "شلوار کتان با خط اتو و دوخت تمیز؛ انتخابی برای استایل روزمره.",
    images: [photo("photo-1473966968600-fa801b869a1a")],
  }
];

export default PRODUCTS;
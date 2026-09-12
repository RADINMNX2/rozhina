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
    fabric: "ابریشم",
    dimensions: "140X140",
    colors: [{ label: "کلاسیک", hex: "#E2C997" }],
    price: 4750000,
    oldPrice: 5000000,
    quantity: 27,
    badges: ["کالکشن جدید"],
    description: "شال ابریشم توییل کیفیت بشدت خوب.",
    images: [photo("photo-1520006403909-838d6b92c22e")],
  }
];

export default PRODUCTS;
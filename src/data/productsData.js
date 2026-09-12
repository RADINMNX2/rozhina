const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const PLACEHOLDER_IMAGE = photo('photo-1520006403909-838d6b92c22e');

export const FABRICS = [
  "21321"
];

export const COLORS = [
  {
    label: "کرم",
    hex: "#FFFFFF"
  },
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
    name: "123",
    enName: "213",
    fabric: "21321",
    dimensions: "1231321",
    colors: [{ label: "کرم", hex: "#FFFFFF" }, { label: "کلاسیک", hex: "#E2C997" }],
    price: 200,
    oldPrice: 233,
    quantity: 4,
    badges: badges: ["دست‌دوز"],
    description: "1231321",
    images: images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzcugoRJ727QPykGR5_2RHRrfRXoLL3o2WjLlvWfuGOw&s=10"],
  }
];

export default PRODUCTS;
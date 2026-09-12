const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const PLACEHOLDER_IMAGE = photo('photo-1520006403909-838d6b92c22e');

export const FABRICS = [];

export const COLORS = [];

const BADGE_STYLES = {
  'دست‌دوز': 'bg-gold text-espresso',
  'کالکشن جدید': 'bg-espresso text-alabaster',
  'تنها': 'bg-terracotta text-alabaster',
};

export const badgeStyle = (label) =>
  BADGE_STYLES[Object.keys(BADGE_STYLES).find((key) => label.includes(key))] || 'bg-espresso text-alabaster';

export const PRODUCTS = [

];

export default PRODUCTS;
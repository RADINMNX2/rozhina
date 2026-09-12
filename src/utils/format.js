const FA_DIGITS = {
  0: '۰',
  1: '۱',
  2: '۲',
  3: '۳',
  4: '۴',
  5: '۵',
  6: '۶',
  7: '۷',
  8: '۸',
  9: '۹',
};

export const toFa = (value) => String(value ?? '').replace(/[0-9]/g, (d) => FA_DIGITS[d]);

export const formatPrice = (amount) => {
  const rounded = Math.round(Number(amount) || 0);
  const grouped = String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
  return toFa(grouped);
};

export const toToman = (amount) => `${formatPrice(amount)} تومان`;
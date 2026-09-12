import { formatPrice, toFa } from './format';

export const buildOrderMessage = (items) => {
  const lines = items.map(({ product, qty }) => `- ${product.name} × ${toFa(qty)}`);
  return [
    'سلام به گالری روژینا! سفارش جدید دارم:',
    ...lines,
    `مجموع فاکتور: ${formatPrice(items.reduce((sum, i) => sum + i.qty * i.product.price, 0))} تومان`,
    'لطفاً شماره کارت و هماهنگی ارسال را بفرمایید.',
  ].join('\n');
};

export const buildWhatsAppLink = (message, number) =>
  `https://wa.me/${String(number).replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
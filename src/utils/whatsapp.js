import { formatPrice } from './format';
import { t } from './text';

export const buildOrderMessage = (items, content) => {
  const c = content.whatsapp ?? {};
  const lines = items.map(({ product, qty }) =>
    t(c.orderLine ?? '- {name} × {qty}', { name: product.name, qty }),
  );
  return [
    c.orderGreeting ?? 'سلام به گالری روژینا! سفارش جدید دارم:',
    ...lines,
    t(c.orderTotal ?? 'مجموع فاکتور: {total} تومان', {
      total: formatPrice(items.reduce((sum, i) => sum + i.qty * i.product.price, 0)),
    }),
    c.orderFooter ?? 'لطفاً شماره کارت و هماهنگی ارسال را بفرمایید.',
  ].join('\n');
};

export const buildWhatsAppLink = (message, number) =>
  `https://wa.me/${String(number).replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
const IDPAY_BASE = 'https://api.idpay.ir/v1.1';
const MIN_AMOUNT_RIALS = 10000;

const json = (data, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...extraHeaders,
    },
  });

const page = (title, bodyHtml) =>
  new Response(
    `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
         background: #0C0B0A; color: #F5F1E8; font-family: Tahoma, sans-serif; }
  .box { max-width: 420px; width: 100%; margin: 24px; padding: 28px; border-radius: 18px;
         border: 1px solid rgba(226,201,151,.25); background: #161412; text-align: center; }
  h1 { font-size: 20px; margin: 0 0 10px; color: #E2C997; }
  p { font-size: 14px; line-height: 1.9; color: #C9C2B5; margin: 0 0 18px; }
  a.btn { display: inline-block; padding: 12px 22px; border-radius: 999px; background: #E2C997;
          color: #0C0B0A; text-decoration: none; font-weight: bold; font-size: 13px; }
  .muted { font-size: 11px; color: #8A8377; margin-top: 16px; }
</style>
</head>
<body>
  <div class="box">${bodyHtml}</div>
</body>
</html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));

const idpayRequest = async (env, path, body) => {
  const res = await fetch(`${IDPAY_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-KEY': env.IDPAY_API_KEY || '',
      'X-SANDBOX': '0',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error_code: res.status, error_message: `خطای پرداخت (${res.status})` };
  }
  return { ok: res.ok, status: res.status, data };
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      } });
    }

    if (url.pathname === '/api/pay' && method === 'POST') {
      try {
        const body = await request.json();
        const amountToman = Math.round(Number(body.amount) || 0);
        const amountRials = amountToman * 10;
        if (amountRials < MIN_AMOUNT_RIALS) {
          return json({ ok: false, error: 'مبلغ کمتر از حداقل مجاز درگاه است' }, 400);
        }
        if (!env.IDPAY_API_KEY) {
          return json({ ok: false, error: 'درگاه هنوز راه‌اندازی نشده است' }, 500);
        }

        const callback = `${url.origin}/api/verify`;
        const orderId = String(body.order_id || `O-${Date.now()}`).slice(0, 50);
        const { ok, status, data } = await idpayRequest(env, '/payment', {
          order_id: orderId,
          amount: amountRials,
          callback,
          name: String(body.name || '').slice(0, 60),
          desc: String(body.desc || '').slice(0, 120),
          payer_mobile: String(body.mobile || '') || undefined,
        });

        if (ok && data.link) {
          return json({ ok: true, order_id: orderId, link: data.link });
        }
        return json({ ok: false, error: data?.error_message || `خطای درگاه (${status})` }, 502);
      } catch (err) {
        return json({ ok: false, error: String(err.message || err) }, 400);
      }
    }

    if (url.pathname === '/api/verify') {
      const trackId = url.searchParams.get('track_id') || '';
      const id = url.searchParams.get('id') || '';
      const orderId = url.searchParams.get('order_id') || '';
      const status = url.searchParams.get('status') || '';

      if (!id || !orderId) {
        return page('خطا', '<h1>پرداخت نامعتبر</h1><p>اطلاعات بازگشتی از درگاه ناقص است. با پشتیبانی فروشگاه تماس بگیرید.</p>');
      }

      if (Number(status) !== 10 && Number(status) !== 100) {
        const whatsappLink = `https://wa.me/${env.WHATSAPP_NUMBER || ''}` +
          `?text=${encodeURIComponent(`سلام، سفارش ${esc(orderId)} را نتوانستم پرداخت کنم. آیا دوباره تلاش کنم؟`)}`;
        return page('پرداخت انجام نشد',
          `<h1>پرداخت انجام نشد</h1>
           <p>سفارش <b>${esc(orderId)}</b> پرداخت نشده است. می‌توانید دوباره تلاش کنید یا با ما در واتس‌اپ در تماس باشید.</p>
           <a class="btn" href="https://rozhina.ir/">بازگشت به فروشگاه</a>
           <a class="btn" style="background:#25D366;color:#fff" href="${whatsappLink}">پیام در واتس‌اپ</a>`);
      }

      const { ok, data } = await idpayRequest(env, '/payment/verify', { id, order_id: orderId });

      let paid = ok && Number(data.status) === 100;
      const amountShown = data.amount ? `${Math.round(Number(data.amount) / 10).toLocaleString('fa-IR')} تومان` : '';

      if (paid) {
        const whatsappLink = `https://wa.me/${env.WHATSAPP_NUMBER || ''}` +
          `?text=${encodeURIComponent(`سلام، سفارش ${esc(orderId)} را پرداخت کردم (${amountShown}).`)}`;
        return page('پرداخت موفق',
          `<h1>${env.SHOP_NAME || 'فروشگاه'}</h1>
           <p>پرداخت سفارش <b>${esc(orderId)}</b> با موفقیت انجام شد<br/>${amountShown}</p>
           <a class="btn" href="https://rozhina.ir/">بازگشت به فروشگاه</a>
           <a class="btn" style="background:#25D366;color:#fff" href="${whatsappLink}">ثبت در واتس‌اپ</a>
           <p class="muted">شماره پیگیری: ${esc(trackId)}</p>`);
      }

      return page('در انتظار تأیید',
        `<h1>پرداخت دریافت شده</h1>
         <p>سفارش <b>${esc(orderId)}</b> در حال بررسی است. در صورت نیاز با پشتیبانی در تماس باشید.</p>
         <a class="btn" href="https://rozhina.ir/">بازگشت به فروشگاه</a>`);
    }

    return json({ ok: false, error: 'not found' }, 404);
  },
};
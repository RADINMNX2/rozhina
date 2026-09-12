const FALLBACK_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='#8C827A'/>
      <stop offset='1' stop-color='#3C3A39'/>
    </linearGradient>
    <pattern id='p' width='40' height='40' patternUnits='userSpaceOnUse'>
      <circle cx='20' cy='20' r='1.2' fill='#D4AF37' opacity='0.35'/>
    </pattern>
  </defs>
  <rect width='600' height='800' fill='url(#g)'/>
  <rect width='600' height='800' fill='url(#p)'/>
  <text x='300' y='418' font-family='Cinzel, Georgia, serif' font-size='46' font-weight='700' fill='#D4AF37' text-anchor='middle'>ROZHINA</text>
  <text x='300' y='452' font-family='Cinzel, Georgia, serif' font-size='13' letter-spacing='7' fill='#FAF8F5' text-anchor='middle'>BOUTIQUE SCARF</text>
</svg>`;

export const LUX_FALLBACK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(FALLBACK_SVG)}`;

export const withImageFallback = (event) => {
  const el = event.currentTarget;
  if (el?.dataset?.fallback) return;
  el.dataset.fallback = '1';
  el.onerror = null;
  el.src = LUX_FALLBACK_IMAGE;
};
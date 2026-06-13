/* ── CornerStone Dynamic Pricing Engine ── */
const priceConfig = {
  starter: { USD: 60, EUR: 55, GBP: 45, CHF: 55, CAD: 80, AUD: 90 },
  professional: { USD: 190, EUR: 175, GBP: 145, CHF: 170, CAD: 260, AUD: 285 },
  overhaul: { USD: 300, EUR: 275, GBP: 230, CHF: 270, CAD: 410, AUD: 450 },
  ada: { USD: 90, EUR: 80, GBP: 70, CHF: 80, CAD: 125, AUD: 135 },
  speed: { USD: 150, EUR: 140, GBP: 115, CHF: 135, CAD: 205, AUD: 225 },
  cms: { USD: 250, EUR: 230, GBP: 190, CHF: 225, CAD: 340, AUD: 375 },
  crm: { USD: 290, EUR: 265, GBP: 220, CHF: 260, CAD: 395, AUD: 435 },
  audit: { USD: 190, EUR: 175, GBP: 145, CHF: 170, CAD: 260, AUD: 285 }
};

async function updatePricing() {
  let currency = 'USD';
  let symbol = '$';

  try {
    const res = await fetch('https://ipapi.co/currency/');
    if (res.ok) {
      const detected = (await res.text()).trim();
      if (['USD', 'EUR', 'GBP', 'CHF', 'CAD', 'AUD'].includes(detected)) {
        currency = detected;
      }
    }
  } catch (e) {
    const locale = navigator.language || '';
    if (locale.startsWith('en-GB')) { currency = 'GBP'; }
    else if (locale.startsWith('fr') || locale.startsWith('de')) { currency = 'EUR'; }
    else if (locale.startsWith('en-AU')) { currency = 'AUD'; }
    else if (locale.startsWith('en-CA') || locale.startsWith('fr-CA')) { currency = 'CAD'; }
  }

  const symbols = { USD: '$', EUR: '€', GBP: '£', CHF: 'CHF\u00a0', CAD: 'CA$', AUD: 'A$' };
  symbol = symbols[currency] || '$';

  document.querySelectorAll('[data-price]').forEach(function(el) {
    const plan = el.getAttribute('data-price');
    if (priceConfig[plan]) {
      const finalPrice = priceConfig[plan][currency] || priceConfig[plan]['USD'];
      el.textContent = symbol + finalPrice;
    }
  });

  document.querySelectorAll('[data-price-from]').forEach(function(el) {
    const plan = el.getAttribute('data-price-from');
    if (priceConfig[plan]) {
      const finalPrice = priceConfig[plan][currency] || priceConfig[plan]['USD'];
      el.textContent = 'From ' + symbol + finalPrice;
    }
  });
}

window.addEventListener('DOMContentLoaded', updatePricing);

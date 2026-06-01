// Server-side menu/pricing — single source of truth shared with the frontend.
// The frontend fetches qr-menu/menu.json; the function require()s the same file,
// so prices can NEVER be trusted from the client — the server recomputes everything.

const menu = require('../qr-menu/menu.json');

// Flat index: dish id → item record
const INDEX = {};
menu.categories.forEach((cat) => {
  cat.items.forEach((it) => {
    INDEX[it.id] = it;
  });
});

// Resolve the chosen variant (or the default first one) → { label, price }
function resolvePrice(it, variantLabel) {
  if (it.variants && it.variants.length) {
    const v = variantLabel ? it.variants.find((x) => x.label === variantLabel) : null;
    return v || it.variants[0];
  }
  return { label: '', price: it.price || 0 };
}

// items: [{ id, qty, variant? }] → fully recomputed order (throws on bad input)
function buildOrder(items) {
  if (!Array.isArray(items) || !items.length) throw new Error('EMPTY');
  const out = [];
  for (const i of items) {
    const it = INDEX[i && i.id];
    if (!it) throw new Error('UNKNOWN_ITEM');
    if (it.available === false) throw new Error('UNKNOWN_ITEM'); // 86'd — refuse, don't silently serve
    // Reject out-of-range quantities instead of silently clamping — otherwise the
    // kitchen ticket would diverge from what the guest reviewed on their phone.
    const qty = parseInt(i.qty, 10);
    if (!Number.isFinite(qty) || qty < 1 || qty > 99) throw new Error('UNKNOWN_ITEM');
    const v = resolvePrice(it, i.variant);
    out.push({ id: it.id, name: it.n, variant: v.label || '', unit: v.price || 0, qty });
  }
  if (!out.length) throw new Error('EMPTY');

  const subtotal = out.reduce((s, x) => s + x.unit * x.qty, 0);
  const tax = Math.round(subtotal * (menu.taxRate || 0));
  const service = Math.round(subtotal * (menu.serviceRate || 0));
  const total = subtotal + tax + service;
  return { items: out, subtotal, tax, service, total, currency: menu.currency || 'IDR' };
}

module.exports = { buildOrder, resolvePrice, INDEX, menu };

// POST /api/order — receive a table order, recompute the total server-side,
// notify the waiters' Telegram chat. Stateless: the order lives in the Telegram
// message (no DB). Vercel Serverless Function (Node), sits next to the static site.

const { buildOrder } = require('../lib/menu');
const { formatOrderMessage, orderKeyboard, sendOrder } = require('../lib/telegram');
const { rateLimited, clientIp, sanitize, sanitizeTable, parseBody } = require('../lib/http');

// Short human-readable id (e.g. "A3F9"). No DB — it only needs to be unique-ish
// within the waiters' chat so they can refer to an order out loud.
function genId() {
  // Time-seeded so two near-simultaneous orders don't share an id in the waiters' chat.
  const t = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).replace(/[^a-z0-9]/gi, '').toUpperCase();
  return (t.slice(-3) + r + 'XX').slice(0, 5);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, message: 'Method not allowed' });
    return;
  }
  // Anti-flood backstop per IP (a whole venue shares one NAT, so keep this loose);
  // the tighter per-table limit is applied below once we know the table.
  if (rateLimited('order:ip:' + clientIp(req), 30, 60_000)) {
    res.status(429).json({ ok: false, message: 'Too many orders — wait a minute and try again.' });
    return;
  }

  const body = parseBody(req);
  if (!body) {
    res.status(400).json({ ok: false, message: 'Bad request.' });
    return;
  }
  // Honeypot: real clients leave _hp empty. Bots that fill every field get a
  // silent 200 so they don't learn they were filtered.
  if (body._hp) {
    res.status(200).json({ ok: true, id: 'OK' });
    return;
  }

  const table = sanitizeTable(body.table);
  const name = sanitize(body.name, 80);
  const note = sanitize(body.note, 300);
  const items = Array.isArray(body.items) ? body.items.slice(0, 80) : [];

  // Per-table limit: one table shouldn't fire 6+ orders a minute, and unlike an IP
  // limit it isn't shared across the whole venue's NAT.
  if (table && rateLimited('order:t:' + table, 6, 60_000)) {
    res.status(429).json({ ok: false, message: 'This table just ordered — give it a minute, or call a waiter.' });
    return;
  }

  let order;
  try {
    order = buildOrder(items);
  } catch (e) {
    const msg = e && e.message;
    res.status(400).json({
      ok: false,
      message: msg === 'EMPTY' ? 'Your order is empty.' : 'Some items are unavailable — please refresh the menu.',
    });
    return;
  }

  // Distinguish "not set up" (permanent misconfig) from a transient outage, so a
  // missing env var doesn't masquerade as "couldn't reach the kitchen" on every order.
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    console.error('[order] not configured — missing TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID');
    res.status(502).json({ ok: false, message: 'Ordering isn’t set up yet — please call a waiter.' });
    return;
  }

  const id = genId();
  // Bali time (UTC+8) so the kitchen ticket shows when it was placed.
  const time = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(11, 16);
  const text = formatOrderMessage({ id, table, time, ...order, name, note, status: 'new' });

  const sent = await sendOrder(process.env.TELEGRAM_CHAT_ID, text, orderKeyboard(id, 'new'));
  if (!sent.ok) {
    // Do NOT pretend success — the guest must know it didn't reach the kitchen.
    console.error('[order] telegram send failed:', sent.error);
    res.status(502).json({ ok: false, message: 'Couldn’t reach the kitchen — please call a waiter.' });
    return;
  }

  res.status(200).json({ ok: true, id });
};

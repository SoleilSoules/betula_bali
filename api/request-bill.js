// POST /api/request-bill — guest asks for the bill; pings the waiters' Telegram chat.
// Stateless, same pattern as /api/call-waiter. Optional payment method hint.

const { tg, escapeHtml } = require('../lib/telegram');
const { rateLimited, clientIp, sanitize, sanitizeTable, parseBody } = require('../lib/http');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, message: 'Method not allowed' });
    return;
  }
  if (rateLimited('bill:' + clientIp(req), 4, 60_000)) {
    res.status(429).json({ ok: false, message: 'Just a moment — the bill was already requested.' });
    return;
  }

  const body = parseBody(req);
  if (!body) {
    res.status(400).json({ ok: false, message: 'Bad request.' });
    return;
  }
  if (body._hp) {
    res.status(200).json({ ok: true });
    return;
  }

  const table = sanitizeTable(body.table);
  const method = sanitize(body.method, 12); // optional: cash / card / QRIS
  const text =
    (table ? `🧾 <b>Table ${escapeHtml(table)}</b> requests the bill` : `🧾 A guest requests the bill <i>(no table)</i>`) +
    (method ? ` — ${escapeHtml(method)}` : '');

  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    res.status(502).json({ ok: false, message: 'Service not configured yet.' });
    return;
  }
  const r = await tg('sendMessage', { chat_id: process.env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' });
  if (!r.ok) {
    console.warn('[request-bill] telegram send failed:', r.error);
    res.status(502).json({ ok: false, message: 'Couldn’t reach staff — please wave to a waiter.' });
    return;
  }
  res.status(200).json({ ok: true });
};

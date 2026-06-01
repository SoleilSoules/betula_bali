// Telegram Bot API helpers — plain Node (global fetch, Node 18+), zero deps.
// The bot token lives ONLY in the Vercel env var TELEGRAM_BOT_TOKEN — never in the repo.

const STATUS_LABEL = {
  new: '🆕 New',
  in_progress: '👨‍🍳 Cooking',
  ready: '✅ Ready',
};

function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

function fmt(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// order: { id, table, items:[{name,variant,unit,qty}], subtotal, tax, service, total, name, note, status }
function formatOrderMessage(order) {
  const status = order.status || 'new';
  const lines = [
    `<b>${STATUS_LABEL[status] || '🆕 New'} order — Bali Betula</b>`,
    `№ <code>${escapeHtml(order.id)}</code>` +
      (order.table ? ` · <b>Table ${escapeHtml(order.table)}</b>` : ' · <i>no table (takeaway?)</i>') +
      (order.time ? ` · ⏰ ${escapeHtml(order.time)}` : ''),
    '',
    ...order.items.map(
      (it) =>
        `• ${escapeHtml(it.name)}${it.variant ? ` (${escapeHtml(it.variant)})` : ''} × ${it.qty} — ${fmt(it.unit * it.qty)} IDR`,
    ),
    '',
    `Subtotal: ${fmt(order.subtotal)} IDR`,
    `Tax + service: ${fmt(order.tax + order.service)} IDR`,
    `<b>Total: ${fmt(order.total)} IDR</b>`,
  ];
  if (order.name) lines.push(`Guest: ${escapeHtml(order.name)}`);
  if (order.note) lines.push(`Note: ${escapeHtml(order.note)}`);
  return lines.join('\n');
}

// Inline buttons step the order along: new → accept → ready. Then no buttons.
function orderKeyboard(orderId, status) {
  if (status === 'new')
    return { inline_keyboard: [[{ text: '✅ Accept', callback_data: `o:${orderId}:in_progress` }]] };
  if (status === 'in_progress')
    return { inline_keyboard: [[{ text: '🍳 Ready', callback_data: `o:${orderId}:ready` }]] };
  return undefined;
}

async function tg(method, payload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: 'TELEGRAM_BOT_TOKEN not set' };
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) return { ok: false, error: `Telegram ${res.status}: ${data.description || ''}` };
    return { ok: true, result: data.result };
  } catch (e) {
    return { ok: false, error: (e && e.message) || 'network error' };
  }
}

async function sendOrder(chatId, text, replyMarkup) {
  if (!chatId) return { ok: false, error: 'TELEGRAM_CHAT_ID not set' };
  const r = await tg('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
  return { ok: r.ok, messageId: r.result && r.result.message_id, error: r.error };
}

async function editMessage(chatId, messageId, text, replyMarkup) {
  return tg('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: replyMarkup || { inline_keyboard: [] },
  });
}

async function answerCallback(callbackQueryId, text, showAlert) {
  return tg('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    ...(text ? { text } : {}),
    ...(showAlert ? { show_alert: true } : {}),
  });
}

module.exports = {
  STATUS_LABEL,
  escapeHtml,
  fmt,
  formatOrderMessage,
  orderKeyboard,
  tg,
  sendOrder,
  editMessage,
  answerCallback,
};

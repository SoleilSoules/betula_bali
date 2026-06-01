// POST /api/telegram-webhook — receives Telegram callback_query when a waiter taps
// the inline button on an order, and steps the order's status by editing the message.
// No DB: the status lives in the message text itself.
//
// Register once (after deploy):
//   https://api.telegram.org/bot<TOKEN>/setWebhook
//     ?url=https://balibetula.com/api/telegram-webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>

const { editMessage, answerCallback, escapeHtml } = require('../lib/telegram');
const { parseBody } = require('../lib/http');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false });
    return;
  }
  // Telegram echoes this header when a secret_token was set on the webhook.
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers['x-telegram-bot-api-secret-token'] !== secret) {
    res.status(401).json({ ok: false });
    return;
  }

  const body = parseBody(req);
  const cq = body && body.callback_query;
  if (!cq) {
    // Not a button tap (other update types) — ack and ignore.
    res.status(200).json({ ok: true });
    return;
  }

  const m = /^o:([A-Za-z0-9]+):(in_progress|ready)$/.exec(cq.data || '');
  if (!m || !cq.message) {
    await answerCallback(cq.id);
    res.status(200).json({ ok: true });
    return;
  }

  const id = m[1];
  const status = m[2];
  const label = status === 'in_progress' ? '👨‍🍳 Cooking' : '✅ Ready';

  // Rebuild the message: swap the status header line, keep the rest (plain → escaped).
  const lines = (cq.message.text || '').split('\n');
  lines.shift(); // drop the old "🆕 New order — Bali Betula" header
  const rest = escapeHtml(lines.join('\n')).replace(/^\n+/, '');
  const newText = `<b>${label} — Bali Betula</b>\n${rest}`;

  const keyboard =
    status === 'in_progress'
      ? { inline_keyboard: [[{ text: '🍳 Ready', callback_data: `o:${id}:ready` }]] }
      : { inline_keyboard: [] };

  const edited = await editMessage(cq.message.chat.id, cq.message.message_id, newText, keyboard);
  // "message is not modified" means a retried/duplicate tap landed on an already-updated
  // card — that's effectively success, not a failure.
  const okOrSame = edited.ok || /not modified/i.test(edited.error || '');
  if (!okOrSame) {
    console.error('[webhook] editMessage failed:', edited.error);
    // The blocking alert is the only feedback channel to the waiter on a failed tap.
    await answerCallback(cq.id, '⚠️ Couldn’t update — tap again', true);
    res.status(200).json({ ok: false });
    return;
  }

  const acked = await answerCallback(cq.id, status === 'in_progress' ? 'Accepted ✅' : 'Marked ready 🍳');
  if (!acked.ok) console.warn('[webhook] answerCallback failed:', acked.error);

  res.status(200).json({ ok: true });
};

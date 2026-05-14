type OrderForNotification = {
  id: string;
  total: number;
  currency: string;
  customerName: string | null;
  customerPhone: string | null;
  note: string | null;
  tableLabel: string | null;
  items: { name: string; quantity: number; price: number }[];
};

function priceFmt(n: number, currency: string) {
  if (currency === "RUB") return `${n.toLocaleString("ru-RU")} ₽`;
  return `${n} ${currency}`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] ?? c));
}

export function formatOrderMessage(restaurantName: string, order: OrderForNotification) {
  const lines = [
    `<b>Новый заказ — ${escapeHtml(restaurantName)}</b>`,
    `№ <code>${order.id.slice(-4).toUpperCase()}</code>${order.tableLabel ? ` · ${escapeHtml(order.tableLabel)}` : ""}`,
    "",
    ...order.items.map(
      (it) =>
        `• ${escapeHtml(it.name)} × ${it.quantity} — ${priceFmt(it.price * it.quantity, order.currency)}`,
    ),
    "",
    `<b>Итого: ${priceFmt(order.total, order.currency)}</b>`,
  ];
  if (order.customerName) lines.push(`Гость: ${escapeHtml(order.customerName)}`);
  if (order.customerPhone) lines.push(`Телефон: ${escapeHtml(order.customerPhone)}`);
  if (order.note) lines.push(`Комментарий: ${escapeHtml(order.note)}`);
  return lines.join("\n");
}

export async function sendTelegramNotification(
  chatId: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: "TELEGRAM_BOT_TOKEN не задан" };
  if (!chatId) return { ok: false, error: "chatId не задан" };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Telegram ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network error" };
  }
}

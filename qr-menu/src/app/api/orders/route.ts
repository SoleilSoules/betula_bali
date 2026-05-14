import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { PlaceOrderSchema } from "@/lib/validators";
import { formatOrderMessage, sendTelegramNotification } from "@/lib/telegram";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const ORDER_RATE_LIMIT = 10;
const ORDER_RATE_WINDOW_MS = 60_000;

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rl = checkRateLimit(`orders:${ip}`, ORDER_RATE_LIMIT, ORDER_RATE_WINDOW_MS);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, message: "Слишком много заказов. Подождите минуту и попробуйте снова." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Некорректный JSON" }, { status: 400 });
  }

  const parsed = PlaceOrderSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Проверьте данные";
    return NextResponse.json({ ok: false, message: first }, { status: 400 });
  }

  const { restaurantSlug, tableToken, customerName, customerPhone, note, items } = parsed.data;

  const restaurant = await db.restaurant.findUnique({
    where: { slug: restaurantSlug },
  });
  if (!restaurant) {
    return NextResponse.json({ ok: false, message: "Заведение не найдено" }, { status: 404 });
  }
  if (!restaurant.isPublished) {
    return NextResponse.json({ ok: false, message: "Меню сейчас недоступно" }, { status: 409 });
  }

  const table = tableToken
    ? await db.table.findFirst({
        where: { qrToken: tableToken, restaurantId: restaurant.id },
      })
    : null;

  if (tableToken && !table) {
    return NextResponse.json(
      { ok: false, message: "Этот QR не принадлежит заведению. Отсканируйте код со стола заново." },
      { status: 409 },
    );
  }

  type CreatedOrder = Awaited<ReturnType<typeof createOrderInTx>>;
  let order: CreatedOrder;
  try {
    order = await db.$transaction(async (tx) => createOrderInTx(tx, {
      restaurantId: restaurant.id,
      tableId: table?.id ?? null,
      items,
      customerName,
      customerPhone,
      note,
    }));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Не удалось оформить заказ";
    if (msg === "DISH_UNAVAILABLE") {
      return NextResponse.json(
        { ok: false, message: "Некоторые блюда сейчас недоступны. Обновите страницу." },
        { status: 409 },
      );
    }
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }

  if (restaurant.telegramChatId && process.env.TELEGRAM_BOT_TOKEN) {
    const message = formatOrderMessage(restaurant.name, {
      id: order.id,
      total: order.total,
      currency: restaurant.currency,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      note: order.note,
      tableLabel: table?.label ?? null,
      items: order.items.map((it) => ({
        name: it.dishName,
        quantity: it.quantity,
        price: it.priceAtOrder,
      })),
    });
    const result = await sendTelegramNotification(restaurant.telegramChatId, message);
    if (!result.ok) {
      console.warn(`[orders] Telegram notify failed`);
    }
  }

  return NextResponse.json({ ok: true, orderId: order.id });
}

type TxClient = Parameters<Parameters<typeof db.$transaction>[0]>[0];

async function createOrderInTx(
  tx: TxClient,
  input: {
    restaurantId: string;
    tableId: string | null;
    items: { dishId: string; quantity: number }[];
    customerName?: string;
    customerPhone?: string;
    note?: string;
  },
) {
  const dishIds = input.items.map((i) => i.dishId);
  const dishes = await tx.dish.findMany({
    where: { id: { in: dishIds }, restaurantId: input.restaurantId, isAvailable: true },
  });
  const dishById = new Map(dishes.map((d) => [d.id, d]));
  if (input.items.some((i) => !dishById.has(i.dishId))) {
    throw new Error("DISH_UNAVAILABLE");
  }

  const total = input.items.reduce((sum, i) => {
    const d = dishById.get(i.dishId)!;
    return sum + d.price * i.quantity;
  }, 0);

  return tx.order.create({
    data: {
      restaurantId: input.restaurantId,
      tableId: input.tableId,
      total,
      customerName: input.customerName || null,
      customerPhone: input.customerPhone || null,
      note: input.note || null,
      items: {
        create: input.items.map((i) => {
          const d = dishById.get(i.dishId)!;
          return {
            dishId: d.id,
            dishName: d.name,
            priceAtOrder: d.price,
            quantity: i.quantity,
          };
        }),
      },
    },
    include: { items: true },
  });
}

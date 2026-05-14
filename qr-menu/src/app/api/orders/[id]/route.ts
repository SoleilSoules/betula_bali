import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

const CANCEL_WINDOW_MS = 90_000;

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/orders/[id]">,
) {
  const { id } = await ctx.params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      restaurant: { select: { slug: true, currency: true } },
    },
  });
  if (!order) {
    return NextResponse.json({ ok: false, message: "Заказ не найден" }, { status: 404 });
  }

  const ageMs = Date.now() - order.createdAt.getTime();
  const canCancel = order.status === "new" && ageMs < CANCEL_WINDOW_MS;

  return NextResponse.json({
    ok: true,
    order: {
      id: order.id,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      restaurantSlug: order.restaurant.slug,
      currency: order.restaurant.currency,
      items: order.items.map((it) => ({
        id: it.id,
        name: it.dishName,
        price: it.priceAtOrder,
        quantity: it.quantity,
      })),
      canCancel,
      cancelDeadlineAt: new Date(order.createdAt.getTime() + CANCEL_WINDOW_MS).toISOString(),
    },
  });
}

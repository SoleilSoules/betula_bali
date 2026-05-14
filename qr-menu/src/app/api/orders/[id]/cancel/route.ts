import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

const CANCEL_WINDOW_MS = 90_000;

export async function POST(
  _req: Request,
  ctx: RouteContext<"/api/orders/[id]/cancel">,
) {
  const { id } = await ctx.params;
  const order = await db.order.findUnique({
    where: { id },
    include: { restaurant: { select: { slug: true } } },
  });
  if (!order) {
    return NextResponse.json({ ok: false, message: "Заказ не найден" }, { status: 404 });
  }
  if (order.status !== "new") {
    return NextResponse.json(
      { ok: false, message: "Заказ уже взят в работу — попросите официанта отменить." },
      { status: 409 },
    );
  }
  const ageMs = Date.now() - order.createdAt.getTime();
  if (ageMs >= CANCEL_WINDOW_MS) {
    return NextResponse.json(
      { ok: false, message: "Время отмены вышло. Попросите официанта." },
      { status: 409 },
    );
  }

  await db.order.update({
    where: { id },
    data: { status: "cancelled" },
  });
  revalidatePath(`/dashboard/r/${order.restaurant.slug}/orders`);
  revalidatePath(`/dashboard/r/${order.restaurant.slug}`);
  return NextResponse.json({ ok: true });
}

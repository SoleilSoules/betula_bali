"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOwnedRestaurantById } from "@/lib/access";
import { OrderStatusSchema } from "@/lib/validators";
import type { ActionResult } from "@/lib/forms";

export async function updateOrderStatusAction(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const restaurantId = String(formData.get("restaurantId") ?? "");
  const status = OrderStatusSchema.parse(formData.get("status"));
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  await db.order.update({
    where: { id, restaurantId },
    data: { status },
  });
  revalidatePath(`/dashboard/r/${restaurant.slug}/orders`);
  revalidatePath(`/dashboard/r/${restaurant.slug}`);
  return { ok: true };
}

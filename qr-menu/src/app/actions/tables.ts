"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { requireOwnedRestaurantById } from "@/lib/access";
import { TableSchema } from "@/lib/validators";
import type { ActionResult } from "@/lib/forms";

export async function createTableAction(formData: FormData): Promise<ActionResult> {
  const restaurantId = String(formData.get("restaurantId") ?? "");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  const parsed = TableSchema.safeParse({ label: formData.get("label") ?? "" });
  if (!parsed.success) return { ok: false, message: "Введите название столика" };
  await db.table.create({
    data: { label: parsed.data.label, restaurantId },
  });
  revalidatePath(`/dashboard/r/${restaurant.slug}/tables`);
  return { ok: true };
}

export async function deleteTableAction(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const restaurantId = String(formData.get("restaurantId") ?? "");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  await db.table.delete({ where: { id, restaurantId } });
  revalidatePath(`/dashboard/r/${restaurant.slug}/tables`);
  return { ok: true };
}

export async function regenerateTableTokenAction(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const restaurantId = String(formData.get("restaurantId") ?? "");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  await db.table.update({
    where: { id, restaurantId },
    data: { qrToken: randomUUID() },
  });
  revalidatePath(`/dashboard/r/${restaurant.slug}/tables`);
  return { ok: true };
}

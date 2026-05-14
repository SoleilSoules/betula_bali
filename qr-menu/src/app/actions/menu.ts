"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOwnedRestaurantById } from "@/lib/access";
import { CategorySchema, DishSchema } from "@/lib/validators";
import type { ActionResult } from "@/lib/forms";

export type { ActionResult } from "@/lib/forms";

function refresh(slug: string) {
  revalidatePath(`/dashboard/r/${slug}/menu`);
  revalidatePath(`/dashboard/r/${slug}`);
  revalidatePath(`/r/${slug}`);
}

export async function createCategoryAction(formData: FormData): Promise<ActionResult> {
  const restaurantId = String(formData.get("restaurantId") ?? "");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  const parsed = CategorySchema.safeParse({ name: formData.get("name") ?? "" });
  if (!parsed.success) return { ok: false, message: "Введите название категории" };
  const max = await db.category.aggregate({
    where: { restaurantId },
    _max: { sort: true },
  });
  await db.category.create({
    data: {
      name: parsed.data.name,
      restaurantId,
      sort: (max._max.sort ?? -1) + 1,
    },
  });
  refresh(restaurant.slug);
  return { ok: true };
}

export async function renameCategoryAction(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const restaurantId = String(formData.get("restaurantId") ?? "");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  const parsed = CategorySchema.safeParse({ name: formData.get("name") ?? "" });
  if (!parsed.success) return { ok: false, message: "Название не подходит" };
  await db.category.update({
    where: { id, restaurantId },
    data: { name: parsed.data.name },
  });
  refresh(restaurant.slug);
  return { ok: true };
}

export async function deleteCategoryAction(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const restaurantId = String(formData.get("restaurantId") ?? "");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  await db.category.delete({ where: { id, restaurantId } });
  refresh(restaurant.slug);
  return { ok: true };
}

export async function createDishAction(formData: FormData): Promise<ActionResult> {
  const restaurantId = String(formData.get("restaurantId") ?? "");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  const parsed = DishSchema.safeParse({
    categoryId: formData.get("categoryId") ?? "",
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    price: formData.get("price") ?? 0,
    photoUrl: formData.get("photoUrl") ?? "",
    isAvailable: formData.get("isAvailable") === "on" || formData.get("isAvailable") === "true",
  });
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const cat = await db.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!cat || cat.restaurantId !== restaurantId) {
    return { ok: false, message: "Категория не найдена" };
  }
  const max = await db.dish.aggregate({
    where: { categoryId: parsed.data.categoryId },
    _max: { sort: true },
  });
  await db.dish.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      photoUrl: parsed.data.photoUrl || null,
      isAvailable: parsed.data.isAvailable,
      sort: (max._max.sort ?? -1) + 1,
      categoryId: parsed.data.categoryId,
      restaurantId,
    },
  });
  refresh(restaurant.slug);
  return { ok: true };
}

export async function updateDishAction(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const restaurantId = String(formData.get("restaurantId") ?? "");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  const parsed = DishSchema.safeParse({
    categoryId: formData.get("categoryId") ?? "",
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    price: formData.get("price") ?? 0,
    photoUrl: formData.get("photoUrl") ?? "",
    isAvailable: formData.get("isAvailable") === "on" || formData.get("isAvailable") === "true",
  });
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  await db.dish.update({
    where: { id, restaurantId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      photoUrl: parsed.data.photoUrl || null,
      isAvailable: parsed.data.isAvailable,
      categoryId: parsed.data.categoryId,
    },
  });
  refresh(restaurant.slug);
  return { ok: true };
}

export async function toggleDishAvailabilityAction(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const restaurantId = String(formData.get("restaurantId") ?? "");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  const dish = await db.dish.findUnique({ where: { id, restaurantId } });
  if (!dish) return { ok: false };
  await db.dish.update({
    where: { id },
    data: { isAvailable: !dish.isAvailable },
  });
  refresh(restaurant.slug);
  return { ok: true };
}

export async function deleteDishAction(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const restaurantId = String(formData.get("restaurantId") ?? "");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  await db.dish.delete({ where: { id, restaurantId } });
  refresh(restaurant.slug);
  return { ok: true };
}

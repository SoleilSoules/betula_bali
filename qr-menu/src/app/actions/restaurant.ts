"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/access";
import { RestaurantSchema, RestaurantDesignSchema } from "@/lib/validators";
import { slugify } from "@/lib/slug";
import type { ActionResult, FormState } from "@/lib/forms";

export type RestaurantFormState = FormState;

export async function createRestaurantAction(
  _prev: RestaurantFormState,
  formData: FormData,
): Promise<RestaurantFormState> {
  const user = await requireUser();

  const rawName = String(formData.get("name") ?? "");
  const rawSlug = String(formData.get("slug") ?? "") || slugify(rawName);

  const parsed = RestaurantSchema.safeParse({
    name: rawName,
    slug: rawSlug,
    description: formData.get("description") ?? "",
    address: formData.get("address") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const taken = await db.restaurant.findUnique({ where: { slug: parsed.data.slug } });
  if (taken) {
    return { ok: false, message: "Этот адрес уже занят. Выберите другой." };
  }

  const restaurant = await db.restaurant.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      address: parsed.data.address || null,
      ownerId: user.id,
    },
  });

  await db.category.create({
    data: { name: "Главное меню", restaurantId: restaurant.id },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/r/${restaurant.slug}`);
}

export async function updateRestaurantDesignAction(
  slug: string,
  _prev: RestaurantFormState,
  formData: FormData,
): Promise<RestaurantFormState> {
  const user = await requireUser();

  const parsed = RestaurantDesignSchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
    address: formData.get("address") ?? "",
    primaryColor: formData.get("primaryColor") ?? "#0F172A",
    theme: formData.get("theme") ?? "modern",
    logoUrl: formData.get("logoUrl") ?? "",
    telegramChatId: formData.get("telegramChatId") ?? "",
    googleMapsUrl: formData.get("googleMapsUrl") ?? "",
    instagramUrl: formData.get("instagramUrl") ?? "",
    whatsappPhone: formData.get("whatsappPhone") ?? "",
    bookingMessage: formData.get("bookingMessage") ?? "",
    mainMenuPdfUrl: formData.get("mainMenuPdfUrl") ?? "",
    specialMenuPdfUrl: formData.get("specialMenuPdfUrl") ?? "",
    isPublished: formData.get("isPublished") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const restaurant = await db.restaurant.findUnique({ where: { slug } });
  if (!restaurant || restaurant.ownerId !== user.id) {
    return { ok: false, message: "Не найдено" } satisfies ActionResult;
  }

  await db.restaurant.update({
    where: { id: restaurant.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      address: parsed.data.address || null,
      primaryColor: parsed.data.primaryColor,
      theme: parsed.data.theme,
      logoUrl: parsed.data.logoUrl || null,
      telegramChatId: parsed.data.telegramChatId || null,
      googleMapsUrl: parsed.data.googleMapsUrl || null,
      instagramUrl: parsed.data.instagramUrl || null,
      whatsappPhone: parsed.data.whatsappPhone || null,
      bookingMessage: parsed.data.bookingMessage || null,
      mainMenuPdfUrl: parsed.data.mainMenuPdfUrl || null,
      specialMenuPdfUrl: parsed.data.specialMenuPdfUrl || null,
      isPublished: parsed.data.isPublished,
    },
  });

  revalidatePath(`/dashboard/r/${slug}`);
  revalidatePath(`/r/${slug}`);
  return { ok: true, message: "Сохранено" };
}

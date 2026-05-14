"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOwnedRestaurantById } from "@/lib/access";
import {
  HighlightSchema,
  EventSchema,
  OfferingSchema,
  InstagramPostSchema,
} from "@/lib/validators";
import type { ActionResult } from "@/lib/forms";

function refreshShowcase(slug: string, sub: string) {
  revalidatePath(`/dashboard/r/${slug}/${sub}`);
  revalidatePath(`/dashboard/r/${slug}`);
  revalidatePath(`/r/${slug}`);
}

function fdString(fd: FormData, key: string) {
  return String(fd.get(key) ?? "");
}

async function nextSort<T extends { sort: number }>(items: T[]) {
  return items.length === 0 ? 0 : Math.max(...items.map((i) => i.sort)) + 1;
}

// HIGHLIGHTS

export async function createHighlightAction(fd: FormData): Promise<ActionResult> {
  const restaurantId = fdString(fd, "restaurantId");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  const parsed = HighlightSchema.safeParse({
    name: fdString(fd, "name"),
    description: fdString(fd, "description"),
    photoUrl: fdString(fd, "photoUrl"),
    instagramUrl: fdString(fd, "instagramUrl"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const all = await db.highlight.findMany({ where: { restaurantId }, select: { sort: true } });
  await db.highlight.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      photoUrl: parsed.data.photoUrl || null,
      instagramUrl: parsed.data.instagramUrl || null,
      restaurantId,
      sort: await nextSort(all),
    },
  });
  refreshShowcase(restaurant.slug, "highlights");
  return { ok: true };
}

export async function updateHighlightAction(fd: FormData): Promise<ActionResult> {
  const id = fdString(fd, "id");
  const restaurantId = fdString(fd, "restaurantId");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  const parsed = HighlightSchema.safeParse({
    name: fdString(fd, "name"),
    description: fdString(fd, "description"),
    photoUrl: fdString(fd, "photoUrl"),
    instagramUrl: fdString(fd, "instagramUrl"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  await db.highlight.update({
    where: { id, restaurantId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      photoUrl: parsed.data.photoUrl || null,
      instagramUrl: parsed.data.instagramUrl || null,
    },
  });
  refreshShowcase(restaurant.slug, "highlights");
  return { ok: true };
}

export async function deleteHighlightAction(fd: FormData): Promise<ActionResult> {
  const id = fdString(fd, "id");
  const restaurantId = fdString(fd, "restaurantId");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  await db.highlight.delete({ where: { id, restaurantId } });
  refreshShowcase(restaurant.slug, "highlights");
  return { ok: true };
}

// EVENTS

export async function createEventAction(fd: FormData): Promise<ActionResult> {
  const restaurantId = fdString(fd, "restaurantId");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  const parsed = EventSchema.safeParse({
    title: fdString(fd, "title"),
    description: fdString(fd, "description"),
    whenText: fdString(fd, "whenText"),
    photoUrl: fdString(fd, "photoUrl"),
    whatsappTopic: fdString(fd, "whatsappTopic"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const all = await db.event.findMany({ where: { restaurantId }, select: { sort: true } });
  await db.event.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      whenText: parsed.data.whenText,
      photoUrl: parsed.data.photoUrl || null,
      whatsappTopic: parsed.data.whatsappTopic || null,
      restaurantId,
      sort: await nextSort(all),
    },
  });
  refreshShowcase(restaurant.slug, "events");
  return { ok: true };
}

export async function updateEventAction(fd: FormData): Promise<ActionResult> {
  const id = fdString(fd, "id");
  const restaurantId = fdString(fd, "restaurantId");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  const parsed = EventSchema.safeParse({
    title: fdString(fd, "title"),
    description: fdString(fd, "description"),
    whenText: fdString(fd, "whenText"),
    photoUrl: fdString(fd, "photoUrl"),
    whatsappTopic: fdString(fd, "whatsappTopic"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  await db.event.update({
    where: { id, restaurantId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      whenText: parsed.data.whenText,
      photoUrl: parsed.data.photoUrl || null,
      whatsappTopic: parsed.data.whatsappTopic || null,
    },
  });
  refreshShowcase(restaurant.slug, "events");
  return { ok: true };
}

export async function deleteEventAction(fd: FormData): Promise<ActionResult> {
  const id = fdString(fd, "id");
  const restaurantId = fdString(fd, "restaurantId");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  await db.event.delete({ where: { id, restaurantId } });
  refreshShowcase(restaurant.slug, "events");
  return { ok: true };
}

// OFFERINGS

export async function createOfferingAction(fd: FormData): Promise<ActionResult> {
  const restaurantId = fdString(fd, "restaurantId");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  const parsed = OfferingSchema.safeParse({
    title: fdString(fd, "title"),
    description: fdString(fd, "description"),
    photoUrl: fdString(fd, "photoUrl"),
    whatsappTopic: fdString(fd, "whatsappTopic"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const all = await db.offering.findMany({ where: { restaurantId }, select: { sort: true } });
  await db.offering.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      photoUrl: parsed.data.photoUrl || null,
      whatsappTopic: parsed.data.whatsappTopic || null,
      restaurantId,
      sort: await nextSort(all),
    },
  });
  refreshShowcase(restaurant.slug, "offerings");
  return { ok: true };
}

export async function updateOfferingAction(fd: FormData): Promise<ActionResult> {
  const id = fdString(fd, "id");
  const restaurantId = fdString(fd, "restaurantId");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  const parsed = OfferingSchema.safeParse({
    title: fdString(fd, "title"),
    description: fdString(fd, "description"),
    photoUrl: fdString(fd, "photoUrl"),
    whatsappTopic: fdString(fd, "whatsappTopic"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  await db.offering.update({
    where: { id, restaurantId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      photoUrl: parsed.data.photoUrl || null,
      whatsappTopic: parsed.data.whatsappTopic || null,
    },
  });
  refreshShowcase(restaurant.slug, "offerings");
  return { ok: true };
}

export async function deleteOfferingAction(fd: FormData): Promise<ActionResult> {
  const id = fdString(fd, "id");
  const restaurantId = fdString(fd, "restaurantId");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  await db.offering.delete({ where: { id, restaurantId } });
  refreshShowcase(restaurant.slug, "offerings");
  return { ok: true };
}

// INSTAGRAM POSTS

export async function createInstagramPostAction(fd: FormData): Promise<ActionResult> {
  const restaurantId = fdString(fd, "restaurantId");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  const parsed = InstagramPostSchema.safeParse({ url: fdString(fd, "url") });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const all = await db.instagramPost.findMany({
    where: { restaurantId },
    select: { sort: true },
  });
  await db.instagramPost.create({
    data: {
      url: parsed.data.url,
      restaurantId,
      sort: await nextSort(all),
    },
  });
  refreshShowcase(restaurant.slug, "instagram");
  return { ok: true };
}

export async function deleteInstagramPostAction(fd: FormData): Promise<ActionResult> {
  const id = fdString(fd, "id");
  const restaurantId = fdString(fd, "restaurantId");
  const { restaurant } = await requireOwnedRestaurantById(restaurantId);
  await db.instagramPost.delete({ where: { id, restaurantId } });
  refreshShowcase(restaurant.slug, "instagram");
  return { ok: true };
}

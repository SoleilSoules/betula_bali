import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRestaurant(slug: string) {
  const user = await requireUser();
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    include: {
      _count: { select: { categories: true, dishes: true, tables: true, orders: true } },
    },
  });
  if (!restaurant || restaurant.ownerId !== user.id) {
    redirect("/dashboard");
  }
  return { user, restaurant };
}

export async function requireOwnedRestaurantById(id: string) {
  const user = await requireUser();
  const restaurant = await db.restaurant.findUnique({ where: { id } });
  if (!restaurant || restaurant.ownerId !== user.id) {
    throw new Error("Нет доступа к этому заведению");
  }
  return { user, restaurant };
}

export { formatPrice } from "@/lib/format";

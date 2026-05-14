import { db } from "@/lib/db";
import { RestaurantMenu } from "./_components/restaurant-menu";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await db.restaurant.findUnique({ where: { slug } });
  if (!r) return { title: "Меню" };
  return {
    title: `${r.name} — меню`,
    description: r.description ?? `Меню заведения ${r.name}`,
  };
}

export default async function PublicMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <RestaurantMenu slug={slug} tableToken={null} />;
}

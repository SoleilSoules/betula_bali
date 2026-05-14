import { db } from "@/lib/db";
import { requireRestaurant } from "@/lib/access";
import { MenuEditor } from "./menu-editor";

export const metadata = { title: "Меню — QR-меню" };

export default async function MenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { restaurant } = await requireRestaurant(slug);

  const categories = await db.category.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { sort: "asc" },
    include: {
      dishes: {
        orderBy: { sort: "asc" },
      },
    },
  });

  return (
    <div>
      <header className="px-8 py-6 border-b bg-background">
        <h1 className="text-xl font-semibold tracking-tight">Меню</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Категории и блюда. Скрытые блюда не показываются гостям.
        </p>
      </header>
      <div className="px-8 py-6">
        <MenuEditor
          restaurantId={restaurant.id}
          currency={restaurant.currency}
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            dishes: c.dishes.map((d) => ({
              id: d.id,
              name: d.name,
              description: d.description,
              price: d.price,
              photoUrl: d.photoUrl,
              isAvailable: d.isAvailable,
              categoryId: d.categoryId,
            })),
          }))}
        />
      </div>
    </div>
  );
}

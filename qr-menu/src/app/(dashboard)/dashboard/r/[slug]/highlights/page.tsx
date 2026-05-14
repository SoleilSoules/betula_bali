import { db } from "@/lib/db";
import { requireRestaurant } from "@/lib/access";
import { HighlightsEditor } from "./highlights-editor";

export const metadata = { title: "Топ-блюда — QR-меню" };

export default async function HighlightsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { restaurant } = await requireRestaurant(slug);

  const highlights = await db.highlight.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { sort: "asc" },
  });

  return (
    <div>
      <header className="px-8 py-6 border-b bg-background">
        <h1 className="text-xl font-semibold tracking-tight">Топ-блюда</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Карточки на главной странице с фото и ссылкой на пост в Instagram. Покажите главное.
        </p>
      </header>
      <div className="px-8 py-6">
        <HighlightsEditor
          restaurantId={restaurant.id}
          items={highlights.map((h) => ({
            id: h.id,
            name: h.name,
            description: h.description,
            photoUrl: h.photoUrl,
            instagramUrl: h.instagramUrl,
          }))}
        />
      </div>
    </div>
  );
}

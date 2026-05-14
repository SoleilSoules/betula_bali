import { db } from "@/lib/db";
import { requireRestaurant } from "@/lib/access";
import { InstagramEditor } from "./instagram-editor";

export const metadata = { title: "Instagram-фид — QR-меню" };

export default async function InstagramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { restaurant } = await requireRestaurant(slug);

  const posts = await db.instagramPost.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { sort: "asc" },
  });

  return (
    <div>
      <header className="px-8 py-6 border-b bg-background">
        <h1 className="text-xl font-semibold tracking-tight">Instagram-фид</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Вставьте 4–8 ссылок на ваши лучшие посты — они появятся снизу витрины.
        </p>
      </header>
      <div className="px-8 py-6">
        <InstagramEditor
          restaurantId={restaurant.id}
          items={posts.map((p) => ({ id: p.id, url: p.url }))}
        />
      </div>
    </div>
  );
}

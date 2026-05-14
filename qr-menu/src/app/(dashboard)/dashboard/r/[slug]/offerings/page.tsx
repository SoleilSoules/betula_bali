import { db } from "@/lib/db";
import { requireRestaurant } from "@/lib/access";
import { OfferingsEditor } from "./offerings-editor";

export const metadata = { title: "Услуги — QR-меню" };

export default async function OfferingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { restaurant } = await requireRestaurant(slug);

  const offerings = await db.offering.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { sort: "asc" },
  });

  return (
    <div>
      <header className="px-8 py-6 border-b bg-background">
        <h1 className="text-xl font-semibold tracking-tight">Услуги и бронирования</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Аренда пуфика на кино, аренда отдельного стола, дни рождения. Каждая карточка — кнопка
          «Забронировать в WhatsApp».
        </p>
      </header>
      <div className="px-8 py-6">
        <OfferingsEditor
          restaurantId={restaurant.id}
          items={offerings.map((o) => ({
            id: o.id,
            title: o.title,
            description: o.description,
            photoUrl: o.photoUrl,
            whatsappTopic: o.whatsappTopic,
          }))}
        />
      </div>
    </div>
  );
}

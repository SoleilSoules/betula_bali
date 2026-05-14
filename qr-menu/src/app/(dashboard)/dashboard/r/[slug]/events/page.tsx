import { db } from "@/lib/db";
import { requireRestaurant } from "@/lib/access";
import { EventsEditor } from "./events-editor";

export const metadata = { title: "События — QR-меню" };

export default async function EventsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { restaurant } = await requireRestaurant(slug);

  const events = await db.event.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { sort: "asc" },
  });

  return (
    <div>
      <header className="px-8 py-6 border-b bg-background">
        <h1 className="text-xl font-semibold tracking-tight">События</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Кино, концерты, мастер-классы. Гость нажмёт «Записаться» — откроется WhatsApp с
          вашим номером и темой.
        </p>
      </header>
      <div className="px-8 py-6">
        <EventsEditor
          restaurantId={restaurant.id}
          items={events.map((e) => ({
            id: e.id,
            title: e.title,
            description: e.description,
            whenText: e.whenText,
            photoUrl: e.photoUrl,
            whatsappTopic: e.whatsappTopic,
          }))}
        />
      </div>
    </div>
  );
}

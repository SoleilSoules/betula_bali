import { db } from "@/lib/db";
import { ClosedNotice } from "../closed-notice";
import { themeStyle } from "@/lib/theme";
import { whatsappLink } from "@/lib/whatsapp";
import { Showcase } from "./showcase";

export async function RestaurantMenu({
  slug,
  tableToken,
}: {
  slug: string;
  tableToken: string | null;
}) {
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    include: {
      highlights: { orderBy: { sort: "asc" } },
      events: { orderBy: { sort: "asc" } },
      offerings: { orderBy: { sort: "asc" } },
      instagramPosts: { orderBy: { sort: "asc" } },
      categories: {
        orderBy: { sort: "asc" },
        include: {
          dishes: {
            where: { isAvailable: true },
            orderBy: { sort: "asc" },
          },
        },
      },
    },
  });

  if (!restaurant) {
    return (
      <main className="min-h-svh flex items-center justify-center p-8 bg-zinc-50 text-zinc-700">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Страница не найдена</h1>
          <p className="text-sm">Похоже, ссылка устарела или адрес изменился.</p>
        </div>
      </main>
    );
  }

  const tableLabel = tableToken
    ? (
        await db.table.findFirst({
          where: { qrToken: tableToken, restaurantId: restaurant.id },
        })
      )?.label ?? null
    : null;

  if (!restaurant.isPublished) {
    return (
      <ClosedNotice
        name={restaurant.name}
        themeId={restaurant.theme}
        primary={restaurant.primaryColor}
      />
    );
  }

  const orderCategories = restaurant.categories
    .filter((c) => c.dishes.length > 0)
    .map((c) => ({
      id: c.id,
      name: c.name,
      dishes: c.dishes.map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        price: d.price,
        photoUrl: d.photoUrl,
      })),
    }));

  const bookingMessage =
    restaurant.bookingMessage?.trim() ||
    `Здравствуйте! Хочу забронировать стол в «${restaurant.name}».`;
  const bookingLink = whatsappLink(restaurant.whatsappPhone, bookingMessage);

  return (
    <div style={themeStyle(restaurant.theme, restaurant.primaryColor)}>
      <Showcase
        slug={restaurant.slug}
        name={restaurant.name}
        description={restaurant.description}
        address={restaurant.address}
        logoUrl={restaurant.logoUrl}
        currency={restaurant.currency}
        googleMapsUrl={restaurant.googleMapsUrl}
        instagramUrl={restaurant.instagramUrl}
        whatsappPhone={restaurant.whatsappPhone}
        bookingLink={bookingLink}
        mainMenuPdfUrl={restaurant.mainMenuPdfUrl}
        specialMenuPdfUrl={restaurant.specialMenuPdfUrl}
        highlights={restaurant.highlights.map((h) => ({
          id: h.id,
          name: h.name,
          description: h.description,
          photoUrl: h.photoUrl,
          instagramUrl: h.instagramUrl,
        }))}
        events={restaurant.events.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          whenText: e.whenText,
          photoUrl: e.photoUrl,
          whatsappLink: whatsappLink(
            restaurant.whatsappPhone,
            e.whatsappTopic?.trim() || `Здравствуйте! Хочу записаться на «${e.title}» (${e.whenText}).`,
          ),
        }))}
        offerings={restaurant.offerings.map((o) => ({
          id: o.id,
          title: o.title,
          description: o.description,
          photoUrl: o.photoUrl,
          whatsappLink: whatsappLink(
            restaurant.whatsappPhone,
            o.whatsappTopic?.trim() || `Здравствуйте! Хочу забронировать «${o.title}».`,
          ),
        }))}
        instagramUrls={restaurant.instagramPosts.map((p) => p.url)}
        orderCategories={orderCategories}
        tableToken={tableToken}
        tableLabel={tableLabel}
      />
    </div>
  );
}

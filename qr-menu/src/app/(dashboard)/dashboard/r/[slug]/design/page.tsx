import { requireRestaurant } from "@/lib/access";
import { DesignForm } from "./design-form";

export const metadata = { title: "Дизайн — QR-меню" };

export default async function DesignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { restaurant } = await requireRestaurant(slug);

  return (
    <div>
      <header className="px-8 py-6 border-b bg-background">
        <h1 className="text-xl font-semibold tracking-tight">Дизайн и контакты</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Внешний вид витрины, контакты для бронирований, PDF-меню.
        </p>
      </header>
      <div className="px-8 py-6 max-w-3xl">
        <DesignForm
          slug={restaurant.slug}
          initial={{
            name: restaurant.name,
            description: restaurant.description ?? "",
            address: restaurant.address ?? "",
            primaryColor: restaurant.primaryColor,
            theme: (restaurant.theme === "modern"
              ? "paper"
              : (restaurant.theme as "paper" | "warm" | "coastal" | "hideout" | "dark")),
            logoUrl: restaurant.logoUrl ?? "",
            telegramChatId: restaurant.telegramChatId ?? "",
            googleMapsUrl: restaurant.googleMapsUrl ?? "",
            instagramUrl: restaurant.instagramUrl ?? "",
            whatsappPhone: restaurant.whatsappPhone ?? "",
            bookingMessage: restaurant.bookingMessage ?? "",
            mainMenuPdfUrl: restaurant.mainMenuPdfUrl ?? "",
            specialMenuPdfUrl: restaurant.specialMenuPdfUrl ?? "",
            isPublished: restaurant.isPublished,
          }}
        />
      </div>
    </div>
  );
}

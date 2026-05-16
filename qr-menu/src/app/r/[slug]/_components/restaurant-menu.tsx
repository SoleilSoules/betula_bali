import { themeStyle } from "@/lib/theme";
import { whatsappLink } from "@/lib/whatsapp";
import { BETULA } from "@/lib/betula-data";
import { Showcase } from "./showcase";

// Landing-only build: no database. The single demo restaurant
// (Bali Betula) is hard-coded in src/lib/betula-data.ts. `slug` and
// `tableToken` are kept in the signature for route compatibility but
// the showcase always renders the static content.
export function RestaurantMenu({
  slug: _slug,
  tableToken,
}: {
  slug: string;
  tableToken: string | null;
}) {
  const r = BETULA;
  const bookingLink = whatsappLink(r.whatsappPhone, r.bookingMessage);

  return (
    <div style={themeStyle(r.theme, r.primaryColor)}>
      <Showcase
        slug={r.slug}
        name={r.name}
        description={r.description}
        address={r.address}
        logoUrl={r.logoUrl}
        currency={r.currency}
        googleMapsUrl={r.googleMapsUrl}
        instagramUrl={r.instagramUrl}
        whatsappPhone={r.whatsappPhone}
        bookingLink={bookingLink}
        mainMenuPdfUrl={r.mainMenuPdfUrl}
        specialMenuPdfUrl={r.specialMenuPdfUrl}
        highlights={r.highlights}
        events={r.events.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          whenText: e.whenText,
          photoUrl: e.photoUrl,
          whatsappLink: whatsappLink(r.whatsappPhone, e.whatsappTopic),
        }))}
        offerings={r.offerings.map((o) => ({
          id: o.id,
          title: o.title,
          description: o.description,
          photoUrl: o.photoUrl,
          whatsappLink: whatsappLink(r.whatsappPhone, o.whatsappTopic),
        }))}
        instagramUrls={r.instagramUrls}
        orderCategories={[]}
        tableToken={tableToken}
        tableLabel={null}
      />
    </div>
  );
}

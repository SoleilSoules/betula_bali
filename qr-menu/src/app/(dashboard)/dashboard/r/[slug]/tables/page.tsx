import QRCode from "qrcode";
import { db } from "@/lib/db";
import { requireRestaurant } from "@/lib/access";
import { TablesEditor } from "./tables-editor";

export const metadata = { title: "Столы и QR — QR-меню" };

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3030";
}

export default async function TablesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { restaurant } = await requireRestaurant(slug);

  const tables = await db.table.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: "asc" },
  });

  const base = appUrl();

  const items = await Promise.all(
    tables.map(async (t) => {
      const url = `${base}/r/${restaurant.slug}/t/${t.qrToken}`;
      const dataUrl = await QRCode.toDataURL(url, {
        margin: 1,
        scale: 8,
        color: { dark: "#0F172A", light: "#FFFFFF" },
      });
      return { id: t.id, label: t.label, url, qrDataUrl: dataUrl };
    }),
  );

  return (
    <div>
      <header className="px-8 py-6 border-b bg-background">
        <h1 className="text-xl font-semibold tracking-tight">Столы и QR</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Сгенерируйте QR на каждый столик. Распечатайте, наклейте — и поехали.
        </p>
      </header>
      <div className="px-8 py-6">
        <TablesEditor restaurantId={restaurant.id} tables={items} />
      </div>
    </div>
  );
}

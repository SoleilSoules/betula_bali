import { db } from "@/lib/db";
import { requireRestaurant, formatPrice } from "@/lib/access";
import { OrdersFeed } from "./orders-feed";

export const metadata = { title: "Заказы — QR-меню" };

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { restaurant } = await requireRestaurant(slug);

  const orders = await db.order.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" },
    ],
    take: 100,
    include: {
      table: true,
      items: true,
    },
  });

  return (
    <div>
      <header className="px-8 py-6 border-b bg-background flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Заказы</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Обновляются автоматически каждые 5 секунд.
          </p>
        </div>
      </header>
      <div className="px-8 py-6">
        <OrdersFeed
          restaurantId={restaurant.id}
          currency={restaurant.currency}
          initialOrders={orders.map((o) => ({
            id: o.id,
            status: o.status,
            total: o.total,
            customerName: o.customerName,
            customerPhone: o.customerPhone,
            note: o.note,
            createdAt: o.createdAt.toISOString(),
            tableLabel: o.table?.label ?? null,
            items: o.items.map((it) => ({
              id: it.id,
              name: it.dishName,
              price: it.priceAtOrder,
              quantity: it.quantity,
            })),
          }))}
        />
      </div>
    </div>
  );
}

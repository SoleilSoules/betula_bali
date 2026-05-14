import Link from "next/link";
import { db } from "@/lib/db";
import { requireRestaurant, formatPrice } from "@/lib/access";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/lib/order-status";
import { ArrowRight, Receipt, UtensilsCrossed, QrCode } from "lucide-react";

export default async function RestaurantOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { restaurant } = await requireRestaurant(slug);
  const base = `/dashboard/r/${restaurant.slug}`;

  const [dishCount, tableCount, openOrders, recentOrders, todayCount] = await Promise.all([
    db.dish.count({ where: { restaurantId: restaurant.id } }),
    db.table.count({ where: { restaurantId: restaurant.id } }),
    db.order.count({
      where: {
        restaurantId: restaurant.id,
        status: { in: ["new", "in_progress", "ready"] },
      },
    }),
    db.order.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { table: true, items: true },
    }),
    db.order.count({
      where: {
        restaurantId: restaurant.id,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);

  return (
    <div>
      <header className="px-8 py-6 border-b bg-background">
        <h1 className="text-xl font-semibold tracking-tight">Обзор</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Что в моменте и куда нажимать дальше.
        </p>
      </header>

      <div className="px-8 py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Блюд в меню" value={dishCount} hint="Управляйте составом" href={`${base}/menu`} icon={UtensilsCrossed} />
          <StatCard label="Столов с QR" value={tableCount} hint="Готовы к печати" href={`${base}/tables`} icon={QrCode} />
          <StatCard label="Активные заказы" value={openOrders} hint="Сейчас в работе" href={`${base}/orders`} icon={Receipt} />
          <StatCard label="Сегодня всего" value={todayCount} hint="С полуночи" href={`${base}/orders`} icon={Receipt} />
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Последние заказы</CardTitle>
            <Link href={`${base}/orders`}>
              <Button variant="ghost" size="sm">
                Все <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Заказов пока нет. Откройте «Дизайн», настройте меню и распечатайте QR — и поехали.
              </p>
            ) : (
              <div className="divide-y">
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">#{o.id.slice(-4).toUpperCase()}</span>
                        <Badge variant={ORDER_STATUS_TONE[o.status as keyof typeof ORDER_STATUS_TONE] ?? "secondary"}>
                          {ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS] ?? o.status}
                        </Badge>
                        {o.table && (
                          <span className="text-xs text-muted-foreground">
                            {o.table.label}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {o.items.length} поз. · {formatPrice(o.total, restaurant.currency)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  href,
  icon: Icon,
}: {
  label: string;
  value: number;
  hint: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link href={href}>
      <Card className="hover:border-foreground/20 transition-colors h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-semibold mt-2">{value}</div>
          <div className="text-xs text-muted-foreground mt-1">{hint}</div>
        </CardContent>
      </Card>
    </Link>
  );
}

import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/access";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logoutAction } from "@/app/actions/auth";
import { ChevronRight, Plus, LogOut, Store } from "lucide-react";

export default async function DashboardHomePage() {
  const user = await requireUser();
  const restaurants = await db.restaurant.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { dishes: true, orders: true, tables: true } },
    },
  });

  return (
    <div className="min-h-svh bg-muted/30">
      <header className="px-6 py-5 border-b bg-background">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="font-semibold tracking-tight">QR-меню</div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              {user.name || user.email}
            </span>
            <form action={logoutAction}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4 mr-1" />
                Выйти
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Ваши заведения</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Каждое заведение — отдельное меню, столы и QR.
            </p>
          </div>
          <Link href="/dashboard/new">
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Добавить
            </Button>
          </Link>
        </div>

        {restaurants.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {restaurants.map((r) => (
              <Link
                key={r.id}
                href={`/dashboard/r/${r.slug}`}
                className="group"
              >
                <Card className="hover:border-foreground/20 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{r.name}</CardTitle>
                        <CardDescription>/r/{r.slug}</CardDescription>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground flex gap-5">
                    <Stat label="Блюда" value={r._count.dishes} />
                    <Stat label="Столы" value={r._count.tables} />
                    <Stat label="Заказы" value={r._count.orders} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide">{label}</div>
      <div className="text-foreground font-medium">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="py-12 flex flex-col items-center text-center gap-3">
        <div className="rounded-full bg-muted p-3">
          <Store className="h-6 w-6" />
        </div>
        <div className="font-medium">Пока нет ни одного заведения</div>
        <p className="text-sm text-muted-foreground max-w-sm">
          Добавьте первое — соберите меню, распечатайте QR и принимайте заказы прямо
          в Telegram.
        </p>
        <Link href="/dashboard/new" className="mt-2">
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Создать заведение
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

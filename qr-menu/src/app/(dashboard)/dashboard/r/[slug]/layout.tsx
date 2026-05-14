import Link from "next/link";
import { requireRestaurant } from "@/lib/access";
import { SidebarLink } from "@/components/dashboard/sidebar-link";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/actions/auth";
import {
  LayoutDashboard,
  UtensilsCrossed,
  QrCode,
  Receipt,
  Palette,
  Sparkles,
  CalendarDays,
  Sofa,
  ExternalLink,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { InstagramIcon } from "@/components/brand-icons";

export default async function RestaurantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { user, restaurant } = await requireRestaurant(slug);
  const base = `/dashboard/r/${restaurant.slug}`;

  return (
    <div className="min-h-svh bg-muted/30 flex">
      <aside className="w-64 shrink-0 border-r bg-background flex flex-col overflow-y-auto">
        <div className="p-4 border-b">
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Все заведения
          </Link>
          <div className="mt-2 font-semibold tracking-tight truncate">{restaurant.name}</div>
          <div className="text-xs text-muted-foreground truncate">/r/{restaurant.slug}</div>
        </div>

        <nav className="p-2 space-y-0.5 flex-1">
          <SidebarLink href={base} icon={LayoutDashboard} exact>
            Обзор
          </SidebarLink>

          <SectionLabel>Витрина</SectionLabel>
          <SidebarLink href={`${base}/highlights`} icon={Sparkles}>
            Топ-блюда
          </SidebarLink>
          <SidebarLink href={`${base}/events`} icon={CalendarDays}>
            События
          </SidebarLink>
          <SidebarLink href={`${base}/offerings`} icon={Sofa}>
            Услуги
          </SidebarLink>
          <SidebarLink href={`${base}/instagram`} icon={InstagramIcon}>
            Instagram
          </SidebarLink>
          <SidebarLink href={`${base}/design`} icon={Palette}>
            Дизайн
          </SidebarLink>

          <SectionLabel>Заказы со столиков</SectionLabel>
          <SidebarLink href={`${base}/menu`} icon={UtensilsCrossed}>
            Меню
          </SidebarLink>
          <SidebarLink href={`${base}/tables`} icon={QrCode}>
            Столы и QR
          </SidebarLink>
          <SidebarLink href={`${base}/orders`} icon={Receipt}>
            Лента заказов
          </SidebarLink>
        </nav>

        <div className="p-3 border-t space-y-2">
          <Link href={`/r/${restaurant.slug}`} target="_blank">
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Открыть страницу
            </Button>
          </Link>
          <div className="text-xs text-muted-foreground truncate px-1">
            {user.name || user.email}
          </div>
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" className="w-full justify-start" type="submit">
              <LogOut className="h-3.5 w-3.5 mr-1" />
              Выйти
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pt-4 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground/80 font-medium">
      {children}
    </div>
  );
}

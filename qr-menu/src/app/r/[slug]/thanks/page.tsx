import Link from "next/link";
import { db } from "@/lib/db";
import { themeStyle } from "@/lib/theme";
import { OrderTracker } from "./order-tracker";

export const metadata = { title: "Заказ принят" };
export const dynamic = "force-dynamic";

export default async function ThanksPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { slug } = await params;
  const { orderId } = await searchParams;

  const restaurant = await db.restaurant.findUnique({ where: { slug } });
  if (!restaurant) {
    return (
      <main className="min-h-svh flex items-center justify-center p-8 bg-zinc-50 text-zinc-700">
        Заказ не найден.
      </main>
    );
  }

  return (
    <main
      style={themeStyle(restaurant.theme, restaurant.primaryColor)}
      className="min-h-svh bg-[var(--qr-bg)] text-[var(--qr-text)] flex items-center justify-center p-6"
    >
      {orderId ? (
        <OrderTracker orderId={orderId} slug={slug} />
      ) : (
        <div className="bg-[var(--qr-surface)] border border-[var(--qr-border)] rounded-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold">Заказ принят</h1>
          <p className="text-[var(--qr-muted)] mt-2">
            Передали ваш заказ на кухню. Скоро принесём.
          </p>
          <Link
            href={`/r/${slug}`}
            className="inline-block mt-6 text-sm text-[var(--qr-muted)] hover:text-[var(--qr-text)]"
          >
            Вернуться в меню
          </Link>
        </div>
      )}
    </main>
  );
}

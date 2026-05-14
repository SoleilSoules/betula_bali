"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/shallow";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-store";
import { ShoppingBag, Plus, Minus, X, MapPin } from "lucide-react";
import { DishPhoto } from "@/components/dish-photo";

type Dish = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  photoUrl: string | null;
};

type Category = {
  id: string;
  name: string;
  dishes: Dish[];
};

function priceFmt(price: number, currency: string) {
  if (currency === "RUB") return `${price.toLocaleString("ru-RU")} ₽`;
  return `${price} ${currency}`;
}

export function MenuView({
  slug,
  name,
  description,
  address,
  logoUrl,
  currency,
  categories,
  tableToken,
  tableLabel,
}: {
  slug: string;
  name: string;
  description: string | null;
  address: string | null;
  logoUrl: string | null;
  currency: string;
  categories: Category[];
  tableToken: string | null;
  tableLabel: string | null;
}) {
  const router = useRouter();
  const items = useCart(useShallow((s) => s.itemsBySlug[slug] ?? []));
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [note, setNote] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    categories[0]?.id ?? null,
  );

  const navRef = useRef<HTMLDivElement | null>(null);
  const sectionsRef = useRef<Map<string, HTMLElement>>(new Map());

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  useEffect(() => {
    if (categories.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const id = visible.target.id.replace("cat-", "");
          setActiveCategoryId(id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.5, 1] },
    );
    sectionsRef.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [categories]);

  useEffect(() => {
    if (!activeCategoryId || !navRef.current) return;
    const link = navRef.current.querySelector<HTMLAnchorElement>(
      `[data-cat="${activeCategoryId}"]`,
    );
    link?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeCategoryId]);

  async function placeOrder() {
    if (items.length === 0) {
      toast.error("Корзина пуста");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug: slug,
          tableToken: tableToken ?? undefined,
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          note: note || undefined,
          items: items.map((i) => ({ dishId: i.dishId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? "Не удалось оформить заказ");
      }
      clear(slug);
      router.push(`/r/${slug}/thanks?orderId=${data.orderId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка отправки");
    } finally {
      setSubmitting(false);
    }
  }

  const brand = name.toUpperCase();

  return (
    <main className="min-h-svh bg-[var(--qr-bg)] text-[var(--qr-text)] pb-32">
      <header className="px-5 pt-8 pb-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${logoUrl}`}
              alt=""
              aria-hidden="true"
              className="h-7 w-7 object-contain select-none"
            />
          )}
          <span
            className="text-[var(--qr-text)] whitespace-nowrap"
            style={{
              fontFamily: "var(--font-brand), Georgia, serif",
              fontWeight: 700,
              fontSize: 22,
              lineHeight: "26px",
              letterSpacing: "0.06em",
            }}
          >
            {brand}
          </span>
        </div>
        <div className="mt-5">
          <h1
            className="text-[var(--qr-accent)] leading-[1]"
            style={{
              fontFamily: "var(--font-hero), system-ui, sans-serif",
              fontSize: "clamp(40px, 11vw, 56px)",
              letterSpacing: "-0.025em",
              fontWeight: 500,
            }}
          >
            Menu
          </h1>
          {tableLabel ? (
            <div
              className="mt-2 text-[var(--qr-muted)]"
              style={{ fontFamily: "var(--font-hero), system-ui, sans-serif", fontSize: 15 }}
            >
              For your table · <span className="text-[var(--qr-text)] font-medium">{tableLabel}</span>
            </div>
          ) : address ? (
            <div className="mt-2 text-[var(--qr-muted)] flex items-center gap-1 text-sm">
              <MapPin className="h-3.5 w-3.5" />
              {address}
            </div>
          ) : null}
        </div>
        {description && (
          <p className="text-[var(--qr-muted)] mt-4 text-sm leading-relaxed">{description}</p>
        )}
      </header>

      <nav className="sticky top-0 z-10 bg-[var(--qr-bg)]/85 backdrop-blur border-b border-[var(--qr-border)]">
        <div
          ref={navRef}
          className="max-w-2xl mx-auto px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar"
        >
          {categories.map((c) => {
            const active = c.id === activeCategoryId;
            return (
              <a
                key={c.id}
                data-cat={c.id}
                href={`#cat-${c.id}`}
                className="text-sm whitespace-nowrap px-4 py-1.5 rounded-sm border transition-colors"
                style={{
                  background: active ? "var(--qr-accent)" : "var(--qr-surface)",
                  color: active ? "#ffffff" : "var(--qr-text)",
                  borderColor: active ? "var(--qr-accent)" : "var(--qr-border)",
                  fontFamily: "var(--font-hero), system-ui, sans-serif",
                  letterSpacing: "0.02em",
                }}
              >
                {c.name}
              </a>
            );
          })}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-10">
        {categories.length === 0 ? (
          <div className="text-center py-20 text-[var(--qr-muted)]">
            Меню пока пустое. Загляните чуть позже.
          </div>
        ) : (
          categories.map((c) => (
            <section
              key={c.id}
              id={`cat-${c.id}`}
              ref={(el) => {
                if (el) sectionsRef.current.set(c.id, el);
                else sectionsRef.current.delete(c.id);
              }}
              className="scroll-mt-20"
            >
              <div className="flex items-baseline gap-3 mb-4">
                <h2
                  className="leading-tight tracking-tight"
                  style={{
                    fontFamily: "var(--font-hero), system-ui, sans-serif",
                    fontSize: 24,
                    fontWeight: 500,
                  }}
                >
                  {c.name}
                </h2>
                <span aria-hidden className="flex-1 h-px bg-[var(--qr-rule)] opacity-50" />
              </div>
              <div className="space-y-3">
                {c.dishes.map((d) => {
                  const inCart = items.find((i) => i.dishId === d.id);
                  return (
                    <article
                      key={d.id}
                      className="bg-[var(--qr-card-bg)] border border-[var(--qr-border)] rounded-sm p-3 flex gap-3 items-start"
                      style={{ boxShadow: "var(--qr-shadow)" }}
                    >
                      <DishPhoto
                        src={d.photoUrl}
                        alt={d.name}
                        className="h-24 w-24 rounded-sm shrink-0"
                        iconSize={24}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className="leading-snug"
                          style={{
                            fontFamily: "var(--font-hero), system-ui, sans-serif",
                            fontSize: 17,
                            fontWeight: 500,
                            letterSpacing: "-0.005em",
                          }}
                        >
                          {d.name}
                        </div>
                        {d.description && (
                          <p className="text-sm text-[var(--qr-muted)] mt-1 leading-snug">
                            {d.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <div
                            className="tabular-nums text-[var(--qr-text)]"
                            style={{
                              fontFamily: "var(--font-hero), system-ui, sans-serif",
                              fontSize: 15,
                              fontWeight: 600,
                            }}
                          >
                            {priceFmt(d.price, currency)}
                          </div>
                          {tableToken && (
                            inCart ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  aria-label="Меньше"
                                  onClick={() => setQty(slug, d.id, inCart.quantity - 1)}
                                  className="h-8 w-8 inline-flex items-center justify-center rounded-sm border border-[var(--qr-accent)] text-[var(--qr-accent)] hover:bg-[var(--qr-accent)]/10"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-6 text-center tabular-nums">{inCart.quantity}</span>
                                <button
                                  type="button"
                                  aria-label="Больше"
                                  onClick={() => add(slug, { dishId: d.id, name: d.name, price: d.price })}
                                  className="h-8 w-8 inline-flex items-center justify-center rounded-sm text-white"
                                  style={{ background: "var(--qr-accent)" }}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => add(slug, { dishId: d.id, name: d.name, price: d.price })}
                                className="px-4 py-1.5 rounded-sm text-sm text-white"
                                style={{
                                  background: "var(--qr-accent)",
                                  fontFamily: "var(--font-hero), system-ui, sans-serif",
                                  fontWeight: 500,
                                  letterSpacing: "0.02em",
                                }}
                              >
                                В заказ
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      {tableToken && totalQty > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-20 px-5 pb-5 pt-3 bg-gradient-to-t from-[var(--qr-bg)] via-[var(--qr-bg)] to-transparent">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="w-full max-w-2xl mx-auto flex items-center justify-between gap-4 rounded-sm px-5 py-4 text-white shadow-lg"
            style={{
              background: "var(--qr-accent)",
              fontFamily: "var(--font-hero), system-ui, sans-serif",
              letterSpacing: "0.02em",
            }}
          >
            <span className="flex items-center gap-2 font-medium">
              <ShoppingBag className="h-4 w-4" />
              Корзина · {totalQty} поз.
            </span>
            <span className="font-semibold tabular-nums">{priceFmt(total, currency)}</span>
          </button>
        </div>
      )}

      {tableToken && cartOpen && totalQty > 0 && (
        <div
          className="fixed inset-0 z-30 flex items-end md:items-center justify-center bg-black/40"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="bg-[var(--qr-surface)] text-[var(--qr-text)] w-full md:max-w-md md:rounded-sm rounded-t-sm shadow-xl max-h-[88svh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-[var(--qr-border)] flex items-center justify-between">
              <div
                style={{
                  fontFamily: "var(--font-hero), system-ui, sans-serif",
                  fontSize: 18,
                  fontWeight: 500,
                  letterSpacing: "-0.005em",
                }}
              >
                Ваш заказ {tableLabel ? `· ${tableLabel}` : ""}
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="text-[var(--qr-muted)] hover:text-[var(--qr-text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-[var(--qr-border)]">
              {items.map((i) => (
                <div key={i.dishId} className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{i.name}</div>
                    <div className="text-sm text-[var(--qr-muted)]">
                      {priceFmt(i.price, currency)} × {i.quantity}
                    </div>
                  </div>
                  <div className="font-semibold tabular-nums shrink-0">
                    {priceFmt(i.price * i.quantity, currency)}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      type="button"
                      aria-label="Меньше"
                      onClick={() => setQty(slug, i.dishId, i.quantity - 1)}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-sm border border-[var(--qr-accent)] text-[var(--qr-accent)]"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center tabular-nums">{i.quantity}</span>
                    <button
                      type="button"
                      aria-label="Больше"
                      onClick={() => add(slug, { dishId: i.dishId, name: i.name, price: i.price })}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-sm text-white"
                      style={{ background: "var(--qr-accent)" }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Убрать"
                      onClick={() => remove(slug, i.dishId)}
                      className="text-[var(--qr-muted)] hover:text-[var(--qr-text)]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-[var(--qr-border)] space-y-3">
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Ваше имя"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  maxLength={80}
                  className="w-full bg-transparent border border-[var(--qr-border)] rounded-sm px-3 py-2 text-sm outline-none focus:border-[var(--qr-accent)] transition-colors"
                />
                <p className="text-xs text-[var(--qr-muted)] px-1">
                  Можно не указывать. Имя помогает официанту, если столик не выбран.
                </p>
              </div>
              <div className="space-y-1">
                <input
                  type="tel"
                  placeholder="Телефон"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  maxLength={40}
                  className="w-full bg-transparent border border-[var(--qr-border)] rounded-sm px-3 py-2 text-sm outline-none focus:border-[var(--qr-accent)] transition-colors"
                />
                <p className="text-xs text-[var(--qr-muted)] px-1">
                  Не обязательно. Только если хотите, чтобы вам перезвонили при вопросе по заказу.
                </p>
              </div>
              <textarea
                placeholder="Комментарий — например, без лука"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={300}
                className="w-full bg-transparent border border-[var(--qr-border)] rounded-sm px-3 py-2 text-sm outline-none focus:border-[var(--qr-accent)] transition-colors resize-none"
              />
              <div className="flex items-center justify-between text-base pt-1">
                <span className="text-[var(--qr-muted)]">Итого</span>
                <span className="font-semibold tabular-nums">{priceFmt(total, currency)}</span>
              </div>
              <button
                type="button"
                disabled={submitting || items.length === 0}
                onClick={placeOrder}
                className="w-full rounded-sm px-5 py-3 text-white disabled:opacity-60"
                style={{
                  background: "var(--qr-accent)",
                  fontFamily: "var(--font-hero), system-ui, sans-serif",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                }}
              >
                {submitting ? "Отправляем…" : "Оформить заказ"}
              </button>
              <p className="text-xs text-center text-[var(--qr-muted)] pt-1">
                Оплата у официанта — наличными или картой.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

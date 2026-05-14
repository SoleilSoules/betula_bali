"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, ChefHat, Bell, XCircle, Loader2 } from "lucide-react";

type Order = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  currency: string;
  items: { id: string; name: string; price: number; quantity: number }[];
  canCancel: boolean;
  cancelDeadlineAt: string;
};

const STATUS_LABEL: Record<string, string> = {
  new: "Принят, ждёт повара",
  in_progress: "Готовится",
  ready: "Готов — несём к столу",
  completed: "Закрыт",
  cancelled: "Отменён",
};

const STATUS_HINT: Record<string, string> = {
  new: "Через минуту повар возьмёт заказ.",
  in_progress: "Сейчас готовим. Будет минут 10–15.",
  ready: "Официант уже идёт к столу.",
  completed: "Спасибо! Хорошего вечера.",
  cancelled: "Заказ отменён. Если это ошибка — позовите официанта.",
};

function priceFmt(n: number, currency: string) {
  if (currency === "RUB") return `${n.toLocaleString("ru-RU")} ₽`;
  return `${n} ${currency}`;
}

export function OrderTracker({ orderId, slug }: { orderId: string; slug: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let alive = true;
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        if (!res.ok || !data.ok) throw new Error(data.message ?? "Ошибка");
        setOrder(data.order);
        setError(null);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Ошибка");
      } finally {
        if (alive) setLoading(false);
      }
    }
    fetchOrder();
    const id = setInterval(fetchOrder, 5000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [orderId]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  async function cancel() {
    if (!order || cancelling) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Не получилось отменить");
      toast.success("Заказ отменён");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не получилось отменить");
    } finally {
      setCancelling(false);
    }
  }

  if (loading && !order) {
    return (
      <div className="bg-[var(--qr-surface)] border border-[var(--qr-border)] rounded-2xl p-8 max-w-md w-full text-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--qr-muted)] mx-auto" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="bg-[var(--qr-surface)] border border-[var(--qr-border)] rounded-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-xl font-semibold">Заказ не найден</h1>
        <p className="text-[var(--qr-muted)] mt-2">{error}</p>
        <Link href={`/r/${slug}`} className="inline-block mt-4 text-sm underline">
          В меню
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const status = order.status;
  const cancelSecondsLeft = Math.max(
    0,
    Math.floor((new Date(order.cancelDeadlineAt).getTime() - now) / 1000),
  );
  const showCancel = order.canCancel && cancelSecondsLeft > 0;

  return (
    <div className="bg-[var(--qr-surface)] border border-[var(--qr-border)] rounded-2xl p-8 max-w-md w-full">
      <div className="text-center">
        <div
          className="mx-auto mb-4 h-14 w-14 rounded-full flex items-center justify-center text-white"
          style={{
            background: status === "cancelled" ? "#a1a1aa" : "var(--qr-primary)",
          }}
        >
          {status === "new" && <CheckCircle2 className="h-7 w-7" />}
          {status === "in_progress" && <ChefHat className="h-7 w-7" />}
          {status === "ready" && <Bell className="h-7 w-7" />}
          {status === "completed" && <CheckCircle2 className="h-7 w-7" />}
          {status === "cancelled" && <XCircle className="h-7 w-7" />}
        </div>
        <h1 className="text-xl font-semibold">{STATUS_LABEL[status] ?? "Заказ принят"}</h1>
        <p className="text-[var(--qr-muted)] mt-2 text-sm">
          {STATUS_HINT[status]}
        </p>
      </div>

      <ProgressBar status={status} />

      <div className="mt-6 text-sm border-t border-[var(--qr-border)] pt-4 space-y-1.5">
        {order.items.map((it) => (
          <div key={it.id} className="flex justify-between items-center">
            <span className="text-[var(--qr-text)]">
              {it.name} <span className="text-[var(--qr-muted)]">× {it.quantity}</span>
            </span>
            <span className="font-medium tabular-nums">
              {priceFmt(it.price * it.quantity, order.currency)}
            </span>
          </div>
        ))}
        <div className="flex justify-between items-center pt-2 border-t border-[var(--qr-border)] text-base">
          <span className="text-[var(--qr-muted)]">Итого</span>
          <span className="font-semibold tabular-nums">
            {priceFmt(order.total, order.currency)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-[var(--qr-muted)] pt-2">
          <span>Номер</span>
          <span className="font-mono">#{order.id.slice(-4).toUpperCase()}</span>
        </div>
      </div>

      {showCancel && (
        <button
          type="button"
          onClick={cancel}
          disabled={cancelling}
          className="w-full mt-6 px-4 py-2.5 rounded-full border border-[var(--qr-border)] text-[var(--qr-muted)] hover:text-[var(--qr-text)] hover:border-[var(--qr-text)] text-sm transition-colors disabled:opacity-50"
        >
          {cancelling
            ? "Отменяем…"
            : `Отменить заказ (${cancelSecondsLeft}с)`}
        </button>
      )}

      <Link
        href={`/r/${slug}`}
        className="block text-center mt-4 text-sm text-[var(--qr-muted)] hover:text-[var(--qr-text)]"
      >
        Вернуться в меню
      </Link>
    </div>
  );
}

const STEPS = [
  { id: "new", label: "Принят" },
  { id: "in_progress", label: "Готовим" },
  { id: "ready", label: "Готов" },
  { id: "completed", label: "Закрыт" },
];

function ProgressBar({ status }: { status: string }) {
  if (status === "cancelled") return null;
  const idx = STEPS.findIndex((s) => s.id === status);
  return (
    <div className="mt-6 flex items-center gap-1">
      {STEPS.map((s, i) => {
        const done = i <= idx;
        return (
          <div key={s.id} className="flex-1">
            <div
              className="h-1.5 rounded-full"
              style={{
                background: done ? "var(--qr-primary)" : "var(--qr-border)",
              }}
            />
            <div
              className="text-[10px] uppercase tracking-wide mt-1.5 text-center"
              style={{ color: done ? "var(--qr-text)" : "var(--qr-muted)" }}
            >
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

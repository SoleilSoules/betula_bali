"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/lib/order-status";
import { updateOrderStatusAction } from "@/app/actions/orders";
import { formatPrice } from "@/lib/format";

type Order = {
  id: string;
  status: string;
  total: number;
  customerName: string | null;
  customerPhone: string | null;
  note: string | null;
  createdAt: string;
  tableLabel: string | null;
  items: { id: string; name: string; price: number; quantity: number }[];
};

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as Array<keyof typeof ORDER_STATUS_LABELS>;

export function OrdersFeed({
  restaurantId,
  currency,
  initialOrders,
}: {
  restaurantId: string;
  currency: string;
  initialOrders: Order[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const knownIds = useRef(new Set(initialOrders.map((o) => o.id)));

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(id);
  }, [router]);

  useEffect(() => {
    const newOnes = initialOrders.filter((o) => !knownIds.current.has(o.id));
    if (newOnes.length > 0) {
      newOnes.forEach((o) => {
        toast.success(`Новый заказ${o.tableLabel ? ` — ${o.tableLabel}` : ""}`, {
          description: `${o.items.length} поз. · ${formatPrice(o.total, currency)}`,
        });
        knownIds.current.add(o.id);
      });
      try {
        const ctx = new (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 740;
        gain.gain.value = 0.05;
        osc.start();
        setTimeout(() => {
          osc.stop();
          ctx.close();
        }, 180);
      } catch {
        /* без звука — не страшно */
      }
    }
  }, [initialOrders, currency]);

  if (initialOrders.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Заказов пока нет. Когда первый гость оформит заказ — он появится здесь и
          в Telegram у владельца.
        </p>
      </Card>
    );
  }

  const active = initialOrders.filter((o) => ["new", "in_progress", "ready"].includes(o.status));
  const archived = initialOrders.filter((o) => !["new", "in_progress", "ready"].includes(o.status));

  return (
    <div className="space-y-8">
      <Section title="В работе" empty="Активных заказов нет.">
        {active.map((o) => (
          <OrderCard key={o.id} order={o} restaurantId={restaurantId} currency={currency} startTransition={startTransition} />
        ))}
      </Section>
      <Section title="Закрытые">
        {archived.map((o) => (
          <OrderCard key={o.id} order={o} restaurantId={restaurantId} currency={currency} startTransition={startTransition} muted />
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
  empty,
}: {
  title: string;
  children: React.ReactNode;
  empty?: string;
}) {
  const arr = Array.isArray(children) ? children : [children];
  const has = arr.filter(Boolean).length > 0;
  return (
    <section>
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
        {title}
      </h2>
      {has ? (
        <div className="grid gap-3 lg:grid-cols-2">{children}</div>
      ) : empty ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : null}
    </section>
  );
}

function OrderCard({
  order,
  restaurantId,
  currency,
  startTransition,
  muted = false,
}: {
  order: Order;
  restaurantId: string;
  currency: string;
  startTransition: (cb: () => void) => void;
  muted?: boolean;
}) {
  return (
    <Card className={muted ? "opacity-70" : ""}>
      <div className="px-5 py-4 border-b flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono font-semibold">#{order.id.slice(-4).toUpperCase()}</span>
          <Badge variant={ORDER_STATUS_TONE[order.status as keyof typeof ORDER_STATUS_TONE] ?? "secondary"}>
            {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] ?? order.status}
          </Badge>
          {order.tableLabel && (
            <span className="text-sm text-muted-foreground truncate">· {order.tableLabel}</span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(order.createdAt).toLocaleString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
          })}
        </span>
      </div>

      <div className="px-5 py-3 space-y-1.5 border-b">
        {order.items.map((it) => (
          <div key={it.id} className="flex items-center justify-between text-sm">
            <span className="min-w-0 truncate">
              {it.name} <span className="text-muted-foreground">× {it.quantity}</span>
            </span>
            <span className="tabular-nums">{formatPrice(it.price * it.quantity, currency)}</span>
          </div>
        ))}
      </div>

      {(order.customerName || order.customerPhone || order.note) && (
        <div className="px-5 py-3 border-b text-sm space-y-1">
          {order.customerName && <div>Гость: {order.customerName}</div>}
          {order.customerPhone && <div>Телефон: {order.customerPhone}</div>}
          {order.note && <div className="text-muted-foreground">Комментарий: {order.note}</div>}
        </div>
      )}

      <div className="px-5 py-3 flex items-center justify-between gap-3">
        <div className="font-semibold tabular-nums">{formatPrice(order.total, currency)}</div>
        <Select
          value={order.status}
          onValueChange={(value) => {
            if (!value) return;
            const fd = new FormData();
            fd.set("id", order.id);
            fd.set("restaurantId", restaurantId);
            fd.set("status", String(value));
            startTransition(async () => {
              const res = await updateOrderStatusAction(fd);
              if (res.ok) toast.success("Статус обновлён");
              else toast.error("Не получилось обновить");
            });
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}

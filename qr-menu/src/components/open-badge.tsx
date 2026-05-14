"use client";

import { useEffect, useState } from "react";

const PX = (n: number) => `calc(${n} * var(--scale, 1px))`;

// Tiny status pill — derives "open / opens at" from a daily 12-23 schedule.
// Server-rendered as a safe placeholder ("OPEN"), real state comes in
// after hydration so SSR/CSR mismatch is avoided. All sizes go through
// the canvas --scale so the badge shrinks with the rest of the layout
// on narrow viewports.
export function OpenBadge({
  openHour = 12,
  closeHour = 23,
}: {
  openHour?: number;
  closeHour?: number;
}) {
  const [label, setLabel] = useState<string>("OPEN");

  useEffect(() => {
    const tick = () => {
      const h = new Date().getHours();
      if (h >= openHour && h < closeHour) {
        setLabel(`OPEN · UNTIL ${closeHour}:00`);
      } else {
        setLabel(`OPENS AT ${openHour}:00`);
      }
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [openHour, closeHour]);

  const isOpen = label.startsWith("OPEN ·");
  return (
    <span
      className="inline-flex items-center whitespace-nowrap"
      style={{
        background: "rgba(247, 242, 232, 0.92)",
        color: "#170f13",
        gap: PX(5),
        paddingTop: PX(3),
        paddingBottom: PX(3),
        paddingLeft: PX(8),
        paddingRight: PX(8),
        fontFamily: "var(--font-hero), system-ui, sans-serif",
        fontSize: PX(10),
        lineHeight: PX(12),
        fontWeight: 600,
        letterSpacing: "0.08em",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: PX(6),
          height: PX(6),
          borderRadius: "50%",
          background: isOpen ? "#2f8a3e" : "#a14a4a",
          boxShadow: isOpen ? "0 0 6px rgba(47,138,62,0.6)" : "none",
        }}
      />
      {label}
    </span>
  );
}

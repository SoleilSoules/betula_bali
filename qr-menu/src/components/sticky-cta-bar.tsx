"use client";

import { useEffect, useState } from "react";

// Floating dual-CTA — Show menu / Reserve a table. Slides up from the
// bottom edge once the user has scrolled past the top of #signatures,
// stays visible all the way to the footer. Two pills, split 50/50
// inside the same 430-canvas grid as the rest of the page.
export function StickyCtaBar({
  showMenuHref,
  bookingLink,
}: {
  showMenuHref: string | null;
  bookingLink: string | null;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById("signatures");
    if (!anchor) return;
    const onScroll = () => {
      const rect = anchor.getBoundingClientRect();
      // Reveal as soon as the Signatures section enters the upper
      // half of the viewport.
      setVisible(rect.top < window.innerHeight * 0.65);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const externalBooking = !!bookingLink && bookingLink.startsWith("http");

  return (
    <div
      aria-hidden={!visible}
      className="fixed inset-x-0 bottom-0 z-30 pointer-events-none transition-transform duration-300 ease-out"
      style={{
        transform: visible ? "translateY(0)" : "translateY(120%)",
      }}
    >
      <div
        className="mx-auto pointer-events-auto"
        style={{
          maxWidth: 430,
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 10,
          paddingBottom: "calc(14px + env(safe-area-inset-bottom, 0px))",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 35%, rgba(255,255,255,0.96) 100%)",
        }}
      >
        <div className="flex gap-2">
          <a
            href={showMenuHref ?? "#"}
            className="flex-1 inline-flex items-center justify-center text-[#170f13] no-underline"
            style={{
              background: "#f7f2e8",
              boxShadow: "0 4px 18px rgba(23,15,19,0.16)",
              paddingTop: 14,
              paddingBottom: 14,
              fontFamily: "var(--font-hero), system-ui, sans-serif",
              fontSize: 16,
              fontWeight: 500,
              letterSpacing: "0.01em",
            }}
          >
            Show menu
          </a>
          <a
            href={bookingLink ?? "#"}
            {...(externalBooking
              ? { target: "_blank", rel: "noreferrer" }
              : {})}
            className="flex-1 inline-flex items-center justify-center no-underline"
            style={{
              background: "#7d3a4c",
              color: "#fbf6ec",
              boxShadow: "0 4px 18px rgba(125,58,76,0.28)",
              paddingTop: 14,
              paddingBottom: 14,
              fontFamily: "var(--font-hero), system-ui, sans-serif",
              fontSize: 16,
              fontWeight: 500,
              letterSpacing: "0.01em",
            }}
          >
            Reserve a table
          </a>
        </div>
      </div>
    </div>
  );
}

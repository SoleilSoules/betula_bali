"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PX = (n: number) => `calc(${n} * var(--scale, 1px))`;

// Left card of the hero-row pair. When the pill is tapped, the MENU
// paper inside the card animates "out" (scales up, untilts, fades a
// little) for a moment, then we navigate. Gives the menu a feeling
// of physically pulling the paper closer before opening it.
export function ShowMenuTile({
  href,
  width = 222,
  left = 10,
}: {
  href: string | null;
  width?: number;
  left?: number;
}) {
  const router = useRouter();
  const [opening, setOpening] = useState(false);

  function onPillClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!href) return;
    // External links → let the browser handle the new tab.
    if (href.startsWith("http")) return;
    e.preventDefault();
    if (opening) return;
    setOpening(true);
    window.setTimeout(() => {
      router.push(href);
    }, 480);
  }

  const isExternal = !!href && href.startsWith("http");

  return (
    <div
      className="absolute bg-[#f1f1f1]"
      style={{
        left: PX(left),
        top: PX(711),
        width: PX(width),
        height: PX(129),
        clipPath: `inset(${PX(-220)} 0 0 0)`,
      }}
    >
      <div
        className={opening ? "menu-paper-eject" : undefined}
        style={{
          position: "absolute",
          left: PX(28),
          top: PX(-88),
          width: PX(195),
          height: PX(252),
          transform: "rotate(-2deg)",
          transformOrigin: "center center",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/photos/figma/menu-paper-asset.png`}
          alt=""
          fill
          sizes="215px"
          className="object-contain"
        />
      </div>

      <Link
        href={href ?? "#"}
        onClick={onPillClick}
        {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
        className="absolute inline-flex items-center gap-1.5 text-[#170f13] whitespace-nowrap no-underline"
        style={{
          left: PX(12.63),
          top: PX(92),
          paddingTop: PX(5),
          paddingBottom: PX(6),
          paddingLeft: PX(10),
          paddingRight: PX(10),
          background: "rgba(247, 242, 232, 0.92)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          boxShadow: "0 1px 4px rgba(23, 15, 19, 0.08)",
          fontFamily: "var(--font-hero), system-ui, sans-serif",
          fontSize: PX(17),
          lineHeight: PX(20),
          fontWeight: 500,
          letterSpacing: "0.01em",
          zIndex: 1,
        }}
      >
        Show menu
        <span style={{ fontSize: PX(15), opacity: 0.6 }}>→</span>
      </Link>
    </div>
  );
}

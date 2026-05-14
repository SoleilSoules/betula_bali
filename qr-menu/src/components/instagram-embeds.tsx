"use client";

import { InstagramIcon } from "@/components/brand-icons";

// Placeholder list — instead of the real Instagram embed script (which
// often shows the «ссылка недействительна» fallback in dev) we render a
// stack of square grey tiles labelled "Instagram post" with the post
// URL as a tap target. Drop-in replacement until the OEmbed flow is
// connected to a real account/token.
export function InstagramEmbeds({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {urls.map((url, i) => (
        <a
          key={url || i}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="relative block w-full bg-[#f1f1f1] no-underline"
          style={{ aspectRatio: "1 / 1" }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#170f13]/60">
            <InstagramIcon className="h-8 w-8" />
            <div
              style={{
                fontFamily: "var(--font-hero), system-ui, sans-serif",
                fontSize: "17px",
                lineHeight: "20px",
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
            >
              Instagram post
            </div>
            <div
              className="text-[#170f13]/40"
              style={{
                fontFamily: "var(--font-hero), system-ui, sans-serif",
                fontSize: "13px",
                letterSpacing: "0.02em",
              }}
            >
              {String(i + 1).padStart(2, "0")} / {String(urls.length).padStart(2, "0")}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

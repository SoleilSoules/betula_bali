"use client";

// Horizontal swipeable hero carousel with autoplay (8s) and animated
// progress pill. Each slide takes the full canvas width (430px) and
// shows one signature dish with logo + wordmark + giant title + sub.
//
// Brand wordmark is split: `BALI` in Cormorant serif (--font-brand),
// `BETULA` in Manrope sans (--font-hero). Designer spec.
//
// Designed for the 430-canvas — uses `--scale` CSS var for sizes.

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { OpenBadge } from "@/components/open-badge";

const PX = (n: number) => `calc(${n} * var(--scale, 1px))`;

export type HeroSlide = {
  id: string;
  title: string; // multi-line via \n
  sub: string;
  imageSrc: string;
};

type Props = {
  brand: string;
  logoSrc: string;
  slides: HeroSlide[];
};

const AUTOPLAY_MS = 7000;

export function HeroCarousel({ brand, logoSrc, slides }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Track active slide via scroll position. Use rAF to throttle so
  // the rapid scroll events during smooth-scroll don't thrash React.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const width = el.clientWidth;
        if (!width) return;
        const idx = Math.round(el.scrollLeft / width);
        const clamped = Math.min(slides.length - 1, Math.max(0, idx));
        setActiveIdx((prev) => (prev === clamped ? prev : clamped));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [slides.length]);

  // Autoplay: every AUTOPLAY_MS read the current scrollLeft (single
  // source of truth), advance to the next slide, smooth-scroll there.
  // setInterval keeps the cadence stable regardless of React renders.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const id = window.setInterval(() => {
      const width = el.clientWidth;
      if (!width) return;
      const currentIdx = Math.round(el.scrollLeft / width);
      const nextIdx = (currentIdx + 1) % slides.length;
      el.scrollTo({ left: nextIdx * width, behavior: "smooth" });
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  return (
    <div className="absolute left-0 top-0" style={{ width: PX(430), height: PX(660) }}>
      <div
        ref={scrollerRef}
        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {slides.map((s, i) => (
          <HeroSlideView
            key={s.id}
            slide={s}
            brand={brand}
            logoSrc={logoSrc}
            isActive={i === activeIdx}
            activeIdx={activeIdx}
            index={i}
          />
        ))}
      </div>

      <ProgressPill activeIdx={activeIdx} total={slides.length} />
    </div>
  );
}

function ProgressPill({
  activeIdx,
  total,
}: {
  activeIdx: number;
  total: number;
}) {
  const pillWidth = 60;
  const dotSize = 8;
  const gap = 4;
  // The active position becomes a 60×8 progress pill; every other
  // position is an 8×8 dot, so the pill physically moves to whichever
  // slide is currently playing.
  const totalWidth =
    pillWidth + (total - 1) * (dotSize + gap);

  return (
    <div
      className="pointer-events-none absolute flex items-center"
      style={{
        left: "50%",
        transform: "translateX(-50%)",
        top: PX(594),
        width: PX(totalWidth),
        height: PX(dotSize),
        gap: PX(gap),
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        if (i === activeIdx) {
          return (
            <div
              key={`pill-${i}`}
              className="relative overflow-hidden rounded-full bg-white/40"
              style={{ width: PX(pillWidth), height: PX(dotSize), flexShrink: 0 }}
            >
              <div
                key={`fill-${activeIdx}`}
                className="hero-progress-fill absolute inset-y-0 left-0 rounded-full bg-white"
                style={{
                  width: "100%",
                  transformOrigin: "left center",
                }}
              />
            </div>
          );
        }
        return (
          <span
            key={`dot-${i}`}
            className="rounded-full bg-white/40"
            style={{ width: PX(dotSize), height: PX(dotSize), flexShrink: 0 }}
          />
        );
      })}
    </div>
  );
}

function HeroSlideView({
  slide,
  brand,
  logoSrc,
  isActive,
  activeIdx,
  index,
}: {
  slide: HeroSlide;
  brand: string;
  logoSrc: string;
  isActive: boolean;
  activeIdx: number;
  index: number;
}) {
  // Re-mount key on slide change retriggers the CSS fade-up keyframes
  // every time this slide becomes active. Inactive slides skip the
  // animation entirely so they don't flash during off-screen renders.
  const animKey = `${slide.id}-${activeIdx}`;
  // First slide reads well over the dark-cooked image already; slides
  // 2-5 have lighter photos (borscht, table-shot, mash, croissant), so
  // we drop a denser top-to-mid overlay only on those to keep the giant
  // title readable.
  const isFirst = index === 0;
  return (
    <div
      className="relative flex-shrink-0 snap-start overflow-hidden"
      style={{ width: PX(430), height: PX(660) }}
    >
      <Image
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${slide.imageSrc}`}
        alt=""
        fill
        priority={index === 0}
        sizes="430px"
        className="object-cover"
        unoptimized
      />
      {/* Soft top-to-bottom gradient — light enough to keep food readable */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: isFirst
            ? "linear-gradient(178deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.12) 38%, rgba(0,0,0,0) 70%)"
            : "linear-gradient(178deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.42) 28%, rgba(0,0,0,0.22) 48%, rgba(0,0,0,0.05) 68%, rgba(0,0,0,0) 80%)",
        }}
      />

      {/* Top-right status badge — open/closed based on a daily 12-23 schedule.
          Sits slightly above the BALI BETULA wordmark on the same row. */}
      <div className="absolute flex items-center" style={{ right: PX(20), top: PX(32), gap: PX(6) }}>
        <OpenBadge openHour={12} closeHour={23} />
      </div>

      {/* Logo + wordmark — same place on every slide */}
      <div className="absolute flex items-center" style={{ left: PX(20), top: PX(34), gap: PX(10) }}>
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${logoSrc}`}
          alt=""
          aria-hidden="true"
          className="select-none"
          width={25}
          height={25}
          style={{ width: PX(25.195), height: PX(25) }}
        />
        <span
          className="text-white whitespace-nowrap"
          style={{
            fontFamily: "var(--font-brand), Georgia, serif",
            fontWeight: 700,
            fontSize: PX(22),
            lineHeight: PX(26),
            letterSpacing: "0.06em",
          }}
        >
          {brand}
        </span>
      </div>

      {/* Hero title + sub — slide-specific */}
      <div className="absolute text-white" style={{ left: PX(20), top: PX(74), width: PX(390) }}>
        <p
          key={isActive ? `title-${animKey}` : `title-idle-${slide.id}`}
          className={isActive ? "hero-text-in" : undefined}
          style={{
            fontFamily: "var(--font-hero), system-ui, sans-serif",
            fontSize: "clamp(53px, 14.5vw, 70px)",
            lineHeight: 0.87,
            letterSpacing: "-0.028em",
            fontWeight: 500,
            whiteSpace: "pre-line",
          }}
        >
          {slide.title}
        </p>
        <p
          key={isActive ? `sub-${animKey}` : `sub-idle-${slide.id}`}
          className={isActive ? "hero-sub-in mt-3" : "mt-3"}
          style={{
            fontFamily: "var(--font-hero), system-ui, sans-serif",
            fontSize: "clamp(16px, 4.4vw, 20px)",
            lineHeight: 1.25,
            letterSpacing: "0.005em",
            fontWeight: 500,
            marginLeft: PX(4),
          }}
        >
          {slide.sub}
        </p>
      </div>
    </div>
  );
}

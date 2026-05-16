// Pixel-perfect rendering of Figma node 1090:17541 + filled card content
// + extended Instagram/Footer at the bottom (preserved from the previous
// editorial layout per Daisy's request).
//
// Absolute coordinates inside a 430px canvas; below 430 the canvas
// scales via `--scale` CSS var.

import Image from "next/image";
import Link from "next/link";
import { InstagramEmbeds } from "@/components/instagram-embeds";
import { InstagramIcon } from "@/components/brand-icons";
import { HeroCarousel, type HeroSlide } from "@/components/hero-carousel";
import { ShowMenuTile } from "@/components/show-menu-tile";
import { StickyCtaBar } from "@/components/sticky-cta-bar";

const PX = (n: number) => `calc(${n} * var(--scale, 1px))`;

type Highlight = {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  instagramUrl?: string | null;
};

type EventItem = {
  id: string;
  title: string;
  whenText: string;
  description: string | null;
  photoUrl: string | null;
  whatsappLink?: string | null;
};

type Offering = {
  id: string;
  title: string;
  description: string | null;
  photoUrl: string | null;
  whatsappLink?: string | null;
};

type FigmaHomepageProps = {
  brand?: string;
  heroTitle?: string;
  pricePrefix?: string;
  heroImageSrc?: string;
  logoSrc?: string;
  reserveImageSrc?: string;
  highlights: Highlight[];
  events: EventItem[];
  offerings: Offering[];
  instagramUrls: string[];
  address: string | null;
  googleMapsUrl: string | null;
  instagramUrl: string | null;
  bookingLink?: string | null;
  showMenuHref?: string | null;
};

export function FigmaHomepage({
  brand = "BALI BETULA",
  heroTitle = "Dacha\nunder palms",
  pricePrefix = "Russian comfort food · Bali",
  heroImageSrc = "/photos/figma/hero-final.png",
  logoSrc = "/photos/figma/logo-final.svg",
  reserveImageSrc = "/photos/bali-betula/stew-plate.jpg",
  highlights,
  events,
  offerings,
  instagramUrls,
  address,
  googleMapsUrl,
  instagramUrl,
  bookingLink,
  showMenuHref,
}: FigmaHomepageProps) {
  // Pad data to known card counts so absolute layout stays predictable
  const sig = pad(highlights, 4);
  const ev = pad(events, 3);
  const off = pad(offerings, 2);

  // 5 hero slides — hardcoded под конкретные фото от Гоши. Цены в IDR.
  const heroSlides: HeroSlide[] = [
    {
      id: "slide-uzbek-set",
      title: "Uzbek Set\nfor two",
      sub: "from Rp 295k",
      imageSrc: heroImageSrc, // hero-final.png — жаркое в казане + плов
    },
    {
      id: "slide-borscht",
      title: "Borscht\n& rye",
      sub: "with sour cream · Rp 95k",
      imageSrc: "/photos/figma/slide-2.jpg",
    },
    {
      id: "slide-sunday-feast",
      title: "Sunday\nfeast",
      sub: "family table · Rp 220k/pp",
      imageSrc: "/photos/figma/slide-3.jpg",
    },
    {
      id: "slide-stroganoff",
      title: "Stroganoff\n& mash",
      sub: "from Rp 165k",
      imageSrc: "/photos/figma/slide-4.jpg",
    },
    {
      id: "slide-brunch",
      title: "Almond\ncroissant",
      sub: "with ice latte · Rp 75k",
      imageSrc: "/photos/figma/slide-5.jpg",
    },
  ];

  // Section coordinates — all blocks share the same horizontal grid
  // as the Show menu / Reserve a table cards (left edge 10, right
  // edge 422, total width 412). Two-column layouts use 200px cards
  // with a 12px gap.
  const COL_LEFT = 10;
  const COL_WIDTH = 412;
  const CARD_W = 203;
  const CARD_GAP = 6;
  const COL_RIGHT_LEFT = COL_LEFT + CARD_W + CARD_GAP; // 222

  // Signatures (bento): top-left Syrniki hero (200×420), top-right
  // Beshbarmak (200×204), bottom-right Borscht (200×204), wide row
  // Manty (412×204).
  // Same SECTION_GAP between the Show menu / Reserve cards row (ends
  // at canvas Y 882) and the Signatures header.
  const SECTION_GAP_BEFORE_HDR = 90;
  // Cards row ends at canvas Y 840 (Reserve top 681 + height 159 = 840).
  const SIG_HDR_TOP = 840 + SECTION_GAP_BEFORE_HDR;
  const SIG_CARDS_TOP = SIG_HDR_TOP + 92;
  const SIG_SMALL_H = 204;
  // Hero card exactly spans the two small cards + the gap between
  // them, so the wide-row below sits at the same vertical Y for both
  // columns.
  const SIG_HERO_H = SIG_SMALL_H * 2 + 6;
  const SIG_BR_TOP = SIG_CARDS_TOP + SIG_SMALL_H + CARD_GAP; // 1273
  const SIG_WIDE_TOP = SIG_CARDS_TOP + SIG_HERO_H + CARD_GAP; // 1489
  const SIG_END = SIG_WIDE_TOP + SIG_SMALL_H; // 1693

  // Uniform vertical gap from the end of one section to the next
  // section's header — tightened so the page reads as one composition
  // rather than disconnected islands.
  const SECTION_GAP = 90;

  // Same offset from a section header to its first card regardless of
  // whether the section has a subtitle — keeps the rhythm uniform.
  const HDR_TO_CARDS = 92;

  // Events
  const EVT_HDR_TOP = SIG_END + SECTION_GAP;
  const EVT_CARDS_TOP = EVT_HDR_TOP + HDR_TO_CARDS;
  // 21:9 ratio at width 412 → height ≈ 176.6, round to 176.
  const EVT_CARD_H = 176;
  const EVT_END = EVT_CARDS_TOP + 3 * EVT_CARD_H + 2 * 6;

  // Private hire
  const PH_HDR_TOP = EVT_END + SECTION_GAP;
  const PH_CARDS_TOP = PH_HDR_TOP + HDR_TO_CARDS;
  const PH_CARD_H = 387;
  const PH_END = PH_CARDS_TOP + PH_CARD_H;

  // Instagram + footer — same vertical breathing space as the rest:
  // PH_END → Instagram header gap = SECTION_GAP, header → embeds = HDR_TO_CARDS.
  const IG_HDR_TOP = PH_END + SECTION_GAP;
  const INSTAGRAM_TOP = IG_HDR_TOP + HDR_TO_CARDS;
  // Placeholder tiles are square at COL_WIDTH (412) with a 12px gap.
  const INSTAGRAM_HEIGHT =
    instagramUrls.length > 0
      ? COL_WIDTH * instagramUrls.length + 12 * (instagramUrls.length - 1)
      : 0;
  const FOOTER_TOP = INSTAGRAM_TOP + INSTAGRAM_HEIGHT + SECTION_GAP;
  const FOOTER_HEIGHT = 320;
  const TOTAL_HEIGHT = FOOTER_TOP + FOOTER_HEIGHT;

  return (
    <div
      className="relative mx-auto w-full bg-[#A7735F] overflow-x-hidden"
      style={{
        maxWidth: 430,
        ["--scale" as string]: "min(1px, calc(100vw / 430))",
        height: PX(TOTAL_HEIGHT),
      }}
    >
      {/* ───────── Hero carousel (0 – 702) ───────── */}
      <HeroCarousel brand={brand} logoSrc={logoSrc} slides={heroSlides} />

      {/* Two cards (Figma node 1093:18010, child 1093:18447 / 1093:18454).
          Show menu (1093:18451): grey 222×129 at (10, 753), label inside
          at (22.63, 845.74) in #170f13, 17px Manrope.
          Reserve a table (1093:18456): grey 186×159 at (236, 723) with a
          325×216 photo (kompot) overlaid at (-47, -14) inside, label at
          (248.21, 868.74). Photo crops to the card via overflow-hidden,
          which matches the Figma mask exactly. */}
      <ShowMenuTile href={showMenuHref ?? null} width={CARD_W} left={COL_LEFT} />
      <div
        className="absolute overflow-hidden bg-[#f1f1f1]"
        style={{ left: PX(COL_RIGHT_LEFT), top: PX(681), width: PX(CARD_W), height: PX(159) }}
      >
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/photos/bali-betula/cocktail-glass.png`}
          alt="Морс в стакане — напиток на столе Bali Betula"
          width={320}
          height={320}
          sizes="320px"
          className="absolute max-w-none"
          style={{
            width: PX(320),
            height: "auto",
            left: PX(-40),
            top: PX(-10),
          }}
        />
        {/* Frosted-glass pill so the label reads as a CTA on top of the
            cocktail photo instead of melting into the colours. */}
        <a
          href={bookingLink ?? "#"}
          target={bookingLink ? "_blank" : undefined}
          rel={bookingLink ? "noreferrer" : undefined}
          className="absolute inline-flex items-center gap-1.5 text-[#170f13] whitespace-nowrap no-underline"
          style={{
            left: PX(12.21),
            top: PX(122),
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
          Reserve a table
          <span style={{ fontSize: PX(15), opacity: 0.6 }}>→</span>
        </a>
      </div>

      {/* ───────── Signatures (bento: hero + 2 small + wide) ───────── */}
      {/* Scroll-target — Show menu pill jumps here on the landing
          page (no table token, so the QR-order section is hidden). */}
      <div
        id="signatures"
        aria-hidden="true"
        className="absolute"
        style={{ left: 0, top: PX(SIG_HDR_TOP - 40), width: 1, height: 1 }}
      />
      <SectionHeader top={SIG_HDR_TOP} title="Signatures" subtitle="What guests come back for" />

      {/* Top-left hero (Syrniki) — gets tilt-on-tap feedback */}
      <PhotoCard
        item={sig[0]}
        kind="signature"
        hero
        style={{ left: PX(COL_LEFT), top: PX(SIG_CARDS_TOP), width: PX(CARD_W), height: PX(SIG_HERO_H) }}
      />
      {/* Top-right small (Beshbarmak) */}
      <PhotoCard
        item={sig[1]}
        kind="signature"
        style={{ left: PX(COL_RIGHT_LEFT), top: PX(SIG_CARDS_TOP), width: PX(CARD_W), height: PX(SIG_SMALL_H) }}
      />
      {/* Bottom-right small (Borscht) */}
      <PhotoCard
        item={sig[2]}
        kind="signature"
        style={{ left: PX(COL_RIGHT_LEFT), top: PX(SIG_BR_TOP), width: PX(CARD_W), height: PX(SIG_SMALL_H) }}
      />
      {/* Bottom wide (Manty) */}
      <PhotoCard
        item={sig[3]}
        kind="signature"
        style={{ left: PX(COL_LEFT), top: PX(SIG_WIDE_TOP), width: PX(COL_WIDTH), height: PX(SIG_SMALL_H) }}
      />

      {/* ───────── Events ───────── */}
      <SectionHeader top={EVT_HDR_TOP} title="Events" />

      <PhotoCard
        item={ev[0]}
        kind="event"
        style={{ left: PX(COL_LEFT), top: PX(EVT_CARDS_TOP), width: PX(COL_WIDTH), height: PX(EVT_CARD_H) }}
      />
      <PhotoCard
        item={ev[1]}
        kind="event"
        style={{ left: PX(COL_LEFT), top: PX(EVT_CARDS_TOP + EVT_CARD_H + 6), width: PX(COL_WIDTH), height: PX(EVT_CARD_H) }}
      />
      <PhotoCard
        item={ev[2]}
        kind="event"
        style={{ left: PX(COL_LEFT), top: PX(EVT_CARDS_TOP + 2 * (EVT_CARD_H + 6)), width: PX(COL_WIDTH), height: PX(EVT_CARD_H) }}
      />

      {/* ───────── Private hire (horizontal scroll) ───────── */}
      <SectionHeader top={PH_HDR_TOP} title="Private hire" subtitle="What guests come back for" />

      {/* Horizontal scroller — width matches the canvas grid, so the
          first card fits on mobile and the second card is hinted by a
          peek on the right. Inner row is wider so the user can swipe. */}
      <div
        className="absolute overflow-x-auto snap-x snap-mandatory no-scrollbar"
        style={{
          left: PX(COL_LEFT),
          top: PX(PH_CARDS_TOP),
          width: PX(COL_WIDTH),
          height: PX(PH_CARD_H + 8),
        }}
      >
        <div className="relative" style={{ width: PX(580), height: PX(PH_CARD_H) }}>
          <PhotoCard
            item={off[0]}
            kind="offering"
            style={{ left: 0, top: 0, width: PX(285), height: PX(PH_CARD_H), scrollSnapAlign: "start" }}
          />
          <PhotoCard
            item={off[1]}
            kind="offering"
            style={{ left: PX(295), top: 0, width: PX(285), height: PX(PH_CARD_H), scrollSnapAlign: "start" }}
          />
        </div>
      </div>

      {/* ───────── Instagram (preserved) ───────── */}
      {instagramUrls.length > 0 && (
        <>
          <SectionHeader top={IG_HDR_TOP} title="Life at Betula" subtitle="Latest from Instagram" />
          <div
            className="absolute overflow-hidden"
            style={{ left: PX(COL_LEFT), top: PX(INSTAGRAM_TOP), width: PX(COL_WIDTH), height: PX(INSTAGRAM_HEIGHT) }}
          >
            <InstagramEmbeds urls={instagramUrls} />
          </div>
        </>
      )}

      {/* ───────── Footer ───────── */}
      <div
        className="absolute flex flex-col items-stretch text-center"
        style={{
          left: PX(COL_LEFT),
          top: PX(FOOTER_TOP),
          width: PX(COL_WIDTH),
          height: PX(FOOTER_HEIGHT),
        }}
      >
        <div
          className="border-t border-dashed w-full"
          style={{ borderColor: "rgba(0,0,0,0.18)" }}
          aria-hidden="true"
        />
        {/* Подвал-«роща» — две берёзы из брендового SVG прижаты к левому
            и правому краю, обрезаны верхней границей контейнера (сама
            эта граница идёт сразу под пунктиром, так что берёзы не
            прорастают выше). Контент (адрес/часы/IG) лежит поверх. */}
        <div className="relative flex-1 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/photos/figma/logo-vec.svg`}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              left: PX(-170),
              top: 0,
              height: PX(360),
              width: "auto",
              opacity: 0.08,
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/photos/figma/logo-vec.svg`}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              right: PX(-170),
              top: 0,
              height: PX(360),
              width: "auto",
              opacity: 0.08,
            }}
          />
          <div className="relative flex flex-col items-center justify-center h-full">
          {address && (
            <div
              className="text-[#F7F1E8]/85"
              style={{
                fontFamily: "var(--font-hero), system-ui, sans-serif",
                fontSize: PX(15),
                lineHeight: PX(22),
                maxWidth: PX(360),
              }}
            >
              {googleMapsUrl ? (
                <Link href={googleMapsUrl} target="_blank">
                  {address}
                </Link>
              ) : (
                <span>{address}</span>
              )}
            </div>
          )}
          <div
            className="mt-2 text-[#F7F1E8]/65"
            style={{
              fontFamily: "var(--font-hero), system-ui, sans-serif",
              fontSize: PX(14),
              lineHeight: PX(20),
              letterSpacing: "0.02em",
            }}
          >
            Open daily · 12:00 – 23:00
          </div>
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-[#F7F1E8]/80"
              style={{
                fontFamily: "var(--font-hero), system-ui, sans-serif",
                fontSize: PX(15),
              }}
            >
              <InstagramIcon className="h-3.5 w-3.5" />
              Instagram
            </a>
          )}
          </div>
        </div>
      </div>

      <StickyCtaBar
        showMenuHref={showMenuHref ?? null}
        bookingLink={bookingLink ?? null}
      />
    </div>
  );
}

function pad<T>(arr: T[], n: number): (T | null)[] {
  const out: (T | null)[] = arr.slice(0, n);
  while (out.length < n) out.push(null);
  return out;
}

function SectionHeader({
  top,
  title,
  subtitle,
}: {
  top: number;
  title: string;
  subtitle?: string;
}) {
  return (
    <>
      <p
        className="absolute text-[#F7F1E8] whitespace-nowrap"
        style={{
          left: PX(14),
          top: PX(top),
          fontFamily: "var(--font-hero), system-ui, sans-serif",
          fontSize: PX(39),
          lineHeight: PX(48),
          letterSpacing: "-0.02em",
          fontWeight: 700,
        }}
      >
        {title}
      </p>
      {subtitle && (
        <p
          className="absolute text-[#F7F1E8]/60 whitespace-nowrap"
          style={{
            left: PX(16),
            top: PX(top + 52),
            fontFamily: "var(--font-hero), system-ui, sans-serif",
            fontSize: PX(17),
            lineHeight: PX(20),
            letterSpacing: "0.01em",
          }}
        >
          {subtitle}
        </p>
      )}
    </>
  );
}

function PhotoCard({
  item,
  kind,
  style,
  hero = false,
}: {
  item: Highlight | EventItem | Offering | null;
  kind: "signature" | "event" | "offering";
  style: React.CSSProperties;
  hero?: boolean;
}) {
  if (!item) {
    return <div className="absolute bg-black" style={style} />;
  }
  const title =
    "name" in item
      ? item.name
      : (item as EventItem | Offering).title;
  const photoUrl = item.photoUrl ?? "/photos/bali-betula/stew-plate.jpg";
  const whenText = "whenText" in item ? item.whenText : null;

  // Whole-card link when the data has a natural target (Signatures →
  // Instagram, Offering → WhatsApp). Event cards aren't wrapped in
  // <a> because they contain their own Join button.
  const cardHref: string | null =
    kind === "signature" && "instagramUrl" in item
      ? (item.instagramUrl as string | null | undefined) ?? null
      : kind === "offering" && "whatsappLink" in item
        ? (item.whatsappLink as string | null | undefined) ?? null
        : null;
  const Wrapper: React.ElementType = cardHref ? "a" : "div";
  const wrapperProps = cardHref
    ? { href: cardHref, target: "_blank", rel: "noreferrer" }
    : {};

  const tileClass = hero && kind === "signature" ? "signature-hero-tile" : "";
  return (
    <Wrapper
      {...wrapperProps}
      className={`absolute overflow-hidden bg-black no-underline ${tileClass}`}
      style={style}
    >
      <Image
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${photoUrl}`}
        alt={title}
        fill
        sizes="398px"
        className={`object-cover ${hero && kind === "signature" ? "signature-hero-photo" : ""}`}
        unoptimized
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            kind === "event"
              ? "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.7) 100%)"
              : "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)",
        }}
      />
      {kind === "event" ? (
        <>
          {whenText && (
            <div
              className="absolute text-white"
              style={{
                top: PX(14),
                left: PX(16),
                fontFamily: "var(--font-hero), system-ui, sans-serif",
                fontSize: PX(13),
                lineHeight: PX(16),
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              {whenText}
            </div>
          )}
          <div
            className="absolute"
            style={{ left: PX(16), right: PX(110), bottom: PX(14) }}
          >
            <div
              className="text-white"
              style={{
                fontFamily: "var(--font-hero), system-ui, sans-serif",
                fontSize: PX(20),
                lineHeight: PX(24),
                fontWeight: 500,
                letterSpacing: "-0.005em",
              }}
            >
              {title}
            </div>
            {item.description && (
              <p
                className="mt-1 text-white/80"
                style={{
                  fontFamily: "var(--font-hero), system-ui, sans-serif",
                  fontSize: PX(13),
                  lineHeight: PX(17),
                }}
              >
                {item.description}
              </p>
            )}
          </div>
          {"whatsappLink" in item && item.whatsappLink ? (
            <a
              href={item.whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="absolute no-underline"
              style={{
                right: PX(14),
                bottom: PX(14),
                paddingTop: PX(9),
                paddingBottom: PX(10),
                paddingLeft: PX(18),
                paddingRight: PX(18),
                background: "rgba(247, 242, 232, 0.96)",
                color: "#170f13",
                fontFamily: "var(--font-hero), system-ui, sans-serif",
                fontSize: PX(15),
                lineHeight: PX(18),
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Join
            </a>
          ) : null}
        </>
      ) : (
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div
            className="text-white"
            style={{
              fontFamily: "var(--font-hero), system-ui, sans-serif",
              fontSize: kind === "offering" ? PX(22) : PX(17),
              lineHeight: kind === "offering" ? PX(26) : PX(22),
              fontWeight: 500,
              letterSpacing: "-0.005em",
            }}
          >
            {title}
          </div>
          {item.description && (
            <p
              className="mt-1 text-white/80"
              style={{
                fontFamily: "var(--font-hero), system-ui, sans-serif",
                fontSize: kind === "signature" ? PX(14) : PX(13),
                lineHeight: PX(18),
                fontWeight: kind === "signature" ? 500 : 400,
              }}
            >
              {item.description}
            </p>
          )}
        </div>
      )}
    </Wrapper>
  );
}

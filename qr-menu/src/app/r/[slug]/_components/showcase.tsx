import Link from "next/link";
import {
  MapPin,
  FileText,
  ExternalLink,
  ChevronRight,
  MessageCircle,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import { DishPhoto } from "@/components/dish-photo";
import { InstagramEmbeds } from "@/components/instagram-embeds";
import { InstagramIcon } from "@/components/brand-icons";
import { TropicalBackdrop } from "@/components/tropical-backdrop";
import { FigmaHero } from "@/components/figma-hero";
import { FigmaHomepage } from "@/components/figma-homepage";
// MenuView temporarily disabled — landing-only demo.
// import { MenuView } from "../menu-view";

type Highlight = {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  instagramUrl: string | null;
};

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  whenText: string;
  photoUrl: string | null;
  whatsappLink: string | null;
};

type Offering = {
  id: string;
  title: string;
  description: string | null;
  photoUrl: string | null;
  whatsappLink: string | null;
};

type Category = {
  id: string;
  name: string;
  dishes: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    photoUrl: string | null;
  }[];
};

export function Showcase(props: {
  slug: string;
  name: string;
  description: string | null;
  address: string | null;
  logoUrl: string | null;
  currency: string;
  googleMapsUrl: string | null;
  instagramUrl: string | null;
  whatsappPhone: string | null;
  bookingLink: string | null;
  mainMenuPdfUrl: string | null;
  specialMenuPdfUrl: string | null;
  highlights: Highlight[];
  events: EventItem[];
  offerings: Offering[];
  instagramUrls: string[];
  orderCategories: Category[];
  tableToken: string | null;
  tableLabel: string | null;
}) {
  const {
    slug,
    name,
    description,
    address,
    logoUrl,
    currency,
    googleMapsUrl,
    instagramUrl,
    bookingLink,
    mainMenuPdfUrl,
    specialMenuPdfUrl,
    highlights,
    events,
    offerings,
    instagramUrls,
    orderCategories,
    tableToken,
    tableLabel,
  } = props;

  // QR-меню рендерится ТОЛЬКО когда гость пришёл со столика (есть
  // tableToken). На лендинге /r/demo показываем только витрину.
  const showOrderSection = !!tableToken && orderCategories.length > 0;
  const hasAnyMenu = !!mainMenuPdfUrl || !!specialMenuPdfUrl || showOrderSection;

  // Toggle: показывать ли pixel-perfect Figma layout (1-в-1) или editorial
  // версию с динамическим контентом (Hero/PrimaryCta/Section/Mosaic/...).
  // Figma layout по требованию заказчика — структура с чёрными плейсхолдерами
  // и фиксированными координатами для согласования.
  const useFigmaLayout = true;

  if (useFigmaLayout) {
    return (
      <main className="relative min-h-svh bg-[#A7735F] text-white">
        <div className="mx-auto md:my-6 md:shadow-[0_30px_60px_-20px_rgb(0_0_0_/_0.25)]" style={{ width: "min(100%, 430px)" }}>
          <FigmaHomepage
            brand={name.toUpperCase()}
            highlights={highlights}
            events={events}
            offerings={offerings}
            instagramUrls={instagramUrls}
            address={address}
            googleMapsUrl={googleMapsUrl}
            instagramUrl={instagramUrl}
            bookingLink={bookingLink}
            showMenuHref="#signatures"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-svh bg-[var(--qr-bg)] text-[var(--qr-text)]">
      <div className="mx-auto max-w-md md:shadow-[0_30px_60px_-20px_rgb(0_0_0_/_0.25)] md:my-6 md:rounded-md md:overflow-hidden bg-[var(--qr-bg)]">
        <FigmaHero brand={name.toUpperCase()} />
        <div className="relative">
          <TropicalBackdrop />
          <div className="relative px-5 pt-12 pb-16 space-y-14">
        <Hero
          name={name}
          description={description}
          address={address}
          logoUrl={logoUrl}
          googleMapsUrl={googleMapsUrl}
          instagramUrl={instagramUrl}
          tableLabel={tableLabel}
        />

        {bookingLink && (
          <PrimaryCta
            href={bookingLink}
            title="Reserve a table"
            subtitle="Opens WhatsApp with a prefilled message"
          />
        )}

        {highlights.length > 0 && (
          <Section
            eyebrow="01"
            title="Signatures"
            subtitle="What guests come back for"
          >
            <HighlightsMosaic items={highlights} />
          </Section>
        )}

        {events.length > 0 && (
          <Section
            eyebrow="02"
            title="Events"
            subtitle="RSVP to save your seat"
          >
            <div className="space-y-3">
              {events.map((e) => (
                <EventCard key={e.id} item={e} />
              ))}
            </div>
          </Section>
        )}

        {offerings.length > 0 && (
          <Section
            eyebrow="03"
            title="Private hire"
            subtitle="Book via WhatsApp"
          >
            <div className="grid sm:grid-cols-2 gap-3">
              {offerings.map((o) => (
                <OfferingCard key={o.id} item={o} />
              ))}
            </div>
          </Section>
        )}

        {hasAnyMenu && (
          <Section eyebrow="04" title="Menu">
            <div className="space-y-3">
              {mainMenuPdfUrl && (
                <MenuButton href={mainMenuPdfUrl} label="Main menu" hint="PDF" />
              )}
              {specialMenuPdfUrl && (
                <MenuButton href={specialMenuPdfUrl} label="Specials" hint="PDF" />
              )}
              {showOrderSection && (
                <a
                  href="#order"
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--qr-border)] bg-[var(--qr-card-bg)] px-5 py-4 hover:border-[var(--qr-accent)] transition-colors"
                  style={{ boxShadow: "var(--qr-shadow)" }}
                >
                  <div>
                    <div className="font-medium">Order from your table</div>
                    <div className="text-sm text-[var(--qr-muted)]">
                      Table {tableLabel} · pay your server
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--qr-muted)]" />
                </a>
              )}
            </div>
          </Section>
        )}

        {instagramUrls.length > 0 && (
          <Section
            eyebrow="05"
            title="Life at Betula"
            subtitle="Latest from Instagram"
          >
            <InstagramEmbeds urls={instagramUrls} />
          </Section>
        )}

        <Footer
          address={address}
          googleMapsUrl={googleMapsUrl}
          instagramUrl={instagramUrl}
        />
          </div>
        </div>

      </div>
    </main>
  );
}

function Hero({
  name,
  description,
  address,
  logoUrl,
  googleMapsUrl,
  instagramUrl,
  tableLabel,
}: {
  name: string;
  description: string | null;
  address: string | null;
  logoUrl: string | null;
  googleMapsUrl: string | null;
  instagramUrl: string | null;
  tableLabel: string | null;
}) {
  // Editorial header: a small eyebrow row up top (table-for badge,
  // optional logo as a sigil instead of an avatar), then the name in the
  // display serif so the place gets a voice. Address/Instagram are
  // underlined text links — like a printed menu — not pill buttons.
  return (
    <header className="space-y-5">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[var(--qr-muted)]">
        <span
          className="text-[var(--qr-accent)]"
          style={{ fontFamily: "var(--font-script), cursive", textTransform: "none", letterSpacing: 0, fontSize: 18 }}
        >
          Open daily
        </span>
        {tableLabel ? (
          <span className="text-[var(--qr-accent)]">Table {tableLabel}</span>
        ) : (
          <span>Showcase</span>
        )}
      </div>

      <div className="flex items-start gap-4">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={name}
            className="h-14 w-14 rounded-full object-cover border border-[var(--qr-border)] shrink-0"
          />
        ) : null}
        <div className="flex flex-col">
          <h1
            className="text-4xl sm:text-5xl leading-[1.02] tracking-[-0.01em] font-medium"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            {name}
          </h1>
          {address ? (
            <span
              className="mt-1 text-[18px] text-[var(--qr-accent)] leading-none"
              style={{
                fontFamily: "var(--font-script), cursive",
                transform: "rotate(-1.5deg)",
                transformOrigin: "left center",
                display: "inline-block",
              }}
            >
              social hideout · est. 2018
            </span>
          ) : null}
        </div>
      </div>

      {description && (
        <p className="text-[var(--qr-muted)] leading-relaxed text-[15px] max-w-[36ch] sm:ml-[72px]">
          {description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-sm">
        {address ? (
          googleMapsUrl ? (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 underline decoration-[var(--qr-rule)] decoration-[1.5px] underline-offset-4 hover:decoration-[var(--qr-accent)] hover:text-[var(--qr-accent)] transition-colors"
            >
              <MapPin className="h-3.5 w-3.5" />
              {address}
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[var(--qr-muted)]">
              <MapPin className="h-3.5 w-3.5" />
              {address}
            </span>
          )
        ) : null}
        {instagramUrl && (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 underline decoration-[var(--qr-rule)] decoration-[1.5px] underline-offset-4 hover:decoration-[var(--qr-accent)] hover:text-[var(--qr-accent)] transition-colors"
          >
            <InstagramIcon className="h-3.5 w-3.5" />
            Instagram
          </a>
        )}
      </div>
    </header>
  );
}

function PrimaryCta({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  // Reservation card — reads as a hand-stamped invitation, not a button.
  // Filled burgundy bg, cream text, decorative double rule inside, a big
  // ornament watermark in the corner, and a two-line script handwritten
  // eyebrow that converts «button text» into «host's note».
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group relative block overflow-hidden rounded-sm px-6 py-7 transition-transform hover:-translate-y-0.5"
      style={{
        background: "var(--qr-accent)",
        color: "var(--qr-card-bg)",
        boxShadow: "0 6px 24px -10px rgb(0 0 0 / 0.25)",
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-[8px] h-px"
        style={{ background: "currentColor", opacity: 0.35 }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 bottom-[8px] h-px"
        style={{ background: "currentColor", opacity: 0.35 }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-3 -right-2 select-none"
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontSize: 140,
          lineHeight: 1,
          color: "currentColor",
          opacity: 0.1,
          transform: "rotate(8deg)",
        }}
      >
        ✦
      </span>
      <div className="relative flex items-end justify-between gap-3">
        <div>
          <div
            className="mb-1.5 leading-[1.05]"
            style={{ fontFamily: "var(--font-script), cursive", fontSize: 19, opacity: 0.92 }}
          >
            from our table —
            <br />
            <span style={{ paddingLeft: 24 }}>to yours</span>
          </div>
          <div
            className="text-2xl sm:text-3xl leading-tight mt-2"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            {title}
          </div>
          <div className="text-sm mt-2 flex items-center gap-1.5 opacity-90">
            <MessageCircle className="h-3.5 w-3.5" />
            {subtitle}
          </div>
        </div>
        <ArrowUpRight
          className="h-6 w-6 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 shrink-0"
        />
      </div>
    </a>
  );
}

function Section({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  // Menu-style section heading: numbered eyebrow + title with a tiny
  // ornament glyph + thin rule that travels to the right edge. Reads
  // as a chapter break in a printed menu rather than another `<h2>`.
  return (
    <section>
      <div className="mb-5">
        {eyebrow ? (
          <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--qr-muted)] mb-1.5">
            {eyebrow}
          </div>
        ) : null}
        <div className="flex items-baseline gap-3">
          <h2
            className="text-2xl leading-tight tracking-tight"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            {title}
          </h2>
          <BirchStripe />
          <span
            aria-hidden="true"
            className="flex-1 h-px bg-[var(--qr-rule)] opacity-60"
          />
        </div>
        {subtitle && (
          <p className="text-sm text-[var(--qr-muted)] mt-1.5">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

// BirchStripe — sigil divider in section headers. Vertical white stripe
// with horizontal dark "eyes" — stylised birch trunk fragment. Brand-
// specific (Betula = birch), replaces the generic ✦ ornament.
function BirchStripe() {
  return (
    <span aria-hidden="true" className="inline-block shrink-0" style={{ lineHeight: 0 }}>
      <svg width="10" height="22" viewBox="0 0 10 22" fill="none">
        <rect x="3" y="0" width="4" height="22" fill="var(--qr-card-bg)" stroke="var(--qr-rule)" strokeWidth="0.6" />
        <rect x="3" y="3" width="4" height="1.5" fill="var(--qr-text)" />
        <rect x="3" y="9" width="4" height="1" fill="var(--qr-text)" />
        <rect x="3" y="14" width="4" height="1.8" fill="var(--qr-text)" />
        <rect x="3" y="19" width="4" height="0.8" fill="var(--qr-text)" />
      </svg>
    </span>
  );
}

function HighlightsMosaic({ items }: { items: Highlight[] }) {
  // Editorial mosaic: first item is a tall hero, the rest sit in a 2x2
  // (or 2-column) grid next to it. Works as long as we have ≥3 items;
  // for fewer items, fall back to a plain grid.
  if (items.length < 3) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {items.map((h) => (
          <HighlightCard key={h.id} item={h} />
        ))}
      </div>
    );
  }
  const [hero, ...rest] = items;
  // never undefined here, but TS narrows via the length check above
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4">
      {hero ? (
        <div className="row-span-2 col-span-1">
          <HighlightCard item={hero} hero />
        </div>
      ) : null}
      <div className="col-span-1 grid grid-cols-1 grid-rows-2 gap-3 sm:gap-4 row-span-2">
        {rest.slice(0, 2).map((h) => (
          <HighlightCard key={h.id} item={h} />
        ))}
      </div>
      {rest.slice(2, 5).length > 0 && (
        <div className="col-span-2 grid grid-cols-3 gap-3 sm:gap-4">
          {rest.slice(2, 5).map((h) => (
            <HighlightCard key={h.id} item={h} compact />
          ))}
        </div>
      )}
    </div>
  );
}

function HighlightCard({
  item,
  hero,
  compact,
}: {
  item: Highlight;
  hero?: boolean;
  compact?: boolean;
}) {
  const Wrapper: React.ElementType = item.instagramUrl ? "a" : "div";
  const wrapperProps = item.instagramUrl
    ? { href: item.instagramUrl, target: "_blank", rel: "noreferrer" }
    : {};
  const photoAspect = hero ? "aspect-[3/4]" : compact ? "aspect-square" : "aspect-[4/3]";
  const photoIcon = hero ? 48 : compact ? 24 : 32;
  return (
    <Wrapper
      {...wrapperProps}
      className="group relative flex h-full flex-col overflow-hidden rounded-sm border border-[var(--qr-border)] bg-[var(--qr-card-bg)] transition-colors hover:border-[var(--qr-accent)]"
      style={{ boxShadow: "var(--qr-shadow)" }}
    >
      {hero ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-2 -right-2 z-10 select-none"
          style={{
            fontFamily: "var(--font-script), cursive",
            fontSize: 22,
            color: "var(--qr-accent)",
            transform: "rotate(-6deg)",
            background: "var(--qr-card-bg)",
            padding: "2px 8px",
            border: "1px solid var(--qr-accent)",
            borderRadius: 2,
            lineHeight: 1.1,
            boxShadow: "0 2px 8px -2px rgb(0 0 0 / 0.15)",
          }}
        >
          family style
        </span>
      ) : null}
      <DishPhoto
        src={item.photoUrl}
        alt={item.name}
        className={`${photoAspect} w-full`}
        iconSize={photoIcon}
      />
      <div className={`flex flex-col gap-1 p-3 ${hero ? "sm:p-4" : ""}`}>
        <div
          className={
            hero
              ? "text-base font-medium leading-snug"
              : "text-sm font-medium leading-snug"
          }
        >
          {item.name}
        </div>
        {item.instagramUrl && !compact && (
          <div className="text-xs text-[var(--qr-muted)] flex items-center gap-1">
            <InstagramIcon className="h-3 w-3" />
            <span>On Instagram</span>
          </div>
        )}
      </div>
    </Wrapper>
  );
}

function EventCard({ item }: { item: EventItem }) {
  return (
    <article
      className="rounded-sm border border-[var(--qr-border)] bg-[var(--qr-card-bg)] p-4 flex gap-4 items-start"
      style={{ boxShadow: "var(--qr-shadow)" }}
    >
      <DishPhoto
        src={item.photoUrl}
        alt={item.title}
        className="h-20 w-20 rounded-sm shrink-0"
        iconSize={24}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--qr-muted)] flex items-center gap-1.5">
          <CalendarDays className="h-3 w-3" />
          {item.whenText}
        </div>
        <div
          className="text-lg leading-tight mt-1"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          {item.title}
        </div>
        {item.description && (
          <p className="text-sm text-[var(--qr-muted)] leading-snug mt-1">
            {item.description}
          </p>
        )}
        {item.whatsappLink && (
          <a
            href={item.whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 mt-3 px-3.5 py-1.5 rounded-sm text-sm font-medium border border-[var(--qr-accent)] text-[var(--qr-accent)] hover:bg-[var(--qr-accent)] hover:text-white transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            RSVP
          </a>
        )}
      </div>
    </article>
  );
}

function OfferingCard({ item }: { item: Offering }) {
  return (
    <article
      className="rounded-sm border border-[var(--qr-border)] bg-[var(--qr-card-bg)] p-4 flex flex-col gap-3"
      style={{ boxShadow: "var(--qr-shadow)" }}
    >
      <DishPhoto
        src={item.photoUrl}
        alt={item.title}
        className="aspect-[16/10] w-full rounded-sm"
        iconSize={28}
      />
      <div className="flex-1 min-w-0">
        <div
          className="text-lg leading-tight"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          {item.title}
        </div>
        {item.description && (
          <p className="text-sm text-[var(--qr-muted)] leading-snug mt-1">
            {item.description}
          </p>
        )}
      </div>
      {item.whatsappLink && (
        <a
          href={item.whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-sm text-sm font-medium border border-[var(--qr-accent)] text-[var(--qr-accent)] hover:bg-[var(--qr-accent)] hover:text-white transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Book
        </a>
      )}
    </article>
  );
}

function MenuButton({
  href,
  label,
  hint,
}: {
  href: string;
  label: string;
  hint: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-3 rounded-sm border border-[var(--qr-border)] bg-[var(--qr-card-bg)] px-5 py-4 hover:border-[var(--qr-accent)] transition-colors"
      style={{ boxShadow: "var(--qr-shadow)" }}
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-sm flex items-center justify-center bg-[var(--qr-bg)] text-[var(--qr-accent)]">
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <div className="font-medium">{label}</div>
          <div className="text-xs text-[var(--qr-muted)]">{hint}</div>
        </div>
      </div>
      <ExternalLink className="h-4 w-4 text-[var(--qr-muted)]" />
    </a>
  );
}

function Footer({
  address,
  googleMapsUrl,
  instagramUrl,
}: {
  address: string | null;
  googleMapsUrl: string | null;
  instagramUrl: string | null;
}) {
  return (
    <footer className="pt-8 border-t border-dashed border-[var(--qr-rule)] text-center text-sm text-[var(--qr-muted)] space-y-3">
      <div
        className="text-[28px] leading-[1.1] text-[var(--qr-accent)]"
        style={{
          fontFamily: "var(--font-script), cursive",
        }}
      >
        good food <span className="text-[var(--qr-rule)]">·</span> good people{" "}
        <span className="text-[var(--qr-rule)]">·</span> good vibes
      </div>
      {address && googleMapsUrl ? (
        <Link
          href={googleMapsUrl}
          target="_blank"
          className="block hover:text-[var(--qr-accent)] transition-colors"
        >
          {address}
        </Link>
      ) : address ? (
        <div>{address}</div>
      ) : null}
      {instagramUrl && (
        <a
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 hover:text-[var(--qr-accent)] transition-colors"
        >
          <InstagramIcon className="h-3.5 w-3.5" />
          Instagram
        </a>
      )}
    </footer>
  );
}

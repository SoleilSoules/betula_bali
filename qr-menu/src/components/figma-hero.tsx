// Full-screen hero ровно по Figma node 865:56248. Структура:
//   • Полноэкранное фуд-фото (жаркое в казане), затемнено градиентом 187deg
//     сверху сверху-вниз так, чтобы белый текст и логотип читались.
//   • В шапке: маленький круглый логотип-знак слева + wordmark
//     `BALI BETULA` (Cormorant Bold 28) по центру.
//   • Большой hero-текст слева: `Uzbek Dinner` 79px Manrope Light (замена
//     Suisse Int'l Book) + цена `от 109₽` под ним 24px.
//   • Внизу — progress-pill (current, 35/60 active) + 3 точки = индикатор
//     карусели hero-промо.
//
// Размеры взяты в Figma пропорционально (430×702). Я держу абсолют px на
// мобильном до ширины 430, выше — клампится через max-w-md.

import Image from "next/image";

type FigmaHeroProps = {
  title?: string;
  pricePrefix?: string;
  brand?: string;
  imageSrc?: string;
  logoSrc?: string;
};

export function FigmaHero({
  title = "Uzbek Dinner",
  pricePrefix = "от 109₽",
  brand = "BALI BETULA",
  imageSrc = "/photos/figma/hero-99999.png",
  logoSrc = "/photos/figma/logo-vec.svg",
}: FigmaHeroProps) {
  return (
    <section
      aria-label={brand}
      className="relative w-full overflow-hidden bg-black text-white"
      // 100svh даёт реальный «первый экран» на iOS (без скачка из-за тулбара)
      style={{ height: "100svh", minHeight: 640, maxHeight: 940 }}
    >
      {/* фуд-фото */}
      <Image
        src={imageSrc}
        alt=""
        fill
        priority
        sizes="(max-width: 430px) 100vw, 430px"
        className="object-cover"
      />

      {/* градиент-затемнение сверху */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(187.155deg, rgba(0,0,0,0.55) 18.298%, rgba(0,0,0,0) 96.43%)",
        }}
      />

      {/* верх: логотип-знак слева + wordmark по центру */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center px-5 pt-[34px]">
        <img
          src={logoSrc}
          alt=""
          aria-hidden="true"
          className="h-[25px] w-[25px] shrink-0 select-none"
          style={{ filter: "invert(1) brightness(2)" }}
        />
        <h1
          className="mx-auto text-center text-[28px] font-bold leading-[32px] tracking-[0.02em] -translate-x-3"
          style={{ fontFamily: "var(--font-brand), Georgia, serif" }}
        >
          {brand}
        </h1>
      </div>

      {/* hero-текст слева */}
      <div className="absolute left-5 top-[72px] z-10 max-w-[85%]">
        <h2
          className="font-light tracking-[-0.02em]"
          style={{
            fontFamily: "var(--font-hero), system-ui, sans-serif",
            fontSize: "clamp(56px, 18vw, 79px)",
            lineHeight: 0.92,
          }}
        >
          {title.split(" ").map((w, i) => (
            <span key={i} className="block">
              {w}
            </span>
          ))}
        </h2>
        <p
          className="mt-3 text-[24px] leading-5 tracking-[0.01em]"
          style={{
            fontFamily: "var(--font-hero), system-ui, sans-serif",
            marginLeft: 5,
          }}
        >
          {pricePrefix}
        </p>
      </div>

      {/* carousel progress снизу */}
      <div className="absolute inset-x-0 bottom-[42px] z-10 flex items-center justify-center gap-1.5">
        <div className="relative h-2 w-[60px] overflow-hidden rounded-full bg-white/40">
          <div className="absolute inset-y-0 left-0 w-[58%] rounded-full bg-white" />
        </div>
        <span className="h-2 w-2 rounded-full bg-white/40" />
        <span className="h-2 w-2 rounded-full bg-white/40" />
        <span className="h-2 w-2 rounded-full bg-white/40" />
      </div>
    </section>
  );
}

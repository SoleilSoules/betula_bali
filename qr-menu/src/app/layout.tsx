import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora, Caveat, Cormorant, Manrope } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Lora — display serif for restaurant / showcase headings. Cyrillic +
// latin subsets so the russian titles still hit a real font instead of
// falling back to Times.
const lora = Lora({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Caveat — handwritten accent для одной коротенькой надписи в hero
// (например «Open daily» / «Good vibes»). Используем редко, как «штамп».
const caveat = Caveat({
  variable: "--font-script",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"],
  display: "swap",
});

// Cormorant — для wordmark логотипа BALI BETULA в hero (Figma spec).
const cormorant = Cormorant({
  variable: "--font-brand",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700"],
  display: "swap",
});

// Manrope — neo-grotesque замена Suisse Int'l / ALS Hauss из дизайна.
// Используется для гигантского hero-заголовка и подписи цены.
const manrope = Manrope({
  variable: "--font-hero",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "QR-меню",
  description: "Витрина заведения и заказы со столика по одному QR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} ${caveat.variable} ${cormorant.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

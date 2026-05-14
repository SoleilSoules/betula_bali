# QR-меню — handover

Привет. Это SaaS-витрина и QR-меню для ресторанов. Демо собрано под балийский ресторан **Bali Betula** (Social Hideout & Eatery в Pererenan, Bali) — русско-балийская кухня.

Внутри две вещи:
1. **Витрина** (`/r/<slug>`) — pixel-perfect лендинг на 430-canvas с hero-каруселью, bento-сеткой блюд, расписанием событий, частными бронями, инстаграм-плашками и футером с берёзами-watermark.
2. **QR-меню со столика** (`/r/<slug>/t/<token>`) — список блюд с корзиной, заказы летят в `/api/orders` и опционально пинают Telegram-бота владельца.

Сейчас включён только лендинг (MenuView временно закомментирован — см. `src/app/r/[slug]/_components/showcase.tsx`).

---

## Стек

- **Next.js 16** (App Router, server components, React 19)
- **Prisma 7** + SQLite через `@prisma/adapter-better-sqlite3`
- **Tailwind v4** + shadcn/ui (base-ui)
- **next/font** для Google Fonts (Cormorant, Manrope, Lora, Caveat)
- **TypeScript**, `tsx` для запуска seed

⚠️ Это **Next.js 16**, не 14/15 — несколько API отличаются (см. `node_modules/next/dist/docs/` если что-то странное компилится).

---

## Запуск локально

```bash
cd qr-menu
cp .env.example .env                       # подставь свежий AUTH_SECRET
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts                     # засеит демо Bali Betula
PORT=3030 npm run dev
# открой http://localhost:3030/r/demo
```

Логин в админку: `demo@qr-menu.local` / `password123` (URL `/login`).

---

## Структура

```
qr-menu/
├── prisma/
│   ├── schema.prisma           # Restaurant, Highlight, Event, Offering, Dish, Order...
│   └── seed.ts                 # данные демо Bali Betula
├── public/photos/
│   ├── figma/                  # logo-vec.svg, menu-paper-asset.png, slide-1..5.jpg
│   └── bali-betula/            # dish-*.jpg, venue-exterior.jpg, cocktail-glass.png
├── src/app/
│   ├── (auth)/                 # login/signup
│   ├── (dashboard)/dashboard/  # админка: highlights, events, menu, tables, orders
│   ├── r/[slug]/               # ПУБЛИЧНЫЙ лендинг ресторана
│   │   ├── _components/
│   │   │   ├── showcase.tsx    # выбирает FigmaHomepage vs editorial fallback
│   │   │   └── restaurant-menu.tsx  # подгружает данные из БД
│   │   ├── menu-view.tsx       # QR-меню со столика (закомментирован сейчас)
│   │   ├── page.tsx
│   │   └── t/[token]/page.tsx  # та же страница, но с tableToken
│   ├── api/orders/             # POST /api/orders — оформление заказа
│   ├── globals.css             # темы, keyframes, dark-mode overrides
│   └── layout.tsx
├── src/components/
│   ├── figma-homepage.tsx      # 🌟 ГЛАВНЫЙ лендинг (absolute-layout 430-canvas)
│   ├── hero-carousel.tsx       # 5-слайдовая hero-карусель + Open badge + ThemeToggle
│   ├── show-menu-tile.tsx      # серая левая карточка с MENU paper, eject-анимация
│   ├── sticky-cta-bar.tsx      # фикс снизу Show menu/Reserve, появляется после Signatures
│   ├── open-badge.tsx          # 🟢 OPEN · UNTIL 23:00 / 🔴 OPENS AT 12:00
│   ├── theme-toggle.tsx        # ◐/☾ — auto-dark после 18:00 + manual override
│   ├── instagram-embeds.tsx    # placeholder-заглушки вместо реальных embed
│   ├── brand-icons.tsx         # InstagramIcon SVG
│   └── ui/                     # shadcn-компоненты
└── src/lib/
    ├── theme.ts                # 5 палитр: paper / warm / coastal / hideout / dark
    ├── whatsapp.ts             # whatsappLink() — генерит wa.me ссылки
    └── ...
```

---

## Что важно понимать про лендинг (`figma-homepage.tsx`)

- Это **pixel-perfect** Figma макет, canvas **430×N** px (под мобилу).
- Все размеры через хелпер `const PX = (n: number) => calc(${n} * var(--scale, 1px))`.
- `--scale = min(1px, calc(100vw / 430))` — на viewport <430 всё пропорционально сжимается, на ≥430 один-в-один.
- Координаты карточек/секций — абсолютные от верха canvas. Менять группой через константы наверху компонента:
  - `COL_LEFT`, `COL_WIDTH`, `CARD_W`, `CARD_GAP` — горизонтальная сетка
  - `SIG_HDR_TOP`, `SIG_CARDS_TOP`, `SIG_HERO_H`, `SIG_SMALL_H` — Signatures bento
  - `EVT_HDR_TOP`, `EVT_CARDS_TOP`, `EVT_CARD_H` — Events
  - `PH_HDR_TOP`, `PH_CARDS_TOP`, `PH_CARD_H` — Private hire
  - `SECTION_GAP`, `HDR_TO_CARDS` — вертикальные отступы (унифицированы)
- Хочешь сдвинуть всё ниже — поменяй один `SIG_HDR_TOP`, остальное пересчитается каскадом.

---

## Что есть готового и работает

- 5-слайдовая hero-карусель, autoplay 7 сек, ручной свайп, прогресс-pill двигается на активный слайд
- Show menu / Reserve a table tiles, MENU paper выглядывает сверху из левой
- Bento Signatures (1 hero + 2 small + 1 wide), реальные фото с Wikipedia Commons
- Events 21:9 с датой сверху и кнопкой Join (WhatsApp)
- Private hire с h-scroll и snap-x
- Footer: пунктир, две берёзы по углам (logo-vec.svg, opacity 0.08), адрес, часы, Instagram-ссылка
- Sticky CTA bar снизу — появляется после Signatures
- Open badge с реальным временем
- Theme toggle: auto-dark после 18:00 + manual ◐/☾
- Tilt-on-tap на Syrniki hero-карточке
- Show menu paper-eject анимация перед переходом

---

## Известное / TODO

- `MenuView` (QR-меню) закомментирован в `showcase.tsx` (импорт + рендер). Включить — раскомментировать import и блок `{showOrderSection && <section id="order">...</section>}` в editorial fallback. Сейчас на лендинге Show menu ведёт на `#signatures` (просто скролл к блюдам).
- Стоковый WhatsApp `+6282144556677` в seed — поменять на реальный номер заведения.
- Реальные Instagram embeds выключены: показываются серые placeholder с текстом «Instagram post NN/NN» (`instagram-embeds.tsx`). Реальный OEmbed-поток требует токен FB Graph API.
- Кнопка Show menu pill при клике крутит paper-eject и потом `router.push(href)` — если href это `#signatures`, скролл сработает после анимации. Если поставить external URL — анимация пропускается.
- В dashboard нет UI для дизайн-токенов (тема/primary) — меняй в БД через Prisma Studio или прямо в seed.
- Sample-PDF `africau.edu` убран из seed — `mainMenuPdfUrl`/`specialMenuPdfUrl` теперь `null`. Если у заведения есть настоящий PDF меню — поставить URL в `Restaurant.mainMenuPdfUrl`.

---

## Деплой

См. `DEPLOY.md` рядом.

Если кратко: продакшн сейчас живёт на `https://doki.goshakazakov.ru/test/r/demo`, развёрнут на VPS под pm2 + nginx reverse proxy.

---

## Контакты по проекту

Дизайн от **Гоши Казакова** (продуктовый дизайнер, Figma-исходник: B2C • Главные и SEO-страницы, fileKey `CkqNlomLidDFtXILEwtkvt`).

Если вопросы по сборке — посмотри `CLAUDE.md`, там для AI-копайлота записаны паттерны/правила/контекст.

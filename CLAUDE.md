# CLAUDE.md

Контекст для Claude (или другого AI-копайлота), работающего с этим проектом. Прочитай перед тем как править код.

## Что это

SaaS QR-меню. Демо собран под ресторан **Bali Betula** (Pererenan, Bali, русско-балийская кухня). Сейчас деплоится только лендинг — QR-заказ временно отключён (`MenuView` закомментирован в `showcase.tsx`).

## Стек

- Next.js **16** (App Router, server components), React 19
- Prisma 7 + SQLite (`@prisma/adapter-better-sqlite3`)
- Tailwind v4 + shadcn/ui
- TypeScript

⚠️ **Это Next.js 16**, не 14/15. APIs могут отличаться от твоей памяти — если что-то странное, читай `node_modules/next/dist/docs/` ПЕРЕД тем как писать код.

## Паттерны проекта

### 1. `PX()` хелпер

В `figma-homepage.tsx`, `hero-carousel.tsx`, `show-menu-tile.tsx`, `open-badge.tsx`:

```ts
const PX = (n: number) => `calc(${n} * var(--scale, 1px))`;
```

Все размеры (top, left, width, height, fontSize, padding, gap) — через `PX(число-canvas)`. Это автоматически масштабируется на узких viewport через `--scale = min(1px, calc(100vw / 430))`. **Не пиши raw `px`** для размеров внутри 430-canvas макета — иначе элемент не масштабируется и ломает дизайн на iPhone SE/Galaxy.

### 2. Absolute-layout 430-canvas

`figma-homepage.tsx` строит лендинг как один большой absolute-positioned canvas:

```jsx
<div style={{ maxWidth: 430, "--scale": "min(1px, calc(100vw / 430))", height: PX(TOTAL_HEIGHT) }}>
  {/* all children: position absolute, coords in canvas-px */}
</div>
```

Координаты — Y растёт вниз от 0 (верх hero) до `TOTAL_HEIGHT`. Высота canvas пересчитывается из констант `SIG_END`, `EVT_END`, `PH_END`, `INSTAGRAM_HEIGHT`, `FOOTER_HEIGHT`.

### 3. Сетка

```
COL_LEFT = 10       // отступ слева
COL_WIDTH = 412     // ширина контента
COL_RIGHT_LEFT = 219  // = COL_LEFT + CARD_W + CARD_GAP
CARD_W = 203
CARD_GAP = 6
SECTION_GAP = 90    // вертикальный зазор между секциями
HDR_TO_CARDS = 92   // от заголовка секции до первой карточки
```

Используй эти константы, не хардкодь числа.

### 4. Cards = `<PhotoCard>` (унифицированный компонент)

```tsx
<PhotoCard
  item={...}                  // Highlight | EventItem | Offering | null
  kind="signature|event|offering"
  hero={false}                // только для Syrniki — tilt-on-tap CSS
  style={{ left, top, width, height }}
/>
```

Один `PhotoCard` для всех трёх типов. Логика стилизации (gradient, кнопка Join, Click-target wrap) разветвляется внутри по `kind`.

### 5. Темы

`src/lib/theme.ts` — 5 палитр (`paper / warm / coastal / hideout / dark`). Применяются через `themeStyle(themeId, primary)` — возвращает inline CSS-переменные `--qr-bg`, `--qr-text`, `--qr-accent` и т.д.

Demo использует `hideout`: cream `#f1ece2` + бордовый `#7d3a4c` + гжель-синий `#1e4a6b`.

**Auto-dark** (вечерняя тема, `globals.css → html[data-theme="dark"]`) переопределяет `bg-white` и `bg-[#f1f1f1]` — это другое от ThemeId, работает на верхнем уровне через атрибут на `<html>`.

## Что НЕ делать

- ❌ Не использовать `<Image>` без `unoptimized` — в текущем deploy включён `unoptimized: true` в `next.config.ts`, иначе Image Optimizer ломается с basePath `/test`.
- ❌ Не добавлять `rounded-*` классы — заказчик просил всё прямоугольное (кроме индикатор-точек hero carousel и open-badge точки статуса).
- ❌ Не использовать `<img src="/photos/...">` без префикса `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}` — на проде basePath `/test` не префиксирует native img автоматически.
- ❌ Не трогать `src/app/(dashboard)` без необходимости — это админка, она работает, дизайн её менее важен.
- ❌ Не удалять `editorial fallback` ветку в `showcase.tsx` — она дедкод (useFigmaLayout=true всегда), но может пригодиться как backup-разметка.

## Файлы что чаще всего трогаются

| Файл | Зачем |
|---|---|
| `src/components/figma-homepage.tsx` | весь лендинг (~600 строк) |
| `src/components/hero-carousel.tsx` | 5-слайдовая carousel + Open badge + Theme toggle |
| `src/components/show-menu-tile.tsx` | левая карточка с MENU paper + eject анимация |
| `src/components/sticky-cta-bar.tsx` | плавающие Show menu / Reserve снизу |
| `src/app/globals.css` | keyframes, темы, dark-mode |
| `prisma/seed.ts` | данные демо (highlights, events, offerings, IG) |
| `src/app/r/[slug]/_components/showcase.tsx` | связка БД → FigmaHomepage |

## Деплой

На проде живёт под `https://doki.goshakazakov.ru/test/`. Деплой ручной через rsync + ssh + pm2:

```bash
# с локалки
sshpass -p '<password>' rsync -az --exclude='node_modules' --exclude='.next' \
  -e 'ssh -o StrictHostKeyChecking=no' ./ root@168.222.192.29:/var/www/qr-menu/

# на VPS
ssh root@168.222.192.29
cd /var/www/qr-menu
rm -rf .next
npm run build       # с NEXT_PUBLIC_BASE_PATH=/test из .env
pm2 restart qr-menu
```

**Не трогать другие сервисы на этом VPS!** Там же `doki` (cluster pid 914/926, порты 3001) и `portfolio` (pid 915, порт 3000). Наш `qr-menu` на порту **3031** под pm2 name `qr-menu`.

Подробности — `DEPLOY.md`.

## Что недавно меняли

Последняя сессия (см. git log если коммитили): добавлен Sticky CTA bar, Theme toggle, Open badge, Tilt-on-tap для Syrniki, Show menu paper-eject анимация, рестайл Events на 21:9 с RSVP→Join кнопкой, унифицированные отступы 90/92, фото с Wikipedia Commons заменили sample-плакаты.

## Если что-то ломается

1. `npm run build` локально — если ошибка тут, в коде проблема
2. `npx tsc --noEmit -p tsconfig.json` — TS-чек отдельно
3. На проде: `pm2 logs qr-menu --lines 50`
4. Картинки 404 → проверь basePath prefix в src
5. Show menu не кликается → проверь что `showMenuHref` дотекает через props из `restaurant-menu.tsx → Showcase → FigmaHomepage → ShowMenuTile`

## Запрещено по правилам Гоши

- Не делать **разрушительных git-команд** без явного запроса.
- Не push в `main` без подтверждения.
- Не править файлы doki (`/var/www/doki` на VPS) — это отдельный проект, важный, **не трогать**.
- Перед инфраструктурными изменениями — описать план, дождаться «ок».

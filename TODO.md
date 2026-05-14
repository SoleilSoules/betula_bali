# TODO — что доделать после хэнд-овера

## 🔥 Главный таск: собрать PDF меню и подключить к Show menu

В папке **`menu-source-photos/`** лежат **8 фотографий реального меню Bali Betula** (страницы с напитками, smoothie bowls, mains, бранч и т.д.) — это всё, что есть от ресторана сейчас.

### Что нужно сделать

1. **Собрать фотки в один PDF** — последовательно, страница за страницей:
   - `00-menu-cover.jpg` — обложка (MENU paper с логотипом)
   - `01-moctails-coffee-drinks.jpg` — напитки и кофе
   - `02-smoothie-bowls.jpg` — smoothie bowls
   - `03-mains-pizza-plov-stroganoff.jpg` — основные блюда
   - `04-club-sandwich-dressings.jpg` — club sandwich и dressings
   - `05-sunday-brunch.jpg` — sunday brunch
   - `06-cheburek.jpg` — чебуреки
   - `07-stew.jpg` — жаркое

   Самый быстрый способ:
   ```bash
   # macOS Preview: открыть все фотки → File → Print → PDF → Save as PDF
   # или ImageMagick:
   magick convert menu-source-photos/*.jpg menu-bali-betula.pdf
   # или Python:
   pip install img2pdf
   img2pdf menu-source-photos/*.jpg -o menu-bali-betula.pdf
   ```

2. **Положить PDF в проект**:
   ```
   qr-menu/public/menu/bali-betula.pdf
   ```

3. **Прописать в БД**:
   В `prisma/seed.ts` найди объект `Restaurant.create` и поменяй:
   ```ts
   mainMenuPdfUrl: null,         // ← сейчас
   mainMenuPdfUrl: "/menu/bali-betula.pdf",  // ← должно стать
   ```

4. **Поменять Show menu link** в `src/app/r/[slug]/_components/showcase.tsx`:
   ```ts
   showMenuHref="#signatures"    // ← сейчас, скроллит к блюдам
   showMenuHref={mainMenuPdfUrl ?? "#signatures"}  // ← должно стать
   ```

5. **Перекатить сид и build**:
   ```bash
   # локально
   npx tsx prisma/seed.ts
   npm run dev
   # проверить что Show menu открывает /menu/bali-betula.pdf

   # потом — деплой по DEPLOY.md
   ```

### Подсказки

- PDF не должен быть тяжелее ~5 МБ — если суммарно фотки > 5 МБ, сначала пожми их через `sips -Z 1600 -s formatOptions 75 menu-source-photos/*.jpg` или скорми ImageMagick'у `-quality 75`.
- На мобиле PDF откроется во встроенном вьювере (iOS Safari / Chrome) — это норм, не нужен отдельный viewer.
- Можно опционально дополнить: добавить `specialMenuPdfUrl` для отдельного винного меню или brunch-меню. В `Restaurant` есть оба поля.

---

## 🔧 Прочие хвосты

- **`MenuView` (QR-меню со столика)** сейчас закомментирован в `src/app/r/[slug]/_components/showcase.tsx` (импорт + блок рендера). Включить — раскомментировать. Должен работать на `/r/demo/t/<token>` где `token` любой `qrToken` из таблицы `Table` (есть 6 seeded столиков).
- **Реальные Instagram embeds** — сейчас в `src/components/instagram-embeds.tsx` тупо placeholder. Чтобы подключить настоящий oEmbed — нужен токен FB Graph API (или использовать раннер вроде `react-instagram-embed` с регистрацией приложения).
- **WhatsApp номер** в seed — фейковый `+6282144556677`. Заменить на реальный когда дадут.
- **Аутентификация дашборда** работает на демо-логине `demo@qr-menu.local` / `password123`. Для прода — поменять пароль через POST `/api/auth/...` или удалить демо-юзера и засеить нового.

---

## 🌱 Идеи для апгрейда (если хочешь поиграть с дизайном)

Эти идеи уже обсуждались с продуктовым дизайнером — могут лечь хорошо:

1. **Параллакс MENU paper при скролле** — бумага на 10–20% быстрее уезжает вверх при скролле страницы.
2. **Today's special плашка** между Hero и Show menu/Reserve — узкая полоска «Today — Borscht Friday · 60k», подтягивается из Events по match даты.
3. **Story-mode для Events** — тап по event-карточке открывает fullscreen «сторис» (как в Instagram).
4. **Sticky reserve bar дополнить QR-share кнопкой** — открывает sheet с QR-кодом текущей страницы для шеринга друзьям.
5. **3-сек MP4 loop в Signatures hero-карточке** — дым над казаном, пар над сырниками. ≤ 400 КБ.
6. **Темная тема — добавить плавный transition** (сейчас snap-смена, можно добавить `transition: background-color 600ms`).

---

Если будут вопросы — `README.md` главный, `CLAUDE.md` для AI-копайлота, `DEPLOY.md` про прод.

# QR-заказ → Telegram — деплой и эксплуатация

Слой онлайн-заказа поверх статического меню (`qr-menu/`). Стек: статика на Vercel
+ Vercel Serverless Functions (`api/`, чистый Node, без зависимостей). **Без БД** —
заказ «живёт» в Telegram-чате официантов.

## Что добавлено

```
qr-menu/index.html      # меню + корзина + заказ + стол + языки + теги (фронт)
qr-menu/menu.json       # единый источник: позиции, цены, варианты, теги, переводы RU/ID
api/order.js            # POST /api/order        — приём заказа → Telegram
api/call-waiter.js      # POST /api/call-waiter  — «позвать официанта» 🔔
api/request-bill.js     # POST /api/request-bill — «запросить счёт» 🧾
api/telegram-webhook.js # POST /api/telegram-webhook — кнопки Accept/Ready
lib/menu.js             # серверный пересчёт суммы из menu.json (id → цена)
lib/telegram.js         # обёртки Telegram Bot API
lib/http.js             # rate-limit, sanitize, parse
tools/qr-gen.html       # генератор QR-карточек столов (НЕ деплоится)
```

## Vercel

- **Root Directory** проекта должен быть **корень репозитория** (где лежит `api/`),
  а статика отдаётся из `outputDirectory: "qr-menu"` (корневой `vercel.json`).
  ⚠️ Свериться в настройках проекта Vercel. Вложенный `qr-menu/vercel.json` удалён,
  чтобы Vercel не принял `qr-menu/` за корень (иначе `api/` не задеплоится).
- Функции `/api/*` Vercel поднимает автоматически (фреймворк не нужен).

### Переменные окружения (Vercel → Project → Settings → Environment Variables)

| Переменная | Обязательна | Зачем |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | да | токен бота от @BotFather |
| `TELEGRAM_CHAT_ID` | да | чат/группа официантов (заказы, 🔔, 🧾) |
| `TELEGRAM_WEBHOOK_SECRET` | для кнопок | секрет для проверки webhook-запросов |
| `TELEGRAM_CHAT_ID_BAR` | опц. | (задел) отдельный чат бара — пока не используется |

**Токен НИКОГДА не коммитится в репозиторий** — только в env Vercel.

### Регистрация webhook (один раз, после деплоя)

Кнопки «Accept/Ready» работают, когда Telegram знает наш webhook-URL:

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://balibetula.com/api/telegram-webhook&secret_token=<WEBHOOK_SECRET>"
# проверка:  curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

Для группы официантов: создать группу, добавить @kebab34bot, написать в ней сообщение,
взять `chat_id` из `getUpdates` (у групп он отрицательный) → вписать в `TELEGRAM_CHAT_ID`.

## Эксплуатация (для не-технических)

- **Стоп-лист (86):** в `qr-menu/menu.json` у позиции добавить `"available": false`
  → блюдо гаснет («Sold out») и сервер его не примет. Вернуть — убрать строку.
- **Цена/новое блюдо:** править `qr-menu/menu.json` (поля `price` или `variants`),
  плюс переводы `n_ru`/`d_ru` (RU) и `n_id`/`d_id` (ID, опц.). `id` — латиницей, уникальный.
- **Теги:** `"tags": ["popular","veg","spicy","gf"]` у позиции. `gf` (без глютена) —
  проставлять только сверившись с поваром (аллерген).
- **Налог/сервис:** `taxRate`/`serviceRate` вверху `menu.json` + подпись в футере меню.
  ⚠️ Сверить с реальной ставкой Бетулы (в Канггу часто 12.5% налог / 5% сервис).
- **QR столов:** открыть `tools/qr-gen.html` в браузере → задать число столов/список →
  Generate → Print.

## Локальная проверка функций

`vercel dev` в корне (эмулирует функции), либо мини-сервер из истории сессии. Без `vercel dev`
статический сервер (`python3 -m http.server`) отдаёт меню, но `/api/*` не работают.

## Чего нет (осознанно, требует хранилища)

Live-статус заказа на телефон гостя, онлайн-оплата (QRIS/card), аналитика, реальный
админ-тоггл 86 без правки файла — всё это требует добавления persistence (напр. Upstash KV).
См. бэклог `qr-menu` в памяти проекта.

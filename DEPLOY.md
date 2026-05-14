# Deploy — текущее состояние и как обновлять

## Где живёт прод

**URL**: https://doki.goshakazakov.ru/test/r/demo

## Инфраструктура

- **VPS**: 168.222.192.29 (тот же что и `doki.goshakazakov.ru`)
- **SSH**: `root@168.222.192.29`, авторизация **по паролю** (нужен `sshpass`)
- **Папка приложения**: `/var/www/qr-menu/`
- **pm2 процесс**: `qr-menu` (id зависит от порядка запуска)
- **Порт**: `3031` (3000 занят portfolio, 3001 — doki cluster)
- **БД**: SQLite файл `/var/www/qr-menu/prod.db` (отдельная от dev.db)

## Установка sshpass на macOS

```bash
brew install hudochenkov/sshpass/sshpass
```

## Обновление кода на проде

С локалки:
```bash
cd ~/qr-menu

# 1. Раскатить исходники (исключаем node_modules, .next, БД)
sshpass -p 'PASSWORD' rsync -az \
  --exclude='node_modules' --exclude='.next' --exclude='.git' \
  --exclude='dev.db' --exclude='tsconfig.tsbuildinfo' \
  -e 'ssh -o StrictHostKeyChecking=no' \
  ./ root@168.222.192.29:/var/www/qr-menu/

# 2. На VPS: clean build + restart pm2
sshpass -p 'PASSWORD' ssh -o StrictHostKeyChecking=no root@168.222.192.29 '
  cd /var/www/qr-menu
  rm -rf .next
  npm run build
  pm2 restart qr-menu
'
```

⚠️ После каждого rsync **обязательно очисти `.next`** — Next.js 16 кэширует server-bundles агрессивно, без чистки могут остаться старые компоненты.

## Первоначальный setup VPS (если переразвернуть)

```bash
ssh root@168.222.192.29
cd /var/www/qr-menu

# Свежий клон / rsync исходников

# .env должен содержать:
cat > .env <<'EOF'
DATABASE_URL="file:./prod.db"
AUTH_SECRET="<новый openssl rand -base64 32>"
TELEGRAM_BOT_TOKEN=""
NEXT_PUBLIC_APP_URL="https://doki.goshakazakov.ru/test"
NEXT_PUBLIC_BASE_PATH="/test"
PORT=3031
EOF

npm install --no-audit --no-fund
npx prisma generate
npx prisma db push

# seed.ts ожидает DATABASE_URL из .env, но в self-adapter указан file:./dev.db.
# Подменяем на prod.db и сеем:
sed -i 's|file:./dev.db|file:./prod.db|g' prisma/seed.ts
npx tsx prisma/seed.ts

npm run build
pm2 start npm --name qr-menu -- run start -- -p 3031
pm2 save
```

## Nginx config

`/etc/nginx/sites-enabled/doki` содержит наш блок внутри `server { server_name doki.goshakazakov.ru; ... }`:

```nginx
location ^~ /test/ {
    proxy_pass http://127.0.0.1:3031;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

После правок nginx config:
```bash
nginx -t          # проверить синтаксис
nginx -s reload   # применить
```

**Бэкап**: `/etc/nginx/sites-enabled/doki.bak.20260514-2200` содержит предыдущий конфиг (где /test был alias на `montedigital-test`). Если надо вернуть — `cp doki.bak.20260514-2200 doki && nginx -s reload`.

## Картинки на проде

Фото блюд лежат в `/var/www/qr-menu/public/photos/bali-betula/` — это **public static**, отдаются Next.js напрямую через `/test/photos/...`.

Файлы пожаты через `sips -Z 1600` (macOS), суммарно ~3 МБ. Если будешь добавлять новые — пропусти через сжатие:
```bash
sips -Z 1600 -s formatOptions 75 *.jpg
```
Или через `imagemagick` если на VPS:
```bash
mogrify -resize '1600x1600>' -quality 75 *.jpg
```

## Что под рукой

- pm2 list: `ssh root@... 'pm2 list'`
- pm2 logs: `ssh root@... 'pm2 logs qr-menu --lines 100'`
- nginx reload: `ssh root@... 'nginx -s reload'`
- БД дамп: `ssh root@... 'cat /var/www/qr-menu/prod.db' > backup.db` (или через sqlite3 export)

## Что НЕ трогать

- **`/var/www/doki/`** — это серьёзный отдельный проект (`doki.goshakazakov.ru`). Не править ни код, ни pm2 процесс, ни БД.
- **`portfolio`** pm2 процесс (port 3000) — это сайт `goshakazakov.ru`.
- **DNS** — все subdomain'ы (`doki.`, `docs.`, `ascii.`, `goshakazakov.ru`) уже настроены.

## Известные шероховатости

- `NEXT_PUBLIC_BASE_PATH` влияет на `<Image>` через `assetPrefix`, но native `<img src="/photos/...">` нужно явно префиксить: `src={\`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}\`}`. Уже сделано в hero-carousel и figma-homepage, но если добавляешь новый — не забудь.
- `next.config.ts` включает `images.unoptimized: true` — Next.js Image Optimizer не дружит с basePath `/test`. Если будешь поднимать на subdomain (без basePath), можно вернуть optimizer для скорости.
- БД `prod.db` НЕ синхронизируется с локальной `dev.db`. Меняешь seed → перекатывай `npx tsx prisma/seed.ts` на VPS (с подменой `file:./dev.db` → `file:./prod.db`).

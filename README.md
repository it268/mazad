# مزاد الفروسية — Mazad Alfursya

منصة مزادات وبيع وشراء خيل العرب الأصيلة. An Arabian-horse auction marketplace: clients sell horses to (and buy horses from) the platform admin, who runs direct sales and live auctions.

**Stack:** TanStack Start (React 19, SSR) · TanStack Query · Tailwind CSS v4 · PocketBase 0.40 (auth, DB, files, realtime, cron hooks) · Docker Compose on Coolify.

## الأدوار (Roles)

- **عميل (client):** يسجّل برقم جواله، يعرض حصانه للبيع للإدارة، يشتري المعروضات مباشرة، ويزايد في المزادات المباشرة.
- **إدارة (admin):** تراجع طلبات البيع وتشتري منها، تدير الخيل، تنشئ عروض البيع والمزادات، وتؤكد الصفقات.

## Flow

1. Client submits a horse + sale request (`/sell`) → status `pending_review`.
2. Admin reviews in `/admin/requests` → buys it (standard or negotiated price) or rejects.
3. Admin lists the horse for direct sale or creates an auction (`/admin/horses`).
4. Clients buy now (listing → `reserved` deal) or bid live (`/auctions/$id`, realtime via PocketBase subscriptions, anti-snipe: bids in the last minute extend it by one minute).
5. A cron hook ends auctions when `ends_at` passes → creates a pending deal for the top bidder.
6. Admin confirms/completes deals (`/admin/deals`) → horse marked sold, listing closed. Payment is recorded as an offline note (bank transfer).

## Collections

`users` (phone identity, role) · `horses` · `sale_requests` · `listings` (direct_sale | auction) · `bids` · `deals`

Schema lives in `pocketbase/pb_migrations/`, business logic (role guards, bid validation, auction clock, ownership transfer) in `pocketbase/pb_hooks/main.pb.js`.

## Local dev

```bash
npm install
# PocketBase (Windows binary, runs migrations + hooks automatically)
cd pocketbase && curl -LO https://github.com/pocketbase/pocketbase/releases/download/v0.40.4/pocketbase_0.40.4_windows_amd64.zip
unzip pocketbase_0.40.4_windows_amd64.zip && ./pocketbase.exe superuser upsert admin@example.com <password>
./pocketbase.exe serve --http=127.0.0.1:8090
# web (separate terminal)
npm run dev   # http://localhost:3000, .env points VITE_PB_URL to 127.0.0.1:8090
```

## Deploy (Coolify)

Docker Compose resource from this repo: `web` (Nitro node server, port 3000) + `pocketbase` (port 8090, `pb_data` volume). Domains: `mazad.alfrusiyaar.com` → web, `mazad-api.alfrusiyaar.com` → pocketbase. Build arg `VITE_PB_URL` must be the public API URL. Superuser comes from `PB_SUPERUSER_EMAIL`/`PB_SUPERUSER_PASSWORD` env vars.

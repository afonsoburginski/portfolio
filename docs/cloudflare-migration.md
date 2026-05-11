# Cloudflare Migration

This project is prepared for Cloudflare Workers + D1 through OpenNext.

## 1. Login

```bash
npx wrangler login
```

## 2. Create D1 Database

```bash
npx wrangler d1 create portfolio-db
```

Copy the returned `database_id` into `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "portfolio-db",
    "database_id": "PASTE_DATABASE_ID_HERE"
  }
]
```

## 3. Import Current Data

The current Turso data was exported to:

```txt
backups/turso-export-2026-05-10T23-17-26-488Z/dump.d1.sql
```

Import it into remote D1:

```bash
npm run d1:import
```

The script imports `dump.d1.sql`, which is the D1-friendly version of the export.

## 4. Set Production Secrets

Set these in Cloudflare dashboard or with `wrangler secret put`:

```bash
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put ADMIN_EMAIL
```

`NEXT_PUBLIC_APP_URL` is a non-secret and is configured in `wrangler.jsonc` under `vars`.

Optional payment secrets if Mercado Pago remains enabled:

```bash
npx wrangler secret put NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
npx wrangler secret put MERCADOPAGO_ACCESS_TOKEN
npx wrangler secret put MERCADOPAGO_CLIENT_ID
npx wrangler secret put MERCADOPAGO_CLIENT_SECRET
npx wrangler secret put MERCADOPAGO_WEBHOOK_SECRET
```

## 5. Build and Deploy

```bash
npm run cf:build
npm run cf:deploy
```

## Notes

- `lib/db.ts` uses Cloudflare D1 binding `DB` in Workers.
- Outside Cloudflare, it falls back to the current `TURSO_DATABASE_URL` flow so local development still works.
- `npm run cf:build` currently passes locally.
- `npm run build` passes locally, but Better Auth logs warnings until `BETTER_AUTH_SECRET` is set in the build/runtime environment.

# Fresh Appeal Store

> Wear the Culture. — A bold streetwear e-commerce site built with Next.js 14, TypeScript, Tailwind CSS, Prisma, and NextAuth.

![Fresh Appeal](public/logo.svg)

## Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS · custom black / off-black / neon green theme
- **Database:** Prisma + SQLite (dev). Drop-in swappable for Vercel Postgres / Supabase / MongoDB.
- **Auth:** NextAuth.js (Credentials) — admin-protected `/admin` routes via middleware
- **State:** React Server Components + Zustand for the cart (with `localStorage` persistence)
- **Charts:** Recharts (admin sales line chart)
- **Payments:** Mock checkout (writes Order rows). Wire up Stripe by replacing the body of `createOrder` in `src/app/checkout/actions.ts` with a Stripe Checkout Session.

## Quick start

```bash
# 1. install deps
npm install

# 2. push schema to SQLite & seed admin + 6 sample products
npm run db:push
npm run db:seed

# 3. dev server
npm run dev
```

Open http://localhost:3000.

### Default admin
- URL: http://localhost:3000/admin/login
- Email: `admin@fresh.local`
- Password: `admin123`

(Change via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` then re-run `npm run db:seed`.)

## Routes

| Path | Description |
| --- | --- |
| `/` | Hero + featured drops + brand strip |
| `/shop` | Catalog with category filters & sort (`?cat=men&sort=price-asc`) |
| `/product/[slug]` | Image gallery (zoom), size selector, add to cart |
| `/cart` | Full cart page |
| `/checkout` | Address + email collection, mock Stripe |
| `/checkout/success?id=...` | Order confirmation |
| `/admin/login` | Credentials form |
| `/admin` | Dashboard: stats, sales chart, low-stock alerts |
| `/admin/products` | Searchable, paginated product table |
| `/admin/products/new` | Create product |
| `/admin/products/[id]` | Edit product |
| `/admin/orders` | All orders |
| `/admin/orders/[id]` | Order detail + status update |

## Environment variables

Copy `.env.example` → `.env`. The defaults work out of the box for local dev.

```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
ADMIN_EMAIL="admin@fresh.local"
ADMIN_PASSWORD="admin123"

# Optional production add-ons (not used in mock mode):
# STRIPE_SECRET_KEY=""
# STRIPE_WEBHOOK_SECRET=""
# BLOB_READ_WRITE_TOKEN=""
```

## Database schema

See `prisma/schema.prisma`. Three models: `User` (admins), `Product`, `Order`.

JSON-shaped fields (`sizes`, `stock`, `images`, `Order.items`, `Order.shippingAddress`) are stored as strings for SQLite compatibility and parsed in `src/lib/utils.ts`. When migrating to Postgres you can switch them to `Json` columns and remove the `JSON.parse` calls.

## Deploying to Vercel

1. Push to GitHub.
2. Import the repo into Vercel.
3. Replace SQLite with **Vercel Postgres**:
   - Add the integration in your Vercel project; this provisions `POSTGRES_*` env vars.
   - Update `prisma/schema.prisma`:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   - In Vercel, set `DATABASE_URL` to `POSTGRES_PRISMA_URL`.
4. Set `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`) and `NEXTAUTH_URL=https://your-domain.vercel.app`.
5. (Optional) Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and replace the body of `createOrder` with a Stripe Checkout Session, then deploy a `/api/webhooks/stripe` route to mark orders as paid.
6. (Optional) For image uploads, install `@vercel/blob` and replace the URL-list textarea in the product form with a file picker calling `put()` from the server action.
7. The build command is already configured: `prisma generate && prisma migrate deploy && next build`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your/repo)

## Scripts

```bash
npm run dev        # Next.js dev server
npm run build      # Production build (runs prisma generate + migrate deploy)
npm run start      # Start production server
npm run db:push    # Sync schema to db without migrations (good for SQLite dev)
npm run db:seed    # Seed admin + sample products
npm run db:reset   # Wipe + re-seed
```

## Notes / next steps

- **Logo:** `public/logo.svg` is a placeholder approximating the brief (bearded silhouette + neon ring). Drop your real PNG/SVG over it (keep the filename or update the `<Image src>` in `navbar.tsx` and `page.tsx`).
- **Images:** Sample products use Unsplash CDN URLs (whitelisted in `next.config.mjs`). Replace with Vercel Blob/Cloudinary URLs in production.
- **Image uploads in admin:** Currently the form takes a list of URLs. To upgrade to drag-and-drop file uploads, swap the URL textarea for `<input type="file" multiple>` + a server action that calls `put()` from `@vercel/blob`.
- **Stripe:** `src/app/checkout/actions.ts` currently fakes a session id. Swap with `stripe.checkout.sessions.create(...)` and add a webhook route to flip `status` to `paid`.

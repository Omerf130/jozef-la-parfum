# Jozef La Parfum — Luxury Perfume E-Commerce

Production-quality Hebrew (RTL) luxury perfume storefront built with Next.js 15
App Router, MongoDB Atlas / Mongoose, NextAuth (Auth.js v5), PayPlus hosted
payment, Vercel Blob image uploads, Resend transactional email, and SCSS
Modules.

## Stack

- **Framework**: Next.js 15 (App Router, RSC, Server Actions)
- **Language**: TypeScript (strict)
- **DB**: MongoDB Atlas via Mongoose with cached connection
- **Auth**: NextAuth v5 Credentials provider, bcrypt, JWT session
- **Payments**: PayPlus hosted payment-page + signed webhook
- **Email**: Resend (Hebrew RTL HTML template)
- **Storage**: `@vercel/blob` (admin product images)
- **Validation**: zod + react-hook-form
- **State**: zustand (cart) with `localStorage` persistence
- **Styling**: SCSS Modules (no Tailwind)

## Getting Started

### 1. Prerequisites

- Node.js 20+
- npm 10+

### 2. Install

```bash
npm install
```

### 3. Environment

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

#### MongoDB Atlas

1. Create a free cluster at <https://www.mongodb.com/cloud/atlas>.
2. Create a database user (Database Access).
3. Allow your IP (Network Access) — or `0.0.0.0/0` for development.
4. Click **Connect → Drivers** and copy the connection string.
5. Set `MONGODB_URI` and append `/perfume_store?retryWrites=true&w=majority`.

#### NextAuth secret

```bash
openssl rand -base64 32
```

Set both `AUTH_SECRET` and `NEXTAUTH_SECRET` to the same value (NextAuth v5 reads
either; middleware reads `AUTH_SECRET` first then falls back).

#### Vercel Blob

1. In your Vercel project: **Storage → Create Database → Blob**.
2. Copy the **Read/Write token** to `BLOB_READ_WRITE_TOKEN`.

#### PayPlus

1. Open a PayPlus terminal at <https://www.payplus.co.il>.
2. From the merchant dashboard, copy:
   - API Key → `PAYPLUS_API_KEY`
   - Secret Key → `PAYPLUS_SECRET_KEY`
   - Terminal UID → `PAYPLUS_TERMINAL_UID`
3. Use the sandbox endpoint (`https://restapidev.payplus.co.il`) during
   development by overriding `PAYPLUS_BASE_URL`.
4. Set the production webhook URL in the PayPlus dashboard to
   `https://YOUR_DOMAIN/api/payments/webhook` and keep the same
   `PAYPLUS_WEBHOOK_SECRET` here.
5. NOTE: review `src/services/payplus.ts` for `// TODO` comments — exact field
   names (e.g. `more_info`, `charge_method`, `payment_request_uid`) vary per
   merchant account / API version and may need adjustment against your terminal
   docs.

#### Resend

1. Sign up at <https://resend.com>.
2. Verify your sending domain (DNS records).
3. Create an API Key → `RESEND_API_KEY`.
4. Set `EMAIL_FROM` to a verified sender, e.g.
   `"Jozef La Parfum <orders@yourdomain.com>"`.

### 4. Seed initial data

Creates the admin user (from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`),
4 demo categories, and ~6 demo products.

```bash
npm run seed
```

### 5. Run

```bash
npm run dev
```

Site: <http://localhost:3000>
Admin: <http://localhost:3000/admin/login>

## Scripts

| Command            | Description                              |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Start dev server                         |
| `npm run build`    | Production build                         |
| `npm run start`    | Start production server                  |
| `npm run lint`     | ESLint                                   |
| `npm run typecheck`| `tsc --noEmit`                           |
| `npm run seed`     | Seed admin + demo data                   |

## Project Structure

```
.
├── middleware.ts         # auth gate for /admin
├── public/
├── scripts/seed.ts       # seed initial data
└── src/
    ├── app/              # App Router pages & API routes
    ├── components/       # reusable UI (Button, Input, ProductCard, ...)
    ├── features/         # domain UI (home/, product/, checkout/, admin/, ...)
    ├── lib/              # db, auth, validation, format helpers
    ├── models/           # Mongoose models (Product, Category, Order, Admin)
    ├── services/         # external integrations (payplus, email, blob)
    ├── store/            # zustand stores (cart)
    ├── styles/           # globals + variables + mixins
    ├── types/            # shared TS types
    └── utils/
```

## Pages

- `/` — Homepage (hero, featured, categories, best sellers, editorial,
  newsletter)
- `/category/[slug]` — Category listing with brand / gender / concentration /
  price filters
- `/product/[slug]` — Product page (gallery, notes pyramid, size + qty)
- `/cart` — Cart
- `/checkout` — Checkout form → creates Order + redirects to PayPlus
- `/payment/success`, `/payment/cancel` — Post-payment landing
- `/about`, `/contact`
- `/admin/login`, `/admin` (dashboard, products, categories, orders)

## Payment Flow

1. User submits checkout — `POST /api/orders` validates stock and creates a
   pending order.
2. `POST /api/payments/create` creates a PayPlus payment page, stores
   `payplusPageUid`, returns the hosted URL.
3. Browser redirects to PayPlus.
4. PayPlus posts the webhook to `/api/payments/webhook`. The handler verifies
   the HMAC signature using `PAYPLUS_WEBHOOK_SECRET`, updates `paymentStatus`
   on the order, and triggers a Hebrew RTL Resend confirmation email.
5. PayPlus redirects the user to `/payment/success` or `/payment/cancel`.

## Deployment (Vercel)

1. Push to GitHub and import the repo at <https://vercel.com/new>.
2. Add **all** environment variables from `.env.example` to the Vercel project.
3. Set `NEXT_PUBLIC_SITE_URL` and `NEXTAUTH_URL` to your production URL.
4. After the first deploy, point the PayPlus webhook URL to
   `https://YOUR_DOMAIN/api/payments/webhook`.
5. Trigger one-off seed: run `npm run seed` locally with the production
   `MONGODB_URI` to seed the cloud DB (or run from a Vercel CLI script).

## Security Notes

- Admin routes are gated by `middleware.ts` reading the NextAuth JWT.
- All admin API routes also call `requireAdmin()` defensively.
- No credit-card data ever touches our servers — PayPlus hosts the payment page.
- Webhook is verified via HMAC-SHA256 of the raw body using
  `PAYPLUS_WEBHOOK_SECRET`.

## License

Proprietary — Jozef La Parfum.

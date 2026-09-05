# Soil Science for Students — E-Commerce Platform

A production-architected Next.js e-commerce application for selling digital
Soil Science study material, built around a real payment-verification flow:
**no order is ever marked PAID except by a signature-verified webhook from
the payment provider.** There is no fake checkout, no fake "payment
successful" state, and no card data touches this application's database.

---

## 1. Stack

- Next.js 14 (App Router) + TypeScript
- PostgreSQL + Prisma ORM
- NextAuth (credentials provider, JWT sessions, bcrypt password hashing)
- Stripe (default payment provider, swappable — see §12)
- Resend (default email provider, swappable)
- S3-compatible private object storage (AWS S3, Cloudflare R2, Backblaze B2)
- Vitest for automated tests

## 2. Install

```bash
npm install
cp .env.example .env
```

Fill in `.env` — see §4–7 below for each service. The app will run, but
checkout and downloads will show clear "not configured" states until you do.

## 3. Run locally

```bash
npx prisma migrate dev --name init
npx prisma db seed          # loads the 10 products from prisma/seed.ts
npm run dev
```

Visit `http://localhost:3000`.

To test the full payment flow locally, run the Stripe CLI alongside the app:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret it prints into `PAYMENT_WEBHOOK_SECRET`.

## 4. Configure the database

Set `DATABASE_URL` in `.env` to a real PostgreSQL instance (Railway, Supabase,
Neon, RDS, etc). Run `npx prisma migrate deploy` in staging/production instead
of `migrate dev`.

## 5. Configure the payment provider (Stripe by default)

1. Create a Stripe account approved for your country/business.
2. Get your keys from the Stripe Dashboard → Developers → API keys.
3. Set `PAYMENT_PUBLIC_KEY` and `PAYMENT_SECRET_KEY`.
4. Add a webhook endpoint in the Stripe Dashboard pointing to
   `https://yourdomain.com/api/webhooks/stripe`, subscribed to at minimum:
   `checkout.session.completed`, `checkout.session.expired`,
   `payment_intent.payment_failed`, `charge.refunded`.
5. Copy the webhook's signing secret into `PAYMENT_WEBHOOK_SECRET`.

Until all three payment variables are set, `/api/checkout` returns:
`"Payment gateway setup is required before live payments can be accepted."`
— it never fakes a successful session.

## 6. Configure email

Set `EMAIL_API_KEY` (Resend) and `EMAIL_FROM`. Until set, order confirmation
emails are skipped with a logged warning rather than silently pretending to send.

## 7. Configure private file storage

Paid PDFs must live in a **private** S3-compatible bucket — never in `/public`.

1. Create a private bucket (block all public access).
2. Create an access key with read/write permission scoped to that bucket.
3. Set `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`,
   `STORAGE_REGION`, and `STORAGE_ENDPOINT` (required for R2/B2, omit for AWS S3).
4. Upload each product's PDF to the bucket, and set that object's key as the
   product's `fileStorageKey` in the database (via the admin API or Prisma Studio).

Downloads are served exclusively through `/api/downloads?token=...`, which
runs the full authorization chain in `lib/download-tokens.ts` before
generating a signed URL that expires in 5 minutes. The storage path is never
exposed to the browser.

## 8. Configure webhooks

Already covered in §5 for Stripe. Webhook processing is idempotent — see
`ProcessedWebhookEvent` in the schema and `app/api/webhooks/stripe/route.ts` —
so Stripe's automatic retries can never create duplicate orders or emails.

## 9. Add products

Products are seeded from `prisma/seed.ts`. To add more (or edit existing
ones) in production, use the authenticated `/api/admin/products` API, or
extend `app/admin/products/page.tsx` with a create/edit form — the API
already exists and logs every change to `AdminAuditLog`.

## 10. Add digital files

Upload the PDF to your private bucket (§7), then set the product's
`fileStorageKey` to match the uploaded object's key.

## 11. Create the first admin account

Set `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` before running
`npx prisma db seed` — this creates one ADMIN user. **Log in and change the
password immediately, then remove those two variables from your environment.**
There is no other way to create an ADMIN account by design (customer
self-registration always creates a `CUSTOMER` role — see
`app/api/auth/register/route.ts`).

## 12. Swapping the payment provider

Everything in the app calls the `PaymentProvider` interface in
`lib/payments/types.ts` — never a specific SDK. To switch providers:

1. Create `lib/payments/<provider>-provider.ts` implementing `PaymentProvider`
   (`createCheckoutSession`, `verifyAndParseWebhook`, `retrieveCheckoutSession`,
   `isConfigured`).
2. Change the single export in `lib/payments/index.ts`.
3. Add a new webhook route (or adapt the existing one) for that provider's
   signature scheme.

No other file needs to change.

## 13. Testing

```bash
npm run test
```

Included tests cover password hashing, and the full authorization chain for
download tokens (expired / unpaid / wrong-owner / valid). Before production
launch, expand these into full integration tests against a disposable test
database and a mocked Stripe client, covering every case listed in the brief:

- Customer cannot access another customer's order
- Customer cannot download an unpaid product
- Frontend cannot change product prices (already true by construction —
  `/api/checkout` always re-reads price from the DB)
- Frontend cannot mark an order PAID (already true by construction — only
  the webhook handler transitions to PAID)
- Invalid webhook signatures are rejected
- Duplicate webhooks do not create duplicate orders
- Non-admin users cannot access admin APIs

## 14. Deployment

### Local development
As above — `npm run dev`, local or Docker Postgres, Stripe CLI for webhooks.

### Staging / sandbox
Same architecture, pointed at a staging database and the payment provider's
**test mode** keys. Use this to fully rehearse a real purchase before launch.

### Production checklist
- [ ] `DATABASE_URL` points to a production Postgres instance with backups enabled
- [ ] All variables in `.env.example` are set with real, non-placeholder values
- [ ] Domain configured with HTTPS (required for Stripe live mode)
- [ ] Payment provider account approved for **live** payments in your country
- [ ] Live-mode webhook endpoint registered and `PAYMENT_WEBHOOK_SECRET` set
- [ ] Email domain verified with your email provider
- [ ] Storage bucket confirmed **private** (no public read)
- [ ] `AUTH_SECRET` set to a strong random value (`openssl rand -base64 32`)
- [ ] Admin account created, bootstrap password changed, bootstrap env vars removed
- [ ] `npx prisma migrate deploy` run against production database
- [ ] Automated backups scheduled (see §15)
- [ ] Error logging/monitoring connected (e.g. Sentry) — not included by default
- [ ] Confirm a real end-to-end test purchase in live mode for a $0.50–$1 test
      product before announcing launch

**Do not tell customers live payments are accepted until every item above is
checked** — until then the checkout API will itself refuse to start a session.

## 15. Backups & recovery

**Database:** enable your Postgres host's automated daily backups with at
least 7–30 day retention. Test the restore procedure at least once before
launch (most managed providers offer point-in-time restore from their dashboard/CLI).

**Digital files:** enable versioning and cross-region replication on your
storage bucket if your provider supports it. Keep an offline copy of source
PDFs outside the bucket as a second line of defense.

**Recovery procedure (documented, not automated):**
1. Restore the database to a new instance from the latest backup.
2. Point `DATABASE_URL` at the restored instance.
3. Verify the storage bucket is intact and `fileStorageKey` values still resolve.
4. Redeploy the application.
5. Re-verify webhook delivery from the payment provider's dashboard (resend
   any events sent during the outage window — this is safe due to webhook idempotency).

## 16. Security notes

- Passwords are hashed with bcrypt (12 rounds), never stored in plaintext.
- Sessions use HTTP-only cookies via NextAuth JWT strategy.
- `middleware.ts` protects `/admin`, `/api/admin/*`, `/my-purchases` at the
  edge; every admin API route **also** re-checks the role server-side
  (`requireAdmin()`), per defence-in-depth.
- Every admin write is logged to `AdminAuditLog` (price changes, product
  edits, etc.) via `lib/admin/audit.ts`.
- Download tokens are random 256-bit values; only their SHA-256 hash is
  stored, they expire, they're single-order/single-product scoped, and every
  download is authorized server-side before a short-lived signed URL is issued.
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`) are set in `next.config.js`.
- MFA for admin accounts is not yet implemented — `mfaEnabled`/`mfaSecret`
  fields exist on the `User` model as a starting point (e.g. via `otplib`)
  before launch if you want it enforced.

## 17. What still needs your attention before this is a finished storefront

This is a real, wired-together application — not a mockup — but a few
things are intentionally left as clearly-marked extension points rather than
faked:

- The uploaded **logo file was not included** in this brief — `logo.jpeg`
  is referenced at `public/images/logo.jpeg`; add the real file there.
- Verification/password-reset **emails** are not yet sent (the tokens are
  generated correctly in `app/api/auth/register/route.ts`; wire them through
  `lib/email` once you're ready).
- The admin product list is read-only in the UI; the create/edit **API**
  already exists and is audited — add a form when you're ready to manage
  products without Prisma Studio.
- Rate limiting on `/api/contact` is in-memory (fine for one server instance;
  swap for Redis/Upstash before scaling to multiple instances).
- Expand the test suite per §13 before accepting live payments.

## 18. Project structure

```
/app                  Pages (App Router) and API routes
  /(shop)             Public storefront pages
  /admin              Admin dashboard (RBAC-protected)
  /api                Server routes: checkout, webhooks, downloads, admin, auth
/components           React components (Header, Footer, ProductCard, cart)
/lib
  /payments           PaymentProvider interface + Stripe implementation
  /email              Email abstraction (Resend)
  /storage            Private S3-compatible storage abstraction
  /auth               NextAuth config, password hashing
  /admin              Audit logging, requireAdmin()
  download-tokens.ts  Secure download token issuance + authorization
  prisma.ts           Prisma client singleton
/prisma               schema.prisma, seed.ts
/tests                Vitest unit/API tests
middleware.ts         Edge-level RBAC for /admin and /my-purchases
```

# Carnivore Club — Phase A scaffold

Skeleton per `docs/SITE_ARCHITECTURE.md`: auth, seller applications, admin
approval queue, and read-only browse/shop pages. No payments yet (Phase B).

The full architecture doc (data model, user flows, build phases, open
decisions, GoHighLevel notes) is checked in at `docs/SITE_ARCHITECTURE.md` —
keep it in sync with the source doc as decisions get made.

## Stack
Next.js 14 (App Router) · Supabase (Postgres, Auth, Storage) · Tailwind CSS.
Stripe + Stripe Connect (Phase B) · GoHighLevel (CRM/marketing, Phase C).

## Setup

1. **Create a Supabase project** (supabase.com), test mode is fine to start.
2. In the SQL editor, run `supabase/schema.sql` — creates all tables, the
   `handle_new_user` trigger (auto-creates a `profiles` row on signup), RLS
   policies, and seeds starter categories.
3. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings > API
   - `SUPABASE_SERVICE_ROLE_KEY` — same page, service_role secret (server-only, never expose to the browser)
4. Install and run:
   ```
   npm install
   npm run dev
   ```
5. **Make yourself an admin**: sign up through `/signup`, then in the
   Supabase SQL editor run:
   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```

## What's here (Phase A)

- Supabase auth (email/password) — `/login`, `/signup`, `/logout`
- Public seller application form — `/seller/apply` → inserts into `sellers` (status `pending`)
- Seller dashboard — `/seller/dashboard`, product creation — `/seller/products/new`
  (gated to sellers with `status = 'approved'`)
- Admin approval queue — `/admin`, `/admin/sellers/[id]`, `/admin/products/[id]`
  — each decision writes to `approval_reviews` and updates the seller/product
  `status`. Gated by `role = 'admin'` in `middleware.ts`.
- Public browse — `/shop`, `/shop/[category]`, `/shop/product/[id]` — no cart yet.

Route protection: `middleware.ts` redirects unauthenticated users away from
`/admin/*` and `/seller/dashboard|products/*`, and non-admins away from
`/admin/*`. Row Level Security in `schema.sql` enforces the same rules at the
database layer as a second line of defence.

## Open decisions (see `docs/SITE_ARCHITECTURE.md` Section 6 — updated v6)

- [ ] Confirm carnivoreclub.net DNS → Vercel
- [x] Stripe account created
- [ ] Create Supabase account (test mode) — needed before Setup step 1 above
- [ ] Minimum insurance coverage threshold — once set, add a `coverage_amount`
      field to the seller application (`app/seller/apply/`) and validate it
      server-side in `actions.ts`
- [x] Private pilot launch decided — via local Facebook groups, before any
      public launch. No technical gating has been added for this yet (no
      invite codes / access list in the schema) — flag if the pilot needs the
      site itself restricted rather than just distributed privately.

## GoHighLevel (Section 7 — new in v6)

GHL is a CRM/marketing layer alongside the app, not a replacement for
Supabase. Supabase stays the source of truth for sellers, products, orders,
reviews. Planned integration point (Phase C, not required for A/B): a
Stripe/Supabase webhook fires on order completion → posts buyer contact +
order summary to a GHL inbound webhook → GHL tags the contact "customer" and
enrols them in post-purchase marketing (reorder nudges, recipe alerts, bundle
promos). Also used for informal seller relationship management during
onboarding and founding-seller/Facebook-group lead capture.

## Next: Phase B

Stripe Connect seller onboarding, cart + multi-seller checkout, order/
order_item creation with payment splitting, fulfilment marking. Tables for
these (`orders`, `order_items`) already exist in `schema.sql`.

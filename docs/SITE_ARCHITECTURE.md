# Carnivore Club — Site Architecture

**Status:** Draft v1 — working reference for building with Claude Code.
**Audience:** You + Claude Code, not a client-facing document.
**Companion docs:** `Carnivore_Club_Strategy_Plan.docx`, `Carnivore_Club_Seller_Approval_Toolkit.docx`, `Carnivore_Club_Brand_Guidelines.docx`.

---

## 1. Stack (optimised for simple + low-maintenance)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js** (App Router, React) | One codebase for pages + API routes; Claude Code works well with it; huge ecosystem |
| Database + Auth + Storage | **Supabase** (managed Postgres) | Auth, database, and file storage in one managed service — no servers to maintain, generous free tier, plain SQL underneath |
| Payments | **Stripe + Stripe Connect** | Industry standard for marketplaces; handles seller payouts, commission splits, KYC/identity verification, and PCI compliance for you |
| Hosting | **Vercel** | Zero-config deploys straight from a Next.js repo, free preview URLs per change, easy custom domain setup for carnivoreclub.net |
| Transactional email | **Resend** | Simple API for order confirmations, approval/rejection notices, licence-expiry reminders |
| Images | **Supabase Storage** | Same place as the database — one less service to manage |

**Why this combination:** every piece is a managed service (no servers to patch, no infrastructure to babysit), all have generous free tiers to start, and all are well-documented enough that Claude Code can work with them reliably. This is deliberately *not* the "fully custom, scalable from day one" route — it optimises for you being able to launch and iterate quickly with minimal ops overhead.

---

## 2. Core data model

Plain-English table list first, SQL-ish shape below for reference during build.

- **profiles** — every person (buyer, seller, admin), extends Supabase's built-in auth
- **sellers** — business details + approval status, one per approved seller profile
- **products** — listings, tied to a seller, with approval status and tier
- **categories** — the taxonomy from the Strategy Plan (Beef, Organ Meats, Tallow, etc.)
- **orders** / **order_items** — a buyer's order, broken into per-seller line items (needed since one order can span multiple sellers)
- **reviews** — verified post-purchase reviews only, tied to an order item
- **recipes** — content hub entries, linked to the products used
- **approval_reviews** — a log of every five-pillar review decision, for sellers, products, or recipes

```sql
profiles
  id (uuid, = supabase auth user id)
  role            -- 'buyer' | 'seller' | 'admin'
  full_name
  email
  created_at

sellers
  id
  profile_id      -- fk -> profiles
  business_name
  abn
  licence_number
  licence_expiry
  insurance_provider
  insurance_policy_number
  insurance_expiry
  stripe_account_id     -- Stripe Connect account
  status          -- 'pending' | 'approved' | 'on_hold' | 'rejected'
  created_at

categories
  id
  name
  slug

products
  id
  seller_id       -- fk -> sellers
  category_id     -- fk -> categories
  name
  description
  price_cents
  images          -- array of storage URLs
  animal_raising_standard
  ingredients_list
  cold_chain_method
  shelf_life
  status          -- 'draft' | 'pending_review' | 'approved' | 'on_hold' | 'rejected'
  tier            -- 'approved' | 'club_selection' | 'founders_pick'
  created_at

orders
  id
  buyer_id        -- fk -> profiles
  total_cents
  status          -- 'pending' | 'paid' | 'fulfilled' | 'cancelled'
  created_at

order_items
  id
  order_id        -- fk -> orders
  product_id      -- fk -> products
  seller_id       -- fk -> sellers
  quantity
  price_cents
  commission_cents
  created_at

reviews
  id
  order_item_id   -- fk -> order_items (ensures verified purchase only)
  buyer_id        -- fk -> profiles
  rating          -- 1-5
  comment
  created_at

recipes
  id
  title
  body
  product_ids     -- array of fk -> products
  category         -- 'basics' | 'organ_forward' | 'bone_broth' | 'tallow' | 'meal_prep' | 'resets'
  status          -- 'draft' | 'pending_review' | 'published'
  created_by       -- fk -> profiles
  created_at

approval_reviews
  id
  target_type     -- 'seller' | 'product' | 'recipe'
  target_id
  reviewer_id     -- fk -> profiles (admin)
  pillar_scores   -- jsonb, e.g. {"animal_raising": true, "ingredient_purity": true, ...}
  decision        -- 'approved' | 'on_hold' | 'rejected'
  notes
  created_at
```

---

## 3. Core user flows

### 3.1 Seller application & approval
Maps directly to the Seller Approval Toolkit's 6-step process.
1. Prospective seller fills out a public application form → creates a `sellers` row with `status = 'pending'`
2. Admin reviews in the **admin approval queue** (Section 4 below) against the Detailed Compliance Checklist
3. Decision recorded as an `approval_reviews` row; seller status updated
4. Approved sellers get dashboard access to create product listings

### 3.2 Product listing & approval
1. Approved seller creates a product → `status = 'pending_review'`
2. Admin reviews against the Five-Pillar Quick Checklist → records `approval_reviews` row
3. Approved products go live at the confirmed `tier` (approved / club selection / founder's pick)

### 3.3 Buyer browse, search, checkout
1. Buyer browses/filters by category, diet-fit tags, region
2. Adds items from one or more sellers to cart
3. Checkout creates one `order` with multiple `order_items` (one per seller) — this is the trickiest part of a multi-seller marketplace checkout
4. Stripe Connect splits payment: platform commission retained, remainder routed to each seller's connected account

### 3.4 Fulfilment & review
1. Seller marks their `order_item` as shipped/fulfilled
2. Buyer can leave a review only after fulfilment, tied to that specific `order_item` (prevents fake/unverified reviews)

### 3.5 Admin approval queue
A simple internal-only section of the same app (gated by `role = 'admin'`), listing:
- Pending sellers awaiting desk/product review
- Pending products awaiting the five-pillar check
- Pending recipes awaiting the recipe standard check
- Upcoming licence/insurance expiries needing follow-up

---

## 4. Suggested repo structure

```
/app
  /(marketing)        -- public homepage, about, standards page
  /shop                -- browse/search/category/product pages
  /seller               -- seller dashboard (own listings, orders, profile)
  /admin                -- approval queue, seller/product/recipe review screens
  /api
    /stripe/webhook     -- payment + payout event handling
    /checkout           -- create order + Stripe session
/lib
  supabase.ts           -- Supabase client
  stripe.ts             -- Stripe client
/components             -- shared UI (badges, product cards, forms)
/supabase
  schema.sql            -- table definitions from Section 2
  migrations/
```

---

## 5. Build phases (code-level, maps to Strategy Plan Section 12)

**Phase A — Skeleton (no payments yet)**
- Auth (buyer/seller/admin roles) via Supabase
- Seller application form → `sellers` table
- Admin approval queue (sellers only)
- Basic product creation + admin product approval
- Public browse/category pages (no cart yet)

**Phase B — Transactions**
- Stripe Connect onboarding for approved sellers
- Cart + multi-seller checkout
- Order + order_item creation, payment splitting
- Order status + fulfilment marking

**Phase C — Retention features**
- Verified reviews
- Recipes & content hub
- Bundles (grouping multiple sellers' products into one purchasable unit)
- Badge visuals (Approved / Club Selection / Founder's Pick) per Brand Guidelines

---

## 6. Open decisions before starting Phase A

- [ ] Confirm carnivoreclub.net DNS is ready to point at Vercel
- [x] Stripe account created
- [ ] Create Supabase account (test mode to start)
- [ ] Confirm minimum insurance coverage amount for the seller compliance checklist (referenced in Toolkit Section 2.2) so it can be enforced in the application form validation later
- [x] Private pilot launch decided — via local Facebook groups, before any public launch

---

## 7. GoHighLevel — role in this stack

GoHighLevel (GHL) is **not** used as the core database — Supabase remains the single source of truth for sellers, products, orders, and reviews (Section 2). GHL sits alongside the marketplace as a CRM/marketing layer:

- **Seller relationship management** — informal follow-ups during onboarding, outside the formal approval workflow tracked in `approval_reviews`
- **Post-purchase marketing** — once a buyer completes a first order in Supabase, drop their details into GHL (via webhook) for email/SMS marketing: reorder nudges, new recipe alerts, bundle promotions
- **Lead capture** — founding-seller outreach and the private Facebook-group launch audience

**Integration point:** a Stripe/Supabase webhook fires on order completion → posts buyer contact + order summary to a GHL inbound webhook → triggers a GHL workflow to tag that contact as "customer" and enrol them in post-purchase marketing. This is a Phase C nice-to-have, not required for Phase A/B.



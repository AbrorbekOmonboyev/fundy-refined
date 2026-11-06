# Plan: rewards, add-ons and the pledge cart (functions learned from Indiegogo)

Source studied: Indiegogo campaign "Creality SPARKX i8" → Rewards / Add-ons / Your pledge (6 Nov 2026).
We copy **functions only** — not their look, wording or pressure tactics.

---

## 1. What their page does (inventory)

| # | Function on Indiegogo | What it means | Fundy today |
|---|---|---|---|
| 1 | Reward cards: price + crossed-out retail price + "% OFF" | Backer sees the real saving | Price only |
| 2 | Tiers by time/stock: *Super Early Bird → Early Bird → Special* | First backers get the best price; price steps up when a tier sells out or a date passes | One price per reward |
| 3 | "7 LEFT", "pledged 3 997 times" | Live stock and popularity per reward | Have `quantity_limit`, `claimed_count`; not shown well |
| 4 | Per-person limit ("only for logged-in users due to limited availability per user") | Stops one person buying all early-bird units | None |
| 5 | Estimated delivery month per reward (+ note "may ship separately") | Honest timing per item | Have `estimated_delivery` text |
| 6 | **Bundles**: "This product consists of: i8 ×1, CFS Lite ×1" | A reward made of several products, each with quantity | `items` is free text |
| 7 | **"More info" modal**: image gallery with zoom, contents, long description, delivery info | Full details without leaving the page | No reward images or details view |
| 8 | **Add-ons** section (extra products) + rule "can't pledge add-ons only" | Upsell accessories on top of a main reward | None |
| 9 | **Cart — "Your pledge"**: several rewards/add-ons, item count in header, empty state | One payment for many items | One reward per payment |
| 10 | "Show your support": any amount, no reward | Tip / pure support | Have (no-reward option) |
| 11 | **Delivery to: Uzbekistan — change location** | Shipping cost & availability depend on destination; "customs and VAT covered" note | No delivery at all |
| 12 | Digital rewards (subscriptions) with no delivery date | No shipping for digital items | Not distinguished |
| 13 | **Compare rewards** tool | Side-by-side table of what each reward includes | None |
| 14 | "FEATURED" / "LIMITED" badges | Founder highlights a reward; limited stock flag | Project-level featured only |
| 15 | Sticky bar: funding total, backers, days left, *Back this project*, *Follow*, share | Always-visible main action | Have on phones (sticky bar), follow & share exist |
| 16 | Tabs: Project · Rewards · Your pledge · Comments · Updates · **FAQ** | Separate FAQ per project | Have all except **FAQ** and **Your pledge** |
| 17 | Display currency switch (USD/EUR/…) | Approximate price in visitor's currency | UZS only |
| 18 | "Pledge Manager" (footer) | After the campaign: collect addresses, choose colour/size, buy late add-ons | None |
| 19 | "Other projects you may like" | Recommendations | Have "related projects" |
| 20 | "Lowest price in last 30 days" | EU price law (Omnibus) | Not required in Uzbekistan — skip, or show "price history" later |

**Not copying:** countdown pressure, fake-sounding "Only today!" copy, EU-specific price labels, login wall before seeing the cart.

---

## 2. Principles for Fundy's version

1. **Honest scarcity only.** "N ta qoldi" comes from real stock in the database, never invented.
2. **Cart works without logging in.** Login is asked only at checkout (Indiegogo asks before "add to pledge" — worse for conversion).
3. **The server decides.** Stock, per-person limits, dates, prices and shipping are checked inside one database function with row locks, so two people can't buy the last unit.
4. **Islamic finance fit.** A reward pre-order is close to *istisnaʼ* / *salam* (paying now for a clearly described item delivered later). That needs: exact description, fixed price, delivery time — all fields below. Musharakah projects do not use rewards. Confirm with the Shariah advisor.
5. **Same rules as now:** money released by milestone; refunds if the goal isn't reached (already built); all amounts in so'm.

---

## 3. Phases

### Phase A — Richer rewards (display only) · ~3–4 days

**Database (migration)**
- `reward_tiers` new columns:
  - `kind` enum `('reward','addon')` default `'reward'`
  - `compare_at_amount bigint` (retail price; must be > `amount`, admin checks it's real)
  - `image_paths text[]` (gallery, Supabase Storage `project-images`)
  - `long_description text`
  - `is_featured boolean`, `is_digital boolean` (no shipping)
  - `per_backer_limit smallint` (null = no limit)
  - `available_from timestamptz`, `available_until timestamptz` (early-bird windows)
  - `is_hidden boolean` (founder can pause a reward)
- New table `reward_components (id, reward_tier_id, position, name, quantity, image_path)` — "consists of" list with quantities (replaces free-text `items`; migrate existing items as quantity 1).
- RLS: public read for rewards of public projects (same as today); write only by owner while draft/changes_requested; admin read.

**Site**
- New reward card: image, title, price, crossed-out price + "−20%", badges *Tavsiya etiladi* (featured) / *Cheklangan* (limited), "N ta qoldi", "N marta tanlandi", delivery month, "Raqamli" (digital).
- Status rules shown on the card: *Tez orada* (before `available_from`), *Tugadi* (sold out / after `available_until`) — sold-out cards move to the bottom.
- **Reward details sheet** (modal on desktop, bottom sheet on phones): gallery with swipe & zoom, components with quantities, long description, delivery note.
- **Compare tool**: pick 2–4 rewards → table (rows = components, cells = quantity / ✓ / —, plus price and delivery).
- Founder wizard → "Mukofotlar" step gets all new fields, image upload, drag to reorder, "Add-on" toggle.
- Admin review page shows the new fields; checklist item "retail price is real".

**Tests**: DB tests for RLS on new columns/tables; unit tests for discount % and card status (coming / available / sold out / ended).

---

### Phase B — The pledge cart ("Homiyligim") · ~4–5 days

**Database**
- New table `contribution_items (id, contribution_id, reward_tier_id, quantity, unit_amount, kind)` — one row per line.
- `contributions` gets `extra_amount bigint default 0` (the "support without reward" part) and `shipping_amount bigint default 0`; `amount` stays the total.
- Project setting `projects.allow_addons_only boolean default false` ("add-ons need a main reward").
- New RPC **`contribute_cart(p_project_id, p_items jsonb, p_extra_amount, p_region_id, p_payment_method, p_anonymous)`**, `security definer`, one transaction:
  1. project is live; caller logged in and not blocked;
  2. lock each reward row (`select … for update`), check: belongs to project, not hidden, inside its date window, `claimed_count + qty ≤ quantity_limit`, caller's previous qty + qty ≤ `per_backer_limit`;
  3. add-on rule; prices taken **from the database**, never from the browser;
  4. shipping from Phase C (0 until then);
  5. insert contribution + items, bump `claimed_count`, update project totals, notify (existing triggers).
- Keep old `contribute()` working (it becomes a one-line cart) so nothing breaks.

**Site**
- Cart stored per project in `localStorage` (works logged out); header/sticky bar shows "Savat · 3".
- "Savatga qo'shish" on cards and in the details sheet; quantity stepper; remove; empty state.
- Cart drawer: lines, quantities, subtotal, "qo'shimcha qo'llab-quvvatlash" (extra amount), delivery line (Phase C), total, then **Rasmiylashtirish** → login if needed → payment method → confirm.
- Prices re-checked on open: if a reward sold out or price changed, the line is marked and the total updates before paying.
- Thank-you screen lists items; backer dashboard shows items per contribution.

**Tests**: concurrency test (two buyers, one unit left → exactly one succeeds), per-backer limit, date window, add-ons-only rule, price tampering ignored, totals equal sum of lines; unit tests for cart math.

---

### Phase C — Delivery · ~4–5 days

**Database**
- `project_shipping (project_id, region_id null=everywhere in Uzbekistan, fee bigint, is_available boolean, note text)` — e.g. Toshkent shahri 0, other regions 30 000 so'm, Qoraqalpog'iston not available. (International later.)
- `contribute_cart` adds the fee once per pledge if any non-digital item; refuses if the region isn't served.
- **Address collection** (only when needed): `backer_addresses (contribution_id pk, full_name, phone, region_id, district, address_line, landmark, postal_code)`. RLS: backer edits own; project owner reads only after the project is `funded`; admin reads. Phone/address are personal data → shown masked in lists, full in the export only.
- **Fulfilment status** per contribution: `fulfilment_status ('pending','preparing','shipped','delivered')`, `tracking_code`, `shipped_at` — set by the founder.

**Site**
- "Yetkazish: Toshkent shahri ▾" selector on the rewards section (defaults to the profile region); cards show "Yetkazib berilmaydi" if not served.
- Cart shows the delivery fee; checkout asks for the address only if the cart has physical items (or later via the survey, Phase D).
- Founder dashboard → "Yetkazish" tab: table of backers with items, region, status; bulk "Jo'natildi" with tracking; **CSV export** for couriers.
- Backer "Pulingiz" column also shows delivery status + tracking.

**Tests**: region availability, fee once per pledge, digital-only carts pay no shipping, address privacy (owner can't read before funded; other backers never).

---

### Phase D — Manage my pledge + post-campaign survey · ~2–3 days

- **"Homiyligim" tab** on the project page (= Indiegogo "Your pledge"): what I backed here, items, total, delivery, status.
- While the campaign is live: **change quantity / add add-ons / cancel** (cancel = simulated refund, stock released) via RPC `update_pledge` / `cancel_pledge` with the same checks as Phase B.
- After funding: **survey** (pledge manager): founder defines options per reward (`reward_options (reward_tier_id, name, values text[])`, e.g. Rang: ko'k/qizil), backers choose options + confirm address before a deadline; reminders via notification + Telegram.
- Late add-ons after the campaign: optional, off by default.

---

### Phase E — Project page extras · ~2 days

- **FAQ per project**: `project_faqs (project_id, position, question, answer, language)`; founder edits in dashboard; shown as an accordion tab; backers' frequent comment questions can be "moved to FAQ" by the founder.
- **Display currency (approximate)**: daily CBU rates (cbu.uz public API, Edge Function + pg_cron) → "≈ $25" under so'm prices for visitors choosing USD/RUB. Payments stay in so'm.
- Rewards tab anchor links (`#rewards`, `#addons`, `#reward-<id>`) so a reward can be shared directly in Telegram.

---

### Phase F — Founder & admin tooling · ~2–3 days

- Reward analytics in the founder dashboard: sold / left / revenue per reward and add-on, per region.
- Admin: reward review checklist (real retail price, honest delivery date, components complete), ability to hide a reward.
- Notifications: "reward almost sold out" to founder; "your survey is waiting" to backers.

---

## 4. Order, size, dependencies

| Phase | Depends on | Size | Visible result |
|---|---|---|---|
| A Richer rewards | — | 3–4 days | Better reward cards, details, compare |
| B Cart | A | 4–5 days | Several rewards + add-ons in one payment |
| C Delivery | B | 4–5 days | Regions, fees, addresses, shipping status |
| D Manage pledge & survey | B, C | 2–3 days | Edit/cancel pledge, colour/size, address survey |
| E Page extras | — (can run in parallel) | 2 days | FAQ tab, ≈USD, shareable reward links |
| F Tooling | A–C | 2–3 days | Analytics, admin checks |

**Total ≈ 3–4 weeks** of work. Every phase ships on its own (with migrations, tests, Uzbek/Russian/English texts, dark mode, phone layout) and keeps the demo payments simulated.

## 5. Open questions for the owner

1. Delivery: Uzbekistan only at first, or international too?
2. Who pays delivery — backer (fee per region) or included in the price?
3. Should founders be allowed "add-ons only" pledges per project?
4. Can backers cancel a pledge while the campaign is live (Indiegogo allows changes until the end)?
5. Display currency: is "≈ USD" useful for diaspora backers, or keep so'm only?
6. Shariah advisor to confirm the pre-order (istisnaʼ) wording and refund rules.

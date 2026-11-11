# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Donors (primary), young and old equally.** A student giving 10,000 so'm from a Telegram link and a parent or grandparent giving a larger amount who needs every step to be obvious and trustworthy. Both arrive on a phone, usually from a link shared in Telegram, and decide within a minute whether the cause is real.
- **Organisers.** Registered charitable funds (NNT) first, plus individuals and small groups raising money for a cause. They write the campaign, publish stage reports with receipts, and post updates.
- **Fundy admins.** Review campaigns, verify funds, check stage reports. Desktop.
- Language order: Uzbek (Latin) first, then Russian, then English. Uzbek Cyrillic is supported.

## Product Purpose

Fundy is a donation platform for good causes in Uzbekistan. It exists because people want to help but do not trust where the money goes. Success is a donor who gives, sees the money arrive at a stage report with receipts, and gives again.

## Positioning

Every campaign is checked before it goes live, the money is released stage by stage, and each stage is closed with a public report of what was spent, with receipt photos. Funds can earn a "Verified fund" badge after Fundy checks their registration number. Fundy takes no commission on donations; donors may add an optional tip for Fundy.

## Operating Context

- Visitors land from Telegram links on phones; the Telegram bot sends updates.
- Payments: Click, Payme, Uzcard, Humo (currently simulated; real merchant contracts pending). Amounts in so'm, minimum 10,000.
- A site-wide "Demonstration Prototype" banner is required while payments are simulated.
- Donation-only mode is on (src/lib/focus.ts and the database setting); the older reward and Musharakah investment models still exist in code, and one real investment campaign (EduNavi) is closed as funded.

## Capabilities and Constraints

- React + Vite + TypeScript, Tailwind v4 (tokens in src/index.css), react-i18next (uz, ru, en), Supabase backend, deployed on Vercel.
- Pages: home, explore, project detail (story, budget, stages, evaluation, updates, questions), donate dialog with optional tip, receipt page, learn/trust/about/legal pages, auth, founder wizard and dashboard, backer dashboard, admin.
- Light and dark mode both exist and must keep working.
- Hackathon sample projects are marked is_demo and will be removed later; they must never be presented as real.

## Brand Commitments

- Keep the Fundy logo (public/brand) as it is.
- Keep green as Fundy's brand colour.
- Uzbek-first copy; plain, warm, honest wording, never hype.
- Look: the familiar donation-site standard, executed at full craft (chosen 2026-11-11). Quality bar: GoFundMe, charity: water, Kitabisa, JustGiving. Conventions embraced, no novelty metaphors.

## Evidence on Hand

- Real campaigns: EduNavi (funded), Nomi Rashidov math centre, Asalarichilik, EcoNuz. Hackathon sample campaigns with photos in public/images.
- No real testimonials, press, partner logos or donor counts exist yet; none may be invented.

## Product Principles

1. Trust is earned by showing, not claiming: budgets, stages, receipts and verification are visible where the decision is made.
2. Every screen must work for a first-time phone user aged 18 or 68.
3. One clear next step per screen; giving takes as few taps as possible.
4. Honest about what is simulated or unverified.

## Accessibility & Inclusion

Older donors: body text at least 15px, smallest text 13.5px, high contrast (WCAG AA minimum), large tap targets (44px), no meaning carried by colour alone, reduced-motion respected.

---
name: Fundy
description: Checked donation campaigns for Uzbekistan, paid out stage by stage with public receipts.
colors:
  fundy-green: "#0b6b45"
  fundy-green-deep: "#08553a"
  green-tint: "#e7f3ec"
  green-on-dark: "#6fd6a0"
  almost-amber: "#e8952b"
  almost-amber-ground: "#fdf0dc"
  almost-amber-ink: "#7a4505"
  ink: "#17201b"
  forest: "#0f2a20"
  forest-soft: "#18392c"
  card: "#ffffff"
  warm-page: "#faf9f6"
  track: "#e3e8e4"
  line: "#e1e5e0"
  line-strong: "#c9d0c9"
  muted-text: "#5f6b63"
  body-secondary: "#525d56"
  body-strong: "#3d4741"
  night-page: "#0c1511"
  night-card: "#15211b"
  night-ink: "#ecf1ed"
  night-green: "#18804f"
typography:
  display:
    fontFamily: "Onest, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Onest, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Onest, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 700
    lineHeight: 1.375
  body:
    fontFamily: "Onest, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  body-small:
    fontFamily: "Onest, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Onest, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.84375rem"
    fontWeight: 600
    lineHeight: 1.2
  money:
    fontFamily: "Onest, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.25
    fontFeature: "tnum"
rounded:
  md: "10px"
  lg: "12px"
  xl: "16px"
  2xl: "16px"
  3xl: "24px"
  full: "9999px"
spacing:
  gutter-phone: "16px"
  gutter-tablet: "24px"
  gutter-desktop: "32px"
  card-gap-x: "24px"
  card-gap-y: "40px"
  section-phone: "64px"
  section-desktop: "96px"
components:
  button-primary:
    backgroundColor: "{colors.fundy-green}"
    textColor: "{colors.card}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.fundy-green-deep}"
  button-hero:
    backgroundColor: "{colors.fundy-green}"
    textColor: "{colors.card}"
    rounded: "{rounded.full}"
    padding: "0 32px"
    height: "52px"
  button-secondary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
    height: "44px"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
    height: "44px"
  proof-chip:
    backgroundColor: "{colors.green-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
    height: "36px"
  almost-there-badge:
    backgroundColor: "{colors.almost-amber-ground}"
    textColor: "{colors.almost-amber-ink}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  amount-preset:
    backgroundColor: "{colors.card}"
    textColor: "{colors.body-strong}"
    rounded: "{rounded.2xl}"
    height: "56px"
  amount-preset-selected:
    backgroundColor: "{colors.green-tint}"
    textColor: "{colors.ink}"
  choice-pill:
    backgroundColor: "{colors.card}"
    textColor: "{colors.body-strong}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "44px"
  campaign-card-photo:
    backgroundColor: "{colors.line}"
    rounded: "{rounded.2xl}"
  money-panel:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.3xl}"
    padding: "24px"
  progress-bar:
    backgroundColor: "{colors.track}"
    rounded: "{rounded.full}"
    height: "8px"
---

# Design System: Fundy

## Overview

**Creative North Star: "The Checked Giving Page"**

Fundy is built to the donation-site standard (GoFundMe, charity: water, Kitabisa, JustGiving): real photos, plain numbers, one green action, and Fundy's proof (checked campaigns, stage-by-stage payouts, public receipts) set exactly where the donor decides. Warm white grounds, near-black ink with a green cast, generous tap targets, and a single typeface carry the whole site. Novelty metaphors and the old navy-heavy institutional look are rejected.

The system is phone first and serves donors young and old equally: body text never below 15px, nothing smaller than 13.5px, 44px minimum targets, WCAG AA contrast, meaning never carried by colour alone, reduced motion respected. Dark mode is a deep forest night where green is the light.

**Key Characteristics:**
- Fundy green is the only action and progress colour; amber appears only for "almost there".
- Onest everywhere (Latin, Uzbek oʻ gʻ, Cyrillic); tabular figures for money.
- Photo-led campaign cards with 16px corners and thick rounded progress bars.
- Pill buttons and chips; 10px corners for inputs.
- Flat at rest; soft shadows only on lifted panels and floating things.

## Colors

A calm green-and-warm-white palette with one warm accent held back for momentum.

### Primary
- **Fundy Green** (fundy-green): every primary button, progress fill, selected-state ring, Suggested tag, done steps in the payout trail. White text on it (6.5:1). Hover and pressed go to **Deep Fundy Green** (fundy-green-deep).
- **Green Tint** (green-tint): proof chips, selected presets and choice cards, cause-chip hover, step icon tiles, empty-state band.
- **Green on Dark** (green-on-dark): icons, link underlines and hover text on forest surfaces and in dark mode.

### Secondary
- **Almost-There Amber** (almost-amber): the flame icon and nothing else that sits on white; never text on white.
- **Amber Ground / Amber Ink** (almost-amber-ground, almost-amber-ink): the "Almost there" badge on card photos and the money-panel nudge (7.6:1). In dark mode the ground stays opaque (#3b2a12) so it reads over photos; the ink lightens to #f6c27a.

### Neutral
- **Ink** (ink): all text and headings; the default focus outline.
- **Forest / Forest Soft** (forest, forest-soft): footer, demo banner, closing band, toasts. Stay dark in both themes.
- **Card White** (card) on **Warm Page** (warm-page): cards, header, inputs, dialogs sit white on the warm ground.
- **Track** (track): empty part of progress bars, image placeholders.
- **Green-warm greys** (line, line-strong, muted-text, body-secondary, body-strong): a custom slate scale with a green-warm cast replacing Tailwind's blue slate. Muted text is #5f6b63 (5.3:1 on the page, AA); line is the default card/border hairline, line-strong the input and secondary-button stroke.
- **Night** (night-page, night-card, night-ink, night-green): dark-mode page, card, text, and a slightly brighter green (white text 4.9:1). The grey scale inverts in dark mode; green and forest areas keep their light-mode inner colours.

### Named Rules
**The One Action Colour Rule.** Green is the only colour that means "do this" or "progress". No second action hue.
**The Amber Is Momentum Rule.** Amber appears only for a live campaign at 75-99% of its goal. It is a badge ground and an icon, never body text on white.

## Typography

**Display Font:** Onest (with system-ui, -apple-system, Segoe UI)
**Body Font:** Onest (same stack)

**Character:** One friendly, open grotesque for every script Fundy serves; hierarchy comes from weight and size, not from a second face.

### Hierarchy
- **Display** (800, 2.5rem phone / 3rem tablet / 3.75rem desktop, 1.04, -0.03em): the home hero line only, balanced wrapping.
- **Headline** (700, 1.625rem phone / 1.875rem desktop, -0.02em): section headings; campaign title on the project page runs 1.75rem to 2.625rem. All h1/h2 break long Uzbek words and hyphenate.
- **Title** (700, 1.0625rem, snug): campaign card titles, clamped to two lines; step titles at 1.125rem.
- **Body** (400, 1rem-1.25rem, relaxed): lead text 1.125-1.25rem in slate 700; paragraphs held near 36rem (max-w-xl).
- **Body small** (400, 15px, 1.4): card taglines, meta, secondary copy. The floor for reading text.
- **Label** (600, 13.5px): badges, tags, hints, stat captions. Nothing renders smaller.
- **Money** (700, 2rem panel / 1rem card, tabular figures): raised amounts, percentages, preset values.

### Named Rules
**The 13.5 Floor Rule.** The smallest text is 13.5px (the overridden `text-xs`); small body text is 15px. Do not use arbitrary smaller sizes.
**The Tabular Money Rule.** Every amount, percentage and count that can sit beside another is set in tabular figures.

## Layout

Centred container, max 80rem, with 16 / 24 / 32px gutters (phone / tablet / desktop). Campaign grids run 1, 2, 3 columns (md, lg) with 24px column and 40px row gaps; phones show three cards on home, the rest one tap away. Sections are separated by 64px on phones and 96-112px on desktop. The home hero is a two-column split on desktop (copy left, five-photo mosaic right, 520px tall); the mosaic is desktop only so the first campaign card starts above the fold on phones. The project page uses a 12-column grid with the money panel in the right four columns, sticky below the 64px sticky header. Cause chips run 2 / 3 / 4 columns. The donate dialog is a bottom sheet on phones and a centred 32rem dialog from sm up.

## Elevation & Depth

Flat at rest on a warm page; white cards separate by tone and a hairline. Shadows are soft, low-contrast and green-tinted, used for lifted panels and anything that floats. In dark mode, dark panels get a 1px white-7% inner hairline instead of shadow, and photos are dimmed to 92% brightness.

### Shadow Vocabulary
- **Rest lift** (`box-shadow: 0 1px 2px rgb(16 32 24 / 0.06)`): badges on photos, save button, primary hero button, small cards.
- **Panel lift** (`box-shadow: 0 2px 6px rgb(16 32 24 / 0.07), 0 8px 24px rgb(16 32 24 / 0.06)`): the money panel (desktop) and the example payout trail.
- **Floating** (Tailwind lg / xl / 2xl defaults): mobile menu, photo-overlay buttons, toasts, the donate dialog.

### Named Rules
**The Soft-Only Rule.** Depth is diffuse and tinted; no hard offset shadows, no coloured glows.

## Shapes

Friendly rounded geometry. Pills (full radius) for buttons, chips, badges, tags and choice toggles; 10px for inputs and search; 12px for alerts and option cards; 16px for photos, campaign images, cause chips, amount presets and the dialog; 24px for the large lifted panels. Progress bars are fully rounded, 8px tall on cards and 10px in the money panel. Photos are 4:3 on cards and 16:10 on the project page. Borders are 1px hairlines; the payout trail uses a 3px line, solid for done and dashed for to come.

## Components

### Buttons
- **Shape:** pill (full radius), 44px minimum height; hero and closing-band CTAs 52px / 48px with 32px side padding.
- **Primary:** Fundy green, white semibold text, 15px; hero size 17px with an arrow icon.
- **Hover / Focus:** deeper green on hover; press scales to 98%; 150ms colour transitions. Focus is a 3px ink outline offset 2px, white on green or forest.
- **Secondary:** white with a line-strong 1px stroke and ink text; hover darkens the stroke to ink. On forest, a white-40% stroke.
- **Link:** ink text with a 4px-offset underline (slate-400, or green 2px in emphasis), arrow icon for "see all".

### Chips
- **Proof chips:** green tint pill, 36px tall, green icon plus 15px semibold ink text: checked, stage by stage, receipts. Sit under the hero CTAs.
- **Cause chips:** white 16px-corner tiles, 56px tall, hairline border, green icon; hover turns border green and ground tint.
- **Badges on photos:** pills at bottom-left of the card image: amber "Almost there" with flame, white "Verified fund" with green check, each with rest lift.

### Cards / Containers
- **Campaign card:** no card box; a 16px-corner 4:3 photo (1.03 zoom on hover, off under reduced motion), then meta line, two-line title that underlines in deep green on hover, tagline, organiser, a progress bar, the raised amount bold beside "of goal", and percent / days left / backers. The whole card is the link.
- **Money panel:** on desktop a white 24px-corner panel with panel lift, sticky; raised amount at 2rem tabular, 10px progress bar, three stat tiles on the warm page ground (16px corners), amber nudge when near goal, full-width green donate button, quiet text actions (save, copy link, Telegram) below.

### Inputs / Fields
- **Style:** white, 1px line-strong stroke, 10px corners, 44px tall, 16px text, slate-400 placeholder; label 15px medium above, hint or error 13.5px below.
- **Focus:** green border with a 2px green-30% ring.
- **Error / Disabled:** rose-400 stroke with rose-600 message; disabled ground slate-100.

### Navigation
- **Header:** sticky white bar, 64px tall, hairline bottom border; logo left, 15px medium links (xl and up) with the active link in ink semibold under a 3px green underline offset 10px; search field on the warm page ground; language, cart, theme, and a green start-fundraiser action on the right; 44px menu button below xl opens a white drop panel with tinted active rows.
- **Footer:** forest ground, light-grey text, white column headings, links hover to green-on-dark, 40-44px targets.
- **Demo banner:** a thin forest strip above the header, 13.5px text, label in lighter grey.

### Donate Dialog (signature)
Bottom sheet on phones, centred dialog on larger screens, over forest at 50%. Amount presets are 56px tiles with 16px corners in a 2 / 4 column grid; the suggested amount carries a small green pill tag reading "Suggested" centred on its top edge. Selected state everywhere (presets, tip percent pills, payment method pills) is the same: green border, green tint ground, 1px green ring, ink text. The custom amount field is 18px semibold tabular in a 16px-corner box.

### Payout Trail (signature)
A vertical stage list: 33px circles, solid green with a white icon when done, dashed grey ring when still to come, joined by a 3px line that is solid when done and dashed ahead, so state never depends on colour alone. Shown as a marked example on home inside a panel-lift card.

## Do's and Don'ts

### Do:
- **Do** use Fundy green for every primary action and every progress fill, with white text on it.
- **Do** keep text at 15px or larger for reading and never below 13.5px for labels.
- **Do** make every tap target at least 44px tall.
- **Do** set money, percentages and counts in tabular figures.
- **Do** use pills for buttons, chips and toggles, and 16px corners for photos and cards.
- **Do** show selected state as green border plus green tint plus a 1px green ring.
- **Do** carry state with shape or pattern as well as colour (solid vs dashed trail).
- **Do** let progress fills grow in once (700ms, cubic-bezier(0.22, 1, 0.36, 1)) and stay still under reduced motion.

### Don't:
- **Don't** introduce a second action colour or return to navy as a primary surface.
- **Don't** use amber for text on white or outside the 75-99% "almost there" state.
- **Don't** add a second typeface; hierarchy comes from Onest's weights.
- **Don't** use hard offset shadows or coloured glows.
- **Don't** put small uppercase kicker labels above headings.
- **Don't** use coloured side stripes on cards or alerts.

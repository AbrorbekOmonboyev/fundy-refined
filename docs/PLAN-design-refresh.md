# Design refresh: from "AI template" to a real crowdfunding platform

Goal: Fundy should look like Kickstarter / GoFundMe / Indiegogo / Republic, not like a generated
landing page. **Colours stay exactly as they are**: chartreuse #B5F23D, ink #15122B,
shadow green #90D508, white, page grey #F4F6FB (and the current dark mode palette).

## Why the site looks "AI-made" today (found on www.fundy.uz and in the code)

| Pattern | Where | How often |
|---|---|---|
| Everything is a pill or a big soft rounded box | buttons, badges, cards, panels | `rounded-full` 106×, `rounded-2xl` 56×, `rounded-xl` 33× |
| Marketing hero: giant 3-line slogan on flat colour + two pill buttons (Explore / Start) | Home | the first thing people see |
| "How it works" as 4 boxes with numbered circles 1-2-3-4 | Home | the most common generated-site block |
| Dark banner "Ready to start your project?" + arrow pill | Home bottom | classic template ending |
| Tiny grey text everywhere | cards, meta lines | `text-xs` 228× |
| Decorative extras: pulsing dot, tilted card with offset shadow, hover zoom on photos, blur buttons, glowing progress bars, glowing horizon in dark mode | Home, cards, dark mode | |
| Chartreuse used as decoration (stat boxes, badges, number circles) so it means nothing | Home, calculator, cards | `bg-brand-soft` 27× |
| Copy written in "AI voice": em-dashes, lists of three, slogans | uz/ru/en texts | 58 em-dashes in uz.json alone |
| Icon next to almost every label | everywhere | lucide in 40 files |

## What the big platforms do instead

- **The projects are the design.** Kickstarter's and GoFundMe's home pages are mostly photos and
  project titles. Marketing text is one line, not a hero slogan.
- **Real numbers as proof.** Kickstarter shows "$X pledged, Y projects funded" in plain type.
  GoFundMe shows "raised" and "donations" on every card. No illustrations of trust, just the data.
- **Editorial curation.** Rows like "Projects We Love", "Nearly funded", "New & noteworthy",
  "Near you", each with a "See all" link.
- **Small corners, thin lines, no shadows.** Kickstarter uses almost-square corners and 1px grey
  rules to separate things. Cards are image + text, not boxes inside boxes.
- **One accent colour with one job.** Kickstarter green = progress bar and the "Back this project"
  button. Nothing else is green. Same rule for our chartreuse.
- **Project page = a funding page.** Big media on the left, a funding box on the right with a huge
  raised number, backers, days to go, one button. Below: sticky tabs (Story, Rewards, FAQ, Updates,
  Comments). Rewards listed in the right column.
- **Category navigation up top.** A plain text row of categories under the header, plus search.
- **Plain human copy.** Short sentences, specific facts, founder names and places.

## The plan (one step = one change we ship and check on phone + desktop)

### Step 1. Design rules (foundation, nothing visible breaks)
- Write the rules in `src/index.css`: corner sizes (cards/images 8px, buttons 6px, pills only for
  avatars, tags and progress bars), no shadows, 1px rules for separation.
- Chartreuse jobs only: progress bars, the main action button, the selected filter, one brand
  moment on the home page. Remove it from stat boxes, number circles, decorative badges.
- Type: body text 16px, smallest text 14px (only for meta info). Headings Onest 700, not 800.
- Dark mode: remove the glow on progress bars and the glowing "horizon"; keep the colours.

### Step 2. Header + category bar
- Under the header, a plain row of categories (Texnologiya, Hunarmandchilik, Qishloq xoʻjaligi,
  Taʼlim, …) linking to Explore, plus a visible search field (Kickstarter style).
- One primary button in the header ("Loyiha joylash"), square-ish, not a pill.
- Demo banner: thinner, one line, less loud.

### Step 3. Project card (used everywhere, biggest win per hour)
- Photo 16:9 with small corners, no hover zoom, no blur button floating on it.
- Funding model as a plain text label above the title, not a chartreuse pill.
- Bigger title (17-18px), founder name + place on one line.
- Bottom row like Kickstarter: progress bar, then three numbers: **% funded · raised · days left**.
- Score shown as plain text, no dotted underline tooltip.
- Remove the inner divider and the people icon.

### Step 4. Home page rebuilt as a curated feed
1. **Featured project block** replaces the slogan hero: big photo left, title, founder, progress,
   one button. Above it one short line: "Foizsiz kraudfanding. Oʻzbekiston uchun."
   The ikat pattern stays as the single brand moment (a thin band, not a full background).
2. **Stats strip**: total raised, projects funded, backers, real numbers from the database, plain type.
3. **Curated rows**: "Fundy tanlovi" (featured), "Deyarli yigʻildi" (nearly funded),
   "Yangi loyihalar", "Viloyatlar boʻyicha". Each with "Barchasi →".
4. **How it works** shrinks to one line of text with a link to /learn (no numbered circles).
5. **Musharakah calculator** stays (it is genuinely ours), but restyled flat: no chartreuse boxes.
6. **Founder strip** replaces the dark "Ready to start?" banner: a real founder photo + quote +
   "Loyiha joylash".

### Step 5. Project page (most important page for money)
- Kickstarter layout: media 2/3 left, funding box 1/3 right with a huge raised number, "of goal",
  backers, days to go, one main button "Qoʻllab-quvvatlash".
- Sticky tab bar: Hikoya · Mukofotlar · Pul yoʻli · Yangiliklar · Izohlar.
- Rewards as a simple list in the right column (price big, title, what you get, delivery, stock).
- Founder box: photo, name, place, verified mark, other projects.

### Step 6. Explore page
- Sentence filter (Kickstarter idea, fits Uzbek well): "Koʻrsat **[barcha]** loyihalarni
  **[butun Oʻzbekiston]** boʻyicha, **[eng mashhur]** tartibda".
- Results count, clean grid, no pill-toggle groups.

### Step 7. Copy pass (uz first, then ru, en)
- Remove em-dashes and "lists of three". Shorter sentences, specific facts.
- Replace slogans with plain statements ("Pul faqat bajarilgan bosqich uchun beriladi" is good: keep
  that kind of line).
- Buttons say exactly what happens ("Loyihalarni koʻrish", not "Kashf eting").

### Step 8. Icons and small details
- Keep icons only where they help (search, cart, bell, bookmark, verified). Remove decorative ones
  next to text labels.
- Remove pulsing dot, tilted card, offset shadow, blur effects.

### Step 9. Photos
- One consistent photo style: real people and real places in Uzbekistan, same crop ratio.
- Ask founders for a cover photo of people/product, not logos (add a hint in the wizard).

### Step 10. The rest of the site
- Apply the same rules to: dashboards, cart drawer, contribute window, wizard, content pages,
  login/signup, footer (simpler: fewer columns, smaller), admin last.

## Order and checking
Steps 1 → 3 first (rules + card change the whole site cheaply), then 4 and 5 (the pages people
judge us by), then 6-10. After each step: check light + dark mode, phone width, Uzbek/Russian/English,
then push and check www.fundy.uz.

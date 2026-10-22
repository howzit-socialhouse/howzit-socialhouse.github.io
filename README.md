# Howzit? Co-working space & Social House: website

A single-page, mobile-first static marketing site for **Howzit?**, a coworking house and social house in Sea Point, Cape Town.
Plain HTML, CSS and a little vanilla JavaScript. There's **no build step**, so it can be served as-is by GitHub Pages (or any static host).

> Live site: **https://howzitseapoint.co.za/**. Prices shown are launch prices (ZAR, incl. VAT where applicable) and may change.

> **Privacy:** the site deliberately shows the location only as **Sea Point, Cape Town**. Do not add a street address, house number, postal code, GPS coordinates, map pin, phone number or property-listing links/IDs anywhere. The only public email is the contact address info@howzitseapoint.co.za (in the JSON-LD `email` and a few page texts); add no others (HTML, JSON-LD, meta tags, alt text, file names, README/CREDITS). Exact directions are shared privately when someone books a visit.

## Structure

```
howzit-socialhouse.github.io/
├── index.html              # the whole site (single page, smooth-scroll sections)
├── assets/
│   ├── css/styles.css      # all styles (design tokens at the top in :root)
│   ├── js/main.js          # menu, scroll reveals, nav highlight, sticky mobile bar, form → Formspree
│   └── img/                # optimised JPEGs (<~290 KB each; AI scenes in -800/-1280 sizes, real photos + -600 thumbs), logos, og-image.jpg
├── favicon.svg             # main favicon (SVG)
├── favicon-32.png          # PNG favicon fallback
├── apple-touch-icon.png    # iOS home-screen icon (180×180)
├── CNAME                   # custom domain for GitHub Pages (howzitseapoint.co.za)
├── robots.txt
├── sitemap.xml
├── CREDITS.md              # what each image is (real photo vs AI-styled visualisation)
├── README.md
└── .nojekyll               # tells GitHub Pages to serve files as-is (no Jekyll processing)
```

### Page sections (in order, 2026-10 redesign)
Order follows business priority: Hero → Hot desks (+ price-match offer) → Private offices → Co-living (with a "Check availability" date-range dialog, window 1 Dec 2026 – 1 Jun 2027, sent via Web3Forms) → The House → Find your fit (tabs) → Social House → Extras (tabs: meeting space, nomad storage, luggage drop, dogs) → Location → FAQ → Contact. Fine print sits in `<details class="more">` toggles.

### Previous page sections (before the redesign)
1. **Top bar + sticky header**: logo, nav, "Day pass" and "Book a visit" buttons (hamburger menu on tablet/mobile).
2. **Hero**: "Work from a house, not an office." with the pool scene in an arch, a round inset of the real pool, a handwritten "5 min to the Prom!" note, location pills and two calls to action.
3. **Marquee**: hot desks · private offices · pool · garden · braai · yoga · board games · workshops · nomad storage.
4. **The House** (`#house`): photo bento (lounge, the house, kitchen), the essentials (fibre, coffee, lockers, people, parking, "Co-barking 🐾" pet-friendly) and a **"Take a peek inside the house"** gallery of real photos with a lightbox.
5. **Work** (`#work`): a **Summer (Nov–Apr) / Winter (May–Oct) price toggle**, hot desk (day / weekly / 10-day pack / monthly + summer season pass or winter rate), the 3 private offices (+ day office), and meeting & workshop space hire (hour / half day / full day / evening). Prices are launch prices, incl. VAT where applicable.
6. **Nomad storage** (`#storage`): seasonal luggage and belongings storage for the Cape Town winter, with prices (per bag/box per month, winter season bundle, member discount), 4 "how it works" steps, what's included and what to know.
7. **Social House** (`#social`): bento (braai by the pool, garden yoga, sundowners on the Prom, board games, work by the pool, courses & workshops) and a calendar-style list of **planned** programme ideas, clearly labelled as ideas rather than a fixed schedule.
8. **Location** (`#location`): Sea Point copy, walking times, a neighbourhood-only location card ("Sea Point, Cape Town"; directions shared on booking) and a static OpenStreetMap image of the Sea Point area with **no marker** (`assets/img/sea-point-map-*`).
9. **FAQ** (`#faq`): accessible `<details>` accordion.
10. **Contact / booking** (`#contact`): reply-time note ("We reply within 24 hours"), "Sea Point, Cape Town", a dog-friendly note and a Formspree enquiry form (name, email, optional WhatsApp/phone, interest chips: hot desk / private office / storage / events / other, message).
11. **Footer**: links, contact info and the note "Some lifestyle images are AI-styled visualisations of the house."
12. **Sticky mobile action bar** (≤760px wide): Day pass + Book a visit. It hides when the contact form or footer is on screen.

Every "Book / Enquire" button that has a `data-plan` attribute pre-selects the matching interest chip in the enquiry form (mapping in `PLAN_TO_INTEREST` in `main.js`) and sends the exact plan in a hidden `plan` field.

## Performance notes (Oct 2026)
- **CSS:** edit `assets/css/styles.css`, then regenerate the file the pages load: `npx csso-cli --no-restructure assets/css/styles.css -o assets/css/styles.min.css`.
- **Images:** every JPEG has a WebP twin (`*.webp`, quality 75) served via `<picture>`; the JPEG stays as the fallback. When you swap a photo, regenerate its `.webp` too (e.g. Pillow `Image.save(..., "WEBP", quality=75, method=6)`). `og-image.jpg` stays JPEG for social previews.
- **Fonts (self-hosted since 21 Oct 2026):** DM Sans, Fraunces (variable, incl. the SOFT axis) and a Caveat subset are WOFF2 files in `assets/fonts/`, declared with `@font-face` (`font-display: swap`) at the top of `styles.css`; each page preloads `dm-sans-latin.woff2` and `fraunces-latin.woff2`. No requests go to Google Fonts. The Caveat subset only covers space ! & ' , - . 0-9 ? E L O P S a-z; if a hand-note needs other characters, download a new subset and replace `caveat-600-subset.woff2`.
- **Analytics:** Google Analytics 4 (gtag.js, ID `G-4FQ6NP60Y5`) sits right after `<meta charset>` in every page's `<head>`, including `404.html` and the redirect stubs. Add it to any new page.
- **IndexNow:** the key file is `/0bf6087b5eee82a9052f1d63cad50300.txt` at the site root. Keep it; after publishing changes, POST the changed URLs to https://api.indexnow.org/indexnow.
- **Open Graph images:** each main page has its own 1200×630 `assets/img/og-*.jpg`; the home page keeps `og-image.jpg`.
- **Pages:** `/private-offices-sea-point/` (new, Oct 2026), `/hot-desk-day-pass-sea-point/` and `/dog-friendly-coworking-cape-town/` (real landing pages again since 21 Oct 2026) and a branded `404.html`. Redirect stubs (noindex): `/private-office-sea-point/`, `/nomad-storage-cape-town/`, `/therapy-room-sea-point/` (→ offices, since 21 Oct 2026; no separate therapy page). Keep `sitemap.xml` in sync when adding pages.

## Editing the site

| What | Where | Notes |
|---|---|---|
| **Site base URL** | `CNAME`, every page's `index.html` (canonical, `og:url`, `og:image`, `twitter:image`, JSON-LD `@id`/`url`/`image`/`logo`), `robots.txt`, `sitemap.xml` | `https://howzitseapoint.co.za/` (served from the repo root; all asset paths are relative) |
| Launch prices | `#work`, `#storage`, FAQ, `#social` note, JSON-LD `priceRange` | Day pass R395 summer / R325 winter · weekly R1,650 / R1,350 · 10-day pack R2,950 · monthly R3,650 / R2,850 · summer season pass R9,950 · Office 1 & 2 R18,000 (12-month lease) / R20,000 month to month · Office 3 (en-suite) R22,000 / R24,000 · day office R950 · space hire R450/h, R1,450 half day, R2,650 full day, R1,650 evening · storage R295 per item/month, winter bundle R2,450 (+R895 per extra item) · members 20% off hire and storage |
| Season dates | `#work` toggle + fine print; `main.js` picks the current season by month | Summer = 1 Nov–30 Apr, Winter = 1 May–31 Oct. To change, edit the `m >= 4 && m <= 9` test in `main.js` and the labels. |
| Changing a seasonal price | `index.html` | Each seasonal price is `<span class="s-sum">…</span><span class="s-win">…</span>`; edit both. Without JS both prices are shown. |
| Office sizes | `#work` | Office 1 & 2 "for teams of up to 6" / Office 3 "up to 8" (smaller teams of 2–4 welcome) |
| Social House programme | `#social` calendar | Planned ideas, labelled "not a fixed schedule". Replace with real dates once events are running. |
| Location | `#location`, contact list, footer, JSON-LD `address` | **Sea Point, Cape Town only** (by design, for privacy). Map = static OpenStreetMap image of the whole Sea Point area, no marker. |
| **Formspree endpoint** | `index.html`, `action` of `#booking-form` | `FORMSPREE_ENDPOINT_PLACEHOLDER` → replace with `https://formspree.io/f/<form-id>` |
| Photos | `assets/img/*.jpg` | Real photos of the house (`real-*.jpg`) plus AI-styled visualisations (`*-800.jpg` / `*-1280.jpg`). Update the `alt` text and `CREDITS.md` when you swap them. |
| Sitemap date | `sitemap.xml` `<lastmod>` | `2026-10-21` (12 URLs) |

### Map (privacy)
The `#location` map is a self-hosted static image of OpenStreetMap tiles of the Sea Point area (no marker; the OSM iframe embed was dropped because it now needs WebGL and rendered as an empty box in some browsers) and the "Open larger map" link is a search for "Sea Point, Cape Town". Please keep it that way: don't swap in a pinned embed of the house.

### Enquiry form (Formspree)
The form posts to the Formspree endpoint in its `action` attribute (`FORMSPREE_ENDPOINT_PLACEHOLDER` until it is set). Fields: `name`, `email`, `phone` (optional), `interest`, `message`, plus hidden `plan`, `prices_viewed` (the season whose prices were on screen) and `_subject` = "New Howzit? website enquiry". `_gotcha` is Formspree's honeypot spam trap (hidden; bots fill it in). `assets/js/main.js` validates name/email/message, submits with `fetch()` (POST, `Accept: application/json`) and shows an inline success or error message, so there's no redirect. Without JavaScript the browser posts the form normally.
1. Create a form at formspree.io (choose the inbox that should receive enquiries; that address is never shown on the site).
2. Replace `FORMSPREE_ENDPOINT_PLACEHOLDER` in `index.html` with the endpoint, e.g. `https://formspree.io/f/abcdwxyz`.
3. Send a test enquiry from the live site and confirm the first submission in Formspree.

## Publishing on GitHub Pages
1. The repository is published from `main` / `(root)` (Settings → Pages → "Deploy from a branch"). `index.html` sits at the repo root and `.nojekyll` makes Pages serve files as-is.
2. The site lives at the custom domain `https://howzitseapoint.co.za/` (set via the `CNAME` file and Settings → Pages → Custom domain; DNS: apex A records to GitHub Pages 185.199.108–111.153, `www` CNAME to `howzit-socialhouse.github.io`). `https://howzit-socialhouse.github.io/` redirects to it. If the domain ever changes, update the `CNAME` file and the absolute URLs in every page's `<head>`/JSON-LD, `robots.txt` and `sitemap.xml`.
3. Submit `sitemap.xml` in Google Search Console and create a Google Business Profile for local search ("coworking space Sea Point"), keeping the address hidden (service-area business).

## Preview locally
```
python3 -m http.server 8000
# open http://localhost:8000
```

## SEO checklist (included)
- Descriptive `<title>` and meta description with "coworking space Sea Point" / "Cape Town coworking"
- Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`), one `<h1>`, keyword-relevant `<h2>`s
- Open Graph and Twitter card tags with a 1200×630 `og-image.jpg`
- schema.org `LocalBusiness` JSON-LD (`additionalType` Coworking; locality only, no street address, coordinates, phone or email)
- `robots.txt`, `sitemap.xml`, canonical URL, `lang="en-ZA"`
- Alt text on every image, lazy-loading below the fold, preloaded hero image, compressed progressive JPEGs with `srcset`

## Design notes
- Fonts: **Fraunces** (soft, characterful serif for headings), **DM Sans** (body), **Caveat** (handwritten notes), all from Google Fonts.
- Colours (`:root` in `styles.css`): cream `#FBF6EE`, sand `#F3E8D6`, terracotta `#C4613A`, sage `#E4E8D5`/`#8FA07B`, ocean `#1F5A6B`, sun `#F2B84B`, ink `#2B211C`.
- Animations respect `prefers-reduced-motion`.

## Pricing logic (updated 2026-10-16)
All prices ZAR incl. VAT where applicable, launch prices. Existing rates are unchanged; the marketing plan's figures (R9,950 summer pass, R2,450 winter bundle, R65/4 h luggage drop, R950 day office) all match the site.
- Bundles = sum of standard rates minus a discount for committing up front: 10-day pack R2,950 = 10 x R395 summer day pass less 25%; summer season pass R9,950 = 3 x R3,650 summer monthly less R1,000 (~9%); winter storage bundle R2,450 = 2 items x R295 x 6 months (R3,540) less ~31%.
- Pet fee (bringing your own dog, you supervise) = 25% of the matching pet-sitting rate: R95/day (25% of R380 full day), R950/month (25% of R3,800 monthly weekdays). Second dog +50%, same as pet sitting. Free only on annual (yearly) hot desk or private office memberships.
- Day pass + dog = day pass + daily pet fee, no extra discount: R490 summer (R395 + R95), R420 winter (R325 + R95).

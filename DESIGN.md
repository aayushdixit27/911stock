# Design System — 911Stock

## Product Context
- **What this is:** Insider trading alert service. SEC Form 4 filings delivered to your phone with plain-English context.
- **Who it's for:** Retail investors with individual stock positions, sub-$100K portfolios.
- **Space/industry:** Fintech, investment alerts, SEC monitoring.
- **Project type:** Landing page (subscribe) + RCS/SMS message product.

## Aesthetic Direction
- **Direction:** Editorial/Magazine
- **Decoration level:** Intentional. Orange accent is the only hot element. Everything else is ink on paper.
- **Mood:** Serious about money. Trustworthy, not flashy. Like reading the FT, not using a crypto app.
- **System name:** MARK

## Typography
- **Display/Hero:** Crimson Pro (italic, 500) — editorial authority, financial gravitas without stuffiness
- **Body:** Inter (400-600) — clean, readable, disappears into the content
- **UI/Labels:** IBM Plex Mono (500-600, uppercase, tracked) — eyebrow labels, section headers, badges
- **Data/Tables:** IBM Plex Mono (400, tabular-nums) — tickers, prices, timestamps, scores
- **Code:** IBM Plex Mono (400)
- **Loading:** Google Fonts CDN `https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;450;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap`
- **Scale:**
  - xs: 0.75rem (12px)
  - sm: 0.8125rem (13px)
  - base: 0.9375rem (15px)
  - lg: 1.0625rem (17px)
  - xl: 1.25rem (20px)
  - 2xl: 1.5rem (24px)
  - 3xl: 2rem (32px)

## Color
- **Approach:** Restrained. One accent color does all the work.
- **Primary (accent):** #ea4c00 (orange) — CTA buttons, urgency signals, active states only
- **Secondary:** #c45c2e (terra) — secondary actions, hover states, warm accent
- **Danger:** #dc2626 (ember) — alert dots, destructive actions, sell signals
- **Neutrals (warm):**
  - White: #ffffff
  - Paper: #fafaf9 (page background)
  - Off: #f5f5f3 (card backgrounds, subtle fills)
  - Ink: #1a1a18 (primary text, buttons)
  - Ink 70: rgba(26,26,24,0.70) (body text)
  - Ink 50: rgba(26,26,24,0.50) (secondary text)
  - Ink 30: rgba(26,26,24,0.30) (muted text, placeholders)
  - Ink 15: rgba(26,26,24,0.15) (borders, input strokes)
  - Ink 08: rgba(26,26,24,0.08) (dividers, card borders)
- **Semantic:** success #22c55e, warning #d97706, error #dc2626, info #3b82f6
- **Dark mode:** Not planned for MVP. When added: swap paper/ink, reduce orange saturation 15%.

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable (landing page needs to breathe)
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px)

## Layout
- **Approach:** Single-column centered for landing/subscribe. Grid-disciplined for dashboard.
- **Grid:** Landing: single column, 540px max. Dashboard: 2-column, 1200px max.
- **Max content width:** 540px (subscribe), 860px (internal pages), 1200px (dashboard)
- **Border radius:** sm: 4px (chips, badges), md: 6px (inputs, buttons), lg: 8px (cards), xl: 12px (alert cards)

## Motion
- **Approach:** Minimal-functional
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50ms) short(150ms) medium(250ms)
- **Rules:** No scroll animations. No parallax. CTA hover: translateY(-1px) + shadow increase. Chip selection: border-color + background transition 150ms.

## Component Patterns
- **Alert card:** White background, orange top bar (3px), red dot for severity, Crimson Pro italic title, Inter context body, Plex Mono action buttons
- **Ticker chips:** Plex Mono, 12px, ink-08 border, ink on hover, ink background when selected (white text)
- **CTA button:** Orange background, white text, Inter 600, 6px radius, box-shadow with orange glow
- **Form inputs:** White background, ink-15 border, orange focus ring (3px, 8% opacity), 6px radius
- **Eyebrow labels:** Plex Mono, 10-11px, 600 weight, 0.1em tracking, uppercase, ink-30 color

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-02 | Initial MARK design system formalized | Created by /design-consultation. Editorial/magazine aesthetic with Crimson Pro + Inter + IBM Plex Mono. Restrained color (one orange accent). Aggressive simplicity for /subscribe. |
| 2026-04-02 | No feature grid on landing page | Creative risk: the example alert card IS the feature demo. No 3-column layout needed. |
| 2026-04-02 | $99/year pricing shown below CTA | "Free for 2 weeks. Then $99/year." Transparent, not hidden. |

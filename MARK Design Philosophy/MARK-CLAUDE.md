# MARK — Design Philosophy
### *One Gesture. Total Conviction.*

> "Design is not the accumulation of many gestures. It is the selection of one gesture placed with total commitment on a field that has no other purpose than to make that gesture legible."

---

## The One-Sentence Rule

> "One mark. One field that exists for it. Total conviction."

---

## The Three Origins

**1. The Orange Loop** — A pure saturated orange-to-ember gradient field. Dead center: a white interlocking hexagonal mark — two concentric angular rings creating an impossible Escher-like loop, glowing at its hollow core. Nothing else exists. The mark IS the message; the gradient field has no purpose except to amplify it.

**2. The Black Panther** — Pure white ground. One black panther mid-leap — zero interior detail, pure silhouette. Heraldic, decisive, ancient. Every part of the white field exists only to make the black form more absolute. The beast needs no color, no texture, no supporting elements.

**3. The Accent Line** — Off-white ground, two figures in flat black and white, and one terracotta-salmon color used only at joints, shadows, and the ground contact point. The entire illustration lives in black and white — the single accent hue is placed exactly where the body bends. The accent is the gesture, not the decoration.

---

## Color System

| Name | Hex | Role |
|---|---|---|
| White | `#ffffff` | Ground — pure field |
| Paper | `#fafaf8` | Illustration ground — chosen, not default |
| Off-White | `#f2f0ec` | Section background |
| Ink | `#0d0d0b` | Panther black — slightly warm, never pure black |
| Orange | `#ff4500` | Fire — primary mark color |
| Ember | `#ff2000` | Fire gradient anchor |
| Orange Light | `#ff6a2f` | Hover / lighter fire moment |
| Ember Dark | `#cc2200` | Deep fire / shadow |
| Terracotta | `#d4613a` | THE single accent — used only at inflection points |
| Terracotta Light | `#e8856a` | Accent hover state |

### Color Laws

- **Fire gradient** `linear-gradient(145deg, #ff4500, #ff2000)` is used ONLY when the entire surface becomes the mark. Never as a card background, never as a subtle tint. Total commitment or not at all.
- **Ink `#0d0d0b`** and **Fire** never appear on the same surface. They occupy separate fields. When black appears, orange disappears.
- **Terracotta `#d4613a`** is used ONLY at: joint/inflection points in illustration, active/hover state borders, the transition moment between two states, and ground shadows. Never decorative.
- **Ground is `#fafaf8`**, never pure white in illustration contexts. Pure white reads digital. Off-white reads chosen.
- **No gradients softening marks.** No opacity reduction on primary forms. Full color, full opacity, or not at all.

---

## Typography

- **Display / Hero:** DM Serif Display 400 Italic, `−0.04em` tracking, `0.82–0.9` leading
- **Heavy / Weight:** Unbounded 900, `−0.025em` tracking, `0.88` leading, uppercase
- **Light / Body:** Unbounded 300, `0.02em` tracking, `1.9` leading
- **Labels / Mono:** DM Mono 400, `lowercase always`, `0.35–0.5em` letter-spacing, terracotta tint
- **NEVER:** Inter, Roboto, Space Grotesk, system-ui, Arial

### Typographic Scale
```
Display:  DM Serif Display 400i / −0.04em / 0.82 / clamp(60px, 10vw, 160px)
Heading:  DM Serif Display 400i / −0.03em / 0.92 / clamp(36px, 5vw, 72px)
Heavy:    Unbounded 900 / −0.025em / 0.88 / uppercase
Body:     Unbounded 300 / 0.02em / 1.9
Label:    DM Mono 400 / lowercase / 0.35–0.5em / terracotta
```

---

## Component Rules

### Primary Mark Container (the fire field)
```css
background: linear-gradient(145deg, #ff4500, #ff2000);
/* Optional inner glow */
::before { background: radial-gradient(ellipse at 40% 40%, rgba(255,255,255,0.15) 0%, transparent 60%); }
```
- The mark inside must be white, flat, no gradient
- Nothing else exists in this container — no text, no supporting elements
- Min size: fills its entire parent

### Silhouette Marks
```css
fill: #0d0d0b;  /* always flat ink, no gradient */
/* No interior detail, no texture, no stroke */
/* White 1px separation line where two black forms overlap */
```
- Always on white or `#fafaf8` ground
- Hover: `translateY(-4px)` + shadow compress (see motion)
- Never apply opacity reduction

### Terracotta Accent Points
```css
/* Joint dots in illustration */
width: 4–6px; height: 4–6px; border-radius: 50%;
background: #d4613a;
/* Ground shadow */
background: rgba(212,97,58,0.20–0.30); border-radius: 50%; /* ellipse */
```
- Used ONLY at joints, ground shadows, section transitions, active states
- Animation: `opacity 0.6 → 1 → 0.6`, `2–3s ease-in-out`, stagger `200ms` per joint

### Cards / Sections
```css
background: var(--white) or var(--paper);
border: 1px solid rgba(13,13,11,0.10);
/* No rounded corners over 4px */
/* No box shadows — marks don't need depth cues */
```
- Top accent stripe: `height: 2–3px`, gradient matching world color
- Hover: `background` shifts from `#fff` to `#fafaf8`
- Never glassmorphism — MARK lives in flat, committed surfaces

### Section Eyebrow Labels
```css
font-family: 'DM Mono', monospace;
font-size: 9px; letter-spacing: 0.5em; text-transform: lowercase;
color: #d4613a; /* always terracotta */
display: flex; align-items: center; gap: 14px;
::before { width: 24px; height: 1.5px; background: #d4613a; }
```

---

## Illustration Language

Five rules — all mandatory:

1. **Black fill, no interior detail.** Forms are flat silhouettes. No shading, no hatching, no texture. If the shape isn't legible as a silhouette, redraw it.

2. **Terracotta only at joints and ground shadows.** `#d4613a` appears at elbows, knees, ankles, and the shadow where a figure contacts the ground. Never on garments, fills, or highlights.

3. **Ground shadow is always terracotta, never black.** `rgba(212,97,58,0.20–0.30)` ellipse beneath figures. This is the only place terracotta is used as a fill area rather than a point.

4. **White `1px` lines for overlap separation only.** When two black forms overlap, a white line separates them. This is the only permitted depth technique — no gradients, no drop shadows.

5. **Ground is `#fafaf8`.** Never pure white in illustration contexts.

---

## Motion Language

**Global easing:** `cubic-bezier(0.16, 1, 0.3, 1)` for arrivals. `ease-in-out` for cycles. Never `linear` on anything character-driven.

### 1. Loop Rotation (hex mark)
Three concentric hex rings at different speeds, different directions.
```css
/* outer */  animation: hex-spin 12s linear infinite;
/* inner */  animation: hex-spin 8s linear infinite reverse;
/* core  */  animation: hex-spin 5s linear infinite;
@keyframes hex-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
```
Never ease. Never stops. Eternal, not frantic.

### 2. Heraldic Hover (silhouette marks)
```css
/* mark */   transform: translateY(-4px); transition: transform 0.4s ease-in-out;
/* shadow */ transform: scaleX(0.7); opacity: 0.25; /* sync with mark */
```
Single composed lift — not a bounce, not a spring. The beast deciding whether to leap.

### 3. Joint Accent Pulse (illustration)
```css
animation: joint-pulse 2.5s ease-in-out infinite;
@keyframes joint-pulse { 0%,100%{opacity:0.6;} 50%{opacity:1;} }
/* Each joint: animation-delay: 0ms, 200ms, 400ms, 600ms */
```
Only the inflection points are alive. The rest of the figure is still.

### 4. Single Mark Arrival (page load)
```css
animation: mark-arrive 0.9s cubic-bezier(0.16,1,0.3,1) forwards;
@keyframes mark-arrive { from{opacity:0;transform:scale(0.85);} to{opacity:1;transform:scale(1);} }
/* Attention ring: scale 1→1.4, opacity 1→0, 600ms, starts 200ms after mark */
```
Arrives once. Then it is still. The ring confirms arrival, then disappears.

### Scroll Reveals
All cards and blocks: `opacity: 0 → 1`, `translateY(18px → 0)`, `0.65s ease`, staggered `0–320ms` via IntersectionObserver.

---

## Spatial Rules

- **White/paper ground always.** This is a light-background system. No dark mode version.
- **Sections alternate:** `#ffffff` → `#fafaf8` → `#ffffff` — never the same twice in a row
- **The ink statement band:** `background: #0d0d0b`, used once per page for maximum contrast. Fire glow radial inside it.
- **Padding:** `120px` top/bottom, `7vw` left/right
- **Nav:** white bg `rgba(255,255,255,0.92)` + `backdrop-filter: blur(16px)` + `border-bottom: 1px solid rgba(13,13,11,0.10)`
- **No box-shadows on marks.** Marks need no depth cue. The field amplifies them.
- **Border-radius:** `2–4px` max. This is not a rounded system.
- **Grid gaps:** `1px`, filled with `rgba(13,13,11,0.10)` background — creates hairline dividers without explicit borders

---

## The Five Laws (reference by number in prompts)

| # | Law | Source |
|---|---|---|
| 1 | The field has one purpose — amplify the mark. If it has nothing to amplify, it should not exist | Orange logo |
| 2 | Commitment is the only style — full opacity, full color, full scale, or not at all | All three |
| 3 | The accent marks where the body bends — terracotta at joints and transitions only | Dance illustration |
| 4 | Recursion is the highest form — the mark that contains its own logic as visible structure | Hex loop |
| 5 | Heraldic means built to last centuries — if it doesn't work as flat black on white, it isn't a mark yet | Panther |

---

## Prompting Claude Code

**Always lead with the constraint:**
> "Following MARK, build a [component] — Law 2 applies, full fire gradient, no supporting decoration."

**Reference laws by number:**
> "Law 3 — the terracotta goes only on the active state border, not on the card background."

**Combine MARK-CLAUDE.md with mark-philosophy.html** for full visual reference.

**Common mistakes to correct:**
- If Claude uses purple/blue gradients → reject, fire gradient only (`#ff4500 → #ff2000`) or flat ink
- If Claude uses pure `#000000` → correct to `#0d0d0b` (warm ink)
- If Claude places terracotta decoratively → flag as Law 3 violation, accent at inflection only
- If Claude rounds corners heavily → `border-radius: 3px max`
- If Claude adds box-shadows to marks → remove, marks need no depth cues
- If Claude uses pure white as illustration ground → correct to `#fafaf8`
- If Claude puts multiple colored elements on the fire field → reject, only the white mark lives there

---

*MARK Design Philosophy — 2026*
*Reference: `mark-philosophy.html` for full visual system*

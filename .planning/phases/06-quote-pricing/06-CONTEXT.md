# Phase 6: Quote & Pricing - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign Step 3 of the quote wizard with a bold, poster-style flat layout. This phase covers: featured tier card as solid navy block, flat color-block pricing cards for all tiers, large price display (text-5xl), solid gray-900 CTA section, geometric circle background decoration, and tier badge redesign. No changes to pricing logic, discount calculations, or campaign data flow.

</domain>

<decisions>
## Implementation Decisions

### Tier card colors
- **Starter**: white background, gray-200 border (`#e5e7eb`)
- **Optimal**: very faint navy tint background (`#f8faff`), solid navy border (1px, `#0d47a1`)
- **Featured (Most Popular)**: solid navy background (`#0d47a1`), all text white — poster-style inversion
- **Premium**: slightly stronger navy tint background (`#eef2ff`), navy border (2px, `#0d47a1`)
- On featured card: all elements (name, description, price, currency, features, icons) are white throughout — no separate shade for the amount

### Tier badges
- **Most Popular** badge (on featured/navy card): white block, navy text, border-radius: 0 — inverted from card background
- **Best Value** badge (on premium card): solid navy block, white text, border-radius: 0 — consistent with flat design
- Both badges: flat solid blocks, no gradient, no border-radius — removes existing gradient pill

### Pricing price display
- Amount: text-5xl, font-bold, tight leading (line-height: 1) — up from current 2.25rem
- Remove `.pricing-price-container` sub-box (the nested background container) — let the price breathe with padding inside the card directly
- Currency symbol (`£`) stays smaller, aligned to baseline
- "per month + VAT" label below price in small gray text (white on featured card)

### Hover behavior
- **Starter, Optimal, Premium**: `scale-[1.02]` on hover — matches discount card pattern from Phase 5
- **Featured**: no hover effect — it's statically prominent, not interactive-feeling
- No `translateY` on any card — removed per flat design system rule
- No `box-shadow` on hover — zero shadows rule

### Tier CTA buttons ("Get Started")
- All non-featured cards: solid navy button (`#0d47a1`, white text)
- Featured (navy bg) card: inverted — white background, navy text button
- border-radius: 0 on all buttons — consistent with flat design

### Step header
- "Your Custom Quote" heading: keep text size (text-2xl/3xl), font-bold
- Add a 4px tall solid navy left-border accent (`border-left: 4px solid #0d47a1`) as decorative element
- Subtext "Choose the plan that works best for your business" in gray-500
- "All prices shown are per month + VAT" subtext stays in small gray

### CTA section
- Solid `gray-900` (`#111827`) background block — full-width
- "Ready to Get Started?" heading: white, font-bold
- Description text: white/gray-300
- Email button: outlined (white border + white text) — primary action
- Phone button: solid white background, gray-900 text — secondary, clearly distinguished
- border-radius: 0 on both buttons

### Geometric circles decoration
- **Placement**: Inside the step container, spanning full width behind the whole pricing layout
- **Count**: 2 circles — one large (top-right), one medium (bottom-left)
- **Size**: Large ~450px diameter, medium ~280px diameter — bleed off edges for poster feel
- **Color**: `rgba(13, 71, 161, 0.05)` — very faint navy tint
- **Fill**: Solid filled circles (not stroke/outline)
- **Z-index**: Behind all card content, `pointer-events: none`

### Removals from existing code
- Remove `linear-gradient` from `.pricing-card.featured` and `.pricing-card.premium` backgrounds
- Remove `linear-gradient` from `.tier-badge-2` and `.tier-badge-3`
- Remove `linear-gradient` text clip technique from `.pricing-card.featured .pricing-name` and `.pricing-card.premium .pricing-name`
- Remove `linear-gradient` from `.pricing-card.featured .pricing-price-container` and `.pricing-card.premium .pricing-price-container`
- Remove `.pricing-price-container` box styling (flatten into card padding)
- Remove `transform: scale(1.03)` / `scale(1.04)` initial-state transforms on featured/premium (these scaled cards up by default — not needed in flat design)
- Remove `translateY(-Xpx)` from all hover states
- Remove all dark mode pricing card entries (light-mode only per Phase 4 decision)
- Remove `border-radius: 12px` from `.pricing-card` — replace with `border-radius: 0`
- Remove `border-radius: 20px` from `.tier-badge` — replace with `border-radius: 0`
- Remove `premium-cta` gradient button style

### Claude's Discretion
- Exact padding values inside cards at each breakpoint
- Whether `.pricing-grid` gap needs adjustment for the flat card style
- Position of the step header navy accent (left-border or bottom-underline — whichever renders more cleanly with the existing flex/center layout)
- How to handle the `overflow: hidden` needed for circles bleeding off edges without clipping card content

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `getTierClass(index)` helper (line 353): returns `['starter', 'optimal', 'featured', 'premium']` — drives CSS class binding, no changes needed to the JS
- `getTierBadge(index)` helper (line 358): returns `[null, null, 'Most Popular', 'Best Value']` — badge text on indices 2 and 3 (featured and premium)
- `getTierCTAClass(index)` helper (line 363): returns `['', '', 'featured-cta', 'premium-cta']` — will need updating to reflect new button styles
- `scrollToCTA()` (line 345): scrolls to `.cta-section` — no changes needed
- Phase 5 `scale-[1.02]` hover pattern (discount cards) — same CSS approach applies to non-featured pricing cards

### Established Patterns
- Zero shadows rule: `box-shadow: none` on all wizard elements (Phases 3+4)
- Border-radius: 0 throughout all wizard components (Phase 4)
- Navy `#0d47a1` as primary brand color
- No dark mode styles on wizard (Phase 4 decision — light-mode only)
- `::v-deep()` for PrimeVue overrides inside `<style scoped>`
- Selected-state inversion pattern: navy bg + white text established in Phase 4 venue cards (same concept applied to featured tier card)

### Integration Points
- **CSS target**: `.pricing-card.featured` (line 1271): replace gradient + border with solid navy background
- **CSS target**: `.pricing-card.premium` (line 1284): replace gradient with `#eef2ff` tint
- **CSS target**: `.tier-badge-2` and `.tier-badge-3` (lines 1311-1319): remove gradient, set solid fills
- **CSS target**: `.pricing-card.featured .pricing-name` / `.pricing-card.premium .pricing-name` (lines 1338-1352): remove gradient text clip, set white/dark color respectively
- **CSS target**: `.pricing-price-container` (line 1362): remove sub-box styling, fold into card padding
- **CSS target**: `.amount` (line 1393): increase from `2.25rem` to `3rem` (text-5xl = 3rem in Tailwind)
- **CSS target**: `.cta-section` (line 1541): set `background: #111827`, update text colors
- **CSS target**: `.cta-button-primary` / `.cta-button-secondary` (lines 1589-1609): redesign for dark bg context
- **New element**: geometric circle decorators — add as absolute-positioned `<div>` elements inside the step container (`.step-container` or a new `.pricing-decoration` wrapper)
- **Dark mode block** (line ~1686): remove all pricing card, tier badge, CTA section dark mode entries

</code_context>

<specifics>
## Specific Ideas

- Tier hierarchy preview confirmed by user: `Starter (white) → Optimal (faint blue tint) → Featured (SOLID NAVY) → Premium (mid blue tint)` with matching border progression
- Step header: vertical navy left-border accent (4px) — like a magazine/editorial pull-quote style
- Geometric circles bleed off edges of the step container for a poster/billboard feel — the step container may need `overflow: hidden` to clip them cleanly
- Featured card CTA button: white bg + navy text — inverted from the card background, same inversion logic as venue card selected state

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-quote-pricing*
*Context gathered: 2026-03-05*

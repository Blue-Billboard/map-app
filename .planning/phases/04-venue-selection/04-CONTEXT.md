# Phase 4: Venue Selection - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign Step 1 of the quote wizard with full-bleed hero venue cards, a clear selected state, a flat filter bar, and a bold count chip. This phase does not touch Step 2, Step 3, mobile full-screen layout, or any pricing/campaign logic.

</domain>

<decisions>
## Implementation Decisions

### Full-bleed image treatment
- `object-fit: cover` — image crops to fill card fully (no letterboxing)
- Aspect ratio: 16:9 landscape — matches physical billboard screen format, more dramatic
- Image load failure fallback: solid navy (#0d47a1) background — the card shows only the navy band with name/city, no broken image indicator. Keeps poster feel even without a photo.

### Overlay band
- Flat navy (#0d47a1) color block at the bottom of the card — no gradient, strictly flat per design system
- Shows: venue name (bold, white) + city (smaller, white/opacity)
- Generous padding (~1.25rem top/bottom) — text breathes, band has presence without dominating the image
- Hard edge between image and band (no gradient fade above)

### Selection indicator
- Selected state: solid navy border on card + small square (sharp-cornered) navy badge with white checkmark in top-right corner, overlaying the image
- Badge is a square to match the flat design system (consistent with step indicator blocks)
- Hover state (unselected): navy-bordered empty square badge appears in top-right — signals selectability before click
- On selection: badge fills navy with white checkmark
- No translateY lift on selected cards — border alone communicates selection, no shadow

### Card grid & layout
- Grid column minimum: `minmax(320px, 1fr)` — wider than current 280px, suits 16:9 cards
- Cards: `border-radius: 0` — sharp corners throughout, consistent with flat design system
- Hover: navy border highlight only (no translateY lift, no shadow) — true flat hover behavior
- Selected card: solid navy border + `bg-blue-50` tint on card background (behind image/band — visible only if fallback state)

### Filter bar & count chip
- Filter bar: `background: #f3f4f6` (gray-100), no border, no shadow — flat container
- Count chip: solid navy background, white text, bold — sharp corners, not a soft pill. Hidden when 0 venues selected (existing behavior retained).

### Claude's Discretion
- Exact padding/font-size for name vs city text in the overlay band
- How to handle very long venue names in the band (truncation approach)
- Whether to show venue type anywhere (omitted from band per decision above)
- Exact badge size (width/height of the square checkmark indicator)
- CSS specifics for the hover badge fade-in transition

</decisions>

<specifics>
## Specific Ideas

No specific references beyond the requirements — full-bleed poster style is clearly defined by the requirement spec and decisions above.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `venue-card-image` div: already exists with `aspect-ratio: 4/3` — change to 16:9 and switch `object-fit` from `contain` to `cover`
- `venue-card-content` div: currently below the image as a separate block — restructure to be an absolutely-positioned overlay band at the bottom of the card
- `venue-card-checkbox` div: currently a circle badge top-right — convert to square (border-radius: 0), show on hover (opacity transition), fill on selected
- `handleGridClick` event delegation: already set up for card clicks — no changes needed
- `isVenueInSelected(venue.id)`: computed for selected state — already works correctly
- `@error` handler on `<img>`: currently hides the img — with full-bleed, hide img but keep navy background on the `.venue-card-image` container

### Established Patterns
- PrimeVue deep overrides with `::v-deep()` in `<style scoped>` — same approach for filter inputs
- `transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)` — existing transition timing used on cards, retain for hover border/badge transitions
- Zero shadows rule established in Phase 3 — carry forward, no `box-shadow` on any element in this step

### Integration Points
- `.venue-card` CSS block (line 917): primary target — change border-radius, remove hover lift
- `.venue-card.selected` CSS block (line 934): change border style, remove transform
- `.venue-card-image` CSS block (line 973): change aspect-ratio, object-fit, add fallback background
- `.venue-card-content` CSS block (line 989): restructure from below-image to absolute overlay at bottom
- `.venue-card-checkbox` CSS block (line 940): convert from circle to flat square, add hover opacity behavior
- `.venue-grid` CSS block (line 909): change minmax from 280px to 320px
- Count chip: `div.bg-blue-100` at line 412 — convert to navy solid chip (inline Tailwind class changes)
- Filter bar: `div.bg-gray-50` at line 429 — convert to gray-100, remove rounded-lg

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-venue-selection*
*Context gathered: 2026-03-03*

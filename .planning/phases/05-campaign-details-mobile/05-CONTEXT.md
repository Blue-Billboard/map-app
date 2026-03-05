# Phase 5: Campaign Details + Mobile - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign Step 2 of the quote wizard with flat component styling (discount cards, duration selector, venue chips) and implement mobile full-screen takeover for the wizard dialog. This phase does not touch Step 1 (venue selection), Step 3 (quote/pricing), or any pricing/campaign logic.

</domain>

<decisions>
## Implementation Decisions

### Discount cards
- Selected state (toggled on): solid navy border (#0d47a1) + blue-50 background (#eff6ff) — same pattern as venue card selected state from Phase 4
- Hover state (unselected): intensify background to gray-100 (#f3f4f6) + scale-[1.02] — no border change on hover
- Remove `translateY(-2px)` lift from hover — scale-[1.02] is the only lift, no shadow
- Remove `::before` pseudo-element with linear gradient — entirely flat, no pseudo overlay
- Border-radius: 0 — sharp corners throughout, consistent with flat design system
- Disabled state: opacity 0.4 (reduced from current 0.6), cursor: not-allowed, no hover effects

### "25% off" value badge
- Flat solid green (#059669) — remove the gradient (`linear-gradient(135deg, #10b981 → #059669)`)
- White text, font-weight: 700 retained
- Border-radius: 0 — sharp corners, consistent with count chip

### Duration selector
- PrimeVue `<Select>` override: gray-100 (#f3f4f6) background, no visible border, no shadow
- Same pattern as Phase 4's `::v-deep(.p-select)` override inside `.venue-filter-bar` — scope to the duration section
- No floating label border (the "floating border" = PrimeVue's default focused border outline, suppress it)

### Venue chips (selected venues in Step 2)
- Gray-100 (#f3f4f6) background, no border, border-radius: 0
- Venue name text unchanged; × remove button stays rounded (small interactive icon control)
- No shadow (already had none)

### Mobile full-screen
- Breakpoint: ≤768px — wizard switches to full-screen takeover
- Full-screen: 100vw × 100dvh, no dialog border-radius, no dialog margin, no padding around the dialog
- Header (title "Create Your Quote" + step indicator) stays visible at top — content area scrolls
- Backdrop/overlay mask removed on mobile via CSS (dialog IS the full screen, mask is pointless)
- Implementation: CSS `@media (max-width: 768px)` targeting PrimeVue Dialog deep selectors + the `.wizard-dialog` class

### Claude's Discretion
- Exact CSS transition for scale-[1.02] on discount card hover (transform-origin)
- Whether to scope duration selector PrimeVue overrides to a wrapper class or use a broader selector
- How to handle the PrimeVue Dialog `max-height: 90vh` inline style override on mobile (may need !important or JS)
- Exact padding adjustments inside the dialog on mobile for smaller screen comfort

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Phase 4 `::v-deep(.p-select)` and `::v-deep(.p-inputtext)` patterns inside `.venue-filter-bar`: same approach for duration selector override — scope to an info-section wrapper
- `isVenueInSelected()` and card selected-state pattern: discount cards need an analogous toggled CSS class (already have `isCharity`, `isPartner`, `isChamber` booleans — add `.selected` class binding)
- `#0d47a1` + `#eff6ff` selected-state pair: already established in Phase 4 venue cards

### Established Patterns
- Zero shadows rule: no `box-shadow` on any element (Phases 3 + 4)
- Border-radius: 0 throughout all wizard components (Phase 4)
- No dark mode styles on wizard (Phase 4 decision — light-mode only flat design)
- PrimeVue deep overrides via `::v-deep()` in `<style scoped>` — established pattern for suppressing component defaults

### Integration Points
- `.discount-card` CSS (line ~1110): remove border-radius, remove ::before pseudo-element, update hover/selected states
- `.discount-value` CSS (line ~1167): remove gradient, set solid #059669, border-radius: 0
- `.selected-venue-chip` CSS (line ~1183): gray-100 bg, no border, border-radius: 0
- PrimeVue Dialog on line 370: mobile full-screen via `@media (max-width: 768px)` targeting `::v-deep(.p-dialog)` and `.wizard-dialog`
- Duration `<Select>` (line ~538): needs a wrapper class to scope PrimeVue overrides
- Dark mode block (line ~1627): discount card + venue chip dark mode entries to be removed (light-mode only rule)

</code_context>

<specifics>
## Specific Ideas

No specific references beyond the requirements and decisions above. The flat design language is well-established from Phases 3 and 4.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-campaign-details-mobile*
*Context gathered: 2026-03-03*

# Phase 2: Premium Pins - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign all venue map pins to a single unified premium style. All pins look identical — no Blue/Gold/Platinum visual distinction visible to clients. Pins must render well over both Stadia light and dark tile layers, with a hover state and at least two variants presented for approval before the final design ships. Level-based color bindings are removed from pin rendering; `useVenueList.levelColour()` is retained but decoupled from map markers.

</domain>

<decisions>
## Implementation Decisions

### Pin shape & style
- Keep the existing teardrop/diamond shape (rotated square with rounded corners, white inner circle, logo overlay) — refine it rather than redesign
- No drop shadow on the pin — clean flat look
- Pin fill color: Claude's discretion — pick the best premium color against Stadia tiles
- Logo sizing and positioning: Claude's discretion — size for best visual balance within the refined pin

### Variant presentation
- At least two meaningfully different variants (Claude picks the differentiating dimension)
- Variants presented live in the browser with a toggle mechanism (URL param or button) for real-map approval
- Toggle is a temporary dev tool — removed once a variant is approved, not kept in production

### Hover state
- Primary effect: scale up to ~110–115% on hover
- Cursor: `pointer` on hover
- Animation: smooth CSS transition (~150ms ease)

### Dark mode pin appearance
- Lighter fill color in dark mode (CSS `@media (prefers-color-scheme: dark)` on `.marker-pin`)
- Inner white circle treatment in dark mode: Claude's discretion — pick what looks most balanced
- Implementation: CSS media query only (no JS class toggling)

### Claude's Discretion
- Exact pin fill color (light mode and dark mode variants)
- Logo size and centering within the refined pin
- The two differentiating dimensions between variant A and variant B
- Inner circle color in dark mode

</decisions>

<specifics>
## Specific Ideas

No specific references — open to Claude's judgment for color, sizing, and variant differentiation as long as the result reads as premium against the Stadia tile canvas.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/composables/useVenueList.ts` — `levelColour()` currently returns `#0d47a1` for all levels. Must be retained (used elsewhere) but decoupled from marker rendering
- `src/styles/index.css` — `.marker-pin`, `.marker-pin::after`, `.custom-div-icon img` CSS classes define current pin appearance (40x40px diamond, white 34x34 inner circle, 25x25 logo). These are the target files for style changes
- `customcolor_icon_transparent_background.png` — billboard logo image currently used inside pin; must stay

### Established Patterns
- Pins built with `L.divIcon` in `src/App.vue` `onMounted` — HTML template string sets background color via `levelColour()`. The color binding to `levelColour()` is what CODE-01/CODE-02 requires removing
- Dark mode tile swap already uses `window.matchMedia('(prefers-color-scheme: dark)')` — CSS media query is the simpler parallel for pin color changes
- Tailwind CSS is available for utility classes but pin styling currently uses custom CSS in `index.css`

### Integration Points
- `src/App.vue` lines 82–89: `L.divIcon` HTML template — where pin color and structure change
- `src/styles/index.css` `.marker-pin` block: where CSS dark mode overrides go
- Variant toggle: URL param (`?variant=b`) checked in `onMounted` before marker creation — no permanent state needed

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-premium-pins*
*Context gathered: 2026-03-01*

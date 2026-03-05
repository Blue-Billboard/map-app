---
phase: 04-venue-selection
plan: 01
subsystem: ui

tags: [vue, css, wizard, venue-cards, flat-design]

# Dependency graph
requires:
  - phase: 03-foundation
    provides: Flat design system (zero shadows, no gradients, Outfit font, border-radius:0 convention)
provides:
  - Full-bleed 16:9 venue cards with flat navy overlay band in WizardView.vue Step 1
  - Square opacity-toggled selection badge (outline on hover, filled on select)
affects:
  - 04-venue-selection (subsequent plans referencing card design)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Overlay band pattern: .venue-card-content absolutely positioned bottom:0 inside .venue-card-image"
    - "Opacity toggle badge: hidden by default (opacity:0), shown via :hover and .selected CSS selectors"
    - "Fallback image pattern: img hidden on error, navy background on container provides visual continuity"

key-files:
  created: []
  modified:
    - src/dialogs/wizard/WizardView.vue

key-decisions:
  - "Navy overlay band uses flat background (no gradient) — hard edge between image and band"
  - "Selection badge converted from circle (border-radius:50%) to flat square (border-radius:0)"
  - "Badge uses opacity toggle (0/1) not display/visibility — preserves transition animation"
  - "Removed pi icon spans from card content — city shown as plain <p class=venue-card-city>"
  - "bg-blue-50 fallback tint changed from #f0f7ff to #eff6ff to match Tailwind blue-50 exactly"

patterns-established:
  - "Image overlay band: position:absolute bottom:0 inside position:relative container"
  - "Flat selection state: border-color change only, no transform, no shadow"
  - "Square badge pattern: border-radius:0, opacity-driven visibility"

requirements-completed: [VENUE-01, VENUE-02]

# Metrics
duration: 1min
completed: 2026-03-03
---

# Phase 4 Plan 01: Venue Card Redesign Summary

**Full-bleed 16:9 venue cards with flat navy overlay band, square opacity-toggled badge, and zero shadow/transform selection state in WizardView.vue**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-03-03T17:13:52Z
- **Completed:** 2026-03-03T17:14:49Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Restructured venue card HTML to nest `.venue-card-content` inside `.venue-card-image` as an absolutely-positioned overlay band
- Overhauled CSS to deliver flat 16:9 poster-style cards: `aspect-ratio: 16/9`, `object-fit: cover`, navy `#0d47a1` overlay, sharp `border-radius: 0`
- Converted selection badge from a circle to a flat square with opacity-based show/hide (outline on hover, filled navy on select)
- Removed all `translateY` transforms and `box-shadow` from card states, matching the Phase 3 flat design system

## Task Commits

Each task was committed atomically:

1. **Task 1: Restructure venue card HTML template** - `dfc72fd` (feat)
2. **Task 2: Overhaul venue card CSS** - `d3d1fa4` (feat)

## Files Created/Modified
- `src/dialogs/wizard/WizardView.vue` - Venue card template restructured and CSS overhauled

## Decisions Made
- Navy overlay band uses a flat solid background, no gradient — hard edge between image and text band as specified
- Badge uses `opacity: 0/1` toggle rather than `display: none/block` to preserve the `transition: all 0.2s` animation
- Removed icon spans (`pi-map-marker`, `pi-tag`) from card content entirely — city is now a plain `<p class="venue-card-city">` element
- Grid `minmax` updated from 280px to 320px to accommodate wider 16:9 cards

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. Build passed on first attempt with zero TypeScript or Vite errors.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness
- Venue card visual identity (VENUE-01, VENUE-02) is complete
- Cards display full-bleed 16:9 images, navy overlay band, flat selection state, square badge
- Ready for Phase 4 Plan 02 (filter/sort bar or pagination improvements)

---
*Phase: 04-venue-selection*
*Completed: 2026-03-03*

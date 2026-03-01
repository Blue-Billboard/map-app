---
phase: 02-premium-pins
plan: "01"
subsystem: ui
tags: [leaflet, css, dark-mode, map-markers, divicon]

# Dependency graph
requires:
  - phase: 01-map-tiles
    provides: Stadia Alidade Smooth tile layers (light/dark) as the canvas pins render against
provides:
  - Unified premium navy pin design (#1a2e4a) via CSS class (not inline style)
  - Hover scale animation (scale 1.12) on .custom-div-icon with 150ms ease transition
  - CSS dark mode pin override (#4a90d9) via @media (prefers-color-scheme: dark)
  - levelColour decoupled from marker rendering (retained in composable for other consumers)
affects:
  - 02-02-PLAN.md (next plan in phase — builds on pin rendering changes here)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS-driven marker color: pin color set by .marker-pin CSS rule, not inline style, enabling dark mode CSS overrides"
    - "Scale hover on Leaflet wrapper: .custom-div-icon:hover scale() avoids combining with .marker-pin rotate(-45deg)"
    - "riseOnHover: true on L.marker for z-index elevation on hover"

key-files:
  created: []
  modified:
    - src/App.vue
    - src/styles/index.css

key-decisions:
  - "Pin color moved from inline style (JS) to CSS class — prerequisite for dark mode overrides (inline styles have higher specificity than any CSS rule)"
  - "Scale transform on .custom-div-icon wrapper not .marker-pin — .marker-pin already has rotate(-45deg), combining transforms would distort the pin shape"
  - "transform-origin: center bottom anchors scale to pin tip so it grows upward, staying visually pinned to its map coordinate"
  - "Dark mode pin color #4a90d9 (lighter blue) chosen for readability against Alidade Smooth Dark tile canvas"
  - "No drop shadow on pin — flat look per plan specification"

patterns-established:
  - "CSS-over-inline-style for marker theming: any map marker color that needs dark mode override must be set via CSS class, not inline style"
  - "Leaflet hover animation pattern: scale on .custom-div-icon (untransformed wrapper), not on internally-transformed child elements"

requirements-completed: [PINS-01, PINS-02, PINS-03, PINS-05, PINS-06, CODE-01, CODE-02]

# Metrics
duration: ~1min
completed: 2026-03-01
---

# Phase 2 Plan 01: Premium Pins Summary

**Unified deep navy map pins (#1a2e4a) with CSS-driven theming, hover scale animation, and dark mode override (#4a90d9) — inline style removed from divIcon, enabling CSS specificity chain**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-03-01T20:11:38Z
- **Completed:** 2026-03-01T20:12:42Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Removed `style="background:${levelColour(location.level)};"` from `.marker-pin` divIcon HTML — pins now color-controlled entirely by CSS
- Added `background: #1a2e4a` to `.marker-pin` CSS rule (deep navy, premium against Alidade Smooth pastel tiles)
- Added `.custom-div-icon` transition (150ms ease) with `transform-origin: center bottom` and `:hover` scale(1.12)
- Added dark mode media query override: `.marker-pin { background: #4a90d9; }` for readability on dark tiles
- Added `riseOnHover: true` to `L.marker()` for z-index elevation on pin hover
- Retained `levelColour` import in App.vue with CODE-02 suppression comment — function stays in composable

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove levelColour from divIcon HTML in App.vue** - `51518f5` (feat)
2. **Task 2: Add premium pin CSS with hover and dark mode to index.css** - `042b5d8` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `src/App.vue` - Removed inline style from .marker-pin divIcon, added riseOnHover: true, retained levelColour with comment
- `src/styles/index.css` - Added .marker-pin background, .custom-div-icon transition/hover, dark mode pin override

## Decisions Made
- Pin color moved to CSS class (not inline style) — inline styles override any CSS rule regardless of specificity, making dark mode impossible without JS. Moving to CSS class enables the `@media (prefers-color-scheme: dark)` override to work.
- Scale transform placed on `.custom-div-icon` wrapper, not `.marker-pin` — the inner element already has `rotate(-45deg)`, stacking `scale()` there would combine into a distorted transform matrix.
- `transform-origin: center bottom` — anchors the scale expansion to the pin tip so the pin appears to grow upward while staying visually pinned to its geographic coordinate.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Pin rendering is now fully CSS-driven, ready for 02-02 (additional pin variants or filtering)
- Dark mode pin theming works automatically via CSS media query — no JS required
- `levelColour` is retained in `useVenueList.ts` if future plans need level-based coloring elsewhere

---
*Phase: 02-premium-pins*
*Completed: 2026-03-01*

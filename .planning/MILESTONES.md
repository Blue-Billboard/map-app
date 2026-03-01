# Milestones

## v1.0 Premium Map Redesign (Shipped: 2026-03-01)

**Phases completed:** 2 phases, 3 plans, 8 tasks
**Files modified:** 18 | **LOC:** 2,708 (Vue/TS/CSS) | **Timeline:** 1 day (2026-03-01)
**Git range:** 54041c6 → 4b309f9

**Key accomplishments:**
- Replaced OSM Hot tiles with Stadia Maps Alidade Smooth dual tile layers (light + dark) — premium cartography with no API key required for free tier
- Added live tile layer swap via `matchMedia` change listener — OS theme toggle updates tiles instantly, no page reload
- Removed CSS `filter: invert(100%)` dark mode hack entirely from codebase
- Unified all venue pins to CSS-driven navy design (#0d47a1), decoupled from Blue/Gold/Platinum level colors
- Added pin hover scale animation (scale 1.12, 150ms ease) with z-index elevation via `riseOnHover`
- Locked final pin design (Blue Billboard blue, 40px Variant A shape) after live two-variant comparison; all toggle code stripped — zero variant debt

---


# Milestones

## v1.1 Quote Wizard Redesign (Shipped: 2026-03-05)

**Phases completed:** 6 phases (3–8), 10 plans
**Files modified:** ~27 | **LOC:** 2,438 (Vue/TS/CSS) | **Timeline:** 2 days (2026-03-03 → 2026-03-05)

**Key accomplishments:**
- Rebuilt quote wizard with Outfit font + zero box-shadows across all 3 steps — flat design system baseline (Phase 3)
- Custom flat step indicator (numbered navy blocks: active, complete with checkmark, pending) + direction-aware 200ms slide transitions (Phase 3)
- Full-bleed 16:9 hero venue cards with flat navy overlay band, solid selected state (navy border + blue-50 tint), flat filter bar, bold navy count chip (Phase 4)
- Flat discount cards, duration selector, venue chips in Step 2; CSS-only mobile full-screen takeover (100dvh, no dialog chrome) for all breakpoints (Phase 5)
- Poster-style navy featured pricing card, flat tier variants with gold Most Popular badge, 5xl price display, geometric circle background decorators, flat gray-900 CTA block (Phases 6–7)
- Two audit gap closure cycles: removed gradient + border-radius from `.info-section` / `.feature-item.highlight`; eliminated live Aura popover shadow; constrained mobile dialog footer; added gstatic.com preconnect; removed dead CSS (Phases 7–8)

---

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


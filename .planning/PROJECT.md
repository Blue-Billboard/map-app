# MapApp — Blue Billboard Venue Map

## Current State: v1.1 Shipped

Shipped v1.1 on 2026-03-05. Quote wizard fully redesigned with flat design system across all 3 steps. Next milestone TBD.

## What This Is

MapApp is a Vue 3 + Leaflet venue showcase for Blue Billboard, displaying billboard advertising locations on an interactive map with quote generation. Shipped v1.0 with premium Stadia Maps cartography (Alidade Smooth light + dark), unified CSS-driven venue pins, and live dark mode switching — the map now matches the premium quality of the venues it displays.

## Core Value

The map must feel as premium as the venues it displays — first impressions matter, and the map is what clients see first.

## Requirements

### Validated

- ✓ Interactive Leaflet map with venue markers — existing
- ✓ Venue data fetched from Blue Billboard API — existing
- ✓ Dark mode support via CSS media query — existing
- ✓ Level-based pin coloring (Blue, Gold, Platinum) — internal only, decoupled from map markers
- ✓ URL parameter support (stripped, lat, lng, showQuote) — existing
- ✓ Quote generation wizard — existing
- ✓ Stadia Maps Alidade Smooth tiles (light + dark) replacing OSM Hot tiles — v1.0
- ✓ CSS invert filter dark mode hack removed — v1.0
- ✓ Live tile layer swap on OS color scheme change — v1.0
- ✓ Unified premium pin design (navy #0d47a1) — no Blue/Gold/Platinum visual distinction — v1.0
- ✓ Existing billboard icon preserved within pin design — v1.0
- ✓ Pin hover scale animation (scale 1.12, 150ms) — v1.0
- ✓ Pins render cleanly in both light and dark map modes — v1.0
- ✓ Level-color bindings removed from marker rendering — v1.0
- ✓ Quote wizard redesigned with flat design system — v1.1
- ✓ Full-bleed hero venue cards in wizard Step 1 — v1.1
- ✓ Wizard mobile full-screen takeover (100dvh, no chrome) — v1.1
- ✓ Outfit font applied throughout wizard — v1.1
- ✓ Zero box shadows, no gradients, flat color blocks across all 3 wizard steps — v1.1

### Active

(No active requirements — v1.1 shipped. Define requirements for next milestone with `/gsd:new-milestone`)

### Deferred (previously Active)

- [ ] Pin clustering for dense venue areas — deferred to future milestone
- [ ] Animated pin entrance on map load — deferred to future milestone
- [ ] Custom map attribution styling to match brand — deferred to future milestone

### Out of Scope

- Changing the map library (staying with Leaflet) — no need to switch
- Changing the API data source — only visual layer changes
- Adding new map functionality (clustering, filters) — future milestone
- Custom Stadia map style editor — free tier styles are sufficient
- Mobile app — web-first approach
- Wizard functional changes (pricing logic, discount rules) — visual redesign only

## Context

Shipped v1.1 on 2026-03-05. 2,438 LOC (Vue/TS/CSS). Tech stack: Vue 3 + Composition API, Leaflet, PrimeVue (unstyled + Aura theme), Tailwind CSS, Stadia Maps (Alidade Smooth), Outfit (Google Fonts).

Known tech debt:
- `transform-origin: center center` (actual) vs `center bottom` (intended) — pin scales from midpoint not tip; cosmetic only
- `levelColour` imported but unused in App.vue — retained for future consumers, tree-shaken from bundle
- Human visual QA pending for Phase 5 (discount card hover, badge colors, mobile viewport) and Phase 7 (Step 2 info panel, Step 3 highlight rows) — automated checks passed, user approved during execution

## Constraints

- **Tech Stack**: Leaflet stays — no library swap
- **No API Key**: Stadia Maps free tier (domain registered in dashboard)
- **Existing Icon**: Billboard icon on pins must be preserved
- **Performance**: Tile provider must be reliable and fast for UK geography

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Stadia Maps over OSM Hot tiles | Free tier, no API key needed, purpose-built dark tile variant avoids CSS filter hacks | ✓ Good — shipped v1.0 |
| Keep Leaflet | No need to swap the map library for a visual upgrade | ✓ Good — no disruption, visual layer only |
| Unified pins (no level colors) | Level distinction is internal-only, clients don't need to see it | ✓ Good — clean visual output |
| CSS-driven pin color (not inline style) | Inline styles override CSS media queries — CSS class enables dark mode override | ✓ Good — correct architecture |
| Scale transform on `.custom-div-icon` wrapper | `.marker-pin` already has `rotate(-45deg)` — combining transforms distorts shape | ✓ Good — correct element choice |
| Both tile layers instantiated once in onMounted | Prevents memory waste and flicker on theme toggle | ✓ Good — clean implementation |
| Variant comparison via URL param (`?variant=b`) | Temporary dev toggle — no UI overhead, stripped post-approval | ✓ Good — zero variant debt shipped |
| Wizard brand color #0d47a1 (not design system #3B82F6) | Brand consistency with map pins and app chrome | ✓ Good — shipped v1.1 |
| CSS-only mobile full-screen (no template changes) | Keeps Vue template clean; 100dvh for iOS Safari dynamic viewport | ✓ Good — zero JS overhead |
| Flat design is light-mode only | Sales presentation context; complexity of dark mode overrides not worth it | ✓ Good — dark mode variants removed cleanly |
| No mode='out-in' on step transitions | Simultaneous enter+leave required for snappy feel; position:absolute provides stacking | ✓ Good — 200ms transitions feel crisp |
| Gold (#FFD700) Most Popular badge (not white) | White was invisible against navy card top edge | ✓ Good — contrast maintained |
| `:deep(.p-popover)` scoped override pattern | Mirrors `:deep(.p-dialog)` — consistent flat shadow control across PrimeVue overlays | ✓ Good — shipped v1.1 Phase 8 |

---
*Last updated: 2026-03-05 after v1.1 milestone shipped*

# MapApp — Blue Billboard Venue Map

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

### Active

- [ ] Pin clustering for dense venue areas
- [ ] Animated pin entrance on map load
- [ ] Custom map attribution styling to match brand

### Out of Scope

- Changing the map library (staying with Leaflet) — no need to switch
- Changing the API data source — only visual layer changes
- Quote wizard changes — separate concern
- Adding new map functionality (clustering, filters) — future milestone
- Custom Stadia map style editor — free tier styles are sufficient
- Mobile app — web-first approach

## Context

Shipped v1.0 on 2026-03-01. 2,708 LOC (Vue/TS/CSS). Tech stack: Vue 3 + Composition API, Leaflet, PrimeVue (unstyled), Tailwind CSS, Stadia Maps (Alidade Smooth).

Two known tech debt items from v1.0:
- `transform-origin: center center` (actual) vs `center bottom` (intended) — pin scales from midpoint not tip; cosmetic only, hover confirmed correct
- `levelColour` imported but unused in App.vue — intentional per CODE-02 (retained for future consumers), dead import tree-shaken from bundle

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

---
*Last updated: 2026-03-01 after v1.0 milestone*

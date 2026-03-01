# MapApp — Premium Map Redesign

## What This Is

MapApp is a Vue 3 + Leaflet venue showcase for Blue Billboard, displaying billboard advertising locations on an interactive map with quote generation. This milestone focuses on elevating the map's visual quality to match the premium nature of the venues being showcased.

## Core Value

The map must feel as premium as the venues it displays — first impressions matter, and the map is what clients see first.

## Requirements

### Validated

- ✓ Interactive Leaflet map with venue markers — existing
- ✓ Venue data fetched from Blue Billboard API — existing
- ✓ Dark mode support via CSS media query — existing
- ✓ Level-based pin coloring (Blue, Gold, Platinum) — existing (internal only, being replaced)
- ✓ URL parameter support (stripped, lat, lng, showQuote) — existing
- ✓ Quote generation wizard — existing

### Active

- [ ] Replace OpenStreetMap hot tiles with Stadia Maps (Alidade Smooth for light mode)
- [ ] Replace CSS invert dark mode hack with Stadia Maps Alidade Smooth Dark tiles
- [ ] Redesign venue pins: keep existing icon, add premium wrapper/styling
- [ ] Remove level-based (Blue/Gold/Platinum) visual distinction from pins — unified single design
- [ ] Present multiple pin color/style options for approval before finalizing

### Out of Scope

- Changing the map library (staying with Leaflet) — no need to switch
- Changing the API data source — only visual layer changes
- Quote wizard changes — separate concern
- Adding new map functionality (clustering, filters) — future milestone

## Context

Currently using OpenStreetMap "hot" tile variant (`https://b.tile.openstreetmap.fr/hot/`) which looks generic and cluttered. Dark mode currently uses a CSS `filter: invert(100%)` hack on the tile layer which produces an ugly, unnatural look.

Pins are `L.divIcon` elements with level-based background colors (Blue: #0d47a1, Gold: #FFD700, Platinum: #E5E4E2). Level distinction is for internal use only — all client-facing pins should look identical.

Stadia Maps offers beautiful Alidade Smooth styles with no API key required for low usage volumes. Their light style has a soft pastel/warm minimal aesthetic; their dark style is a proper dark base map rather than an inverted one.

## Constraints

- **Tech Stack**: Leaflet stays — no library swap
- **No API Key**: Prefer Stadia Maps free tier (no key needed for low volume), but can add if needed
- **Existing Icon**: The current billboard icon on pins must be preserved — just wrapped in better styling
- **Performance**: Tile provider must be reliable and fast for UK geography

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Stadia Maps over Mapbox | Free tier, no API key needed, beautiful Alidade styles | — Pending |
| Keep Leaflet | No need to swap the map library for a visual upgrade | — Pending |
| Unified pins | Level distinction is internal-only, clients don't need to see it | — Pending |

---
*Last updated: 2026-03-01 after initialization*

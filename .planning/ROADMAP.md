# Roadmap: MapApp — Premium Map Redesign

## Overview

Two focused phases elevate the map from generic to premium. Phase 1 replaces the tile provider — the canvas everything renders on. Phase 2 redesigns the venue pins — the objects clients actually interact with. Both phases must complete for the map to feel premium; neither is optional.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Map Tiles** - Replace OpenStreetMap tiles with Stadia Maps Alidade Smooth, fix dark mode
- [ ] **Phase 2: Premium Pins** - Redesign venue pins to unified premium design, clean up level-based code

## Phase Details

### Phase 1: Map Tiles
**Goal**: The map canvas looks premium in both light and dark mode
**Depends on**: Nothing (first phase)
**Requirements**: TILES-01, TILES-02, TILES-03, TILES-04
**Success Criteria** (what must be TRUE):
  1. Light mode displays soft pastel Alidade Smooth tiles instead of the cluttered OSM hot tiles
  2. Dark mode displays a proper dark base map rather than an inverted/ugly color-shifted view
  3. The CSS invert filter is gone from the codebase — dark mode uses a real dark tile layer
  4. Changing system color scheme (light to dark, dark to light) switches the tile layer without a page reload
**Plans**: 1 plan

Plans:
- [ ] 01-01-PLAN.md — Replace OSM tiles with dual Stadia Alidade Smooth layers, remove CSS invert hack

### Phase 2: Premium Pins
**Goal**: All venue pins look identical, premium, and render correctly over the new map tiles
**Depends on**: Phase 1
**Requirements**: PINS-01, PINS-02, PINS-03, PINS-04, PINS-05, PINS-06, CODE-01, CODE-02
**Success Criteria** (what must be TRUE):
  1. All venue pins on the map look identical — no visual Blue/Gold/Platinum distinction visible to clients
  2. The existing billboard icon is visible within each pin (not replaced or removed)
  3. At least two distinct pin style variants are presented and one is approved before pins ship
  4. Hovering a pin produces a clear visual change (scale, brightness, or shadow)
  5. Pins look clean and readable over both the light and dark Stadia tile layers
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Map Tiles | 0/1 | Not started | - |
| 2. Premium Pins | 0/TBD | Not started | - |

# Requirements: MapApp — Premium Map Redesign

**Defined:** 2026-03-01
**Core Value:** The map must feel as premium as the venues it displays — first impressions matter.

## v1 Requirements

### Map Tiles

- [ ] **TILES-01**: Light mode displays Stadia Maps Alidade Smooth tile layer (soft pastel, minimal cartography)
- [ ] **TILES-02**: Dark mode displays Stadia Maps Alidade Smooth Dark tile layer (proper dark base, not inverted)
- [ ] **TILES-03**: CSS invert filter hack removed from dark mode map tile implementation
- [ ] **TILES-04**: Tile layer switches correctly when system color scheme changes

### Venue Pins

- [ ] **PINS-01**: All venue pins use a single unified design (no Blue/Gold/Platinum visual distinction)
- [ ] **PINS-02**: Existing billboard icon is preserved within the new pin design
- [ ] **PINS-03**: Pin design feels premium — uses shadow, glow, or refined wrapper styling
- [ ] **PINS-04**: Multiple pin color/style variants are presented for user approval before finalizing
- [ ] **PINS-05**: Pin hover state gives clear visual feedback (scale, brightness, or shadow change)
- [ ] **PINS-06**: Pins render cleanly in both light and dark map modes

### Code Cleanup

- [ ] **CODE-01**: Level color bindings removed from pin rendering logic (levelColour() no longer drives pin appearance)
- [ ] **CODE-02**: useVenueList composable levelColour() function retained (still used internally) but decoupled from map markers

## v2 Requirements

### Enhancements

- **ENH-01**: Pin clustering for dense venue areas
- **ENH-02**: Animated pin entrance on map load
- **ENH-03**: Custom map attribution styling to match brand

## Out of Scope

| Feature | Reason |
|---------|--------|
| Switching map library (e.g., MapLibre, Google Maps) | Leaflet works, visual upgrade only |
| Adding new map interactions | Separate milestone |
| Quote wizard changes | Not related to visual redesign |
| Custom Stadia map style editor | Free tier styles are sufficient |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TILES-01 | Phase 1 | Pending |
| TILES-02 | Phase 1 | Pending |
| TILES-03 | Phase 1 | Pending |
| TILES-04 | Phase 1 | Pending |
| PINS-01 | Phase 2 | Pending |
| PINS-02 | Phase 2 | Pending |
| PINS-03 | Phase 2 | Pending |
| PINS-04 | Phase 2 | Pending |
| PINS-05 | Phase 2 | Pending |
| PINS-06 | Phase 2 | Pending |
| CODE-01 | Phase 2 | Pending |
| CODE-02 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-01*
*Last updated: 2026-03-01 after initial definition*

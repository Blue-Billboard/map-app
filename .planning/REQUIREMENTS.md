# Requirements: MapApp — Blue Billboard Venue Map

**Defined:** 2026-03-03
**Core Value:** The map must feel as premium as the venues it displays — first impressions matter.

## v1.1 Requirements

Quote wizard redesigned with a bold flat design system — no shadows, no gradients on components, Outfit font, full-bleed images, and a full-screen mobile experience.

### Wizard Wrapper & Navigation

- [ ] **WIZD-01**: User sees Outfit font applied throughout the entire wizard (all steps, all text)
- [ ] **WIZD-02**: User on mobile sees the wizard fill the full viewport (100vw × 100dvh, no dialog chrome, no border-radius, no margin)
- [ ] **WIZD-03**: User sees a custom flat step indicator replacing PrimeVue Steps (numbered blocks: active=navy, complete=navy+checkmark, pending=gray)
- [ ] **WIZD-04**: User sees a snappy step transition animation when navigating between steps (opacity + translateX slide, 200ms)
- [ ] **WIZD-05**: User sees zero box shadows on any wizard element (buttons, cards, inputs, containers)

### Venue Selection (Step 1)

- [ ] **VENUE-01**: User sees venue cards with full-bleed hero images (image fills card entirely, venue name and city overlaid on a flat navy color band at the bottom)
- [ ] **VENUE-02**: User sees selected venue cards with a flat selected state (solid navy border + bg-blue-50 tint, no shadow)
- [ ] **VENUE-03**: User sees a flat search/filter bar (gray-100 background, no border, no shadow)
- [ ] **VENUE-04**: User sees selected venue count as a bold navy color chip with white text (not a soft pill)

### Campaign Details (Step 2)

- [ ] **CAMP-01**: User sees discount cards with flat styling (no shadow, no gradient — hover intensifies background color + scale-[1.02])
- [ ] **CAMP-02**: User sees the duration selector using flat input styling (gray-100 background, no floating border)
- [ ] **CAMP-03**: User sees selected venues displayed as flat chips (no shadow)

### Quote & Pricing (Step 3)

- [ ] **QUOT-01**: User sees the featured tier card (Most Popular) as a solid navy background block with white text — poster-style
- [ ] **QUOT-02**: User sees pricing cards using flat color block style (no box shadows, no gradient borders, solid backgrounds)
- [ ] **QUOT-03**: User sees price amounts displayed extra-large (text-5xl, font-bold, tight leading)
- [ ] **QUOT-04**: User sees the CTA section as a solid gray-900 block with white text
- [ ] **QUOT-05**: User sees bold geometric background decoration on the pricing step (large low-opacity circles, absolutely positioned)

## v2 Requirements

Deferred to future milestones.

### Map Enhancements

- Pin clustering for dense venue areas
- Animated pin entrance on map load
- Custom map attribution styling to match brand

## Out of Scope

| Feature | Reason |
|---------|--------|
| Quote wizard pricing logic changes | Visual redesign only — existing discount/tier calculations unchanged |
| Dark mode for wizard | Flat design system is light-mode only; wizard targets sales presentation context |
| PrimeVue component library swap | Continue using PrimeVue with CSS overrides — no library swap |
| Design system Blue (#3B82F6) as primary | Brand color (#0d47a1 navy) retained for consistency with map pins and app |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| WIZD-01 | Phase 3 | Pending |
| WIZD-02 | Phase 5 | Pending |
| WIZD-03 | Phase 3 | Pending |
| WIZD-04 | Phase 3 | Pending |
| WIZD-05 | Phase 3 | Pending |
| VENUE-01 | Phase 4 | Pending |
| VENUE-02 | Phase 4 | Pending |
| VENUE-03 | Phase 4 | Pending |
| VENUE-04 | Phase 4 | Pending |
| CAMP-01 | Phase 5 | Pending |
| CAMP-02 | Phase 5 | Pending |
| CAMP-03 | Phase 5 | Pending |
| QUOT-01 | Phase 6 | Pending |
| QUOT-02 | Phase 6 | Pending |
| QUOT-03 | Phase 6 | Pending |
| QUOT-04 | Phase 6 | Pending |
| QUOT-05 | Phase 6 | Pending |

**Coverage:**
- v1.1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-03*
*Last updated: 2026-03-03 after roadmap creation*

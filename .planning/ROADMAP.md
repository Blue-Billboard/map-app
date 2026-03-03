# Roadmap: MapApp — Blue Billboard Venue Map

## Milestones

- ✅ **v1.0 Premium Map Redesign** — Phases 1-2 (shipped 2026-03-01)
- 🚧 **v1.1 Quote Wizard Redesign** — Phases 3-6 (in progress)

## Phases

<details>
<summary>✅ v1.0 Premium Map Redesign (Phases 1-2) — SHIPPED 2026-03-01</summary>

- [x] Phase 1: Map Tiles (1/1 plans) — completed 2026-03-01
- [x] Phase 2: Premium Pins (2/2 plans) — completed 2026-03-01

Full archive: `.planning/milestones/v1.0-ROADMAP.md`

</details>

### 🚧 v1.1 Quote Wizard Redesign (In Progress)

**Milestone Goal:** Redesign the quote wizard with a bold flat design system — Outfit font, zero shadows, full-bleed venue images, and full-screen mobile — across all 3 wizard steps.

- [ ] **Phase 3: Foundation** — Design tokens, Outfit font, zero shadows, custom step indicator, step transitions
- [ ] **Phase 4: Venue Selection** — Full-bleed hero cards, selected state, flat filter bar, count chip (Step 1)
- [ ] **Phase 5: Campaign Details + Mobile** — Flat discount cards, duration selector, venue chips, mobile full-screen (Step 2)
- [ ] **Phase 6: Quote & Pricing** — Featured tier block, flat pricing cards, large price display, CTA section, geometric decoration (Step 3)

## Phase Details

### Phase 3: Foundation
**Goal**: The wizard has a consistent flat design identity — Outfit font, zero shadows, a custom step indicator, and animated step transitions applied across all steps
**Depends on**: Nothing (first phase of v1.1)
**Requirements**: WIZD-01, WIZD-03, WIZD-04, WIZD-05
**Success Criteria** (what must be TRUE):
  1. Every text element in the wizard renders in the Outfit typeface
  2. No box shadow appears on any wizard element (buttons, inputs, cards, containers) in any step
  3. The step indicator shows numbered blocks — active step in solid navy, completed steps in navy with a checkmark, pending steps in gray — replacing the default PrimeVue Steps component
  4. Navigating between steps triggers a snappy opacity + translateX slide animation completing in 200ms
**Plans**: TBD

### Phase 4: Venue Selection
**Goal**: Step 1 of the wizard shows full-bleed hero venue cards with clear selected state, a flat filter bar, and a bold count chip
**Depends on**: Phase 3
**Requirements**: VENUE-01, VENUE-02, VENUE-03, VENUE-04
**Success Criteria** (what must be TRUE):
  1. Venue cards display images that fill the card entirely, with venue name and city overlaid on a flat navy color band at the bottom
  2. Selecting a venue shows a solid navy border and blue-50 background tint on the card — no shadow
  3. The search and filter bar has a gray-100 background with no visible border or shadow
  4. The selected venue count displays as a bold navy chip with white text — not a soft pill style
**Plans**: TBD

### Phase 5: Campaign Details + Mobile
**Goal**: Step 2 of the wizard uses flat component styling throughout, and the wizard fills the full viewport on mobile devices
**Depends on**: Phase 4
**Requirements**: CAMP-01, CAMP-02, CAMP-03, WIZD-02
**Success Criteria** (what must be TRUE):
  1. Discount cards have no shadow and no gradient — hovering intensifies the background color and applies a subtle scale-[1.02] lift
  2. The duration selector uses gray-100 background flat input styling with no floating border
  3. Selected venues in Step 2 appear as flat chips with no shadow
  4. On a mobile device, the wizard fills 100vw × 100dvh with no dialog chrome, no border-radius, and no margin
**Plans**: TBD

### Phase 6: Quote & Pricing
**Goal**: Step 3 of the wizard presents pricing in a bold, poster-style flat layout with a featured tier, large price figures, a solid CTA section, and geometric background decoration
**Depends on**: Phase 5
**Requirements**: QUOT-01, QUOT-02, QUOT-03, QUOT-04, QUOT-05
**Success Criteria** (what must be TRUE):
  1. The "Most Popular" tier card renders as a solid navy background block with white text in poster style
  2. All pricing cards use flat solid color block styling — no box shadows, no gradient borders
  3. Price amounts display at text-5xl, font-bold, with tight leading
  4. The CTA section is a solid gray-900 block with white text
  5. Large low-opacity geometric circles appear as absolute-positioned background decoration on the pricing step
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 3 → 4 → 5 → 6

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Map Tiles | v1.0 | 1/1 | Complete | 2026-03-01 |
| 2. Premium Pins | v1.0 | 2/2 | Complete | 2026-03-01 |
| 3. Foundation | v1.1 | 0/? | Not started | - |
| 4. Venue Selection | v1.1 | 0/? | Not started | - |
| 5. Campaign Details + Mobile | v1.1 | 0/? | Not started | - |
| 6. Quote & Pricing | v1.1 | 0/? | Not started | - |

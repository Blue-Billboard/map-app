# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Premium Map Redesign

**Shipped:** 2026-03-01
**Phases:** 2 | **Plans:** 3 | **Sessions:** 1

### What Was Built
- Stadia Maps Alidade Smooth dual tile layers replacing OSM Hot tiles — premium cartography in light and dark mode
- Live tile layer swap via `matchMedia` — OS theme toggle works without page reload
- Unified CSS-driven navy venue pins (#0d47a1) with hover scale animation — level colors decoupled from marker rendering
- Two-variant pin comparison (URL-param toggle) followed by approval checkpoint and full toggle code removal

### What Worked
- **Tiny scope, tight execution:** Two phases with one clear dependency (tiles → pins) executed without blockers
- **CSS-over-JS for theming:** Moving pin color from inline style to CSS class was the right architectural call — it unlocked dark mode overrides with zero JS complexity
- **Variant approval flow:** URL-param toggle (`?variant=b`) was lightweight and left zero debt after stripping — much cleaner than a UI toggle
- **Audit first:** Running the milestone audit before completion caught the `transform-origin` discrepancy and the dead `levelColour` import — both surfaced as tech debt, not surprises

### What Was Inefficient
- **Task count not tracked by gsd-tools:** The CLI reported 0 tasks in MILESTONES.md because task counts aren't auto-extracted from SUMMARY.md frontmatter. Required manual correction.
- **Accomplishments not extracted:** The `summary-extract` mechanism didn't populate accomplishments automatically; had to write them manually from SUMMARY.md files.

### Patterns Established
- **CSS-over-inline-style for marker theming:** Any map marker property that needs dark mode override must be set via CSS class, not inline style (inline styles beat CSS specificity chain)
- **Scale hover on Leaflet wrapper:** Apply `scale()` transform to `.custom-div-icon` (untransformed wrapper), not to internally-rotated child elements
- **Dark tile layer, not CSS filters:** For dark mode maps, use a purpose-built dark tile variant — never apply `filter: invert()` to light tiles
- **matchMedia change listener:** Use `addEventListener('change')` not deprecated `.addListener()`

### Key Lessons
1. **Decouple visual appearance from data model early.** The level-color coupling existed in JS inline styles — CSS classes would have enabled dark mode from day one.
2. **Temporary dev toggles belong in URL params, not in app state.** `?variant=b` kept the codebase clean; a React state toggle would have left residue.
3. **Dual tile instantiation beats recreation.** Both tile layers initialized once in `onMounted` prevents flicker and memory waste on theme changes.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: 1
- Notable: Entire milestone executed in ~45 minutes total; tight scope with clear phase dependency made execution efficient

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 1 | 2 | First milestone — established base patterns |

### Cumulative Quality

| Milestone | Requirements | Coverage | Zero-Dep Additions |
|-----------|-------------|----------|-------------------|
| v1.0 | 12/12 | 100% | 0 (Stadia Maps tile API only, no npm deps) |

### Top Lessons (Verified Across Milestones)

1. CSS-driven theming beats JS-driven theming for anything that needs media query support
2. Tight milestone scope (2 phases, 1 clear dependency) is the sweet spot for fast, clean execution

---
phase: 08-wizard-shell-gap-closure
plan: 01
subsystem: ui
tags: [primevue, popover, mobile, css, font-performance, flat-design]

# Dependency graph
requires:
  - phase: 07-flat-design-cleanup
    provides: Flat design system — zero shadows, no dead CSS, no border-radius violations
provides:
  - :deep(.p-popover) shadow override in WizardView.vue scoped styles
  - Mobile p-dialog-footer flex-shrink: 0 rule preventing content compression
  - fonts.gstatic.com preconnect hint for Outfit font binary pre-negotiation
  - Dead save-quote CSS fully removed (no latent border-radius selectors remain)
affects: [v1.1 milestone requirements WIZD-05, WIZD-02, WIZD-01]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - ":deep(.p-popover) scoped override pattern — mirrors :deep(.p-dialog) for flat shadow control"
    - "Both Google Fonts preconnect hints (googleapis + gstatic with crossorigin) — canonical pattern for Outfit font loading"

key-files:
  created: []
  modified:
    - src/dialogs/wizard/WizardView.vue
    - index.html

key-decisions:
  - "Popover shadow override placed immediately after :deep(.p-dialog) block for consistent flat design grouping"
  - "form-label retained — appears in dark mode block and is legitimate utility class independent of save-quote selectors"
  - "fonts.gstatic.com preconnect inserted between googleapis preconnect and stylesheet link — standard Google Fonts canonical order"

patterns-established:
  - "Flat design popover: :deep(.p-popover) { box-shadow: none !important; border: 1px solid #e5e7eb }"
  - "Mobile dialog footer: .wizard-dialog ::v-deep(.p-dialog-footer) { flex-shrink: 0 } inside @media (max-width: 768px)"

requirements-completed: [WIZD-05, WIZD-02, WIZD-01]

# Metrics
duration: 8min
completed: 2026-03-05
---

# Phase 8 Plan 1: Wizard Shell Gap Closure Summary

**Closed four v1.1 audit gaps: popover shadow removed, mobile footer flex-shrink hardened, Outfit font preconnect added, dead save-quote CSS eliminated**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-05T10:00:00Z
- **Completed:** 2026-03-05T10:08:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added `:deep(.p-popover) { box-shadow: none !important; border: 1px solid #e5e7eb }` — eliminates Aura theme drop shadow on Chamber Member popover in Step 2 (WIZD-05)
- Added `.wizard-dialog ::v-deep(.p-dialog-footer) { flex-shrink: 0 }` inside `@media (max-width: 768px)` — footer no longer compresses scrollable content area on mobile (WIZD-02)
- Added `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` to index.html — Outfit font binaries now pre-negotiate TCP/TLS (WIZD-01)
- Removed `.save-quote-section` and `.save-quote-form` CSS selectors (light mode + dark mode) — 20 lines of dead code with latent border-radius risk eliminated

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix WIZD-05 — add :deep(.p-popover) shadow override and remove dead save-quote CSS** - `0ec76ed` (fix)
2. **Task 2: Fix WIZD-02 + WIZD-01 — mobile footer flex-shrink and font preconnect** - `2d764b8` (fix)

## Files Created/Modified
- `src/dialogs/wizard/WizardView.vue` - Added popover override, removed dead save-quote CSS, added mobile footer flex-shrink rule
- `index.html` - Added fonts.gstatic.com preconnect hint with crossorigin attribute

## Decisions Made
- Retained `.form-label` selector — appears in dark mode block as a legitimate utility class; not exclusively tied to save-quote context
- Placed `:deep(.p-popover)` immediately after the existing `:deep(.p-dialog)` block to keep flat design shadow overrides co-located

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- v1.1 milestone requirements WIZD-05, WIZD-02, and WIZD-01 are now satisfied
- All four audit gaps from the milestone audit are closed
- No remaining flat design violations or dead CSS with border-radius in WizardView.vue
- `npm run build` exits 0 — ready for deployment

---
*Phase: 08-wizard-shell-gap-closure*
*Completed: 2026-03-05*

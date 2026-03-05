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

## Milestone: v1.1 — Quote Wizard Redesign

**Shipped:** 2026-03-05
**Phases:** 6 (3–8) | **Plans:** 10 | **Sessions:** multiple over 2 days

### What Was Built
- Outfit font + zero box-shadow baseline across all 3 wizard steps; PrimeVue dialog shadow overridden with 1px border
- Custom flat step indicator (numbered navy blocks: active, complete with checkmark, pending) + direction-aware 200ms slide transitions
- Full-bleed 16:9 venue hero cards with flat navy overlay band, solid selected state (navy border + blue-50 tint), flat filter bar and count chip
- CSS-only mobile full-screen wizard takeover (100dvh, no dialog chrome) — no template changes needed
- Poster-style navy featured pricing card, flat tier variants, 5xl price display, geometric circle decorators, flat gray-900 CTA block
- Two audit gap closure cycles: `.info-section` gradient + `.feature-item.highlight` border-radius removed; Aura popover shadow overridden; mobile dialog footer constrained; gstatic.com font preconnect added; dead CSS removed

### What Worked
- **Two audit cycles as quality gate:** Running milestone audits mid-development (before archiving) surfaced real gaps that weren't visible from task completion status alone — the Aura CSS variable shadow on `.p-popover` would have shipped undetected
- **CSS-only approach for PrimeVue overrides:** `:deep(.p-popover)` pattern (mirroring `:deep(.p-dialog)`) cleanly neutralized Aura theme injection without touching component internals
- **Gap closure phases on demand:** `plan-milestone-gaps` and `plan-phase` for targeted phases worked well — each gap became a focused sub-phase rather than a vague fix
- **Flat design system as constraint:** Declaring "zero shadows, no gradients" upfront made every plan decision obvious — no subjective calls needed during execution

### What Was Inefficient
- **Audit status not auto-refreshed:** After Phase 8 closed all gaps, the audit file still showed `gaps_found`. A stale audit created a pre-flight friction point at milestone completion. Ideal: audit re-run or inline status update after gap closure verification passes.
- **Phase numbers drifted from milestone scope description:** ROADMAP.md said "Phases 3-6 in progress" after Phases 7 and 8 were added — the milestone summary line was never updated. Required manual correction at completion.
- **`summary-extract` still not auto-populating MILESTONES.md accomplishments:** Same issue as v1.0 — gsd-tools reports "accomplishments: []" and the CLI entry needs manual enrichment.

### Patterns Established
- **`:deep(.p-overlay-class)` pattern for Aura theme shadow suppression:** Any PrimeVue overlay component (Popover, Dialog, Tooltip, etc.) with Aura's shadow token needs an explicit `:deep()` override in scoped styles — the dialog-level `box-shadow: none !important` does not cascade to other overlay types
- **Both Google Fonts preconnect hints required:** `fonts.googleapis.com` (CSS) + `fonts.gstatic.com` (binaries, `crossorigin`) — omitting the gstatic preconnect leaves font binaries without pre-negotiated TCP/TLS
- **Flat design = light-mode only:** Dark mode variants were explicitly removed from Phases 3-8. Any future dark mode wizard work starts from scratch against the flat system
- **CSS-only mobile full-screen pattern:** `.wizard-dialog ::v-deep(.p-dialog)` scoped under a wrapper class + `@media (max-width: 768px)` — zero template attribute changes, no JS, `100dvh` for iOS Safari

### Key Lessons
1. **Run milestone audit twice:** Once mid-milestone to catch gaps early, once before completion. Gaps like the Aura shadow token only show in integration audit, not in individual phase verification.
2. **PrimeVue Aura theme injects CSS variables that bypass component-level overrides.** Always check overlay shadow tokens separately — `:deep(.p-dialog)` and `:deep(.p-popover)` are independent targets.
3. **Flat design scope creep is real.** "Zero shadows" must be verified per overlay type, not just per dialog. The popover was a blind spot because it's a different PrimeVue component family.
4. **Dead CSS with non-zero border-radius is a latent design risk.** If a selector has `border-radius: 12px` and is unreferenced today, it becomes a bug the moment a dev adds the class to a template.

### Cost Observations
- Model mix: ~100% sonnet (balanced profile)
- Sessions: multiple over 2 days
- Notable: 6 phases across 2 days — milestone scope was larger (17 requirements, 6 phases vs 2 for v1.0) but execution was still clean with the wave-based parallel approach

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 1 | 2 | First milestone — established base patterns |
| v1.1 | ~6 | 6 | Introduced audit cycles and gap closure phases as quality gate |

### Cumulative Quality

| Milestone | Requirements | Coverage | Zero-Dep Additions |
|-----------|-------------|----------|-------------------|
| v1.0 | 12/12 | 100% | 0 (Stadia Maps tile API only, no npm deps) |
| v1.1 | 17/17 | 100% | 0 (Google Fonts CDN only) |

### Top Lessons (Verified Across Milestones)

1. CSS-driven theming beats JS-driven theming for anything that needs media query support
2. Tight milestone scope (2 phases, 1 clear dependency) is the sweet spot for fast, clean execution
3. Run milestone audit before archiving — integration checker catches gaps that per-phase verification misses
4. PrimeVue Aura theme injects CSS variables independently per overlay type — verify each overlay family separately

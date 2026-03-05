# Phase 7: Flat Design Cleanup - Research

**Researched:** 2026-03-05
**Domain:** CSS gap closure — scoped Vue component styles in WizardView.vue
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WIZD-05 | User sees zero box shadows on any wizard element (buttons, cards, inputs, containers) | Gap 1 (.info-section gradient/radius) and Gap 2 (.feature-item.highlight radius) are the two confirmed WIZD-05 violations from the milestone audit |
| CAMP-01 | Discount cards with flat styling (no shadow, no gradient — hover intensifies bg + scale) | Discount cards are children of .info-section; parent container gradient makes CAMP-01 only partially satisfied; fixing .info-section closes this |
| CAMP-02 | Duration selector using flat input styling (gray-100 background, no floating border) | Duration selector PrimeVue override is already flat; parent .info-section gradient/radius is the remaining violation |
| CAMP-03 | Selected venues displayed as flat chips (no shadow) | Venue chips are already flat; parent .info-section gradient is the remaining violation |
| QUOT-02 | Pricing cards using flat color block style (no box shadows, no gradient borders) | .pricing-card base is already flat (border-radius:0, box-shadow:none); .feature-item.highlight inside every card has border-radius:6px — the sole remaining violation |
</phase_requirements>

---

## Summary

Phase 7 is a surgical CSS gap-closure phase. The milestone audit (2026-03-05) identified exactly two flat design violations remaining in WizardView.vue after Phases 3-6:

1. **Gap 1 — `.info-section` container (Step 2, lines 1110-1117):** The parent wrapper for all Step 2 content (Campaign Duration, Available Discounts, Selected Venues) has `background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)` and `border-radius: 12px`. Phases 4 and 5 flattened all child elements but documented the parent as out of scope. This violates WIZD-05 and means CAMP-01, CAMP-02, CAMP-03 are only partially satisfied — child elements are flat but sit on a gradient surface.

2. **Gap 2 — `.feature-item.highlight` (Step 3, line 1483):** The highlighted feature row inside every pricing card has `border-radius: 6px`. Phase 6 flattened the outer card and badges but did not remediate this inner rule. This violates WIZD-05 and QUOT-02.

There is also a dark mode `@media` block (lines 1682-1688) that overrides `.info-section` background to `#1f2937` for dark mode — but project decisions explicitly state the flat design system is light-mode only for the wizard. That dark mode block is pre-existing and does not interfere with the flat design fix; it can remain untouched.

**Primary recommendation:** Two targeted CSS property changes in WizardView.vue `<style scoped>` block — both changes are isolated, zero-risk, and require no template or script modifications.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 scoped CSS | — | Component-isolated styles via `<style scoped>` | Project-wide pattern; prevents global pollution |
| WizardView.vue | — | Single file containing all wizard styles | All wizard CSS lives here; no separate stylesheet |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vue-tsc | — | TypeScript build validation | Run after changes to confirm no compile errors |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Targeted CSS property overrides | Extracting `.info-section` to a separate utility class | Single-file approach is consistent with project conventions; no need to refactor |

**No package installation required.** This phase is pure CSS property changes within existing scoped styles.

---

## Architecture Patterns

### File Location
```
src/
└── dialogs/wizard/
    └── WizardView.vue     # All changes are in <style scoped> block only
```

All styles are scoped inside `WizardView.vue`. No global stylesheets, no separate CSS files, no new components. This is consistent with every prior phase in v1.1.

### Pattern: Targeted property override in existing rule block
**What:** Modify specific properties within the existing CSS rule — do not create new rules or restructure the file.
**When to use:** When the rule already exists and only specific properties violate the flat design system.
**Example:**
```css
/* BEFORE (lines 1110-1117 in WizardView.vue) */
.info-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

/* AFTER */
.info-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;   /* was: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%) */
  border-radius: 0;       /* was: 12px */
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}
```

```css
/* BEFORE (line 1481-1487 in WizardView.vue) */
.feature-item.highlight {
  padding: 0.5rem;
  border-radius: 6px;
  font-weight: 600;
  border-left: 3px solid transparent;
  font-size: 0.8rem;
}

/* AFTER */
.feature-item.highlight {
  padding: 0.5rem;
  border-radius: 0;      /* was: 6px */
  font-weight: 600;
  border-left: 3px solid transparent;
  font-size: 0.8rem;
}
```

### Anti-Patterns to Avoid
- **Adding `!important`:** The existing flat design overrides in this file do not rely on `!important` for scoped rules. Don't add it here.
- **Creating new rule blocks for the same selector:** Modify the existing `.info-section` rule in-place; don't add a second `.info-section { }` block below.
- **Touching the dark mode block:** Lines 1682-1688 have a dark mode `.info-section` override with `background: #1f2937`. This pre-existing dark mode rule does not conflict with the flat design fix (project decision: wizard is light-mode only). Leave it in place.
- **Removing `.info-section:hover`:** The hover block at lines 1119-1121 only changes `border-color`. It does not add gradients or radius. Leave it untouched.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Removing gradient | JavaScript style manipulation | Direct CSS property change | Pure CSS problem; no runtime logic needed |
| Verifying zero border-radius | Computed style assertions | Visual browser check + source grep | No test framework exists; CSS source review is authoritative |

---

## Common Pitfalls

### Pitfall 1: Forgetting the dark mode `.info-section` override
**What goes wrong:** Developer sees the dark mode block at lines 1682-1688 and incorrectly adds `border-radius: 0` there too, or wonders whether to update it.
**Why it happens:** The dark mode block overrides `.info-section` background — looks like it needs matching treatment.
**How to avoid:** The dark mode block only overrides `background` and `border`. It does not set `border-radius`, so it inherits `border-radius: 0` from the base rule after the fix. No dark mode change needed.
**Warning signs:** If you find yourself editing the `@media (prefers-color-scheme: dark)` block for this phase, stop — it's not needed.

### Pitfall 2: Confusing dead CSS with live violations
**What goes wrong:** The audit also flagged `.save-quote-section` (line 1625, `border-radius: 12px`) and `.save-quote-form` (line 1631, `border-radius: 8px`) as radius violations. These classes have no corresponding template elements — they are dead CSS.
**Why it happens:** The audit logs tech debt alongside live gaps; easy to conflate them.
**How to avoid:** The success criteria for Phase 7 specifically targets `.info-section` and `.feature-item.highlight`. The dead `.save-quote-*` CSS is tech debt noted in the audit but not in scope for this phase.
**Warning signs:** If you're editing `.save-quote-section` or `.save-quote-form`, you've gone out of scope.

### Pitfall 3: Choosing wrong flat background color for `.info-section`
**What goes wrong:** Replacing the gradient with `white` (#ffffff) instead of `#f9fafb` — creates a subtle visual shift where the section no longer reads as slightly separated from the white wizard background.
**Why it happens:** "Flat = white" instinct.
**How to avoid:** Use `#f9fafb` (gray-50) — the start color of the existing gradient. This is the lightest value in the gradient, so it maintains the intended light gray panel look. The audit's suggested fix confirms: `background: #f9fafb`.

### Pitfall 4: Line number drift
**What goes wrong:** Line numbers from the audit (1110-1117 for `.info-section`, 1483 for `.feature-item.highlight`) may not be exact if other changes were made after the audit.
**Why it happens:** The audit was taken on a snapshot; subsequent commits may have shifted lines.
**How to avoid:** Use grep/search for the selector names (`.info-section {` and `.feature-item.highlight {`), not line numbers, to locate the rules.

---

## Code Examples

### Gap 1 — Current state (confirmed via live source grep)
```css
/* Source: WizardView.vue <style scoped>, ~line 1110 */
.info-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);  /* VIOLATION */
  border-radius: 12px;                                               /* VIOLATION */
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}
```

### Gap 1 — Target state
```css
.info-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}
```

### Gap 2 — Current state (confirmed via live source grep)
```css
/* Source: WizardView.vue <style scoped>, ~line 1481 */
.feature-item.highlight {
  padding: 0.5rem;
  border-radius: 6px;   /* VIOLATION */
  font-weight: 600;
  border-left: 3px solid transparent;
  font-size: 0.8rem;
}
```

### Gap 2 — Target state
```css
.feature-item.highlight {
  padding: 0.5rem;
  border-radius: 0;
  font-weight: 600;
  border-left: 3px solid transparent;
  font-size: 0.8rem;
}
```

### Post-change grep verification command
```bash
# Should return zero results after changes
grep -n "linear-gradient\|border-radius: 12px\|border-radius: 6px" src/dialogs/wizard/WizardView.vue
# Acceptable remaining results: border-radius: 50% (on .pricing-circle decorators — intentional circles)
#                               border-radius: 0 (correct flat values)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Gradient card containers | Flat solid-color containers | Phase 3 established baseline; Phase 7 closes gap | Consistent flat design system throughout all 3 steps |
| Rounded highlight rows | Sharp-cornered highlight rows | Phase 7 | All pricing card internals match outer card flat treatment |

**Deprecated/outdated in this phase:**
- `linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)` on `.info-section`: replaced with `#f9fafb`
- `border-radius: 12px` on `.info-section`: replaced with `0`
- `border-radius: 6px` on `.feature-item.highlight`: replaced with `0`

---

## Open Questions

1. **Should the dark mode `.info-section` block be cleaned up too?**
   - What we know: Project decision is wizard is light-mode only; dark mode wizard styles are present but inconsistent with the flat design system decision
   - What's unclear: Whether removing the dark mode block is in scope for Phase 7 or a separate cleanup task
   - Recommendation: Leave the dark mode block untouched in Phase 7. It's tech debt, not a flat design violation. The audit categorizes it as separate from the gap closure items.

2. **Should dead CSS (`.save-quote-section`, `.save-quote-form`) be removed?**
   - What we know: These classes have no template elements; audit lists them as tech debt; they contain `border-radius` values
   - What's unclear: Whether removing dead CSS is in scope for Phase 7
   - Recommendation: Out of scope for Phase 7. The success criteria is specific to `.info-section` and `.feature-item.highlight`. Dead CSS removal is separate tech debt.

---

## Validation Architecture

> nyquist_validation is enabled in .planning/config.json

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — no test framework installed |
| Config file | None |
| Quick run command | `npm run build` (TypeScript compilation via vue-tsc) |
| Full suite command | `npm run build` |

No automated test framework exists in this project (confirmed by TESTING.md and absence of test files). The established validation pattern for prior phases has been visual browser inspection + grep verification of CSS source.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | Notes |
|--------|----------|-----------|-------------------|-------|
| WIZD-05 | Zero box shadows AND no gradients/non-zero radius on wizard elements | manual-only | `grep -n "linear-gradient\|border-radius: [^0]" src/dialogs/wizard/WizardView.vue` | CSS source grep is the automated check; visual confirmation in browser for final sign-off |
| CAMP-01 | Discount cards on flat (non-gradient) surface | manual-only | Same grep command above | Verified by absence of gradient on .info-section parent |
| CAMP-02 | Duration selector on flat surface | manual-only | Same grep command above | Verified by absence of gradient on .info-section parent |
| CAMP-03 | Venue chips on flat surface | manual-only | Same grep command above | Verified by absence of gradient on .info-section parent |
| QUOT-02 | Pricing cards fully flat including highlight rows | manual-only | `grep -n "border-radius" src/dialogs/wizard/WizardView.vue` | Check only `border-radius: 50%` (circles) and `border-radius: 0` remain |

### Sampling Rate
- **Per task commit:** `npm run build` — confirms TypeScript compiles cleanly
- **Per wave merge:** `npm run build` + visual browser check of Step 2 and Step 3
- **Phase gate:** Both grep verifications pass + visual sign-off before `/gsd:verify-work`

### Wave 0 Gaps
None — no new test infrastructure needed. This phase requires only source grep verification and visual browser inspection, consistent with all prior phases.

---

## Sources

### Primary (HIGH confidence)
- Direct source read of `src/dialogs/wizard/WizardView.vue` — live CSS confirmed via grep (lines ~1110-1117, ~1481-1487)
- `.planning/v1.1-MILESTONE-AUDIT.md` — authoritative gap documentation with exact line references and fix recommendations
- `.planning/REQUIREMENTS.md` — requirement definitions and traceability table
- `.planning/STATE.md` — project decisions log confirming flat design system scope
- `.planning/codebase/CONVENTIONS.md` — confirmed scoped style convention and single-file pattern

### Secondary (MEDIUM confidence)
- `.planning/ROADMAP.md` — Phase 7 success criteria and dependency confirmation

### Tertiary (LOW confidence)
None — all findings sourced from direct code inspection.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — confirmed by direct source inspection; no new libraries
- Architecture: HIGH — two-property CSS change in existing scoped rules; file structure well-understood from prior phases
- Pitfalls: HIGH — sourced directly from milestone audit findings and prior-phase decision log

**Research date:** 2026-03-05
**Valid until:** Indefinite — this research targets specific line content in a file that only changes when edited

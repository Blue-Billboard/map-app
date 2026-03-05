---
phase: 7
slug: flat-design-cleanup
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test framework installed |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build` + visual browser check of Step 2 and Step 3
- **Before `/gsd:verify-work`:** Both grep verifications pass + visual sign-off
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 7-01-01 | 01 | 1 | WIZD-05, CAMP-01, CAMP-02, CAMP-03 | manual | `grep -n "linear-gradient\|border-radius: 12px" src/dialogs/wizard/WizardView.vue` | N/A | ⬜ pending |
| 7-01-02 | 01 | 1 | WIZD-05, QUOT-02 | manual | `grep -n "border-radius: 6px" src/dialogs/wizard/WizardView.vue` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test infrastructure needed — source grep verification and visual browser inspection are the validation methods for this CSS-only phase, consistent with all prior v1.1 phases.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `.info-section` has flat background (no gradient) | WIZD-05, CAMP-01, CAMP-02, CAMP-03 | No test framework; CSS source grep is authoritative | Run: `grep -n "linear-gradient" src/dialogs/wizard/WizardView.vue` — expect 0 results |
| `.info-section` has `border-radius: 0` | WIZD-05 | No test framework; CSS source grep is authoritative | Run: `grep -n "border-radius" src/dialogs/wizard/WizardView.vue` — only `border-radius: 50%` (circles) and `border-radius: 0` should remain |
| `.feature-item.highlight` has `border-radius: 0` | WIZD-05, QUOT-02 | No test framework; CSS source grep is authoritative | Same grep as above |
| Visual: Step 2 info panel renders flat in browser | CAMP-01, CAMP-02, CAMP-03 | Visual regression only | Open wizard Step 2 in browser, confirm `.info-section` has no visible gradient or rounded corners |
| Visual: Step 3 pricing highlight rows render flat | QUOT-02 | Visual regression only | Open wizard Step 3 in browser, confirm `.feature-item.highlight` rows have square corners |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

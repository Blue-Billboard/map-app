---
phase: 2
slug: premium-pins
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-01
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None installed — no vitest, jest, or test scripts in package.json |
| **Config file** | None — Wave 0 installs grep-based checks |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build` + grep checks below
- **Before `/gsd:verify-work`:** Full grep suite green + human visual approval of pin variants
- **Max feedback latency:** ~5 seconds (build) + manual visual check

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | CODE-01 | grep | `grep 'levelColour' src/App.vue \| grep -v 'import\|const {levelColour}' \| wc -l \| grep -q '^0$' && echo "PASS"` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 1 | CODE-02 | grep | `grep -q 'levelColour' src/composables/useVenueList.ts && echo "PASS"` | ❌ W0 | ⬜ pending |
| 2-01-03 | 01 | 1 | PINS-02 | grep | `grep -q 'customcolor_icon_transparent_background.png' src/App.vue && echo "PASS"` | ❌ W0 | ⬜ pending |
| 2-01-04 | 01 | 2 | PINS-03 | grep | `grep -n 'marker-pin' src/styles/index.css \| grep -q 'background' && echo "PASS"` | ❌ W0 | ⬜ pending |
| 2-01-05 | 01 | 2 | PINS-05 | grep | `grep -q 'custom-div-icon:hover' src/styles/index.css && echo "PASS"` | ❌ W0 | ⬜ pending |
| 2-01-06 | 01 | 2 | PINS-06 | grep | `grep -A3 'prefers-color-scheme: dark' src/styles/index.css \| grep -q 'marker-pin' && echo "PASS"` | ❌ W0 | ⬜ pending |
| 2-01-07 | 01 | 2 | PINS-01 | grep | `grep -n 'levelColour' src/App.vue \| grep -v 'import\|levelColour}' \| grep 'divIcon\|marker-pin\|background' \| wc -l \| grep -q '^0$' && echo "PASS"` | ❌ W0 | ⬜ pending |
| 2-02-01 | 02 | 3 | PINS-04 | manual | Visual browser test: `npm run dev` then visit `/?variant=b` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Grep verification commands documented above (no files to create — commands are inline)
- [ ] `npm run build` confirmed working (TypeScript compile check)

*Note: No test framework installation required — all automated checks are grep-based and work immediately.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Pin variant visual approval | PINS-04 | Must be seen in real browser over actual map tiles | Start `npm run dev`, visit `/?variant=b`, compare A vs B on real Stadia tiles in both light and dark mode |
| Pin premium appearance | PINS-03 | Aesthetic quality requires human judgment | Visual check: do pins look premium/clean against Stadia Alidade Smooth tiles? |
| Dark mode pin appearance | PINS-06 | CSS media query behavior requires browser verification | Toggle system dark mode, check pin colors adapt correctly |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

---
phase: 1
slug: map-tiles
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-01
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no automated test framework in project |
| **Config file** | none |
| **Quick run command** | `grep -r 'map-tiles-filter\|invert.*hue-rotate' src/` (should return 0 matches) |
| **Full suite command** | Manual browser verification (see Manual-Only section) |
| **Estimated runtime** | ~5 seconds for grep check |

---

## Sampling Rate

- **After every task commit:** Run `grep -r 'map-tiles-filter' src/` — confirm CSS hack not reintroduced
- **After every plan wave:** Manual browser verification in light and dark OS modes
- **Before `/gsd:verify-work`:** All 4 requirements verified manually
- **Max feedback latency:** 5 seconds (grep)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| CSS cleanup | 01 | 1 | TILES-03 | grep | `grep -r 'map-tiles-filter' src/` → 0 matches | ✅ | ⬜ pending |
| Tile init | 01 | 1 | TILES-01, TILES-02 | manual-only | n/a | n/a | ⬜ pending |
| Scheme switch | 01 | 1 | TILES-04 | manual-only | n/a | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No test framework installation needed — this phase is visual/browser-behavior only. The one automatable check (TILES-03) uses a grep command.

*Existing grep-based verification covers all automated requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Light mode shows Alidade Smooth (soft pastel) | TILES-01 | Visual tile rendering | Open app in light OS mode, verify pastel minimal map tiles |
| Dark mode shows Alidade Smooth Dark | TILES-02 | Visual tile rendering | Switch OS to dark mode, verify dark base map (not inverted colors) |
| Tile layer switches without page reload | TILES-04 | Requires OS-level color scheme toggle | While app is open, toggle OS appearance in System Settings → map tiles should swap |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: grep check after each commit
- [x] Wave 0 covers all MISSING references (none needed)
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

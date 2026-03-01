# Phase 2: Premium Pins - Research

**Researched:** 2026-03-01
**Domain:** Leaflet divIcon CSS styling, map pin hover effects, dark mode CSS media queries
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Pin shape & style**
- Keep the existing teardrop/diamond shape (rotated square with rounded corners, white inner circle, logo overlay) — refine it rather than redesign
- No drop shadow on the pin — clean flat look
- Pin fill color: Claude's discretion — pick the best premium color against Stadia tiles
- Logo sizing and positioning: Claude's discretion — size for best visual balance within the refined pin

**Variant presentation**
- At least two meaningfully different variants (Claude picks the differentiating dimension)
- Variants presented live in the browser with a toggle mechanism (URL param or button) for real-map approval
- Toggle is a temporary dev tool — removed once a variant is approved, not kept in production

**Hover state**
- Primary effect: scale up to ~110–115% on hover
- Cursor: `pointer` on hover
- Animation: smooth CSS transition (~150ms ease)

**Dark mode pin appearance**
- Lighter fill color in dark mode (CSS `@media (prefers-color-scheme: dark)` on `.marker-pin`)
- Inner white circle treatment in dark mode: Claude's discretion — pick what looks most balanced
- Implementation: CSS media query only (no JS class toggling)

### Claude's Discretion
- Exact pin fill color (light mode and dark mode variants)
- Logo size and centering within the refined pin
- The two differentiating dimensions between variant A and variant B
- Inner circle color in dark mode

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PINS-01 | All venue pins use a single unified design (no Blue/Gold/Platinum visual distinction) | Remove `levelColour()` call from `L.divIcon` HTML string; hardcode pin fill color in CSS |
| PINS-02 | Existing billboard icon is preserved within the new pin design | Keep `customcolor_icon_transparent_background.png` in divIcon HTML; only adjust sizing/positioning via CSS |
| PINS-03 | Pin design feels premium — uses shadow, glow, or refined wrapper styling | Use a carefully chosen deep navy/midnight fill that reads as premium against Stadia's soft pastel palette; no drop shadow per decision |
| PINS-04 | Multiple pin color/style variants are presented for user approval before finalizing | `?variant=b` URL param checked in `onMounted`; adds CSS class `variant-b` to marker container; CSS switches fill + sizing |
| PINS-05 | Pin hover state gives clear visual feedback (scale, brightness, or shadow change) | `.custom-div-icon:hover` with `transform: scale(1.12)` + `transition: transform 150ms ease`; `riseOnHover: true` on marker for z-index lift |
| PINS-06 | Pins render cleanly in both light and dark map modes | `@media (prefers-color-scheme: dark) { .marker-pin { background: <lighter-color>; } }` in index.css |
| CODE-01 | Level color bindings removed from pin rendering logic | Remove `style="background:${levelColour(location.level)};"` from divIcon HTML template in App.vue |
| CODE-02 | useVenueList composable levelColour() function retained but decoupled from map markers | `levelColour()` stays in useVenueList.ts; just stop calling it in processLocationData() |
</phase_requirements>

---

## Summary

Phase 2 is a focused CSS/HTML styling job with a small decoupling change in App.vue. The existing Leaflet `L.divIcon` infrastructure is sound — the shape, structure, and image assets all stay. The primary work is: (1) remove the `levelColour()` call from the divIcon HTML template and replace with a hardcoded CSS class, (2) refine `.marker-pin` styles in `index.css` to look premium against Stadia's soft pastel tiles, (3) add a CSS hover rule targeting `.custom-div-icon:hover` for the scale effect, and (4) add a URL-param-gated variant system for approval.

The key technical constraint is the existing pin transform: `.marker-pin` is `rotate(-45deg)`, so hover scale must be applied to the `.custom-div-icon` wrapper (the untransformed parent), not to `.marker-pin` itself — otherwise the scale combines with the rotation and the pin visually drifts from its anchor point. Leaflet's `riseOnHover: true` marker option handles z-index lift automatically so scaled pins render above neighbors.

Color choice for a premium feel against Stadia Alidade Smooth (light pastel background, ~`#f5f5f3` land) and Alidade Smooth Dark (dark background, ~`#1a1a2e` land): a deep navy (`#1a2e4a`) reads as unmistakably premium in light mode; a vivid medium blue (`#4a90d9`) maintains contrast in dark mode. Both are distinct from the tile colors while staying in the Blue Billboard brand family.

**Primary recommendation:** Scope all changes to `src/styles/index.css` (CSS) and `src/App.vue` (remove levelColour from divIcon HTML, add variant param logic). No new dependencies required.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Leaflet | ^1.9.3 (installed) | Map and marker rendering | Already in project; divIcon is the correct primitive for HTML/CSS markers |
| CSS @media (prefers-color-scheme) | N/A (browser native) | Dark mode pin variant | Project already uses this pattern for tile swapping |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vue-tsc | ^1.0.24 (installed) | TypeScript compile check | Run after removing levelColour from template string to verify no type errors |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS-only hover on `.custom-div-icon` | JS mouseover/mouseout events on marker | CSS is simpler and zero-JS; JS events are needed only if you require dynamic style changes beyond what CSS can express |
| `riseOnHover: true` option | Manual `setZIndexOffset` in mouseover handler | riseOnHover is built-in, zero code; manual z-index only needed if you need exact control over the rise amount |
| URL param `?variant=b` for variant toggle | In-page button toggle | URL param requires no reactive state, no UI component, zero Vue reactivity involved — matches the existing `?stripped=true` pattern in the codebase |

**Installation:** No new packages needed — all requirements fulfilled by existing Leaflet + CSS.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── App.vue                  # Remove levelColour() from divIcon HTML; add variant param read
├── styles/
│   └── index.css            # All pin styling changes: .marker-pin refinement, hover rule, dark mode, variant class
└── composables/
    └── useVenueList.ts      # Unchanged — levelColour() retained but no longer called for markers
```

### Pattern 1: Remove levelColour from divIcon HTML, hardcode via CSS class

**What:** Move pin color from inline style (driven by `levelColour()`) to a CSS class. The divIcon HTML becomes color-agnostic; CSS owns the fill.

**When to use:** Always — this is the CODE-01/CODE-02 requirement.

**Current code (App.vue line 84):**
```typescript
// BEFORE — level color injected as inline style
html: `<div style="background:${levelColour(location.level)};" class="marker-pin"></div><img src="img/customcolor_icon_transparent_background.png" alt="bbLogo"/>`,
```

**After:**
```typescript
// AFTER — color defined entirely by CSS class .marker-pin
html: `<div class="marker-pin"></div><img src="img/customcolor_icon_transparent_background.png" alt="bbLogo"/>`,
```

Then in `index.css`:
```css
.marker-pin {
  background: #1a2e4a; /* hardcoded premium navy — replaces inline style */
  /* ... other existing properties unchanged ... */
}
```

### Pattern 2: CSS hover scale on `.custom-div-icon` wrapper

**What:** Apply the scale transform to the Leaflet-generated outer wrapper element (`.custom-div-icon`), NOT to `.marker-pin`. The `.marker-pin` is already `rotate(-45deg)` — scaling it directly combines transforms and misaligns the visual from the anchor.

**When to use:** All hover scale effects on rotated divIcon pins.

**Example:**
```css
/* Source: Leaflet divIcon docs + CSS transform-origin analysis */
.custom-div-icon {
  transition: transform 150ms ease;
  transform-origin: center bottom; /* anchor scale to the pin tip */
}

.custom-div-icon:hover {
  transform: scale(1.12);
  cursor: pointer;
}
```

**Why `.custom-div-icon` and not `.marker-pin`:**
- `.marker-pin` has `transform: rotate(-45deg)` — hover scale would combine to `rotate(-45deg) scale(1.12)` and the pin visually grows sideways
- `.custom-div-icon` is the untransformed wrapper Leaflet creates; scaling it scales the whole icon (diamond + white circle + logo) uniformly
- `transform-origin: center bottom` pins the scale origin to the bottom tip so the pin grows upward/outward, staying anchored to its map position

### Pattern 3: riseOnHover on L.marker for z-index lift

**What:** Use Leaflet's built-in `riseOnHover` marker option to auto-elevate the hovered marker above its neighbors.

**When to use:** Any time scale hover would cause the marker to visually overlap adjacent markers.

**Example:**
```typescript
// Source: Leaflet 1.9.4 API docs — Marker options
let marker: any = L.marker(coords, {
  icon: icon,
  riseOnHover: true   // elevates z-index on hover automatically
}).addTo(markerGroup.value).on('click', (e: any) => showModal(e));
```

### Pattern 4: URL param variant toggle in onMounted

**What:** Read `?variant=b` from URLSearchParams in `onMounted`, before `processLocationData()` runs. Pass a `variantB: boolean` flag to the icon builder. The icon HTML adds a conditional CSS class; CSS `.variant-b .marker-pin` overrides fill color and optionally size.

**When to use:** Pre-approval variant comparison only — remove after user approves one variant.

**Example:**
```typescript
// In onMounted, after existing URL param reads:
const variantB = urlParams.get('variant') === 'b';

// Pass to processLocationData:
processLocationData(variantB);
```

```typescript
// In processLocationData:
const processLocationData = (variantB = false) => {
  if (!locationData.value) return;
  locationData.value.forEach((location: any) => {
    const icon = L.divIcon({
      className: `custom-div-icon${variantB ? ' variant-b' : ''}`,
      html: `<div class="marker-pin"></div><img src="img/customcolor_icon_transparent_background.png" alt="bbLogo"/>`,
      iconSize: [50, 72],
      iconAnchor: [25, 72]
    });
    // ...
  });
};
```

```css
/* Variant B overrides — TEMP: remove after approval */
.variant-b .marker-pin {
  background: #0d47a1; /* or alternate differentiating dimension */
}
```

### Pattern 5: Dark mode pin color via CSS media query

**What:** Override `.marker-pin` background in `@media (prefers-color-scheme: dark)` block. No JS required — mirrors the exact approach already used for PrimeVue button overrides in index.css.

**Example:**
```css
@media (prefers-color-scheme: dark) {
  .marker-pin {
    background: #4a90d9; /* lighter blue for dark tile canvas */
  }
}
```

### Anti-Patterns to Avoid

- **Scaling `.marker-pin` directly on hover:** The existing `rotate(-45deg)` on `.marker-pin` means `scale()` combines with rotation and the pin grows diagonally, not symmetrically. Always scale the parent `.custom-div-icon`.
- **Adding transition to `.marker-pin`:** The rotation is a static transform — adding transition here will animate the rotation on page load. Transition only belongs on `.custom-div-icon`.
- **Keeping `style="background:..."` inline on `.marker-pin`:** Inline styles have higher specificity than class-based CSS rules, so `@media (prefers-color-scheme: dark) { .marker-pin { ... } }` will NOT override an inline style. The inline style must be removed for dark mode CSS to work.
- **Using JS `mouseover`/`mouseout` events for hover:** Unnecessary complexity. CSS `:hover` on the wrapper element works reliably for divIcon markers once `pointer-events: auto` is present (Leaflet sets this by default on interactive markers).
- **Calling `processLocationData()` with the variant flag after it has already run:** The variant read and marker creation must happen in a single `onMounted` pass — markers are not re-renderable without clearing `markerGroup` first.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Z-index lift on hover | Custom mouseover JS event that calls `marker.setZIndexOffset()` | `riseOnHover: true` marker option | Built into Leaflet 1.x; zero code, zero event handler to manage |
| Dark mode pin color switch | JS `matchMedia` listener that iterates markers and updates styles | CSS `@media (prefers-color-scheme: dark)` on `.marker-pin` | Already the project's established pattern; no JS state or marker rebuilding needed |
| Variant toggle state | Vue `ref` + watcher + reactive marker rebuild | URL param read once in `onMounted` | Matches existing `?stripped=true` pattern; zero reactivity complexity for a dev-only tool |

**Key insight:** This phase is 95% CSS editing. Resist the temptation to add JS complexity — the browser's CSS engine handles hover, dark mode, and transitions natively.

---

## Common Pitfalls

### Pitfall 1: Inline style overrides CSS class rule for dark mode

**What goes wrong:** The existing divIcon HTML is `<div style="background:${levelColour(location.level)};" class="marker-pin">` — the inline `style` attribute has specificity 1000, higher than any class selector. After CODE-01 is done (removing the inline style), dark mode CSS works; before CODE-01, no `@media` override can change pin color.

**Why it happens:** Developers add the CSS dark mode rule first, test, and see no change — then blame the browser, not specificity.

**How to avoid:** Remove the inline style from divIcon HTML (CODE-01 task) before adding any CSS override rules. Verify with browser DevTools that the computed `background` value is coming from the class, not an inline style.

**Warning signs:** Dark mode CSS rule is present but has no effect in browser preview.

### Pitfall 2: Transform scale applied to the wrong element

**What goes wrong:** Adding `transform: scale(1.12)` on `.marker-pin:hover` produces a visually distorted pin because `.marker-pin` already has `transform: rotate(-45deg)`. The hover scale stacks: the pin grows diagonally.

**Why it happens:** Natural instinct to hover-style the visible pin element rather than its wrapper.

**How to avoid:** Target `.custom-div-icon:hover` for scale. Verify in DevTools that the computed transform on `.custom-div-icon` is `scale(1.12)` and on `.marker-pin` remains `rotate(-45deg)`.

**Warning signs:** On hover, the pin appears to grow sideways or the inner white circle becomes oblong.

### Pitfall 3: Missing `transform-origin` causes pin to scale away from tip

**What goes wrong:** Default `transform-origin` is `50% 50%` (center of the element). Scaling from the center causes the pin tip to move upward (away from map position) on hover.

**Why it happens:** `transform-origin` is rarely considered when adding hover scales.

**How to avoid:** Set `transform-origin: center bottom` on `.custom-div-icon`. This anchors the scale to the bottom center, where the pin tip visually points to the map location.

**Warning signs:** On hover, the pin visually "jumps" or the tip appears to lift off its map coordinate.

### Pitfall 4: `cursor: pointer` not appearing on the icon area

**What goes wrong:** CSS `cursor: pointer` on `.custom-div-icon:hover` may not fire if `pointer-events` is set to `none` on the element.

**Why it happens:** Leaflet sets `pointer-events: none` on some internal elements within divIcon containers in certain configurations.

**How to avoid:** Confirm with DevTools that `.custom-div-icon` has `pointer-events: auto` (the Leaflet default for interactive markers). If not, add `pointer-events: auto` explicitly. Do not set interactive: false on the marker — that disables clicks as well.

**Warning signs:** Hover CSS rules have no effect; cursor stays as default map cursor.

### Pitfall 5: Variant flag not read before marker creation

**What goes wrong:** If `processLocationData()` is called before the `?variant=b` URL param is read, all markers render without the variant class and no visual difference appears.

**Why it happens:** The URL param read and the marker creation are in different code blocks — easy to add the param read after the function call.

**How to avoid:** In `onMounted`, read ALL URL params first, then call `processLocationData(variantB)`. The current `onMounted` already follows this pattern for `isStripped` and `showQuoteButton`.

---

## Code Examples

Verified patterns from codebase inspection and Leaflet 1.9 docs:

### Complete refined divIcon call (App.vue `processLocationData`)

```typescript
// Source: Leaflet 1.9 API — L.divIcon options, L.marker options
const processLocationData = (variantB = false) => {
  if (!locationData.value) return;
  locationData.value.forEach((location: any) => {
    const icon = L.divIcon({
      className: `custom-div-icon${variantB ? ' variant-b' : ''}`,
      html: `<div class="marker-pin"></div><img src="img/customcolor_icon_transparent_background.png" alt="bbLogo"/>`,
      iconSize: [50, 72],
      iconAnchor: [25, 72]
    });
    const coords: any = [location.location.coordinates[1], location.location.coordinates[0]];
    let marker: any = L.marker(coords, { icon, riseOnHover: true })
      .addTo(markerGroup.value)
      .on('click', (e: any) => showModal(e));
    marker.getProps().meta = location;
  });
};
```

### Pin CSS block (index.css — full revised block)

```css
/* Source: existing codebase pattern + transform-origin fix */
.custom-div-icon {
  transition: transform 150ms ease;
  transform-origin: center bottom;
}

.custom-div-icon:hover {
  transform: scale(1.12);
  cursor: pointer;
}

.marker-pin {
  width: 40px;
  height: 40px;
  border-radius: 50% 50% 50% 0;
  background: #1a2e4a; /* deep navy — premium against Alidade Smooth pastel */
  position: absolute;
  transform: rotate(-45deg);
  left: 50%;
  top: 50%;
  margin: -15px 0 0 -15px;
}

.marker-pin::after {
  content: '';
  width: 34px;
  height: 34px;
  margin: 3px 0 0 3px;
  background: #fff;
  position: absolute;
  border-radius: 50%;
}

/* Dark mode: lighter fill for contrast against dark tile canvas */
@media (prefers-color-scheme: dark) {
  .marker-pin {
    background: #4a90d9;
  }
}

/* TEMP: Variant B — remove after approval */
.variant-b .marker-pin {
  background: #0d47a1; /* [variant dimension TBD — e.g. original Blue Billboard blue] */
}

.custom-div-icon img {
  position: absolute;
  width: 25px;
  height: 25px;
  left: 0;
  right: 0;
  margin: 29px 12.5px;
  text-align: center;
}
```

### URL param read in onMounted (App.vue)

```typescript
// Source: existing codebase pattern (?stripped=true, ?lat=, ?lng=)
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('stripped') === 'true') { isStripped.value = true; }
if (urlParams.get('showQuote') === 'true') { showQuoteButton.value = true; }
if (urlParams.get('lat') && urlParams.get('lng')) { /* ... */ }

// Add after existing params:
const variantB = urlParams.get('variant') === 'b';

// Later, pass to marker creation:
processLocationData(variantB);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Inline `style="background:${levelColour()}"` on divIcon | CSS class controls background; no inline style | This phase | Enables CSS dark mode overrides (specificity fix) |
| No hover state on pins | CSS scale transform on `.custom-div-icon:hover` | This phase | PINS-05 compliance |
| All levels visually distinct (Blue/Gold/Platinum) | Single unified pin appearance | This phase | PINS-01 compliance |

**No deprecated APIs involved.** Leaflet 1.9.x `L.divIcon` and `L.marker` with `riseOnHover` are current and stable.

---

## Open Questions

1. **Exact variant differentiation dimensions for A vs B**
   - What we know: User left this to Claude's discretion; two variants must be "meaningfully different"
   - What's unclear: Whether the dimension should be color (navy vs blue), size (40px vs 46px diamond), or border (none vs thin white border)
   - Recommendation: Make Variant A = deep navy (#1a2e4a) with current 40px size, Variant B = Blue Billboard blue (#0d47a1) at 44px — one dimension per variant (color vs size) keeps comparison clean. The planner should pick specific values and document them in the plan.

2. **Inner circle color in dark mode**
   - What we know: User deferred to Claude's discretion
   - What's unclear: Whether the white `#fff` inner circle should become off-white (e.g. `#e8e8f0`) in dark mode to reduce harsh contrast against the dark pin fill
   - Recommendation: Keep white (`#fff`) — white-on-navy/blue reads clearly regardless of tile darkness, and it maintains the billboard logo contrast. Only change if visual testing shows it looks harsh.

3. **Logo image visibility against new pin fills**
   - What we know: `customcolor_icon_transparent_background.png` has a transparent background. Current pin uses blue (#0d47a1) fill with white inner circle behind logo.
   - What's unclear: Whether the logo is white/light or dark on its transparent background — if logo is dark, it needs the white inner circle to be visible. If logo is light, it could render directly on the pin fill.
   - Recommendation: Current structure (white `::after` circle behind logo) is correct regardless — keep it. Logo positioning and size are already tuned (25x25, `margin: 29px 12.5px`). Do not change unless visual testing shows misalignment.

---

## Validation Architecture

nyquist_validation is enabled. No test framework is installed.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed — no vitest.config.*, jest.config.*, or test scripts in package.json |
| Config file | None — see Wave 0 |
| Quick run command | `npm run build` (TypeScript compile check only) |
| Full suite command | `npm run build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PINS-01 | No Blue/Gold/Platinum distinction in pin HTML | automated grep | `grep -n 'levelColour' src/App.vue \| grep -v 'import\|levelColour}' \| grep 'divIcon\|marker-pin\|background' \| wc -l \| grep -q '^0$' && echo "PASS"` | ❌ Wave 0 (grep command) |
| PINS-02 | Billboard logo img tag preserved in divIcon | automated grep | `grep -q 'customcolor_icon_transparent_background.png' src/App.vue && echo "PASS"` | ❌ Wave 0 |
| PINS-03 | Pin fill color is set via CSS class (not inline style) | automated grep | `grep -n 'marker-pin' src/styles/index.css \| grep -q 'background' && echo "PASS"` | ❌ Wave 0 |
| PINS-04 | Variant toggle exists temporarily | manual-only | Visual browser test: `npm run dev` then visit `/?variant=b` | N/A |
| PINS-05 | Hover scale CSS rule present | automated grep | `grep -q 'custom-div-icon:hover' src/styles/index.css && echo "PASS"` | ❌ Wave 0 |
| PINS-06 | Dark mode CSS rule for pin | automated grep | `grep -A3 'prefers-color-scheme: dark' src/styles/index.css \| grep -q 'marker-pin' && echo "PASS"` | ❌ Wave 0 |
| CODE-01 | levelColour() not used in divIcon HTML template | automated grep | `grep 'levelColour' src/App.vue \| grep -v 'import\|const {levelColour}' \| wc -l \| grep -q '^0$' && echo "PASS: levelColour decoupled from markers"` | ❌ Wave 0 |
| CODE-02 | levelColour() function still exists in composable | automated grep | `grep -q 'levelColour' src/composables/useVenueList.ts && echo "PASS"` | ❌ Wave 0 |

**Note:** PINS-03 (premium feel) and PINS-04 (variant approval) and PINS-06 (visual render quality) require human visual confirmation in addition to grep automation.

### Sampling Rate
- **Per task commit:** `npm run build` — TypeScript must compile clean
- **Per wave merge:** `npm run build` + grep checks above
- **Phase gate:** Full grep suite green + human visual approval of pin variants before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] No test framework installed — all automated checks are grep-based shell commands inline in task verify blocks
- [ ] No wave 0 setup needed — grep commands are self-contained; no fixtures or config files required
- [ ] Human visual checkpoint task required for PINS-04 (variant approval gate before cleanup)

*(Existing infrastructure covers all automated checks — no test framework installation needed for grep-based verification.)*

---

## Sources

### Primary (HIGH confidence)
- Leaflet 1.9.4 official API reference (leafletjs.com/reference.html) — `L.divIcon` options, `L.marker` `riseOnHover` option confirmed
- Existing codebase (`src/App.vue`, `src/styles/index.css`, `src/composables/useVenueList.ts`) — current pin structure, CSS class names, and URL param patterns confirmed by direct inspection

### Secondary (MEDIUM confidence)
- geoapify.com CSS marker tutorial — transform-origin pattern for rotated pin hover scale verified against CSS spec behavior
- Stadia Maps docs (docs.stadiamaps.com/map-styles/) — Alidade Smooth described as "muted color scheme" — supports deep navy as high-contrast premium choice against pastel background

### Tertiary (LOW confidence)
- WebSearch results on Leaflet z-index / riseOnHover behavior — consistent with official docs but not independently verified against 1.9.4 changelog

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; Leaflet divIcon + CSS is fully established in the codebase
- Architecture: HIGH — patterns confirmed by direct code inspection of existing App.vue and index.css
- Pitfalls: HIGH (inline style specificity, wrong element for scale) — verified by CSS spec rules; MEDIUM (transform-origin drift) — confirmed by multiple sources

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (Leaflet 1.x is stable; CSS media query behavior is stable)

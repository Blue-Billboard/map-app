# Phase 1: Map Tiles - Research

**Researched:** 2026-03-01
**Domain:** Leaflet tile layer management, Stadia Maps raster tiles, JavaScript dark mode detection
**Confidence:** HIGH

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TILES-01 | Light mode displays Stadia Maps Alidade Smooth tile layer | Stadia tile URL confirmed: `alidade_smooth/{z}/{x}/{y}{r}.png` |
| TILES-02 | Dark mode displays Stadia Maps Alidade Smooth Dark tile layer | Stadia tile URL confirmed: `alidade_smooth_dark/{z}/{x}/{y}{r}.png` |
| TILES-03 | CSS invert filter hack removed from dark mode implementation | Exact CSS to remove identified in `src/styles/index.css` lines 92–105 |
| TILES-04 | Tile layer switches correctly when system color scheme changes | `MediaQueryList.addEventListener('change', ...)` pattern verified |
</phase_requirements>

---

## Summary

Phase 1 upgrades the map tile provider from OpenStreetMap Hot tiles to Stadia Maps premium raster tiles, replacing a CSS invert hack with real dark/light tile layers. The current implementation uses a single OSM tile URL for both modes and applies a CSS filter (`invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)`) via the `.map-tiles` class in dark mode — this produces an ugly color-shifted map that fails the "premium" bar.

The solution is straightforward: replace the single `L.tileLayer()` call with two named tile layer references (one for light, one for dark), initialize the correct one based on `window.matchMedia('(prefers-color-scheme: dark)').matches`, then add a `change` event listener on that MediaQueryList to swap tile layers at runtime when the OS color scheme changes. No new npm dependencies are needed — this is pure Leaflet and browser API work.

Stadia Maps tiles work on localhost without any API key. For production, domain-based authentication is required: register the app's domain in the Stadia Maps dashboard (no code changes needed, just a dashboard configuration). The correct attribution string must include Stadia Maps, OpenMapTiles, and OpenStreetMap credits.

**Primary recommendation:** Add two `L.tileLayer` instances in `onMounted`, attach the appropriate one based on initial dark mode state, wire a `matchMedia.addEventListener('change', ...)` to swap them, and delete the CSS invert filter block from `src/styles/index.css` and the `--map-tiles-filter` CSS variable.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| leaflet | 1.9.3 (already installed) | Tile layer management | Already in project; `L.tileLayer` and `layer.remove()` handle all tile swapping needs |
| Stadia Maps raster tiles | CDN (no npm package) | Premium tile provider | Free tier available; Alidade Smooth is a soft pastel style; Alidade Smooth Dark is a proper dark base map |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| window.matchMedia (browser built-in) | n/a | Detect and watch system color scheme | Detecting initial dark mode state and listening for live changes |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Stadia Alidade Smooth | Carto Positron | Carto requires domain registration too; Alidade Smooth was already decided |
| Stadia Alidade Smooth Dark | Carto Dark Matter | Same reason — tile provider already decided |
| `matchMedia` change event | CSS-only approach | CSS can't swap Leaflet tile layers; JavaScript is required |

**Installation:**
```bash
# No new npm packages needed — Leaflet is already installed
```

---

## Architecture Patterns

### Recommended Project Structure

No new files or folders needed. All changes are confined to two existing files:

```
src/
├── App.vue                    # Tile layer init + matchMedia change listener (onMounted)
└── styles/
    └── index.css              # Remove --map-tiles-filter variable and .map-tiles dark rule
```

### Pattern 1: Dual Tile Layer With MediaQueryList Swap

**What:** Create both light and dark tile layers up front, track a reference to the active layer, and swap on color scheme change.
**When to use:** Any time a Leaflet map must respond to OS-level dark mode changes without a page reload.
**Example:**

```typescript
// Source: Stadia Maps Docs + Leaflet reference (https://leafletjs.com/reference.html)
// In onMounted, after L.map() and before fetching venues:

const TILE_LIGHT = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';
const TILE_DARK  = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';

const darkMQ = window.matchMedia('(prefers-color-scheme: dark)');

const lightLayer = L.tileLayer(TILE_LIGHT, { maxZoom: 20, attribution: TILE_ATTRIBUTION });
const darkLayer  = L.tileLayer(TILE_DARK,  { maxZoom: 20, attribution: TILE_ATTRIBUTION });

// Add the correct layer based on current OS preference
let activeTileLayer = darkMQ.matches ? darkLayer : lightLayer;
activeTileLayer.addTo(map.value);

// Listen for OS color scheme changes and swap layers
darkMQ.addEventListener('change', (e) => {
  activeTileLayer.remove();
  activeTileLayer = e.matches ? darkLayer : lightLayer;
  activeTileLayer.addTo(map.value);
});
```

### Pattern 2: Remove CSS Invert Filter

**What:** Delete the CSS variable and media query block that inverts the tile layer in dark mode.
**When to use:** Any time a real dark tile layer replaces the invert hack.
**What to remove from `src/styles/index.css`:**

```css
/* DELETE THIS BLOCK (lines 92–105 of current index.css): */

:root {
    --map-tiles-filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
    ...
}

@media (prefers-color-scheme: dark) {
    .map-tiles {
        filter: var(--map-tiles-filter, none);
    }
}
```

Note: The `--map-tiles-filter` CSS variable is defined in `:root` alongside brand color variables. Only remove the `--map-tiles-filter` line; keep the brand color variables intact. The `.map-tiles` className on the tile layer can also be removed from the `L.tileLayer` options since it will no longer carry any CSS rules.

### Anti-Patterns to Avoid

- **Recreating tile layers on every change event:** Instantiate both tile layers once before the listener and keep references. Re-creating on every change wastes memory and causes visible flicker.
- **Using `addListener` instead of `addEventListener`:** `addListener` is deprecated on `MediaQueryList`. Use `addEventListener('change', handler)`.
- **Removing the `className: 'map-tiles'` option before confirming no other CSS targets it:** Grep the codebase for `.map-tiles` before removing the class to avoid silent styling regressions.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark map tiles | CSS filter inversion | Stadia Alidade Smooth Dark tile layer | Inversion shifts all hue values, producing ugly greens, purples, and washed-out roads |
| Color scheme change detection | Polling `document.body` class or setTimeout | `window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ...)` | Browser-native, fires immediately on OS change, zero polling overhead |
| Tile layer swap | Destroy and recreate the Leaflet map | `tileLayer.remove()` + `newTileLayer.addTo(map)` | Map state, markers, and zoom level are preserved; no need to re-initialize |

**Key insight:** CSS inversion of map tiles is a common hack that looks acceptable at a glance but fails the premium bar because hue-rotation shifts every color on the map unpredictably. The only correct fix is a purpose-built dark tile set from the tile provider.

---

## Common Pitfalls

### Pitfall 1: Missing `{r}` Retina Placeholder
**What goes wrong:** Tiles appear blurry on HiDPI/Retina displays.
**Why it happens:** The OSM hot URL uses a fixed `.png` extension. Stadia URLs support `{r}` which Leaflet automatically expands to `@2x` on retina devices.
**How to avoid:** Always use `{r}` in the Stadia tile URL: `.../alidade_smooth/{z}/{x}/{y}{r}.png`
**Warning signs:** Map looks blurry or soft on MacBook Retina or mobile devices.

### Pitfall 2: Wrong Attribution String
**What goes wrong:** Stadia Maps may rate-limit or flag the account for missing attribution; legally required by OSM license.
**Why it happens:** Developers copy an old attribution string that only credits OpenStreetMap.
**How to avoid:** Use the full three-part attribution: `&copy; Stadia Maps, &copy; OpenMapTiles &copy; OpenStreetMap`
**Warning signs:** Attribution strip at bottom of map only shows "OpenStreetMap".

### Pitfall 3: Tile Flicker on Layer Swap
**What goes wrong:** A white flash appears briefly when switching tile layers.
**Why it happens:** The old tile layer is removed before the new one has loaded any tiles.
**How to avoid:** Add the new layer to the map first, then remove the old layer after a brief delay — OR accept that Leaflet handles this reasonably well because it keeps old tiles visible until new tiles load. Test in practice; if flicker is acceptable, no extra handling is needed.
**Warning signs:** Visible white gap when toggling OS appearance in System Preferences.

### Pitfall 4: `maxZoom` Mismatch
**What goes wrong:** Map refuses to zoom beyond level 19 even though Stadia supports level 20.
**Why it happens:** The current `L.tileLayer` sets `maxZoom: 19`. Stadia supports up to 20.
**How to avoid:** Set `maxZoom: 20` on both Stadia tile layers.
**Warning signs:** Zoom control grays out at zoom 19.

### Pitfall 5: Production Tiles Fail (403/429)
**What goes wrong:** Tiles load fine in development but return 403 on the deployed site.
**Why it happens:** Stadia Maps permits localhost without auth but requires domain registration for production.
**How to avoid:** Register the production domain in the Stadia Maps client dashboard under "Authentication Configuration." This requires no code changes — only a dashboard configuration.
**Warning signs:** Network tab shows 403 or 429 responses for tile requests on the deployed URL.

### Pitfall 6: Leaving `--map-tiles-filter` CSS Variable Orphaned
**What goes wrong:** The CSS variable remains in `:root` but is never used, causing confusion for future maintainers.
**Why it happens:** Developer removes the `@media` block but forgets the `:root` variable declaration.
**How to avoid:** Remove the entire `--map-tiles-filter: ...` line from `:root` in `index.css`. Keep all other brand color variables.
**Warning signs:** `grep --map-tiles-filter src/` still returns a match after cleanup.

---

## Code Examples

Verified patterns from official sources:

### Complete onMounted Tile Initialization (Replace Existing Block)

```typescript
// Source: Stadia Maps docs (https://docs.stadiamaps.com/tutorials/raster-maps-with-leaflet/)
// Place in onMounted after: map.value = L.map('map').setView([lat, lng], zoomLevel);

const TILE_LIGHT = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';
const TILE_DARK  = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';

const lightTileLayer = L.tileLayer(TILE_LIGHT, { maxZoom: 20, attribution: TILE_ATTRIBUTION });
const darkTileLayer  = L.tileLayer(TILE_DARK,  { maxZoom: 20, attribution: TILE_ATTRIBUTION });

const darkMQ = window.matchMedia('(prefers-color-scheme: dark)');
let activeTileLayer: L.TileLayer = darkMQ.matches ? darkTileLayer : lightTileLayer;
activeTileLayer.addTo(map.value);

darkMQ.addEventListener('change', (e: MediaQueryListEvent) => {
  activeTileLayer.remove();
  activeTileLayer = e.matches ? darkTileLayer : lightTileLayer;
  activeTileLayer.addTo(map.value);
});
```

### CSS Lines to Remove From `src/styles/index.css`

```css
/* REMOVE the --map-tiles-filter declaration from :root (line ~92): */
--map-tiles-filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);

/* REMOVE this entire @media block (lines ~101-105): */
@media (prefers-color-scheme: dark) {
    .map-tiles {
        filter: var(--map-tiles-filter, none);
    }
}
```

### What Remains in `:root` After Cleanup

```css
:root {
    /* Blue Billboard Brand Colors */
    --blue-billboard-primary: #0d47a1;
    --blue-billboard-primary-hover: #1565c0;
    --blue-billboard-primary-dark: #60a5fa;
    --blue-billboard-primary-dark-hover: #3b82f6;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS `invert()` filter on OSM tiles for dark mode | Dedicated dark tile layer (Stadia Alidade Smooth Dark) | Been possible since Stadia launched ~2020 | Real dark map with correctly colored roads, water, parks |
| `MediaQueryList.addListener()` | `MediaQueryList.addEventListener('change', ...)` | Deprecated as of Chrome 45; removed in some browsers | `addListener` still works in most browsers but is deprecated — use `addEventListener` |
| OSM hot tiles (`tile.openstreetmap.fr/hot`) | Stadia Alidade Smooth | N/A (project-specific upgrade) | Softer, more minimal cartography suitable for premium venue display |

**Deprecated/outdated:**
- `MediaQueryList.addListener()`: Deprecated; replaced by `addEventListener('change', handler)`. The old method is still functional in current browsers but should not be used in new code.
- CSS filter dark mode hack (`--map-tiles-filter`): Present in `src/styles/index.css`. Must be removed as part of this phase.

---

## Open Questions

1. **Production domain registration**
   - What we know: Stadia Maps requires domain-based authentication for production use; localhost works without auth
   - What's unclear: Whether the production domain for this app has already been registered in the Stadia Maps dashboard
   - Recommendation: The planner should include a verification step confirming production domain is registered (or flag it as a deployment prerequisite)

2. **`className: 'map-tiles'` on the tile layer**
   - What we know: The current `L.tileLayer` passes `className: 'map-tiles'` which is used by the CSS filter rule being deleted
   - What's unclear: Whether any other CSS in the project targets `.map-tiles` for non-filter purposes
   - Recommendation: Run `grep -r 'map-tiles' src/` before removing the className option; if no other matches exist, remove it

---

## Validation Architecture

`nyquist_validation` is enabled. However, this phase involves visual/browser behavior (tile rendering, OS color scheme switching) that cannot be meaningfully automated with a unit test framework. All requirements are visual or browser-event-driven.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no jest.config, vitest.config, or test directories found in project |
| Config file | None — see Wave 0 |
| Quick run command | n/a (manual verification only for this phase) |
| Full suite command | n/a |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TILES-01 | Light mode shows Alidade Smooth tiles (pastel, minimal) | manual-only | n/a | n/a |
| TILES-02 | Dark mode shows Alidade Smooth Dark tiles (dark base) | manual-only | n/a | n/a |
| TILES-03 | CSS invert filter removed from codebase | automated grep | `grep -r 'map-tiles-filter\|invert.*hue-rotate' src/` should return 0 matches | ❌ Wave 0 |
| TILES-04 | Tile layer switches on OS scheme change without reload | manual-only | n/a — requires OS-level color scheme toggle | n/a |

**Manual verification steps for TILES-01/02/04:**
1. Open app in browser (light mode) — verify soft pastel tiles, no busy OSM hot coloring
2. Switch OS to dark mode — verify tile layer switches to dark base map without page reload
3. Verify no CSS invert applied to map tiles (check DevTools Elements panel for `.map-tiles` filter)
4. Switch OS back to light — verify tiles return to Alidade Smooth

### Sampling Rate
- **Per task commit:** `grep -r 'map-tiles-filter' src/` — confirms CSS hack removed
- **Per wave merge:** Manual browser verification in both light and dark OS modes
- **Phase gate:** All 4 requirements verified manually before `/gsd:verify-work`

### Wave 0 Gaps
- No test framework is installed; no automated tests exist or are needed for this visual phase
- The one automatable check (TILES-03) is a `grep` command, not a test suite

*(No test infrastructure needs to be created — grep-based verification is sufficient for TILES-03)*

---

## Sources

### Primary (HIGH confidence)
- https://docs.stadiamaps.com/tutorials/raster-maps-with-leaflet/ — Exact tile URL templates for Alidade Smooth, attribution string, API key requirements
- https://docs.stadiamaps.com/map-styles/alidade-smooth-dark/ — Exact tile URL template for Alidade Smooth Dark (`alidade_smooth_dark/{z}/{x}/{y}{r}.png`)
- https://docs.stadiamaps.com/authentication/ — Production authentication requirements (domain-based auth, localhost exemption)
- https://leafletjs.com/reference.html — `L.TileLayer`, `layer.remove()`, `layer.addTo()` API

### Secondary (MEDIUM confidence)
- https://davidwalsh.name/detect-system-theme-preference-change-using-javascript — `MediaQueryList.addEventListener('change', ...)` pattern (verified against MDN behavior)
- https://docs.stadiamaps.com/map-styles/alidade-smooth/ — Alidade Smooth style description and `{r}` placeholder behavior

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Stadia tile URLs confirmed from official docs; Leaflet API confirmed from official docs
- Architecture: HIGH — Pattern is simple (two tile layers, one matchMedia listener); no complex integration needed
- Pitfalls: HIGH — CSS invert location confirmed by reading actual source files; authentication requirements confirmed from official Stadia docs

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (Stadia Maps tile URLs and Leaflet API are stable; 30-day window is conservative)

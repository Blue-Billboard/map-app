# Codebase Concerns

**Analysis Date:** 2026-03-01

## Tech Debt

**Widespread Use of `any` Type:**
- Issue: Excessive use of TypeScript `any` type defeats the purpose of strict type checking
- Files: `src/App.vue`, `src/dialogs/wizard/WizardView.vue`
- Examples: `locationData.value: any[]`, `displayGroups.value: any[]`, venue parameters, event handlers
- Impact: No compile-time type safety, difficult refactoring, runtime errors not caught early
- Fix approach: Define proper interfaces for Venue, DisplayGroup, Location data structures and use throughout the codebase

**Incomplete Feature Implementation in useVenueList Composable:**
- Issue: `levelColour()` function ignores the `level` parameter and always returns hardcoded blue color
- Files: `src/composables/useVenueList.ts` (lines 2-4)
- Impact: Venue color differentiation (Blue/Gold/Platinum) doesn't work; all markers show same color
- Current code: Returns `"#0d47a1"` regardless of level input
- Fix approach: Implement actual level-to-color mapping per CLAUDE.md specification (Blue: #0d47a1, Gold: #FFD700, Platinum: #E5E4E2)

**Unused or Dead Code:**
- Issue: `feature1` property in Plan interface is defined but never used in pricing calculations
- Files: `src/dialogs/wizard/WizardView.vue` (interface line 14, but see template)
- Impact: Confusing codebase, possible indicator of incomplete refactoring
- Fix approach: Remove unused property or implement its intended functionality

## Known Bugs

**Missing API Error Handling:**
- Symptoms: If venue or group API endpoints fail, app silently breaks with empty data
- Files: `src/App.vue` (lines 64-65)
- Code: `fetch().then(res => res.json())` with no `.catch()` or error checking
- Trigger: Network failure, API server down, invalid JSON response
- Workaround: Users must hard-refresh; check browser console for silent failures
- Fix approach: Add proper error handling with user-facing error messages and retry logic

**Dark Mode Tile Source Duplication:**
- Symptoms: No visible difference between dark and light mode map tiles
- Files: `src/App.vue` (lines 43-47)
- Issue: Both conditions set identical tile source; dark mode check is non-functional
- Impact: User experience inconsistency in dark mode
- Fix approach: Implement separate dark-themed tile source or use CSS filters consistently

**Hardcoded Zoom Level Not Preserved:**
- Symptoms: When using lat/lng URL params, zoom level is always set to 14; user cannot customize
- Files: `src/App.vue` (line 37)
- Impact: Reduces flexibility of embedded map usage
- Fix approach: Add optional `?zoom=N` parameter to URL query string

**Image Loading Failures Not Handled Gracefully:**
- Symptoms: Missing venue images cause layout issues; cards with broken images appear empty
- Files: `src/dialogs/wizard/WizardView.vue` (line 452)
- Current approach: Only hides image element but doesn't prevent layout shift
- Impact: Visual inconsistency in venue grid
- Fix approach: Provide fallback placeholder or skeleton loader

## Security Considerations

**No API Request Validation:**
- Risk: Client accepts any response from API without schema validation
- Files: `src/App.vue` (lines 64-65)
- Current mitigation: None - assumes API always returns well-formed data
- Recommendations:
  - Add runtime validation using zod or io-ts
  - Validate required fields (id, name, location, coordinates)
  - Handle missing/malformed fields gracefully

**Hardcoded API Endpoints:**
- Risk: API URLs embedded in source code cannot be changed without rebuilding
- Files: `src/App.vue` (lines 64-65)
- Impact: Prevents use of different API environments (dev/staging/prod)
- Recommendations: Move API base URL to environment variables (.env file usage)

**No CORS or CSP Configuration Visible:**
- Risk: Cross-origin requests may fail silently or be vulnerable
- Files: API calls in `src/App.vue`
- Current mitigation: Not visible in codebase
- Recommendations: Verify CORS headers from Blue Billboard API are correct

**Unvalidated User Input in Filters:**
- Risk: Search/filter values go directly into string matching without sanitization
- Files: `src/App.vue` (lines 118-123), `src/dialogs/wizard/WizardView.vue` (lines 296-301)
- Impact: Potential for ReDoS (Regular Expression Denial of Service) with malicious input
- Recommendations: Add input validation and sanitization for search terms

## Performance Bottlenecks

**All Venues Loaded Into Memory:**
- Problem: Complete venue list fetched on mount; no pagination on fetch
- Files: `src/App.vue` (line 64)
- Cause: Single `fetch()` of entire `/api/public/venues` endpoint
- Current state: Works for ~100s of venues but scales poorly
- Improvement path:
  - Implement server-side pagination
  - Load venues on-demand or by region
  - Cache locally with expiration

**No Memoization of Computed Properties:**
- Problem: `filteredVenues`, `sortedVenues`, `paginatedVenues` recompute on every render
- Files: `src/App.vue` (lines 104-106, 113-135), `src/dialogs/wizard/WizardView.vue` (lines 289-320)
- Cause: Large arrays being filtered multiple times per user interaction
- Impact: Noticeable lag with 500+ venues
- Improvement path: Use `computed()` with proper dependency tracking (already done in wizard, but sorts not memoized in App.vue)

**Marker Creation Not Optimized:**
- Problem: `L.divIcon` created for every venue without reuse
- Files: `src/App.vue` (lines 73-86)
- Cause: Creating 100+ DOM elements for markers
- Impact: Slow initial render, high memory usage
- Improvement path:
  - Reuse icon template with CSS classes
  - Use canvas rendering or clustering for large datasets
  - Consider Leaflet.markercluster plugin

**DOM Query in Watch Callback:**
- Problem: `document.querySelector()` called on every active step change
- Files: `src/dialogs/wizard/WizardView.vue` (lines 271-276)
- Cause: Manual DOM manipulation in watch callback with setTimeout
- Impact: Potential jank and memory leaks from repeated DOM queries
- Improvement path: Use Vue refs instead of querySelector, or implement virtual scroll

**No Lazy Loading for Images:**
- Problem: All venue images in grid load immediately even if not visible
- Files: `src/dialogs/wizard/WizardView.vue` (line 448)
- Note: Has `loading="lazy"` but grid has max-height with overflow - lazy loading may not work well
- Impact: Bandwidth waste, slower initial render
- Improvement path: Implement intersection observer or virtualization for large grids

## Fragile Areas

**Marker Click Event Handler:**
- Files: `src/App.vue` (line 83-84)
- Why fragile: Stores metadata using custom `getProps()` method added to L.Layer prototype
  - Prototype mutation can cause conflicts with other libraries
  - Event handling relies on `sourceTarget.getProps().meta` which could be undefined
- Safe modification: Add null checks, consider using weakmap for marker metadata instead
- Test coverage: No unit tests for marker interaction flow

**Display Group Filtering:**
- Files: `src/App.vue` (lines 128-131), `src/dialogs/wizard/WizardView.vue` (lines 282, 305-306)
- Why fragile: Assumes `venueIds` property exists and is an array
  - If API changes structure, filtering silently fails
  - No validation that venue IDs in group actually exist
- Safe modification: Add null checks and defensive coding
- Test coverage: Filtering logic untested

**Price Calculation Logic:**
- Files: `src/dialogs/wizard/WizardView.vue` (lines 173-248)
- Why fragile: Multiple discount multipliers can compound unexpectedly
  - Complex nested conditions for discount application
  - No maximum discount cap (could theoretically go negative)
  - Tier multipliers hardcoded; changes require code modification
- Safe modification: Add validation, implement discount limits, extract tier config to data file
- Test coverage: No unit tests for pricing scenarios

**Discount Calculation Potential Bug:**
- Issue: Discounts can theoretically exceed 100% if all conditions met
- Files: `src/dialogs/wizard/WizardView.vue` (lines 191-219)
- Calculation: charity (25%) + partner (25%) + chamber (25%) + circle (25%) + multisite (10%) + multimonth (10%) = 120%
- Impact: Negative prices possible
- Fix approach: Cap total discount at maximum value (e.g., 50%)

## Scaling Limits

**Hardcoded Venue Data Limit:**
- Current capacity: Works well with ~200-500 venues
- Limit: Performance degrades significantly with 1000+ venues
- Causes:
  - All data loaded in single fetch
  - No pagination on API side
  - Full filtering on client done on every keystroke
- Scaling path:
  1. Implement server-side pagination (fetch 100 venues at a time)
  2. Add server-side search/filter endpoints
  3. Consider lazy-loading markers only for visible map area
  4. Implement marker clustering for dense areas

**Dialog Scaling Issues:**
- Current capacity: ~500 venues displayable in wizard dialog
- Limit: > 1000 venues causes significant lag in grid rendering
- Causes: Creating 8+ venue cards per page, full list refiltered per keystroke
- Scaling path: Implement virtual scrolling in DataTable or custom virtualized list

**Map Tile Loading:**
- Current capacity: Works fine for typical web usage
- Limit: Heavy map usage (panning, zooming) can cause tile load bottleneck
- Scaling path: None needed unless user base increases 10x

## Dependencies at Risk

**Leaflet 1.9.3 - Maintenance Status:**
- Risk: Library is mature but updates are infrequent
- Impact: Security patches may be delayed, missing modern browser features
- Current usage: Core functionality for map rendering
- Migration plan: Monitor for critical security updates; plan migration to modern alternatives (Mapbox GL, Deck.gl) if needed

**PrimeVue 4.3.9 - Unstyled Mode Complexity:**
- Risk: Custom design system maintenance burden; diverges from standard patterns
- Impact: Component styling issues across browsers, difficult to debug
- Current usage: All UI components rely on custom PassThrough config
- Migration plan: Consider using standard styled mode or switching to Headless UI / shadcn-vue

**leaflet-draw 1.0.4 - Imported but Unused:**
- Risk: Dead dependency increasing bundle size
- Impact: ~20-30KB added to bundle for unused functionality
- Current usage: Imported but never used (no drawing tools in UI)
- Migration plan: Remove import or implement drawing functionality

**Vue Router 4.3.2 - Imported but Unused:**
- Risk: Dead dependency; no routes defined
- Impact: ~30-40KB added to bundle, unnecessary complexity
- Current usage: Imported but not used (App.vue doesn't use routing)
- Migration plan: Remove if truly not needed

**Type Definitions Gap:**
- Risk: Missing type definitions for some dependencies
- Files: Using `any` type for event handlers, unclear types for Leaflet operations
- Impact: Type safety compromised, hard to maintain
- Recommendations: Add proper type definitions for all external APIs

## Missing Critical Features

**No Network Offline Handling:**
- Problem: App fails silently if internet is lost after initial load
- Impact: Users cannot use app in offline mode even for cached data
- Blocks: Offline functionality, reliability improvements

**No Loading States:**
- Problem: No visual feedback while fetching venue data
- Files: `src/App.vue` (lines 64-65)
- Impact: Users don't know if app is loading or broken
- Blocks: Good UX, proper error communication

**No Error Boundaries:**
- Problem: Single component error crashes entire application
- Impact: Any runtime error in WizardView or dialog breaks the app
- Blocks: Production reliability

**No Analytics or Monitoring:**
- Problem: Cannot track user behavior, errors, or performance
- Impact: Cannot identify issues without user reports
- Blocks: Data-driven improvements

## Test Coverage Gaps

**No Unit Tests:**
- What's not tested: All TypeScript logic (filtering, pricing, calculations)
- Files: `src/composables/useVenueList.ts`, discount logic in `src/dialogs/wizard/WizardView.vue`
- Risk: Price calculation bugs not caught, discount edge cases untested
- Priority: High - pricing logic directly affects business

**No Component Tests:**
- What's not tested: Venue selection, wizard flow, venue detail dialog
- Files: `src/App.vue`, `src/dialogs/wizard/WizardView.vue`
- Risk: UI bugs like broken filters, unselectable venues, broken navigation
- Priority: High - affects user experience

**No Integration Tests:**
- What's not tested: API fetch flow, marker rendering, dialog interaction
- Files: Map initialization, venue data loading, display group filtering
- Risk: Silent API failures, broken data flow
- Priority: Medium

**No E2E Tests:**
- What's not tested: Complete user workflows (select venues → view quote → pricing)
- Risk: Critical user flows may be broken in production
- Priority: Medium - would catch regression issues

**Test Infrastructure Missing:**
- No test runner configured (no Jest/Vitest in package.json)
- No test utilities or fixtures
- No CI/CD test execution
- Recommendation: Set up Vitest with Vue 3 testing library

---

*Concerns audit: 2026-03-01*

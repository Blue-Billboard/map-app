# Architecture

**Analysis Date:** 2026-03-01

## Pattern Overview

**Overall:** Vue 3 Single-Page Application (SPA) with component-based UI and Composition API

**Key Characteristics:**
- Lean architecture with minimal state management (no Vuex/Pinia)
- Leaflet-based interactive map as core visualization
- Multi-step wizard dialog for quote generation
- Composable-based shared state via `useVenueList()`
- Direct API integration to Blue Billboard backend

## Layers

**Presentation Layer:**
- Purpose: Render interactive UI components and handle user interactions
- Location: `src/App.vue`, `src/dialogs/wizard/WizardView.vue`
- Contains: Vue Single-File Components (SFCs) with templates, scripts, styles
- Depends on: PrimeVue components, Leaflet library, composables
- Used by: Browser runtime

**Application Logic Layer:**
- Purpose: Handle multi-step wizard flow, venue filtering, quote calculation, form state
- Location: `src/dialogs/wizard/WizardView.vue` (script setup section)
- Contains: Computed properties, refs, event handlers, business logic
- Depends on: Vue composition API, Leaflet, PrimeVue
- Used by: Presentation layer

**Shared State Layer:**
- Purpose: Provide shared reactive state across components
- Location: `src/composables/useVenueList.ts`
- Contains: Composable functions exporting reactive state
- Depends on: Vue Composition API
- Used by: `App.vue`, `WizardView.vue`

**Map Integration Layer:**
- Purpose: Initialize and manage Leaflet map, markers, and interactions
- Location: `src/App.vue` (onMounted hook)
- Contains: Leaflet instance setup, marker creation, tile layer configuration
- Depends on: Leaflet, leaflet-draw, marker data from API
- Used by: Map visualization and venue selection

**Data Access Layer:**
- Purpose: Fetch venue and group data from external API
- Location: `src/App.vue` (onMounted hook, direct fetch calls)
- Contains: Direct fetch() calls to Blue Billboard API endpoints
- Depends on: Fetch API, network connectivity
- Used by: App component for populating maps and wizard

**Styling Layer:**
- Purpose: Provide consistent theming, component styling, and dark mode support
- Location: `src/styles/index.css`, scoped styles in `.vue` files, `tailwind.config.ts`
- Contains: Tailwind CSS directives, PrimeVue overrides, custom CSS
- Depends on: Tailwind CSS v4, PrimeIcons
- Used by: All components

## Data Flow

**Map Initialization & Venue Display:**

1. `App.vue` mounted → Parse URL parameters (stripped, showQuote, lat, lng)
2. Initialize Leaflet map with configured center and zoom level
3. Fetch venues from `https://admin.bluebillboard.co.uk/api/public/venues`
4. Fetch groups from `https://admin.bluebillboard.co.uk/api/public/groups`
5. Process venue data: Create Leaflet markers with level-based colors
6. Attach click handler to markers → Show venue detail dialog
7. User clicks "Get Quote" button → Open wizard dialog

**Quote Generation Wizard Flow:**

1. Step 0 (Choose Venues):
   - Display filtered/paginated venue grid (8 venues per page)
   - Support search by name/type/city
   - Support group filter via dropdown
   - Event delegation: Click venue card → Add/remove from selected venues
   - Computed `filteredVenues` and `paginatedVenues` update in real-time

2. Step 1 (Campaign Details):
   - Select campaign duration (1-12 months)
   - Toggle discount eligibility (Charity, Partner, Chamber)
   - Display selected venues summary with remove buttons
   - `calculateQuote()` triggered on continue

3. Step 2 (Quote Display):
   - Calculate pricing per tier (Starter, Optimal, Enhanced, 1 in 6)
   - Apply discounts and duration multipliers
   - Display 4-tier pricing cards with play frequency features
   - Show call-to-action section with contact links

**State Management:**

- `locationData`: Array of all venue objects fetched from API
- `displayGroups`: Array of group objects for filtering
- `selectedVenues`: Object tracking user-selected venues during wizard
- `filters`: Global and ID-based filter state for venue search
- `duration`: Selected campaign duration in months
- `isCharity/isPartner/isChamber`: Discount toggles (mutually exclusive)
- `plans`: Array of pricing tier objects with calculated prices and features
- Reactive updates via Vue's `watch()` for interdependent state changes

## Key Abstractions

**Venue Card Component Pattern:**
- Purpose: Reusable venue selection UI element
- Examples: Used in `WizardView.vue` step 0 and `App.vue` "View All" dialog
- Pattern: Data attributes (`data-venue-id`), CSS classes for selection state, lazy loading images

**Level Color Mapping:**
- Purpose: Provide consistent color scheme for venue levels (Blue, Gold, Platinum)
- Examples: `src/composables/useVenueList.ts` exports `levelColour()`
- Pattern: Composable function returns color hex value based on venue level

**Pricing Tier System:**
- Purpose: Calculate quote pricing based on tier, duration, screen count
- Examples: `TIER_CONFIG` in `WizardView.vue` with SOV percentages and multipliers
- Pattern: Configuration object mapping tier names to pricing multipliers and display frequency

**Dialog Management:**
- Purpose: Show/hide modal dialogs (venue detail, wizard, view all)
- Examples: `v-model:visible` bindings on PrimeVue Dialog components
- Pattern: Boolean refs (`wizardOpen`, `open`, `viewAllOpen`) control visibility

## Entry Points

**Application Entry:**
- Location: `src/main.ts`
- Triggers: Browser loads `index.html`
- Responsibilities: Create Vue app instance, configure PrimeVue, register global components, mount to DOM

**Map Entry:**
- Location: `src/App.vue` `onMounted` hook
- Triggers: Component mounted to DOM
- Responsibilities: Initialize Leaflet map, fetch venues/groups, create markers, attach event handlers

**Wizard Entry:**
- Location: `src/dialogs/wizard/WizardView.vue` component
- Triggers: User clicks "Get Quote" button in App.vue
- Responsibilities: Multi-step venue selection, campaign details, quote calculation

## Error Handling

**Strategy:** Minimal explicit error handling; relies on fetch defaults and component error boundaries

**Patterns:**
- Image load errors: `@error` handler on venue card images hides broken images
- API fetch errors: No explicit error handler (fails silently, UI shows empty data)
- URL parameter parsing: Graceful fallback to defaults if invalid lat/lng/zoom provided

## Cross-Cutting Concerns

**Logging:** None detected - uses browser console indirectly via Vue devtools

**Validation:**
- URL parameter validation: Optional URL params parsed with fallback defaults
- Form validation: Duration select and discount toggles constrained by UI (no runtime validation)
- Venue selection: Computed properties prevent advancing without venue selection

**Authentication:** Not applicable - API endpoints are public, no auth required

**Dark Mode:**
- Implemented via CSS media query `(prefers-color-scheme: dark)`
- Map tiles apply invert filter in dark mode
- PrimeVue components automatically styled via CSS variables
- Custom dark mode overrides in `src/styles/index.css` (lines 169-218)

---

*Architecture analysis: 2026-03-01*

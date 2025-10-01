# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MapApp is a Vue 3 + TypeScript application for visualizing Blue Billboard venue locations on an interactive map. It displays venue markers with different color schemes based on venue levels (Blue, Gold, Platinum) and provides quote generation functionality for advertising campaigns.

## Common Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build` (runs TypeScript compilation via vue-tsc, then builds)
- **Preview production build**: `npm run preview`

## Architecture

### Tech Stack
- **Framework**: Vue 3 with Composition API (`<script setup>`)
- **Build tool**: Vite
- **TypeScript**: Type checking with vue-tsc
- **Map library**: Leaflet with leaflet-draw plugin
- **UI components**: PrimeVue (unstyled mode with custom design system)
- **Styling**: Tailwind CSS

### Project Structure

```
src/
├── App.vue                    # Main application component with map initialization
├── main.ts                    # App entry point, PrimeVue component registration
├── composables/               # Vue composables
│   └── useVenueList.ts       # Shared state (sidebar visibility, level colors)
├── dialogs/                   # Modal/dialog components
│   ├── wizard/
│   │   └── WizardView.vue    # Quote generation wizard
│   └── listv2/
│       └── VenueList.vue     # Venue list sidebar
├── design-system/
│   └── index.js              # Custom PrimeVue PassThrough configuration
└── styles/                    # Global styles
```

### Key Architecture Patterns

**Map Integration (App.vue)**:
- Leaflet map initialized in `onMounted` lifecycle hook
- Venue data fetched from Blue Billboard API (`https://admin.bluebillboard.co.uk/api/public/venues`)
- Custom map markers use `L.divIcon` with level-based coloring
- Marker metadata stored via custom `getProps()` method added to `L.Layer`
- URL params support: `?stripped=true` for minimal UI, `?lat=X&lng=Y` for specific location

**State Management**:
- No Vuex/Pinia - uses Vue 3 Composition API with composables
- `useVenueList()` composable provides shared state (sidebar visibility, level colors)
- Level colors: Blue (#0d47a1), Gold (#FFD700), Platinum (#E5E4E2)

**PrimeVue Customization**:
- PrimeVue initialized in unstyled mode: `app.use(PrimeVue, { unstyled: true, pt: MyDesignSystem })`
- All styling via custom PassThrough configuration in `src/design-system/index.js`
- Components registered globally in main.ts (Dialog, DataTable, Sidebar, etc.)

**Wizard Flow**:
- Multi-step quote generation: venue selection → additional info → quote display
- Supports filtering venues by city, type, level
- Calculates pricing based on duration and venue rates

### Important Notes

- Path alias `@` configured in vite.config.ts pointing to `./src`
- Dark mode support via CSS media query `(prefers-color-scheme: dark)`
- Map tiles apply invert filter in dark mode
- TypeScript strict mode enabled
# Technology Stack

**Analysis Date:** 2026-03-01

## Languages

**Primary:**
- TypeScript 4.9.3 - Application logic, type safety, and Vue component development

**Secondary:**
- JavaScript (ES2020+) - Dependencies and library interoperability
- HTML5 - Markup and semantic structure in `.vue` templates
- CSS3 - Styling via Tailwind CSS and component-scoped styles

## Runtime

**Environment:**
- Node.js (version unspecified - no `.nvmrc` file)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (v3, present)

## Frameworks

**Core:**
- Vue 3.2.45 - Progressive framework with Composition API (`<script setup>` syntax)
- Vue Router 4.3.2 - Client-side routing (imported but not actively used in main structure)

**UI Component Library:**
- PrimeVue 4.3.9 - Unstyled component library with Aura theme preset
- @primevue/themes 4.3.9 - Theme management and CSS variable system
- PrimeIcons 7.0.0 - Icon library (used throughout for UI icons)

**Styling:**
- Tailwind CSS 4.1.13 - Utility-first CSS framework
- @tailwindcss/vite 4.1.13 - Vite integration for Tailwind processing
- tailwindcss-primeui 0.6.1 - Tailwind compatibility bridge for PrimeVue
- Autoprefixer 10.4.13 - CSS vendor prefixing

**Icons:**
- @heroicons/vue 2.0.14 - Icon component library (not currently used, available for future UI)

**Markdown:**
- marked 4.2.12 - Markdown parsing library (available, not actively used)

## Build Tools

**Build System:**
- Vite 6.3.6 - Fast frontend build tool and dev server
- @vitejs/plugin-vue 6.0.1 - Vue 3 Single File Component support
- vue-tsc 1.0.24 - TypeScript type checking for Vue files

**CSS Processing:**
- PostCSS 8.4.21 - CSS transformation and plugin pipeline
- tailwindcss 4.1.13 - CSS generation and optimization
- @tailwindcss/node 4.1.13 - Node.js integration for Tailwind (v4 API)

## Key Dependencies

**Critical:**
- leaflet 1.9.3 - Interactive map library (core mapping functionality)
  - Used in: `src/App.vue` for map initialization and marker rendering
- leaflet-draw 1.0.4 - Drawing plugin for Leaflet maps
  - Imported in: `src/App.vue` via `import 'leaflet-draw'`

**UI & Interaction:**
- primevue 4.3.9 - Headless component library providing Dialog, DataTable, Sidebar, etc.
- @primevue/themes 4.3.9 - Theme system with CSS layer support
- primeicons 7.0.0 - Icon font (pi-* classes throughout)

**Type Definitions:**
- @types/leaflet 1.9.0 - TypeScript definitions for Leaflet API
- @types/marked 4.0.8 - TypeScript definitions for marked library

## Configuration

**Build Configuration:**
- `vite.config.ts` - Vite build configuration with Vue and Tailwind plugins, path aliases
- `tsconfig.json` - TypeScript compiler options (strict mode enabled, ESNext target)
- `tailwind.config.ts` - Tailwind CSS content paths
- `index.html` - HTML entry point with Leaflet and Leaflet-Draw CSS imports

**Path Aliases:**
- `@` → `./src` (configured in `vite.config.ts` and `tsconfig.json`)
- `leaflet` → Explicit resolution to Leaflet dist in `vite.config.ts`

**TypeScript Settings:**
- Strict mode: Enabled
- Module resolution: Node
- Target: ESNext
- JSX: Preserved (Vue handles JSX transformation)

## Platform Requirements

**Development:**
- Node.js (version not specified - no `.nvmrc` constraint)
- npm or compatible package manager
- POSIX-compatible terminal (scripts use standard npm/vite commands)
- Browser with ES2020+ support and Leaflet compatibility

**Production:**
- Modern browser with ES2020+ support (transpilation not configured)
- HTTPS-recommended for external tile and API requests
- Leaflet-compatible browser (Chrome, Firefox, Safari, Edge)

**External Dependencies:**
- OpenStreetMap tile server (hot layer variant): `https://b.tile.openstreetmap.fr/hot/`
- Blue Billboard API: `https://admin.bluebillboard.co.uk/api/public/`
- Inter font CDN: `https://rsms.me/inter/inter.css`

## Build & Serve Commands

**Development:**
```bash
npm run dev          # Start Vite dev server with hot module reloading
```

**Production:**
```bash
npm run build        # TypeScript type check (vue-tsc), then Vite build
npm run preview      # Preview production build locally
```

---

*Stack analysis: 2026-03-01*

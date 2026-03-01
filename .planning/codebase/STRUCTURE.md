# Codebase Structure

**Analysis Date:** 2026-03-01

## Directory Layout

```
MapApp/
├── src/
│   ├── App.vue                    # Root component: map initialization, venue dialogs
│   ├── main.ts                    # App entry point, PrimeVue/Vue setup
│   ├── vite-env.d.ts              # Vite client type definitions
│   ├── composables/
│   │   └── useVenueList.ts        # Shared state: level colors
│   ├── dialogs/
│   │   └── wizard/
│   │       └── WizardView.vue     # Multi-step quote generation wizard (1792 lines)
│   ├── assets/
│   │   └── vue.svg                # Vue logo asset
│   └── styles/
│       └── index.css              # Global styles, Tailwind config, custom CSS
├── public/
│   ├── img/                       # Venue images, Blue Billboard logo
│   ├── favicon-*.png              # Favicon variations
│   └── vite.svg                   # Vite logo
├── index.html                     # HTML entry point (mounts #mapApp)
├── vite.config.ts                 # Vite build config, path aliases
├── tsconfig.json                  # TypeScript strict mode config
├── tsconfig.node.json             # TypeScript config for Node (vite/build)
├── tailwind.config.ts             # Tailwind CSS content scanning
├── package.json                   # Dependencies: Vue 3, Leaflet, PrimeVue
├── package-lock.json              # Locked dependency versions
├── CLAUDE.md                       # Project guidelines for AI assistants
├── CNAME                          # GitHub Pages domain config
└── deploy.sh                      # Deployment script
```

## Directory Purposes

**src/:**
- Purpose: All source code for the application
- Contains: Vue components, composables, styles, TypeScript definitions
- Key files: `App.vue` (root), `main.ts` (entry)

**src/composables/:**
- Purpose: Reusable Vue composition API logic
- Contains: Composable functions that export reactive state
- Key files: `useVenueList.ts` (level color helper)

**src/dialogs/:**
- Purpose: Modal/dialog components
- Contains: Multi-step interfaces shown in modals
- Key files: `wizard/WizardView.vue` (quote wizard, largest file)

**src/dialogs/wizard/:**
- Purpose: Quote generation workflow
- Contains: 3-step wizard for venue selection → campaign details → pricing
- Key files: `WizardView.vue` (46KB, handles all wizard logic)

**src/styles/:**
- Purpose: Global styling and Tailwind configuration
- Contains: CSS imports, custom CSS rules, dark mode support, PrimeVue overrides
- Key files: `index.css` (219 lines including Tailwind directives)

**public/:**
- Purpose: Static assets served directly by web server
- Contains: Images, favicons, logos
- Key files: `img/` (venue photos, customcolor_icon_transparent_background.png)

**dist/:**
- Purpose: Production build output (git submodule)
- Contains: Compiled HTML, JS, CSS bundles
- Note: Excluded from version control via `.gitignore`, managed as submodule

## Key File Locations

**Entry Points:**
- `index.html`: HTML root document, mounts Vue app to `#mapApp` div
- `src/main.ts`: Creates Vue app, configures PrimeVue, registers components
- `src/App.vue`: Root Vue component, initializes map, manages main dialogs

**Configuration:**
- `vite.config.ts`: Build tool config, path alias `@` → `./src`, Leaflet alias
- `tsconfig.json`: TypeScript strict mode, path mapping for `@/*`
- `tailwind.config.ts`: Tailwind content sources for Vue/TS files
- `package.json`: npm dependencies, build scripts

**Core Logic:**
- `src/App.vue`: Leaflet map init, venue fetching, marker creation, dialog state
- `src/dialogs/wizard/WizardView.vue`: Multi-step wizard, pricing calculation, form handling
- `src/composables/useVenueList.ts`: Shared color utility

**Styling:**
- `src/styles/index.css`: Global styles including Tailwind imports, custom map styles, dark mode

## Naming Conventions

**Files:**
- `.vue`: Vue Single-File Components (PascalCase)
  - Example: `App.vue`, `WizardView.vue`
- `.ts`: TypeScript files (camelCase for utilities, PascalCase for types)
  - Example: `useVenueList.ts`, `vite-env.d.ts`
- `.html`: HTML entry point (lowercase)
  - Example: `index.html`

**Directories:**
- Feature/feature-group: kebab-case
  - Example: `composables/`, `dialogs/`, `styles/`
- Nested features: Lowercase grouping
  - Example: `dialogs/wizard/`, `src/assets/`

**Component Names:**
- PascalCase for Vue components
  - Example: `App.vue`, `WizardView.vue`
- Components exported as default from `.vue` files

**TypeScript Variables:**
- camelCase for variables, functions, composables
  - Example: `useVenueList()`, `locationData`, `isCharity`
- UPPER_CASE for constants
  - Example: `TIER_CONFIG`, `FilterMatchMode`

## Where to Add New Code

**New Feature (e.g., new dialog/workflow):**
- Primary code: `src/dialogs/[feature-name]/[ComponentName].vue`
- Tests: `src/dialogs/[feature-name]/__tests__/[ComponentName].test.ts` (if testing added)
- Example: `src/dialogs/report/ReportView.vue` for new report feature

**New Composable/Shared Logic:**
- Implementation: `src/composables/use[FeatureName].ts`
- Pattern: Export functions with reactive state
- Example: `src/composables/useQuoteCalculation.ts` for pricing logic

**New Utility Functions:**
- Shared helpers: `src/composables/use[UtilityName].ts` or new `src/utils/` folder
- Location: Create `src/utils/` for non-reactive utilities if needed
- Example: `src/utils/mapHelpers.ts` for Leaflet utilities

**New Styles:**
- Global styles: `src/styles/index.css` (top-level concerns)
- Component-scoped: Use `<style scoped>` in `.vue` component files
- Pattern: Tailwind classes preferred, custom CSS via CSS variables

**New Static Assets:**
- Images: `public/img/`
- Favicons: `public/favicon-*.png`
- SVGs: `public/` or embed in components via `<img>` tags

## Special Directories

**node_modules/:**
- Purpose: npm package dependencies
- Generated: Yes (by npm install)
- Committed: No (in .gitignore)

**dist/:**
- Purpose: Production build output
- Generated: Yes (by `npm run build`)
- Committed: No (managed as git submodule per deploy.sh)

ter**.planning/:**
- Purpose: GSD planning documents
- Generated: No (created by GSD commands)
- Committed: Conditionally (depends on project workflow)

**.git/:**
- Purpose: Git version control metadata
- Generated: Yes (by git init/clone)
- Committed: N/A (git internals)

**.idea/, .vscode/:**
- Purpose: IDE configuration (JetBrains, VS Code)
- Generated: Yes (by IDE)
- Committed: Conditionally (see .gitignore)

## File Structure Summary

**Shallow hierarchy:** Most source code lives at `src/` top level or one level deep
- `src/App.vue` (1 file at root)
- `src/composables/` (1 file)
- `src/dialogs/` (1 large component in subdirectory)
- `src/styles/` (1 file)

**Monolithic component:** `WizardView.vue` is 1792 lines containing all wizard logic (venue selection, campaign details, pricing)
- Consider extracting into: separate files for each step or sub-components for pricing/filters if this grows

**Flat config:** All build/type config at project root (vite.config.ts, tsconfig.json, tailwind.config.ts, package.json)

---

*Structure analysis: 2026-03-01*

# Coding Conventions

**Analysis Date:** 2026-03-01

## Naming Patterns

**Files:**
- Vue components: `PascalCase.vue` (e.g., `App.vue`, `WizardView.vue`)
- TypeScript/JavaScript files: `camelCase.ts` (e.g., `useVenueList.ts`, `vite.config.ts`)
- Directories: `lowercase` or `camelCase` (e.g., `src/dialogs/wizard`, `src/composables`)

**Functions:**
- Arrow functions: `const functionName = () => { ... }` (standard approach)
- Regular function declarations: Not observed; prefer const arrow functions
- Lifecycle hooks: Used directly from Vue (e.g., `onMounted`, `watch`, `computed`)
- Composable functions: Prefixed with `use` (e.g., `useVenueList()`)

**Variables:**
- State refs: `const variableName = ref(initialValue)` with type annotation when complex
  - Example: `const locationData = ref<any[]>([])`
  - Example: `const open = ref(false)`
- Computed properties: `const derivedName = computed(() => { ... })`
- Module-level constants: PascalCase for configuration objects
  - Example: `TIER_CONFIG` for tier pricing configuration
  - Example: `const chambers = [...]` for fixed lists

**Types:**
- Inline interfaces when used in single file: `interface SelectedVenues { ... }`
- Generic typing: Prefer specific types when available, use `any` sparingly (currently prevalent in codebase)
- Vue component props typed: `defineProps({ propName: { type: Type, required: boolean } })`

## Code Style

**Formatting:**
- No explicit formatter detected (no `.prettierrc` or `prettier` config)
- TypeScript target: `ESNext` with `strict: true` mode enabled
- Indentation: 2 spaces (observed in source)
- Line length: No enforced limit observed

**Linting:**
- No ESLint configuration detected
- No linting errors enforced in build pipeline
- TypeScript compiler (`vue-tsc`) validates types on build

**Vue 3 Composition API Pattern:**
- All Vue components use `<script setup lang="ts">` syntax
- Imports at top of script block
- Reactive state declared with `ref()` and `computed()`
- Lifecycle hooks imported and used directly (e.g., `onMounted`, `watch`)
- Template binding to reactive state with automatic unwrapping

## Import Organization

**Order:**
1. Vue core imports (`vue`, `primevue/`)
2. Third-party libraries (`leaflet`, `marked`)
3. Local imports from `@/` path alias
4. Styles (CSS imports last)

**Path Aliases:**
- `@/` maps to `./src/` (configured in `tsconfig.json` and `vite.config.ts`)
- Used consistently throughout codebase for internal imports
- Example: `import { useVenueList } from "@/composables/useVenueList"`

**Example Import Structure (from `App.vue`):**
```typescript
import { ref, onMounted, computed } from "vue";
import L from 'leaflet';
import 'leaflet-draw';
import WizardView from "./dialogs/wizard/WizardView.vue";
import { useVenueList } from "@/composables/useVenueList";
```

## Error Handling

**Patterns:**
- No try-catch blocks observed in source code
- Errors handled inline with ternary operators or conditional rendering
- Example from `WizardView.vue`: `@error="(e: Event) => ((e.target as HTMLElement).style.display = 'none')"`
- API calls without error handling: `fetch().then().json()` pattern without catch
- Type narrowing with falsy checks before operations (e.g., `if (!locationData.value) return`)

**API Error Strategy:**
- No error boundaries or global error handling middleware detected
- Fetch calls directly in component lifecycle without error handlers
- Silent failure approach (missing images handled via CSS display:none)

## Logging

**Framework:** `console` object only; no dedicated logging library detected

**Patterns:**
- No log statements observed in production code
- Debug approach: browser console via `console.log()` if needed
- PrimeVue Toast component available for user notifications (`useToast()`)
- Example usage in `WizardView.vue`: `const toast = useToast()`

## Comments

**When to Comment:**
- Section headers for major logical blocks: `// ========== View All Dialog Functions ==========`
- Single-line explanations for non-obvious logic
- Sparse usage; code generally written for readability without extensive comments

**JSDoc/TSDoc:**
- No JSDoc comments observed
- No function/variable documentation blocks
- Type annotations in TypeScript provide implicit documentation

**Example Comment Style (from `App.vue`):**
```typescript
// Navigate back from venue detail to View All list
const backToViewAll = () => {
  open.value = false;
  cameFromViewAll.value = false;
  viewAllOpen.value = true;
}
```

## Function Design

**Size:**
- Functions generally compact (5-30 lines)
- Larger components handle multiple responsibilities (e.g., `WizardView.vue` ~1800 lines)
- Inline computations preferred over extracted utility functions

**Parameters:**
- Parameters typed with Vue's `any` type for flexibility
- Example: `const showModal = (e: any) => { ... }`
- Prefer using component props with `defineProps()` for parent-child communication

**Return Values:**
- Explicit returns from computed properties and functions
- Void functions common for state mutations
- Arrow functions return last expression implicitly when single-line

**Example Function (from `WizardView.vue`):**
```typescript
const selectVenue = (venue: any) => {
  if (selectedVenues.value) {
    const index = selectedVenues.value.selected.findIndex((x: any) => x.id === venue.id);
    if (index > -1) {
      selectedVenues.value.selected.splice(index, 1);
    } else {
      selectedVenues.value.selected.push(venue);
    }
  } else {
    selectedVenues.value = {
      selected: [venue]
    }
  }
}
```

## Module Design

**Exports:**
- Named exports from composables: `export function useVenueList() { ... return { ... } }`
- Component exports implicit via Vue single-file component syntax
- Module composition via Vue composables pattern

**Barrel Files:**
- No barrel files (`index.ts`) observed in project
- Direct imports from specific files preferred

**Composable Pattern:**
- Used for shared state and logic (`useVenueList.ts`)
- Returns object with public interface
- Simple functions returning configuration or constants

**Example Composable (from `useVenueList.ts`):**
```typescript
export function useVenueList() {
    const levelColour = (level: string) => {
        return "#0d47a1";
    }

    return {
        levelColour
    }
}
```

## Vue Component Organization

**Template:**
- Responsive design with Tailwind classes
- Dark mode support via `@media (prefers-color-scheme: dark)`
- Lazy loading images with `loading="lazy"` and `decoding="async"`
- PrimeVue component bindings with v-model and @click handlers

**Style:**
- Scoped styles: `<style scoped>` prevents global pollution
- CSS custom properties for theming: `--blue-billboard-primary`, `--map-tiles-filter`
- Dark mode media queries for theme switching
- Responsive breakpoints with @media queries

**Example Scoped Style Pattern:**
```vue
<style scoped>
/* Section Header */
.element-class {
  property: value;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .element-class {
    property: dark-value;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .element-class {
    property: mobile-value;
  }
}
</style>
```

---

*Convention analysis: 2026-03-01*

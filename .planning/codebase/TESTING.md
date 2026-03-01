# Testing Patterns

**Analysis Date:** 2026-03-01

## Test Framework

**Current Status:** No testing framework detected

**Test Infrastructure:**
- No Jest, Vitest, or other test runner configured
- No test files (`.test.*` or `.spec.*`) present in codebase
- No test scripts in `package.json`
- TypeScript compilation (`vue-tsc`) is only validation tool used

**Dependencies:**
- No testing libraries in `package.json` (no `@testing-library/vue`, `vitest`, `jest`, etc.)
- Only development validation: TypeScript strict mode via `vue-tsc` command

## Test File Organization

**Status:** Not applicable - no tests currently present

**Recommended Structure (for future implementation):**
```
src/
├── App.vue
├── App.test.ts              # Component tests
├── composables/
│   ├── useVenueList.ts
│   └── useVenueList.test.ts # Composable tests
├── dialogs/
│   └── wizard/
│       ├── WizardView.vue
│       └── WizardView.test.ts # Component tests
```

**Naming Convention:**
- Test files: `ComponentName.test.ts` for TypeScript test units
- Vue component tests: `ComponentName.spec.ts` or `ComponentName.test.ts`
- Composable tests: `useComposableName.test.ts`

## Validation Currently In Place

**TypeScript Compilation:**
- Command: `npm run build` (runs `vue-tsc && vite build`)
- Config: `tsconfig.json` with `strict: true`
- Validates:
  - Type safety across entire codebase
  - Vue component prop/emit types
  - Interface compliance
  - No implicit `any` (mitigated by existing `any` usage)

**Type Annotations:**
- Refs with explicit types: `ref<any[]>([])`
- Computed properties typed: `computed(() => { ... })`
- Interface definitions: `interface SelectedVenues { ... }`
- Component props: `defineProps({ openWizard: { type: Boolean, required: true } })`

**Example Type Validation (from `WizardView.vue`):**
```typescript
interface SelectedVenues {
  selected: any[];
}

interface Plan {
  name: string;
  description: string;
  price: number;
  feature1: string;
  features: string[];
}

const props = defineProps({
  openWizard: {
    type: Boolean,
    required: true
  },
  venues: {
    type: Array<any>,
    required: true
  },
  displayGroups: {
    type: Array<any>,
    required: true
  }
});
```

## Test Structure (Recommended for Future)

**Suite Organization:**
```typescript
describe('WizardView', () => {
  // Test setup
  beforeEach(() => {
    // Setup
  });

  describe('selectVenue', () => {
    it('should add venue when not selected', () => {
      // Arrange
      // Act
      // Assert
    });

    it('should remove venue when already selected', () => {
      // Arrange
      // Act
      // Assert
    });
  });

  describe('calculateQuote', () => {
    it('should calculate pricing based on selected venues and duration', () => {
      // Arrange
      // Act
      // Assert
    });

    it('should apply discounts correctly', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## Mocking Strategy (Recommended)

**Framework:** Vitest or Jest recommended for Vue 3 components

**Patterns to Mock:**
- API endpoints (`fetch()` calls)
- Leaflet library instances
- PrimeVue composables (`useToast()`)
- Vue Router (if integrated)
- URL parameters (`window.location.search`)

**Example Mock Pattern (Recommended):**
```typescript
vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(),
    tileLayer: vi.fn(),
    marker: vi.fn(),
    divIcon: vi.fn(),
    layerGroup: vi.fn(),
    Layer: {
      include: vi.fn()
    }
  }
}));

vi.mock('primevue/usetoast', () => ({
  useToast: vi.fn(() => ({
    add: vi.fn()
  }))
}));
```

**What to Mock:**
- External API calls (Blue Billboard venues and groups API)
- Browser APIs (`window.matchMedia`, `window.location`, `document`)
- Third-party library methods (Leaflet map operations)
- PrimeVue composables

**What NOT to Mock:**
- Vue composition API functions (`ref`, `computed`, `watch`)
- Component logic and state management
- DOM rendering (should test rendered output)
- Application-specific composables (test real implementations)

## Fixtures and Factories (Recommended)

**Test Data Structure:**
```typescript
// Mock venue data
const mockVenue = {
  id: '123',
  name: 'Test Venue',
  city: 'Brighton',
  type: 'Shopping Center',
  footfallPerMonth: 50000,
  screenCount: 5,
  rate: 500,
  isRatePerScreen: false,
  image: 'http://example.com/image.jpg',
  description: 'Test venue description',
  level: 'Blue',
  location: {
    coordinates: [-0.196, 50.988]
  },
  impressionsPerMonth: 10000,
  impressionsPerFortnight: 5000
};

// Mock display group
const mockDisplayGroup = {
  id: 'group-1',
  name: 'Test Group',
  venueIds: ['123', '456']
};
```

**Location:**
- Create `src/test/fixtures/` directory
- Create `src/test/factories/` for factory functions
- Example files:
  - `src/test/fixtures/venues.ts` - Mock venue data
  - `src/test/factories/venueFactory.ts` - Dynamic venue creation for tests

## Coverage Requirements

**Status:** No coverage enforcement currently in place

**Recommended Coverage Targets:**
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

**Coverage Focus Areas (by priority):**
1. **Critical Business Logic** - `calculateQuote()` function (pricing, discounts)
2. **State Management** - `selectVenue()`, venue filtering
3. **Composables** - `useVenueList()` and any future composables
4. **Component Rendering** - Dialog visibility, conditional rendering
5. **Integration** - API fetch calls, data transformation

**View Coverage (Recommended Setup):**
```bash
npm run test:coverage    # Generate coverage report
# View in browser:
open coverage/index.html
```

## Test Types

**Unit Tests:**
- **Scope:** Individual functions and composables
- **Approach:**
  - Test pure functions (pricing calculations, filters)
  - Test composable logic in isolation
  - Mock external dependencies
  - Verify return values and side effects

**Example Unit Test (Recommended):**
```typescript
describe('calculateQuote', () => {
  it('should apply 25% charity discount', () => {
    // Setup: Create component instance with test data
    const wrapper = mount(WizardView, {
      props: {
        openWizard: true,
        venues: [mockVenue],
        displayGroups: []
      }
    });

    // Select venue and enable charity
    wrapper.vm.selectVenue(mockVenue);
    wrapper.vm.isCharity = true;
    wrapper.vm.calculateQuote();

    // Verify discount applied
    expect(wrapper.vm.totalRate).toBe(mockVenue.rate * 0.75);
  });
});
```

**Integration Tests:**
- **Scope:** Component interaction, state flow
- **Approach:**
  - Test user interactions (clicks, form inputs)
  - Verify state updates trigger UI changes
  - Test watchers and computed properties
  - Mock only external APIs, not component logic

**Example Integration Test (Recommended):**
```typescript
describe('WizardView User Flow', () => {
  it('should navigate through wizard steps and generate quote', async () => {
    const wrapper = mount(WizardView, {
      props: {
        openWizard: true,
        venues: [mockVenue, mockVenue2],
        displayGroups: [mockGroup]
      }
    });

    // Step 1: Select venues
    const venueCards = wrapper.findAll('[data-test="venue-card"]');
    await venueCards[0].trigger('click');

    // Verify selection
    expect(wrapper.vm.selectedVenues.value?.selected).toHaveLength(1);

    // Step 2: Advance to quote
    wrapper.vm.active = 2;
    await wrapper.vm.$nextTick();

    // Verify quote calculated
    expect(wrapper.vm.plans[0].price).toBeGreaterThan(0);
  });
});
```

**E2E Tests:**
- **Status:** Not configured
- **Recommended Framework:** Playwright or Cypress
- **Scope:** Full user workflows through browser
- **Focus areas:**
  - Map rendering and marker interactions
  - Venue selection across dialogs
  - Quote generation workflow
  - Dark mode switching

## Common Testing Patterns (Recommended)

**Async Testing:**
```typescript
// For async component rendering
it('should fetch venues on mount', async () => {
  vi.mock('fetch', () => vi.fn(() =>
    Promise.resolve({ json: () => Promise.resolve(mockVenues) })
  ));

  const wrapper = mount(App);
  await wrapper.vm.$nextTick();

  expect(wrapper.vm.locationData).toEqual(mockVenues);
});

// For watcher changes
it('should recalculate quote when duration changes', async () => {
  const wrapper = mount(WizardView, { props: defaultProps });
  wrapper.vm.duration = 5;

  await wrapper.vm.$nextTick();
  // Verify recalculation
});
```

**Error Testing:**
```typescript
describe('Error Handling', () => {
  it('should handle image load failure gracefully', async () => {
    const wrapper = mount(App);
    const img = wrapper.find('img');

    await img.trigger('error');

    // Verify image is hidden (display: none applied)
    expect(img.element.style.display).toBe('none');
  });

  it('should handle missing venue data', () => {
    const wrapper = mount(App, {
      data: () => ({ locationData: null })
    });

    // Should not crash
    wrapper.vm.processLocationData();
    expect(wrapper.exists()).toBe(true);
  });
});
```

**Computed Property Testing:**
```typescript
it('should filter venues by search term', async () => {
  const wrapper = mount(WizardView, { props: defaultProps });

  wrapper.vm.filters.global.value = 'Brighton';
  await wrapper.vm.$nextTick();

  const filtered = wrapper.vm.filteredVenues;
  expect(filtered.every(v =>
    v.name.includes('Brighton') ||
    v.city.includes('Brighton')
  )).toBe(true);
});
```

## Recommended Testing Setup

**Package Installation:**
```bash
npm install -D vitest @testing-library/vue jsdom
# OR
npm install -D jest @vue/test-utils @testing-library/vue
```

**Vitest Config (Recommended - `vitest.config.ts`):**
```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

**Scripts to Add to `package.json`:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

*Testing analysis: 2026-03-01*

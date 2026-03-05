# Phase 3: Foundation - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the wizard's flat design identity across all steps: Outfit font applied throughout, zero box shadows on every wizard element, a custom flat step indicator replacing PrimeVue Steps, and direction-aware step transition animations. This phase does not touch venue card images, mobile layout, or campaign/quote step content — those are subsequent phases.

</domain>

<decisions>
## Implementation Decisions

### Step Indicator
- Square blocks (sharp corners) — consistent with flat design system, no border-radius
- Active step: solid navy (#0d47a1) background, white number
- Completed step: solid navy background, white checkmark icon (pi-check) — number replaced by checkmark
- Pending step: gray background, gray number
- Text labels below each block — "Choose Venues", "Additional Information", "Quote" — retained for clarity
- Thin gray horizontal line connector between blocks

### Step Transitions
- Direction-aware: Forward (Next) slides content left (translateX negative), Back slides content right (translateX positive)
- Simultaneous: outgoing step slides out at the same time incoming step slides in — both animate together
- Subtle translateX: 20–30px nudge combined with opacity fade — not full-width slide
- Duration: 200ms (as per WIZD-04 requirement)

### Shadow Removal
- Wizard dialog container: replace PrimeVue shadow with 1px solid gray border, no shadow
- All cards (venue cards, discount cards, count badge, venue chips): fully flat — no shadow, no border replacement
- All buttons: remove box-shadow on all states (default, hover, focus, active) — zero shadows everywhere
- PrimeVue deep CSS overrides needed to suppress default component shadows

### Font
- Outfit typeface applied throughout the entire wizard (all steps, all text elements)
- Loading method: Google Fonts CDN via `<link>` in index.html — consistent with how Inter is currently loaded

### Claude's Discretion
- Exact Outfit font weights to load (e.g., 400, 600, 700)
- Vue `<Transition>` implementation approach for direction-aware animation (dynamic transition name via computed ref)
- Exact CSS keyframes for enter/leave transitions
- How to handle the `active` ref change to detect forward vs back navigation

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `active` ref (number 0/1/2) in WizardView.vue: already tracks current step — direction can be detected by comparing new vs old value in a watch
- `items` ref: array of step labels `[{label: 'Choose Venues'}, ...]` — reusable for the custom indicator
- PrimeIcons available: `pi pi-check` for completed step checkmark

### Established Patterns
- PrimeVue deep overrides with `::deep()` in `<style scoped>` — used extensively for current Steps styling; same approach for removing dialog shadow
- Step visibility controlled via `v-if="active === 0"` / `v-if="active === 1"` / `v-if="active === 2"` — each step is a separate `div.step-container`
- Current animation on `.step-container` uses CSS `@keyframes slideIn` without Vue `<Transition>` — needs to be upgraded to Vue `<Transition>` for direction-aware behavior
- Scoped styles with `@media (prefers-color-scheme: dark)` — shadow removal should cover dark mode too

### Integration Points
- `<Steps>` component at line 372 of WizardView.vue: replace entirely with custom template component
- `::deep(.p-steps)` CSS block at line 684: remove entirely, replaced by custom indicator styles
- `index.html`: add Outfit font `<link>` preconnect + stylesheet (same location as Inter font link)
- `box-shadow` declarations scattered in WizardView.vue CSS (lines 697, 847, 852, 859, 877, 890, 896, 962, 1031): all to be removed or set to `none`

</code_context>

<specifics>
## Specific Ideas

No specific references beyond the requirements — flat design identity is clearly defined by the requirement spec.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-foundation*
*Context gathered: 2026-03-03*

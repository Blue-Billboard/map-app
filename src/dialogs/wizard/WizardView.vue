<script setup lang="ts">
import {ref, watch, computed} from "vue";
import {FilterMatchMode} from '@primevue/core/api';
import {useToast} from "primevue/usetoast";

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
const toast = useToast();
const isCharity = ref<boolean>(false);
const isPartner = ref<boolean>(false);
const isChamber = ref<boolean>(false);
const isCircle = ref<boolean>(false);
const displayGroup = ref<string>("");
const totalRate = ref(0);
const op = ref();
const filters = ref<{
  global: { value: string | null, matchMode: string },
  id: { value: string[] | null, matchMode: string }
}>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  id: { value: null, matchMode: FilterMatchMode.IN },
});

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

const active = ref<number>(0);
const duration = ref<number>(1);
const items = ref([
  {
    label: 'Choose Venues'
  },
  {
    label: 'Additional Information'
  },
  {
    label: 'Quote'
  }
]);

// Pagination for venue list
const currentPage = ref<number>(1);
const itemsPerPage = 8; // Show 8 venues at a time for better performance

const chambers = ["Worthing & Adur Chamber of Commerce", "Sussex Chamber of Commerce", "Brighton Chamber of Commerce", "Worthing Business Circle", "HHBA", "Horsham & Billingshurst Chamber of Commerce", "Independent Worthing"];
const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const selectedVenues = ref<SelectedVenues>();

const emit = defineEmits({
  'close-wizard': null
});

// Use a Set for faster lookups
const selectedVenueIds = computed(() => {
  if (!selectedVenues.value) return new Set();
  return new Set(selectedVenues.value.selected.map((v: any) => v.id));
});

const isVenueInSelected = (venueId: string) => {
  return selectedVenueIds.value.has(venueId);
}

const addVenue = (venue: any) => {
  selectVenue(venue);
}

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

// Create a Map for O(1) venue lookups
const venueMap = computed(() => {
  const map = new Map();
  props.venues.forEach((v: any) => map.set(v.id, v));
  return map;
});

// Event delegation with direct DOM manipulation for instant feedback
const handleGridClick = (event: MouseEvent) => {
  const card = (event.target as HTMLElement).closest('.venue-card');
  if (!card) return;

  const venueId = (card as HTMLElement).dataset.venueId;
  if (!venueId) return;

  const venue = venueMap.value.get(venueId);
  if (!venue) return;

  // Immediately toggle the visual state (no Vue reactivity delay)
  card.classList.toggle('selected');

  // Update the data in the background
  requestIdleCallback(() => {
    selectVenue(venue);
  }, { timeout: 50 });
}

const plans = ref<Plan[]>([
  {
    name: "Starter",
    description: "Gets you on screen for the lowest price",
    price: 0,
    feature1: "8-10 plays/screen/hour",
    features: []
  },
  {
    name: "Optimal",
    description: "For businesses that want more exposure",
    price: 0,
    feature1: "18-20 plays/screen/hour",
    features: []
  },
  {
    name: "Enhanced",
    description: "Maximum exposure for your business",
    price: 0,
    feature1: "36-40 plays/screen/hour",
    features: []
  },
]);

const resetCalculations = () => {
  plans.value[0].features = [];
  plans.value[1].features = [];
  plans.value[2].features = [];

  plans.value[0].price = 0;
  plans.value[1].price = 0;
  plans.value[2].price = 0;
  totalRate.value = 0;
}

const calculateQuote = () => {
  resetCalculations();
  let totalDiscount = 0;
  let totalImpressionsPerMonth = 0;
  let totalImpressionsPerFortnight = 0;
  selectedVenues.value?.selected.forEach((venue: any) => {
    if (venue.isRatePerScreen) {
      totalRate.value += venue.rate * venue.screenCount - 50;
    } else {
      totalRate.value += venue.rate;
    }
    // Sum impressions
    totalImpressionsPerMonth += venue.impressionsPerMonth;
    totalImpressionsPerFortnight += venue.impressionsPerFortnight;
  });

  // Apply Discounts
  // Apply Charity
  if (isCharity.value) {
    totalDiscount = totalDiscount + 0.25;
    plans.value[0].features.push("Includes Charity discount of 25%");
    plans.value[1].features.push("Includes Charity discount of 25%");
    plans.value[2].features.push("Includes Charity discount of 25%");
  }
  // Apply Partner
  if (isPartner.value) {
    totalDiscount = totalDiscount + 0.25;
    plans.value[0].features.push("Includes Partner discount of 25%");
    plans.value[1].features.push("Includes Partner discount of 25%");
    plans.value[2].features.push("Includes Partner discount of 25%");
  }
  // Apply Chamber
  if (isChamber.value) {
    totalDiscount = totalDiscount + 0.25;
    plans.value[0].features.push("Includes Chamber discount of 25%");
    plans.value[1].features.push("Includes Chamber discount of 25%");
    plans.value[2].features.push("Includes Chamber discount of 25%");
  }
  // Apply Circle
  if (isCircle.value) {
    totalDiscount = totalDiscount + 0.25;
    plans.value[0].features.push("Includes WBC discount of 25%");
    plans.value[1].features.push("Includes WBC discount of 25%");
    plans.value[2].features.push("Includes WBC discount of 25%");
  }
  // Apply MultiSite
  if (selectedVenues.value && selectedVenues.value?.selected.length >= 2) {
    totalDiscount = totalDiscount + 0.10;
    plans.value[0].features.push("Includes Multi Site discount of 10%");
    plans.value[1].features.push("Includes Multi Site discount of 10%");
    plans.value[2].features.push("Includes Multi Site discount of 10%");
  }
  // Apply MultiMonth
  if (duration.value >= 3) {
    totalDiscount = totalDiscount + 0.10;
    plans.value[0].features.push("Includes Multi Month discount of 10%");
    plans.value[1].features.push("Includes Multi Month discount of 10%");
    plans.value[2].features.push("Includes Multi Month discount of 10%");
  }
  // Apply Impressions
  plans.value[0].features.push(`Total Impressions Per Month: ${(2.5 / 100) * totalImpressionsPerMonth}`);
  plans.value[1].features.push(`Total Impressions Per Month: ${(5 / 100) * totalImpressionsPerMonth}`);
  plans.value[2].features.push(`Total Impressions Per Month: ${(10 / 100) * totalImpressionsPerMonth}`);

  plans.value[0].features.push(`Total Impressions Per Fortnight: ${(2.5 / 100) * totalImpressionsPerFortnight}`);
  plans.value[1].features.push(`Total Impressions Per Fortnight: ${(5 / 100) * totalImpressionsPerFortnight}`);
  plans.value[2].features.push(`Total Impressions Per Fortnight: ${(10 / 100) * totalImpressionsPerFortnight}`);

  applyDiscount(totalDiscount);
  plans.value[0].price = totalRate.value;
  plans.value[1].price = totalRate.value * 1.8;
  plans.value[2].price = totalRate.value * 3.5;
};

const applyDiscount = (discount: number) => {
  totalRate.value = totalRate.value - (totalRate.value * discount);
};

const toggle = (event: any) => {
  op.value.toggle(event);
}

const closeWizard = () => {
  totalRate.value = 0;
  selectedVenues.value = undefined;
  active.value = 0;
  filters.value.global.value = null;
  resetCalculations();
  emit('close-wizard');
};

watch(active, (newValue) => {
  if (newValue === 2) {
    calculateQuote();
    // Scroll to top of dialog when Quote tab loads
    setTimeout(() => {
      const dialogContent = document.querySelector('.wizard-dialog .p-dialog-content');
      if (dialogContent) {
        dialogContent.scrollTop = 0;
      }
    }, 100);
  }
});

watch(displayGroup, (newValue) => {
  if (newValue) {
    filters.value['id'].value = props.displayGroups.find((d: any) => d.id === newValue).venueIds;
  } else {
    filters.value['id'].value = null;
  }
});

// Computed property for filtered venues
const filteredVenues = computed(() => {
  if (!props.openWizard) return []; // Don't compute if dialog is closed

  let venues = props.venues;

  // Apply global filter
  if (filters.value.global.value) {
    const searchTerm = filters.value.global.value.toLowerCase();
    venues = venues.filter((v: any) =>
      v.name.toLowerCase().includes(searchTerm) ||
      v.city.toLowerCase().includes(searchTerm) ||
      v.type.toLowerCase().includes(searchTerm)
    );
  }

  // Apply ID filter (display group)
  if (filters.value.id.value && filters.value.id.value.length > 0) {
    venues = venues.filter((v: any) => filters.value.id.value!.includes(v.id));
  }

  return venues;
});

// Paginated venues
const paginatedVenues = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredVenues.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredVenues.value.length / itemsPerPage);
});

// Reset to page 1 when filters change
watch([() => filters.value.global.value, () => filters.value.id.value], () => {
  currentPage.value = 1;
});

// Sync visual state when page changes
watch(paginatedVenues, () => {
  // Use nextTick to ensure DOM is updated
  requestAnimationFrame(() => {
    const cards = document.querySelectorAll('.venue-card');
    cards.forEach((card) => {
      const venueId = (card as HTMLElement).dataset.venueId;
      if (venueId && selectedVenueIds.value.has(venueId)) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
  });
}, { flush: 'post' });

// Helper function for level colors
const getLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    'Blue': '#0d47a1',
    'Gold': '#FFD700',
    'Platinum': '#E5E4E2'
  };
  return colors[level] || '#6B7280';
};

// Scroll to CTA section
const scrollToCTA = () => {
  const ctaSection = document.querySelector('.cta-section');
  if (ctaSection) {
    ctaSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};
</script>

<template>
  <Dialog v-model:visible="props.openWizard" modal :style="{ width: '80rem' }"
          class="wizard-dialog"
          style="max-height: 90vh; overflow-y: auto;" :breakpoints="{ '1199px': '85vw', '575px': '95vw' }" :closable="false" :draggable="false">

    <!-- Header with Progress -->
    <template #header>
      <div class="w-full">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create Your Quote</h2>
        <Steps v-model:activeStep="active" :model="items" :readonly="false" class="cursor-pointer" />
      </div>
    </template>

    <div class="wizard-content">
      <!-- STEP 1: Venue Selection -->
      <div v-if="active === 0" class="step-container">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h3 class="text-2xl font-semibold text-gray-900 dark:text-white">Select Your Venues</h3>
              <p class="text-gray-600 dark:text-gray-300 mt-1">Choose the locations where you want to advertise</p>
            </div>
            <div class="flex items-center gap-4">
              <div v-if="selectedVenues?.selected.length" class="bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-lg">
                <span class="text-blue-800 dark:text-blue-200 font-semibold">
                  {{ selectedVenues.selected.length }} venue{{ selectedVenues.selected.length !== 1 ? 's' : '' }} selected
                </span>
              </div>
              <Button
                icon="pi pi-arrow-right"
                iconPos="right"
                @click="active = 1"
                label="Continue"
                size="large"
                :disabled="!selectedVenues || selectedVenues.selected.length === 0"
              />
            </div>
          </div>

          <!-- Filters -->
          <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
            <div class="flex gap-4">
              <div class="relative flex-1">
                <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <InputText
                  v-model="filters['global'].value"
                  placeholder="Search by name, type, or location..."
                  class="w-full pl-10"
                />
              </div>
              <Select
                showClear
                v-model="displayGroup"
                :options="props.displayGroups"
                class="w-80"
                optionLabel="name"
                optionValue="id"
                placeholder="Filter by group"
              />
            </div>
          </div>

          <!-- Results Info -->
          <div class="flex justify-between items-center mb-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Showing {{ paginatedVenues.length }} of {{ filteredVenues.length }} venues
            </p>
          </div>

          <!-- Venue Grid -->
          <div class="venue-grid" @click="handleGridClick">
            <div
              v-for="venue in paginatedVenues"
              :key="venue.id"
              :data-venue-id="venue.id"
              class="venue-card"
            >
              <div class="venue-card-image">
                <img
                  :src="venue.image"
                  :alt="venue.name"
                  loading="lazy"
                  decoding="async"
                  width="400"
                  height="300"
                  @error="(e: Event) => ((e.target as HTMLElement).style.display = 'none')"
                />
              </div>
              <div class="venue-card-content">
                <h4 class="venue-card-title">{{ venue.name }}</h4>
                <div class="venue-card-details">
                  <span><i class="pi pi-map-marker"></i> {{ venue.city }}</span>
                  <span><i class="pi pi-tag"></i> {{ venue.type }}</span>
                </div>
              </div>
              <div class="venue-card-overlay">
                <i :class="isVenueInSelected(venue.id) ? 'pi pi-check-circle' : 'pi pi-plus-circle'"></i>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-6">
            <Button
              icon="pi pi-chevron-left"
              @click="currentPage--"
              :disabled="currentPage === 1"
              outlined
              size="small"
            />
            <span class="text-sm text-gray-600 dark:text-gray-400">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <Button
              icon="pi pi-chevron-right"
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              outlined
              size="small"
            />
          </div>

          <div class="flex justify-center mt-6">
            <Button
              icon="pi pi-arrow-right"
              iconPos="right"
              @click="active = 1"
              label="Continue to Details"
              size="large"
              :disabled="!selectedVenues || selectedVenues.selected.length === 0"
            />
          </div>
        </div>

      <!-- STEP 2: Additional Information -->
      <div v-if="active === 1" class="step-container">
          <div class="mb-6">
            <h3 class="text-2xl font-semibold text-gray-900 dark:text-white">Campaign Details</h3>
            <p class="text-gray-600 dark:text-gray-300 mt-1">Tell us more about your campaign to get accurate pricing</p>
          </div>

          <div class="info-form">
            <!-- Duration -->
            <div class="info-section">
              <label class="info-label">
                <i class="pi pi-calendar"></i>
                Campaign Duration
              </label>
              <Select
                v-model="duration"
                :options="months"
                placeholder="Select duration (months)"
                class="w-full"
              >
                <template #value="slotProps">
                  <span v-if="slotProps.value">{{ slotProps.value }} month{{ slotProps.value !== 1 ? 's' : '' }}</span>
                  <span v-else>{{ slotProps.placeholder }}</span>
                </template>
                <template #option="slotProps">
                  {{ slotProps.option }} month{{ slotProps.option !== 1 ? 's' : '' }}
                </template>
              </Select>
              <p class="info-hint">Campaigns 3+ months receive a 10% discount</p>
            </div>

            <!-- Discounts -->
            <div class="info-section">
              <label class="info-label">
                <i class="pi pi-percentage"></i>
                Available Discounts
              </label>
              <div class="discount-options">
                <div :class="['discount-card', { 'disabled': isPartner || isChamber }]" @click="!isPartner && !isChamber && (isCharity = !isCharity)">
                  <Checkbox v-model="isCharity" :binary="true" :disabled="isPartner || isChamber" />
                  <div class="discount-info">
                    <span class="discount-title">Registered Charity</span>
                  </div>
                  <span class="discount-value">25% off</span>
                </div>

                <div :class="['discount-card', { 'disabled': isChamber || isCharity }]" @click="!isChamber && !isCharity && (isPartner = !isPartner)">
                  <Checkbox v-model="isPartner" :binary="true" :disabled="isChamber || isCharity" />
                  <div class="discount-info">
                    <span class="discount-title">Blue Billboard Partner</span>
                  </div>
                  <span class="discount-value">25% off</span>
                </div>

                <div :class="['discount-card', { 'disabled': isCharity || isPartner }]" @click="!isCharity && !isPartner && (isChamber = !isChamber)">
                  <Checkbox v-model="isChamber" :binary="true" :disabled="isCharity || isPartner" />
                  <div class="discount-info">
                    <span class="discount-title">
                      Chamber Member
                      <Button icon="pi pi-info-circle" @click.stop="toggle" text rounded size="small" class="ml-1" />
                    </span>
                  </div>
                  <span class="discount-value">25% off</span>
                </div>

                <Popover ref="op" class="surface-card shadow-2 border-round">
                  <div class="p-4">
                    <h4 class="font-semibold mb-3">Approved Chambers & Groups</h4>
                    <ul class="space-y-2">
                      <li v-for="(chamber, cIdx) in chambers" :key="cIdx" class="text-sm">
                        <i class="pi pi-check text-green-600 mr-2"></i>{{ chamber }}
                      </li>
                    </ul>
                  </div>
                </Popover>
              </div>
            </div>

            <!-- Selected Venues Summary -->
            <div class="info-section">
              <label class="info-label">
                <i class="pi pi-building"></i>
                Selected Venues ({{ selectedVenues?.selected.length }})
              </label>
              <div class="selected-venues-summary">
                <div v-for="venue in selectedVenues?.selected" :key="venue.id" class="selected-venue-chip">
                  {{ venue.name }}
                  <Button icon="pi pi-times" text rounded size="small" @click="selectVenue(venue)" />
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-between mt-8">
            <Button icon="pi pi-arrow-left" @click="active = 0" label="Back" outlined size="large" />
            <Button icon="pi pi-arrow-right" iconPos="right" @click="calculateQuote(); active = 2" label="View Quote" size="large" />
          </div>
        </div>

      <!-- STEP 3: Quote -->
      <div v-if="active === 2" class="step-container">
          <div class="mb-8 text-center">
            <h3 class="text-3xl font-bold text-gray-900 dark:text-white">Your Custom Quote</h3>
            <p class="text-gray-600 dark:text-gray-300 mt-2 text-lg">Choose the plan that works best for your business</p>
          </div>

          <!-- Pricing Cards -->
          <div class="pricing-grid">
            <div v-for="(plan, index) in plans" :key="index" :class="['pricing-card', { 'featured': index === 1 }]">
              <div v-if="index === 1" class="featured-badge">Most Popular</div>

              <div class="pricing-header">
                <h4 class="pricing-name">{{ plan.name }}</h4>
                <p class="pricing-description">{{ plan.description }}</p>
              </div>

              <div class="pricing-price">
                <span class="currency">£</span>
                <span class="amount">{{ plan.price.toFixed(2) }}</span>
                <span class="period">/month</span>
              </div>
              <p class="pricing-vat">+ VAT</p>

              <div class="pricing-features">
                <div class="feature-item highlight">
                  <i class="pi pi-bolt"></i>
                  <span>{{ plan.feature1 }}</span>
                </div>
                <div v-for="(feature, i) in plan.features" :key="i" class="feature-item">
                  <i class="pi pi-check"></i>
                  <span>{{ feature }}</span>
                </div>
              </div>

              <Button
                @click="scrollToCTA"
                :label="index === 1 ? 'Get Started' : 'Choose Plan'"
                :class="['pricing-cta-button', { 'featured-cta': index === 1 }]"
                size="large"
              />
            </div>
          </div>

          <!-- Call to Action -->
          <div class="cta-section">
            <div class="cta-content">
              <h4 class="cta-title">Ready to Get Started?</h4>
              <p class="cta-description">Contact us today to book your campaign or discuss your requirements</p>
              <div class="cta-buttons">
                <a href="mailto:sales@bluebillboard.co.uk" class="cta-button cta-button-primary">
                  <i class="pi pi-envelope"></i>
                  <span>sales@bluebillboard.co.uk</span>
                </a>
                <a href="tel:08000584275" class="cta-button cta-button-secondary">
                  <i class="pi pi-phone"></i>
                  <span>0800 058 4275</span>
                </a>
              </div>
            </div>
          </div>


          <div class="flex justify-between mt-8">
            <Button icon="pi pi-arrow-left" @click="active = 1" label="Back" outlined size="large" />
            <Button label="Start New Quote" icon="pi pi-refresh" @click="closeWizard" size="large" />
          </div>
        </div>
    </div>

    <template #footer>
      <Button label="Close" icon="pi pi-times" @click="closeWizard" text severity="secondary"/>
    </template>
  </Dialog>

</template>

<style scoped>
/* Override PrimeVue color scheme to use Blue Billboard blue */
:deep(.p-steps .p-steps-item.p-highlight .p-steps-number) {
  background-color: #0d47a1 !important;
  border-color: #0d47a1 !important;
}

:deep(.p-steps .p-steps-item.p-highlight .p-steps-title) {
  color: #0d47a1 !important;
}

:deep(.p-button:not(.p-button-outlined):not(.p-button-text)) {
  background-color: #0d47a1 !important;
  border-color: #0d47a1 !important;
}

:deep(.p-button:not(.p-button-outlined):not(.p-button-text):hover) {
  background-color: #1565c0 !important;
  border-color: #1565c0 !important;
}

:deep(.p-button.p-button-success) {
  background-color: #0d47a1 !important;
  border-color: #0d47a1 !important;
}

:deep(.p-button.p-button-success:hover) {
  background-color: #1565c0 !important;
  border-color: #1565c0 !important;
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  :deep(.p-steps .p-steps-item.p-highlight .p-steps-number) {
    background-color: #60a5fa !important;
    border-color: #60a5fa !important;
  }

  :deep(.p-steps .p-steps-item.p-highlight .p-steps-title) {
    color: #60a5fa !important;
  }

  :deep(.p-button:not(.p-button-outlined):not(.p-button-text)) {
    background-color: #60a5fa !important;
    border-color: #60a5fa !important;
  }

  :deep(.p-button:not(.p-button-outlined):not(.p-button-text):hover) {
    background-color: #3b82f6 !important;
    border-color: #3b82f6 !important;
  }

  :deep(.p-button.p-button-success) {
    background-color: #60a5fa !important;
    border-color: #60a5fa !important;
  }

  :deep(.p-button.p-button-success:hover) {
    background-color: #3b82f6 !important;
    border-color: #3b82f6 !important;
  }
}

/* Dialog Dark Mode */
.wizard-dialog {
  background-color: white;
}

@media (prefers-color-scheme: dark) {
  .wizard-dialog {
    background-color: #111827 !important;
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Layout */
.wizard-content {
  padding: 1.5rem 0;
  min-height: 400px;
}

.step-container {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Venue Grid */
.venue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 0.5rem;
  content-visibility: auto;
}

.venue-card {
  position: relative;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  contain: layout style paint;
  content-visibility: auto;
}

.venue-card:hover {
  border-color: #0d47a1;
}

.venue-card.selected {
  /* Use outline to avoid layout changes */
  outline: 3px solid #0d47a1;
  outline-offset: -3px;
}

.venue-card-image {
  position: relative;
  height: 160px;
  overflow: hidden;
  background: #f3f4f6;
  contain: layout paint;
  contain-intrinsic-size: 160px 280px;
}

.venue-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.venue-card-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.venue-card-content {
  padding: 1rem;
}

.venue-card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.venue-card-details {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.venue-card-details span {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.venue-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(13, 71, 161, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
}

.venue-card.selected .venue-card-overlay {
  opacity: 1;
}

.venue-card-overlay i {
  font-size: 2.5rem;
  color: white;
}

/* Info Form */
.info-form {
  max-width: 800px;
  margin: 0 auto;
}

.info-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.info-hint {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.discount-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.discount-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.discount-card:hover:not(.disabled) {
  border-color: #0d47a1;
  background: #f0f7ff;
}

.discount-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.discount-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.discount-title {
  font-weight: 500;
  color: #111827;
  display: flex;
  align-items: center;
}

.discount-value {
  padding: 0.25rem 0.75rem;
  background: #dcfce7;
  color: #166534;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
}

.selected-venues-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-venue-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

/* Pricing Grid */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

@media (max-width: 1024px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }
}

.pricing-card {
  position: relative;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
}

.pricing-card.featured {
  border-color: #0d47a1;
  box-shadow: 0 4px 12px rgba(13, 71, 161, 0.15);
}

.featured-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #0d47a1 0%, #1976d2 100%);
  color: white;
  padding: 0.375rem 1.25rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pricing-header {
  text-align: center;
  margin-bottom: 2rem;
}

.pricing-name {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.pricing-description {
  color: #6b7280;
  font-size: 0.975rem;
  min-height: 2.5rem;
}

.pricing-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.currency {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
}

.amount {
  font-size: 3.5rem;
  font-weight: 800;
  color: #0d47a1;
  line-height: 1;
  margin: 0 0.25rem;
}

.period {
  font-size: 1rem;
  color: #6b7280;
}

.pricing-vat {
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  margin-bottom: 2rem;
}

.pricing-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #374151;
}

.feature-item i {
  margin-top: 0.125rem;
  color: #10b981;
  font-size: 1rem;
}

.feature-item.highlight {
  background: #eff6ff;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
}

.feature-item.highlight i {
  color: #0d47a1;
}

.pricing-cta-button {
  width: 100%;
  margin-top: 1.5rem;
  background: #0d47a1;
  color: white;
  border: 2px solid #0d47a1;
  font-weight: 600;
  transition: all 0.2s ease;
}

.pricing-cta-button:hover {
  background: #1565c0;
  border-color: #1565c0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 71, 161, 0.3);
}

.pricing-cta-button.featured-cta,
.p-button.pricing-cta-button.featured-cta,
.p-button.pricing-cta-button.featured-cta:not(.p-button-outlined):not(.p-button-text) {
  background: white !important;
  background-color: white !important;
  color: #0d47a1 !important;
  border-color: white !important;
}

.pricing-cta-button.featured-cta:hover,
.p-button.pricing-cta-button.featured-cta:hover,
.p-button.pricing-cta-button.featured-cta:not(.p-button-outlined):not(.p-button-text):hover {
  background: #f0f7ff !important;
  background-color: #f0f7ff !important;
  color: #0d47a1 !important;
  border-color: #0d47a1 !important;
}

/* Call to Action Section */
.cta-section {
  margin: 3rem auto 2rem;
  max-width: 700px;
}

.cta-content {
  background: linear-gradient(135deg, #0d47a1 0%, #1976d2 100%);
  padding: 2.5rem;
  border-radius: 16px;
  text-align: center;
  color: white;
}

.cta-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.cta-description {
  font-size: 1.125rem;
  opacity: 0.95;
  margin-bottom: 2rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.cta-button i {
  font-size: 1.25rem;
}

.cta-button-primary {
  background: white;
  color: #0d47a1;
}

.cta-button-primary:hover {
  background: #f0f7ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cta-button-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.cta-button-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* Save Quote Section */
.save-quote-section {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 12px;
}

.save-quote-form {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  /* Venue Cards */
  .venue-card {
    background: #1f2937;
    border-color: #374151;
  }

  .venue-card:hover {
    border-color: #60a5fa;
    box-shadow: 0 12px 24px rgba(96, 165, 250, 0.15);
  }

  .venue-card.selected {
    background: #1e3a5f;
    border-color: #60a5fa;
  }

  .venue-card-title {
    color: #f9fafb;
  }

  .venue-card-image {
    background: #111827;
  }

  /* Info Section */
  .info-section {
    background: #1f2937;
    border: 1px solid #374151;
  }

  .info-label {
    color: #f9fafb;
  }

  .info-hint {
    color: #9ca3af;
  }

  /* Discount Cards */
  .discount-card {
    background: #111827;
    border-color: #374151;
  }

  .discount-card:hover:not(.disabled) {
    border-color: #60a5fa;
    background: #1e3a5f;
  }

  .discount-title {
    color: #f9fafb;
  }

  .discount-value {
    background: #065f46;
    color: #d1fae5;
  }

  /* Selected Venues */
  .selected-venue-chip {
    background: #111827;
    border-color: #4b5563;
    color: #f9fafb;
  }

  /* Pricing Cards */
  .pricing-card {
    background: #1f2937;
    border-color: #374151;
  }

  .pricing-card:hover {
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  }

  .pricing-card.featured {
    border-color: #60a5fa;
    box-shadow: 0 10px 30px rgba(96, 165, 250, 0.3);
  }

  .pricing-name {
    color: #f9fafb;
  }

  .pricing-description {
    color: #9ca3af;
  }

  .currency {
    color: #d1d5db;
  }

  .amount {
    color: #60a5fa;
  }

  .period {
    color: #9ca3af;
  }

  .pricing-vat {
    color: #6b7280;
  }

  .feature-item {
    color: #d1d5db;
  }

  .feature-item.highlight {
    background: #1e3a5f;
  }

  /* Save Quote Section */
  .save-quote-section {
    background: #1f2937;
    border: 1px solid #374151;
  }

  .save-quote-form {
    background: #111827;
    border: 1px solid #374151;
  }

  .form-label {
    color: #d1d5db;
  }

  /* Pricing CTA Buttons Dark Mode */
  .pricing-cta-button {
    background: #60a5fa;
    border-color: #60a5fa;
  }

  .pricing-cta-button:hover {
    background: #3b82f6;
    border-color: #3b82f6;
  }

  .pricing-cta-button.featured-cta,
  .p-button.pricing-cta-button.featured-cta,
  .p-button.pricing-cta-button.featured-cta:not(.p-button-outlined):not(.p-button-text) {
    background: white !important;
    background-color: white !important;
    color: #1976d2 !important;
    border-color: white !important;
  }

  .pricing-cta-button.featured-cta:hover,
  .p-button.pricing-cta-button.featured-cta:hover,
  .p-button.pricing-cta-button.featured-cta:not(.p-button-outlined):not(.p-button-text):hover {
    background: #e3f2fd !important;
    background-color: #e3f2fd !important;
    color: #1976d2 !important;
    border-color: #60a5fa !important;
  }

  /* CTA Section Dark Mode */
  .cta-content {
    background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  }

  .cta-button-primary {
    background: white;
    color: #1976d2;
  }

  .cta-button-primary:hover {
    background: #e3f2fd;
  }
}
</style>

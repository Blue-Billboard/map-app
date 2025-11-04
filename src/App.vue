<script setup lang="ts">
import {ref, onMounted, computed} from "vue";
import L from 'leaflet';
import 'leaflet-draw';
import WizardView from "./dialogs/wizard/WizardView.vue";
import {useVenueList} from "@/composables/useVenueList";

const open = ref(false);
const wizardOpen = ref(false);
const viewAllOpen = ref(false);
const cameFromViewAll = ref(false);
const map = ref();
const markerGroup = ref();
const locationData = ref<any[]>([]);
const displayGroups = ref<any[]>([]);
const meta = ref();
const {levelColour} = useVenueList();
const isStripped = ref(false);

let lat = 50.9885170505752;
let lng = -0.1969095226736214;
let zoomLevel = 9;

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('stripped') === 'true') {
    isStripped.value = true;
  }

  if (urlParams.get('lat') && urlParams.get('lng')) {
    lat = parseFloat(urlParams.get('lat')!);
    lng = parseFloat(urlParams.get('lng')!);
    zoomLevel = 14;
  }

  map.value = L.map('map').setView([lat, lng], zoomLevel);
  markerGroup.value = L.layerGroup().addTo(map.value);

  let mapSource = "https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png";
  //Check for Dark Mode
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    mapSource = "https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png";
  }

  L.tileLayer(mapSource, {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    className: 'map-tiles'
  }).addTo(map.value);

  L.Layer.include({
    getProps: function () {
      const feature = this.feature = this.feature || {}; // Initialize the feature, if missing.
      feature.type = 'Feature';
      feature.properties = feature.properties || {}; // Initialize the properties, if missing.
      return feature.properties;
    }
  });

  locationData.value = await fetch("https://admin.bluebillboard.co.uk/api/public/venues").then(res => res.json());
  displayGroups.value = await fetch("https://admin.bluebillboard.co.uk/api/public/groups").then(res => res.json());
  processLocationData();

  setTimeout(function () {
    window.dispatchEvent(new Event('resize'));
  }, 1000);
});

const processLocationData = () => {
  if (!locationData.value) return;
  locationData.value.forEach((location: any) => {
    const icon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background:${levelColour(location.level)};" class="marker-pin"></div><img src="img/customcolor_icon_transparent_background.png"  alt="bbLogo"/>`,
      iconSize: [50, 72],
      iconAnchor: [25, 72]
    });
    const coords: any = [location.location.coordinates[1], location.location.coordinates[0]]
    let marker: any = L.marker(coords, {icon: icon}).addTo(markerGroup.value).on('click', (e: any) => showModal(e));
    marker.getProps().meta = location;
  });
};

const showModal = (e: any) => {
  meta.value = e.sourceTarget.getProps().meta;
  cameFromViewAll.value = false;
  open.value = true;
}

// ========== View All Dialog Functions ==========

// Navigate back from venue detail to View All list
const backToViewAll = () => {
  open.value = false;
  cameFromViewAll.value = false;
  viewAllOpen.value = true;
}

// Sort venues by monthly impressions (highest first)
const sortedVenues = computed(() => {
  return [...locationData.value].sort((a, b) => b.footfallPerMonth - a.footfallPerMonth);
});

// Filter state for View All dialog
const viewAllSearchFilter = ref('');
const viewAllGroupFilter = ref('');

// Apply search and group filters to sorted venues
const filteredSortedVenues = computed(() => {
  let venues = sortedVenues.value;

  // Apply search filter (name, city, type)
  if (viewAllSearchFilter.value) {
    const searchTerm = viewAllSearchFilter.value.toLowerCase();
    venues = venues.filter((v: any) =>
      v.name.toLowerCase().includes(searchTerm) ||
      v.city.toLowerCase().includes(searchTerm) ||
      v.type.toLowerCase().includes(searchTerm)
    );
  }

  // Apply group filter
  if (viewAllGroupFilter.value) {
    const group = displayGroups.value.find((g: any) => g.id === viewAllGroupFilter.value);
    if (group && group.venueIds) {
      venues = venues.filter((v: any) => group.venueIds.includes(v.id));
    }
  }

  return venues;
});
</script>

<template>
  <div class="flex h-screen">
    <Dialog v-if="meta" v-model:visible="open" modal class="venue-dialog"
            :style="{ width: '60rem', 'max-height': '90vh' }"
            :breakpoints="{ '1199px': '80vw', '575px': '95vw' }">
      <template #header>
        <div class="venue-dialog-header">
          <div class="venue-title-row">
            <Button v-if="cameFromViewAll" icon="pi pi-arrow-left" @click="backToViewAll" text rounded size="small" class="back-btn" />
            <h2 class="venue-title">{{ meta.name }}</h2>
          </div>
        </div>
      </template>

      <!-- Hero Image -->
      <div class="venue-hero-image">
        <img :src="meta.image" :alt="meta.name" />
      </div>

      <!-- Venue Details -->
      <div class="venue-details">
        <p class="venue-description">{{ meta.description }}</p>

        <div class="venue-stats">
          <div class="stat-item">
            <i class="pi pi-map-marker"></i>
            <div>
              <span class="stat-label">Location</span>
              <span class="stat-value">{{ meta.city }}</span>
            </div>
          </div>

          <div class="stat-item">
            <i class="pi pi-building"></i>
            <div>
              <span class="stat-label">Type</span>
              <span class="stat-value">{{ meta.type }}</span>
            </div>
          </div>

          <div class="stat-item">
            <i class="pi pi-users"></i>
            <div>
              <span class="stat-label">Monthly Footfall</span>
              <span class="stat-value">{{ meta.footfallPerMonth.toLocaleString() }}</span>
            </div>
          </div>

          <div class="stat-item">
            <i class="pi pi-desktop"></i>
            <div>
              <span class="stat-label">Screens</span>
              <span class="stat-value">{{ meta.screenCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </Dialog>

    <wizard-view :open-wizard="wizardOpen" :venues="locationData" :display-groups="displayGroups"
                 @close-wizard="wizardOpen = false"/>

    <!-- View All Venues Dialog -->
    <Dialog v-model:visible="viewAllOpen" modal class="venues-list-dialog"
            :style="{ width: '80rem', 'max-height': '90vh' }"
            :breakpoints="{ '1199px': '85vw', '575px': '95vw' }"
            :draggable="false"
            :closable="true">
      <template #header>
        <div class="w-full">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">All Venues</h2>
        </div>
      </template>

      <div class="view-all-content">
        <!-- Filters -->
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
          <div class="flex gap-4">
            <div class="relative flex-1">
              <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <InputText
                v-model="viewAllSearchFilter"
                placeholder="Search by name, type, or location..."
                class="w-full pl-10"
              />
            </div>
            <Select
              showClear
              v-model="viewAllGroupFilter"
              :options="displayGroups"
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
            Showing {{ filteredSortedVenues.length }} of {{ sortedVenues.length }} venues
          </p>
        </div>

        <!-- Venue Grid -->
        <div class="venue-grid">
          <div
            v-for="venue in filteredSortedVenues"
            :key="venue.id"
            class="venue-card"
            @click="meta = venue; cameFromViewAll = true; open = true; viewAllOpen = false"
          >
            <div class="venue-card-image">
              <img
                :src="venue.image"
                :alt="venue.name"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div class="venue-card-content">
              <h4 class="venue-card-title">{{ venue.name }}</h4>
              <div class="venue-card-details">
                <span><i class="pi pi-map-marker"></i> {{ venue.city }}</span>
                <span><i class="pi pi-tag"></i> {{ venue.type }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>

    <div id="map">

    </div>
    <button @click="isStripped ? viewAllOpen = true : wizardOpen = true" id="quoteButton"
            class="quote-button">
      {{ isStripped ? 'View All' : 'Get Quote' }}
    </button>
    <toast/>
  </div>
</template>

<style scoped>
/* Quote Button */
.quote-button {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 19;
  background-color: #0d47a1;
  color: white;
  font-weight: 700;
  padding: 1.5rem 2.5rem;
  border-radius: 0.5rem;
  font-size: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.quote-button:hover {
  background-color: #1565c0;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

/* Venue Dialog Styling */
.venue-dialog-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.venue-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Back button - only shown when navigating from View All dialog */
.back-btn {
  color: #6b7280 !important;
  width: 2rem !important;
  height: 2rem !important;
  padding: 0 !important;
  flex-shrink: 0;
}

.back-btn:hover {
  color: #0d47a1 !important;
  background: #f3f4f6 !important;
}

.venue-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.2;
}

.venue-level-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #0d47a1 0%, #1565c0 100%);
  color: white;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  width: fit-content;
}

.venue-hero-image {
  width: 100%;
  max-height: 400px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.venue-hero-image img {
  max-width: 100%;
  max-height: 400px;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}

.venue-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.venue-description {
  font-size: 1.125rem;
  line-height: 1.75;
  color: #4b5563;
  margin: 0;
}

.venue-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stat-item i {
  font-size: 1.5rem;
  color: #0d47a1;
  margin-top: 0.25rem;
}

.stat-item > div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .back-btn {
    color: #9ca3af !important;
  }

  .back-btn:hover {
    color: #60a5fa !important;
    background: #374151 !important;
  }

  .venue-title {
    color: #f9fafb;
  }

  .venue-description {
    color: #d1d5db;
  }

  .stat-item {
    background: #1f2937;
    border-color: #374151;
  }

  .stat-item:hover {
    background: #374151;
    border-color: #4b5563;
  }

  .stat-item i {
    color: #60a5fa;
  }

  .stat-label {
    color: #9ca3af;
  }

  .stat-value {
    color: #f9fafb;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .venue-hero-image {
    max-height: 250px;
  }

  .venue-hero-image img {
    max-height: 250px;
  }

  .venue-stats {
    grid-template-columns: 1fr;
  }

  .venue-title {
    font-size: 1.5rem;
  }
}

/* ========== View All Venues Dialog (Stripped Mode) ========== */

.venues-list-dialog {
  background-color: white;
}

@media (prefers-color-scheme: dark) {
  .venues-list-dialog {
    background-color: #111827 !important;
  }
}

.view-all-content {
  padding: 0;
  min-height: 400px;
}

/* Venue Grid - Matches Wizard styling */
.venue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 0.5rem;
  content-visibility: auto;
  max-height: 60vh;
  overflow-y: auto;
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

.venue-card-image {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #f3f4f6;
  contain: layout paint;
  aspect-ratio: 4 / 3;
}

.venue-card-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
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

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .venue-card {
    background: #1f2937;
    border-color: #374151;
  }

  .venue-card:hover {
    border-color: #60a5fa;
    box-shadow: 0 12px 24px rgba(96, 165, 250, 0.15);
  }

  .venue-card-title {
    color: #f9fafb;
  }

  .venue-card-image {
    background: #111827;
  }
}
</style>


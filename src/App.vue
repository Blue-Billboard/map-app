<script setup lang="ts">
import {ref, onMounted} from "vue";
import L from 'leaflet';
import 'leaflet-draw';
import WizardView from "./dialogs/wizard/WizardView.vue";
import {useVenueList} from "@/composables/useVenueList";

const open = ref(false);
const wizardOpen = ref(false);
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
  open.value = true;
}



</script>

<template>
  <div class="flex h-screen">
    <Dialog v-if="meta" v-model:visible="open" modal class="venue-dialog"
            :style="{ width: '60rem', 'max-height': '90vh' }"
            :breakpoints="{ '1199px': '80vw', '575px': '95vw' }">
      <template #header>
        <div class="venue-dialog-header">
          <h2 class="venue-title">{{ meta.name }}</h2>
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
    <div id="map">

    </div>
    <button v-if="!isStripped" @click="wizardOpen = true" id="quoteButton"
            class="quote-button">
      Get Quote
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

.venue-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
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
</style>


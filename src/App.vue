<script setup lang="ts">
/* BOLT Venue Map — the live Blue Billboard network on a warm, BOLT-tinted
   Leaflet map. Photo-teardrop pins, animated hover preview, a right-docked
   venue detail panel with audience/footfall data-viz, a floating plan bar, and
   the BOLT quote builder + branded quote document.
   Implements the "BOLT Venue Map" design (map-ideas/prototype.jsx). */
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@maplibre/maplibre-gl-leaflet' // adds L.maplibreGL (GPU vector base layer)
import { T } from '@/bolt/tokens'
import { buildVenues, networkOf, loadAudience, fmtK, coverBg, type VenueVM } from '@/bolt/data'
import type { QuoteData } from '@/bolt/quote'
import BoltMark from '@/bolt/BoltMark.vue'
import Icon from '@/bolt/Icon.vue'
import HoverPreview from '@/bolt/HoverPreview.vue'
import VenueDetailPanel from '@/bolt/VenueDetailPanel.vue'
import PlanBar from '@/bolt/PlanBar.vue'
import QuoteBuilder from '@/bolt/QuoteBuilder.vue'
import QuoteDocument from '@/bolt/QuoteDocument.vue'

// ─────────────── state ───────────────
const venues = ref<VenueVM[]>([])
const hoverId = ref<string | null>(null)
const selId = ref<string | null>(null)
const planIds = ref<string[]>([])
const quoteOpen = ref(false)
const docData = ref<QuoteData | null>(null)
const weeks = ref(4)
const isStripped = ref(false)
const showQuote = ref(false) // gate the plan bar + quote builder behind ?showQuote=true
const loading = ref(true) // BOLT "charging" overlay until the pins are on the map

const searchQ = ref('')
const searchFocused = ref(false)

const mapTick = ref(0) // bumped on map move/zoom to reproject the hover overlay
// cluster hover: the venues under the hovered cluster + its anchor latlng
const clusterHover = ref<{ venues: VenueVM[]; lat: number; lng: number } | null>(null)

let map: L.Map | undefined
let markerGroup: L.MarkerClusterGroup | undefined
const markers = new Map<string, L.Marker>()

// ─────────────── derived ───────────────
const sel = computed(() => venues.value.find(v => v.id === selId.value) || null)
const plan = computed(() =>
  planIds.value.map(id => venues.value.find(v => v.id === id)).filter(Boolean) as VenueVM[],
)
const hoverV = computed(() =>
  hoverId.value && hoverId.value !== selId.value
    ? venues.value.find(v => v.id === hoverId.value) || null
    : null,
)
const network = computed(() => networkOf(venues.value))
const inPlan = computed(() => !!sel.value && planIds.value.includes(sel.value.id))

const hoverPos = computed(() => {
  void mapTick.value // reactive dependency: reproject on pan/zoom
  const v = hoverV.value
  if (!v || !map) return null
  const p = map.latLngToContainerPoint([v.lat, v.lng])
  // flip the preview below the pin when there isn't room to pop it above
  return { left: `${p.x}px`, top: `${p.y}px`, above: p.y > 330 }
})

const clusterHoverPos = computed(() => {
  void mapTick.value // reproject the roster on pan
  const c = clusterHover.value
  if (!c || !map) return null
  const p = map.latLngToContainerPoint([c.lat, c.lng])
  return { left: `${p.x}px`, top: `${p.y}px`, above: p.y > 300 }
})

const searchResults = computed(() => {
  const q = searchQ.value.trim().toLowerCase()
  if (!q) return []
  return venues.value
    .filter(v => v.name.toLowerCase().includes(q) || v.city.toLowerCase().includes(q) || v.type.toLowerCase().includes(q))
    .slice(0, 6)
})

// ─────────────── plan / selection ───────────────
function selectVenue(id: string) {
  selId.value = id
  hoverId.value = null
}
function togglePlan(id: string) {
  const i = planIds.value.indexOf(id)
  if (i >= 0) planIds.value.splice(i, 1)
  else planIds.value.push(id)
}
function onQuote() {
  if (sel.value && !planIds.value.includes(sel.value.id)) togglePlan(sel.value.id)
  quoteOpen.value = true
}
function pickSearch(v: VenueVM) {
  searchQ.value = ''
  searchFocused.value = false
  const m = markers.get(v.id)
  if (m && markerGroup) {
    // expand any cluster the pin is inside (zoom in / spiderfy) so it's visible,
    // then select once it's on the map so the active ring can apply
    markerGroup.zoomToShowLayer(m, () => selectVenue(v.id))
  } else {
    // atomic center+zoom in one call — panTo() then setZoom() races (the pan is
    // animated, so setZoom re-centers on the mid-flight location)
    map?.setView([v.lat, v.lng], Math.max(map.getZoom(), 13), { animate: true })
    selectVenue(v.id)
  }
}
// delay so a result's mousedown can register before the list closes
function onSearchBlur() {
  setTimeout(() => { searchFocused.value = false }, 150)
}

// close the quote dialog if the plan is emptied out from under it
watch(() => plan.value.length, n => { if (n === 0) quoteOpen.value = false })

// reflect selection as the active pin
watch(selId, (nv, ov) => {
  if (ov) {
    const m = markers.get(ov)
    m?.getElement()?.classList.remove('is-active')
    m?.setZIndexOffset(0)
  }
  if (nv) {
    const m = markers.get(nv)
    m?.getElement()?.classList.add('is-active')
    m?.setZIndexOffset(1000)
  }
})

// ─────────────── pins ───────────────
function pinHtml(v: VenueVM) {
  const dot = v.hot ? '<span class="bolt-pin__dot"></span>' : ''
  const bg = v.img ? `background-image:url('${v.img.replace(/'/g, "%27")}')` : ''
  return `<div class="bolt-pin"><span class="bolt-pin__bubble" style="${bg}"></span><span class="bolt-pin__stem"></span>${dot}</div>`
}
function addMarker(v: VenueVM) {
  const icon = L.divIcon({
    className: 'bolt-pin-icon' + (v.hot ? ' is-hot' : ''),
    html: pinHtml(v),
    iconSize: [64, 84],
    iconAnchor: [32, 84],
  })
  const m = L.marker([v.lat, v.lng], { icon, riseOnHover: true })
  ;(m as any).bbHot = v.hot   // read back by clusterIcon to tint clusters with a top-reach venue
  ;(m as any).bbId = v.id     // reverse lookup for the cluster-hover roster
  m.on('click', () => selectVenue(v.id))
  m.on('mouseover', () => { hoverId.value = v.id; loadAudience(v) })
  m.on('mouseout', () => { if (hoverId.value === v.id) hoverId.value = null })
  markerGroup!.addLayer(m)
  markers.set(v.id, m)
}

// BOLT-styled cluster badge: an ink disc with the venue count, mint-ringed when
// the cluster contains a "top reach" venue. Size steps up with the count.
function clusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const count = cluster.getChildCount()
  const hot = cluster.getAllChildMarkers().some(m => (m as any).bbHot)
  const size = count < 10 ? 44 : count < 25 ? 52 : 60
  const html =
    `<div class="bolt-cluster${hot ? ' is-hot' : ''}" style="width:${size}px;height:${size}px">` +
      `<span class="bolt-cluster__count">${count}</span>` +
    `</div>`
  return L.divIcon({ html, className: 'bolt-cluster-icon', iconSize: L.point(size, size) })
}

// ─────────────── map controls ───────────────
const zoomIn = () => map?.zoomIn()
const zoomOut = () => map?.zoomOut()

// ─────────────── lifecycle ───────────────
const STADIA_API_KEY = 'f5f0fc7d-849a-4c4f-86d3-22e9a7948ad4'
// Stadia's alidade_smooth as a MapLibre GL VECTOR style — GPU-rendered, crisp at
// any DPR, and no per-zoom raster tile-grid fetch (the cause of the slow redraw).
const STADIA_VECTOR_STYLE = `https://tiles.stadiamaps.com/styles/alidade_smooth.json?api_key=${STADIA_API_KEY}`
const TILE_ATTRIBUTION =
  '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'

onMounted(async () => {
  const t0 = performance.now()
  const p = new URLSearchParams(window.location.search)
  isStripped.value = p.get('stripped') === 'true'
  showQuote.value = p.get('showQuote') === 'true'

  let lat = 50.9885170505752
  let lng = -0.1969095226736214
  let zoom = 9
  let hasFocus = false
  if (p.get('lat') && p.get('lng')) {
    lat = parseFloat(p.get('lat')!)
    lng = parseFloat(p.get('lng')!)
    zoom = 14
    hasFocus = true
  }

  // maxZoom must be on the map (not just the tile layer) — markercluster reads
  // map.getMaxZoom() at init, before the tile layer is added, and throws without it
  map = L.map('map', { zoomControl: false, maxZoom: 20 }).setView([lat, lng], zoom)
  markerGroup = L.markerClusterGroup({
    showCoverageOnHover: false,   // the hull polygon fights the warm map aesthetic
    spiderfyOnMaxZoom: true,      // fan out co-located venues so each is pickable
    maxClusterRadius: 55,         // only genuinely-close pins merge
    iconCreateFunction: clusterIcon,
  }).addTo(map)
  ;(L as any).maplibreGL({
    style: STADIA_VECTOR_STYLE,
    attribution: TILE_ATTRIBUTION,
    // Stadia injects the api_key into the tile-source URL only — NOT the glyphs
    // or sprite URLs. From a non-allowlisted origin those 503, and MapLibre
    // retries them on every move (the "lots of requests" churn). Append the key
    // to every Stadia request so glyphs/sprite load once and cache (6h max-age).
    transformRequest: (url: string) =>
      url.includes('stadiamaps.com') && !url.includes('api_key=')
        ? { url: `${url}${url.includes('?') ? '&' : '?'}api_key=${STADIA_API_KEY}` }
        : { url },
    refreshExpiredTiles: false, // don't silently re-fetch tiles when the 6h cache expires mid-session
    fadeDuration: 0,            // no label cross-fade — snappier and less render churn
  }).addTo(map)
  // Only the hover overlays need per-frame reprojection. During a plain pan/zoom
  // with nothing hovered, skip the mapTick bump entirely — it would otherwise
  // re-run the whole App render every frame and fight Leaflet for the main thread.
  // rAF-coalesce so at most one bump per frame while hovering.
  let reprojRaf = 0
  map.on('move zoom', () => {
    if (!hoverId.value && !clusterHover.value) return
    if (reprojRaf) return
    reprojRaf = requestAnimationFrame(() => { reprojRaf = 0; mapTick.value++ })
  })
  map.on('moveend zoomend', () => { mapTick.value++ })
  map.on('click', () => { selId.value = null })
  // clusters recompose on zoom, so drop the roster; panning just reprojects it
  map.on('zoomstart', () => { clusterHover.value = null })

  // hover a cluster → roster of its venues; click still zooms in (roster clears)
  markerGroup
    .on('clustermouseover', (e: any) => {
      const vs = e.layer.getAllChildMarkers()
        .map((m: any) => venues.value.find(v => v.id === m.bbId))
        .filter(Boolean) as VenueVM[]
      const ll = e.layer.getLatLng()
      clusterHover.value = { venues: vs, lat: ll.lat, lng: ll.lng }
    })
    .on('clustermouseout', () => { clusterHover.value = null })
    .on('clusterclick', () => { clusterHover.value = null })

  try {
    const recs = await fetch('https://admin.bluebillboard.co.uk/api/public/venues').then(r => r.json())
    venues.value = buildVenues(recs)
  } catch (e) {
    console.error('[BOLT] failed to load venues', e)
    venues.value = []
  }

  venues.value.forEach(addMarker)
  mapTick.value++

  // frame the whole network unless a specific location was requested
  if (!hasFocus && venues.value.length && markerGroup.getBounds().isValid()) {
    map.fitBounds(markerGroup.getBounds().pad(0.15))
  }

  setTimeout(() => window.dispatchEvent(new Event('resize')), 400)

  // hold the overlay for a minimum beat so a fast localhost load doesn't flash
  const held = performance.now() - t0
  setTimeout(() => { loading.value = false }, Math.max(0, 650 - held))
})

onBeforeUnmount(() => { map?.remove() })

// ─────────────── shared inline styles ───────────────
const glassPill = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '9px 14px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(20,20,20,0.08)',
  boxShadow: '0 8px 24px rgba(20,20,20,0.12)',
}
</script>

<template>
  <div class="bolt-app">
    <div id="map" class="bolt-map"></div>

    <!-- BOLT loading overlay: the mark charges up while venue pins load -->
    <Transition name="bolt-loader-fade">
      <div v-if="loading" class="bolt-loader">
        <div class="bolt-loader__mark">
          <BoltMark :size="60" :color="T.ink" cut-color="#FFF" :radius="16" />
        </div>
        <div class="bolt-loader__track"></div>
        <div class="bolt-loader__label">Charging the network</div>
      </div>
    </Transition>

    <!-- top-left: brand + search -->
    <div v-if="!isStripped" :style="{ position: 'absolute', left: '22px', top: '22px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 60 }">
      <div :style="glassPill">
        <BoltMark :size="22" :color="T.ink" cut-color="#FFF" />
        <span :style="{ fontFamily: T.display, fontWeight: 800, fontSize: '16px', letterSpacing: '-0.04em', color: T.ink }">BOLT</span>
      </div>
      <div :style="{ position: 'relative' }">
        <label :style="{ ...glassPill, padding: '9px 15px', width: '260px', color: T.inkDim, fontSize: '13px', cursor: 'text' }">
          <Icon name="search" :size="14" :stroke="T.inkDim" />
          <input
            v-model="searchQ"
            placeholder="Search the network…"
            @focus="searchFocused = true"
            @click="searchFocused = true"
            @blur="onSearchBlur"
            :style="{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '13px', color: T.ink, fontFamily: T.body }"
          />
        </label>
        <!-- results -->
        <div
          v-if="searchFocused && searchResults.length"
          :style="{ position: 'absolute', top: '48px', left: 0, width: '300px', background: T.surface, border: `1px solid ${T.hair}`, borderRadius: '14px', boxShadow: '0 18px 44px rgba(20,20,20,0.18)', overflow: 'hidden', zIndex: 90 }"
        >
          <button
            v-for="v in searchResults"
            :key="v.id"
            @mousedown.prevent="pickSearch(v)"
            :style="{ display: 'flex', alignItems: 'center', gap: '11px', width: '100%', textAlign: 'left', border: 'none', borderBottom: `1px solid ${T.hairSoft}`, background: 'transparent', cursor: 'pointer', padding: '9px 12px' }"
          >
            <span :style="{ width: '38px', height: '38px', borderRadius: '9px', flexShrink: 0, background: coverBg(v.img) }" />
            <span :style="{ minWidth: 0 }">
              <span :style="{ display: 'block', fontFamily: T.display, fontWeight: 700, fontSize: '14px', color: T.ink, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }">{{ v.name }}</span>
              <span :style="{ display: 'block', fontFamily: T.mono, fontSize: '10.5px', color: T.inkDim, marginTop: '1px' }">{{ v.type }} · {{ v.city }}</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- bottom-left: network stat pill -->
    <div v-if="!isStripped" :style="{ position: 'absolute', left: '22px', bottom: '22px', zIndex: 60 }">
      <div :style="glassPill">
        <Icon name="globe" :size="14" :stroke="T.ink" />
        <span :style="{ fontFamily: T.mono, fontSize: '12px', color: T.ink, fontVariantNumeric: 'tabular-nums' }">{{ network.venues }} venues · {{ fmtK(network.impressions) }} monthly reach</span>
      </div>
    </div>

    <!-- animated hover preview above (or below) the hovered pin -->
    <div v-if="hoverV && hoverPos" :style="{ position: 'absolute', left: hoverPos.left, top: hoverPos.top, zIndex: 70, pointerEvents: 'none' }">
      <HoverPreview :v="hoverV" :above="hoverPos.above" />
    </div>

    <!-- cluster hover roster: lists every venue in the hovered cluster -->
    <div
      v-if="clusterHover && clusterHoverPos"
      :style="{
        position: 'absolute', left: clusterHoverPos.left, top: clusterHoverPos.top, zIndex: 72,
        transform: clusterHoverPos.above ? 'translate(-50%, calc(-100% - 40px))' : 'translate(-50%, 40px)',
        pointerEvents: 'none', width: '256px', background: T.surface, borderRadius: '14px',
        border: `1px solid ${T.hair}`, boxShadow: '0 22px 54px rgba(13,27,42,0.28)',
        padding: '11px 6px 7px', animation: 'vm-fade 140ms ease both',
      }"
    >
      <div :style="{ padding: '0 10px 8px', fontFamily: T.mono, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: T.inkDim }">
        {{ clusterHover.venues.length }} venues
      </div>
      <div
        v-for="v in clusterHover.venues.slice(0, 8)"
        :key="v.id"
        :style="{ display: 'flex', alignItems: 'center', gap: '9px', padding: '5px 10px' }"
      >
        <span :style="{ width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0, background: coverBg(v.img) }" />
        <div :style="{ minWidth: 0, flex: 1 }">
          <div :style="{ fontFamily: T.display, fontWeight: 600, fontSize: '13px', letterSpacing: '-0.01em', color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }">{{ v.name }}</div>
          <div :style="{ fontFamily: T.mono, fontSize: '10px', color: T.inkDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }">{{ v.type }}<template v-if="v.city"> · {{ v.city }}</template></div>
        </div>
        <span v-if="v.hot" :style="{ width: '7px', height: '7px', borderRadius: '999px', background: T.mint, flexShrink: 0 }" />
      </div>
      <div :style="{ padding: '7px 10px 2px', fontFamily: T.mono, fontSize: '10px', letterSpacing: '0.02em', color: T.inkFaint }">
        <template v-if="clusterHover.venues.length > 8">+{{ clusterHover.venues.length - 8 }} more · </template>click to zoom in
      </div>
    </div>

    <!-- map zoom controls (shift left when the detail panel is open) -->
    <div :style="{ position: 'absolute', bottom: '26px', right: sel ? '506px' : '26px', transition: 'right 320ms cubic-bezier(.3,.8,.25,1)', zIndex: 80 }">
      <div :style="{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', border: `1px solid ${T.hair}`, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(20,20,20,0.12)' }">
        <button @click="zoomIn" :style="{ width: '38px', height: '38px', display: 'grid', placeItems: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }">
          <Icon name="plus" :size="16" :width="2" :stroke="T.ink" />
        </button>
        <button @click="zoomOut" :style="{ width: '38px', height: '38px', display: 'grid', placeItems: 'center', border: 'none', borderTop: `1px solid ${T.hair}`, background: 'transparent', cursor: 'pointer' }">
          <span :style="{ width: '14px', height: '2px', borderRadius: '2px', background: T.ink }" />
        </button>
      </div>
    </div>

    <!-- floating plan bar (quote feature only) -->
    <PlanBar v-if="showQuote" :plan="plan" @open="quoteOpen = true" @clear="planIds = []" />

    <!-- venue detail panel -->
    <VenueDetailPanel
      :v="sel"
      :in-plan="inPlan"
      :show-quote="showQuote"
      @close="selId = null"
      @add="() => sel && togglePlan(sel.id)"
      @quote="onQuote"
    />

    <!-- quote builder -->
    <QuoteBuilder
      v-if="showQuote && quoteOpen && plan.length"
      :plan="plan"
      v-model:weeks="weeks"
      @close="quoteOpen = false"
      @remove="togglePlan"
      @view-doc="d => (docData = d)"
    />

    <!-- branded quote document -->
    <QuoteDocument v-if="showQuote && docData" :data="docData" @close="docData = null" />
  </div>
</template>

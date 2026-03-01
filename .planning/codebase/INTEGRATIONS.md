# External Integrations

**Analysis Date:** 2026-03-01

## APIs & External Services

**Blue Billboard Admin API:**
- Service: Blue Billboard venue and group management system
- Hostname: `https://admin.bluebillboard.co.uk`
- Auth: None (public endpoints)

**Venues Endpoint:**
- URL: `https://admin.bluebillboard.co.uk/api/public/venues`
- Method: GET (fetch via native browser Fetch API)
- Purpose: Retrieve all venue locations with metadata
- Data Structure: Array of venue objects with:
  - `id`: Unique identifier
  - `name`: Venue name
  - `city`: Location city
  - `type`: Venue type classification
  - `level`: Venue tier (Blue, Gold, Platinum)
  - `location`: GeoJSON-like object with `coordinates: [longitude, latitude]`
  - `description`: Venue description text
  - `image`: Venue image URL
  - `footfallPerMonth`: Monthly visitor count
  - `screenCount`: Number of display screens
- Called from: `src/App.vue` in `onMounted` hook (line 64)
- Response handling: Direct JSON parsing, stored in `locationData.ref<any[]>`

**Groups Endpoint:**
- URL: `https://admin.bluebillboard.co.uk/api/public/groups`
- Method: GET (fetch via native browser Fetch API)
- Purpose: Retrieve venue grouping/filtering categories
- Data Structure: Array of group objects with:
  - `id`: Group identifier
  - `name`: Display name for group
  - `venueIds`: Array of venue IDs belonging to group
- Called from: `src/App.vue` in `onMounted` hook (line 65)
- Response handling: Direct JSON parsing, stored in `displayGroups.ref<any[]>`

## Map & Geospatial Services

**OpenStreetMap Tile Server:**
- Service: Free raster tiles for map rendering
- Hostname: `https://b.tile.openstreetmap.fr`
- URL Pattern: `https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png`
- Layer: HOT (Humanitarian OpenStreetMap Team) variant
- Purpose: Provide map background tiles for Leaflet
- Called from: `src/App.vue` in `onMounted` hook (line 49)
- Configuration:
  - Max zoom: 19
  - Attribution: OpenStreetMap copyright notice
  - CSS class for styling: `map-tiles`
- Dark Mode Support: Same HOT layer used (CSS filter applied via `map-tiles` class)

## Frontend Assets

**Web Fonts:**
- Service: Inter font CDN
- URL: `https://rsms.me/inter/inter.css`
- Purpose: Typography for application
- Loaded in: `index.html` `<head>` (line 6)

**Leaflet Library Assets:**
- Service: unpkg CDN
- Leaflet CSS: `https://unpkg.com/leaflet@1.9.3/dist/leaflet.css`
- Leaflet-Draw CSS: `https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css`
- Purpose: Map library stylesheets
- Loaded in: `index.html` `<head>` (lines 7-8)

## Data Storage

**Client-Side State:**
- Mechanism: Vue 3 Composition API with `ref()` and `computed()`
- Persistence: None (memory-only, lost on page refresh)
- State modules:
  - `locationData`: Venue locations array from API
  - `displayGroups`: Group filtering data from API
  - `meta`: Currently selected venue for detail view
  - `filters`: DataTable filter state for wizard
  - `active`: Current wizard step index
  - `duration`: Selected campaign duration

**Local Storage:**
- Usage: Not detected
- Caching: Not implemented

**Session Storage:**
- Usage: Not detected

## Authentication & Identity

**Auth Provider:**
- Type: None
- Public API endpoints require no authentication
- All API endpoints are public (no API keys, tokens, or credentials required)

## Monitoring & Observability

**Error Tracking:**
- Type: Not detected
- Fallback: Browser console (standard `console.*` available via DevTools)

**Logs:**
- Approach: None configured
- Manual logging not observed in codebase

**Analytics:**
- Service: Not detected
- Tracking: Not implemented

## URL Parameters & Configuration

**Query Parameter API:**
- `stripped=true` - Minimal UI mode (hides headers, shows "View All" button instead of "Get Quote")
  - Parsed in: `src/App.vue` line 27
  - Usage: Sets `isStripped.value` boolean
- `showQuote=true` - Enable quote button visibility
  - Parsed in: `src/App.vue` line 30
  - Usage: Sets `showQuoteButton.value` boolean
- `lat=<number>` - Initial map latitude
  - Parsed in: `src/App.vue` line 34
  - Default: 50.9885170505752
  - Effect: Changes map view center and zoom level to 14
- `lng=<number>` - Initial map longitude
  - Parsed in: `src/App.vue` line 35
  - Default: -0.1969095226736214
  - Effect: Changes map view center and zoom level to 14

## Browser APIs Used

**Geolocation:**
- Not used

**Local/Session Storage:**
- Not used

**URL/Window APIs:**
- `window.location.search` - Parse URL query parameters (line 26)
- `window.matchMedia()` - Detect dark mode preference (line 45)
- `window.dispatchEvent()` - Trigger resize event for map recalculation (line 69)

## Third-Party Integrations

**None Detected:**
- No payment processors (Stripe, PayPal)
- No email services (SendGrid, Mailgun)
- No analytics (Google Analytics, Mixpanel)
- No CDN configuration beyond unpkg/rsms.me defaults
- No webhooks or callback endpoints

## Data Flow Summary

```
1. Page Load (onMounted)
   ↓
2. Fetch Venues → https://admin.bluebillboard.co.uk/api/public/venues
   ├─ Store in locationData
   └─ Process into map markers
3. Fetch Groups → https://admin.bluebillboard.co.uk/api/public/groups
   └─ Store in displayGroups (for filtering)
4. Load Map Tiles → https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png
   └─ Render base layer
5. Render Markers
   └─ Each venue = marker at coordinates with level-based color
6. User Interactions
   ├─ Click marker → Show venue detail dialog
   └─ Click "Get Quote" → Open wizard with venue selection
```

---

*Integration audit: 2026-03-01*

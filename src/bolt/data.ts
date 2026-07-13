/* BOLT venue map — data model + audience/footfall profiles + format helpers.
   Adapts the live Blue Billboard API records into the view-model the prototype
   (map-ideas/*.jsx) was designed around. Real per-venue audience/footfall is
   fetched lazily from the API (see loadAudience); the type-based profiles below
   remain as a per-field fallback for venues the API has no data for yet. */

import { reactive } from 'vue'

export const API_BASE = 'https://admin.bluebillboard.co.uk/api/public'

// ─────────────── view model ───────────────
export interface VenueVM {
  id: string
  name: string
  city: string
  type: string          // raw venue type, e.g. "Gym", "Golf Club", "Garage"
  img: string           // full image URL
  footfall: number      // footfallPerMonth
  screens: number       // screenCount
  hot: boolean          // "top reach" — mint ring / chip
  lat: number
  lng: number
  rate: number
  isRatePerScreen: boolean
  impressionsPerMonth: number
  openOohTypeId: number       // OpenOOH Venue Taxonomy id (wire field: openOohVenueTypeId)
  cpm: number                 // £ per 1000 impressions, resolved from the CPM rate card
  forecastMonthlyImpressions: number
  impressionsSource: string   // "Measured" | "Forecast" | "Estimated"
  level: string         // Blue | Gold | Platinum
  description: string
  partner?: string
  raw: any
}

// ─────────────── formatting ───────────────
export const fmtK = (n: number): string =>
  n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : '' + n

export const money = (n: number): string => '£' + Math.round(n).toLocaleString('en-GB')

// CSS `background` shorthand for a cover image. Live image URLs contain spaces
// and parentheses, so the url() MUST be quoted or the whole declaration is
// dropped as invalid CSS.
export function coverBg(img: string, base = '#EEE'): string {
  if (!img) return base
  return `${base} url('${img.replace(/'/g, '%27')}') center/cover`
}

// ─────────────── audience profiles (DOOH-style, mock by venue category) ───────────────
export interface AudProfile {
  index: number
  dwell: number
  gender: [number, number]
  affluence: string
  age: [string, number][]
  segments: string[]
  shape: number[]
  peakDay: string
  peakWin: string
}

export const AUD_PROFILES: Record<string, AudProfile> = {
  Football: {
    index: 118, dwell: 74, gender: [62, 38], affluence: 'C1C2 core',
    age: [['18–24', 22], ['25–34', 31], ['35–44', 24], ['45–54', 14], ['55+', 9]],
    segments: ['Sports fans', 'Local families', 'Food & drink'],
    shape: [0.35, 0.30, 0.32, 0.38, 0.55, 1.0, 0.72], peakDay: 'Sat', peakWin: '13:00–18:00',
  },
  Golf: {
    index: 141, dwell: 96, gender: [68, 32], affluence: 'AB affluent',
    age: [['18–24', 6], ['25–34', 14], ['35–44', 22], ['45–54', 29], ['55+', 29]],
    segments: ['Affluent 45+', 'Business', 'Hospitality'],
    shape: [0.62, 0.58, 0.64, 0.70, 0.86, 1.0, 0.94], peakDay: 'Sat', peakWin: '08:00–12:00',
  },
  Gym: {
    index: 127, dwell: 58, gender: [48, 52], affluence: 'C1 urban',
    age: [['18–24', 26], ['25–34', 38], ['35–44', 21], ['45–54', 10], ['55+', 5]],
    segments: ['Health-conscious', 'Young professionals', 'Students'],
    shape: [1.0, 0.92, 0.88, 0.90, 0.82, 0.70, 0.66], peakDay: 'Mon', peakWin: '06:00–09:00',
  },
  Retail: {
    index: 104, dwell: 32, gender: [45, 55], affluence: 'Broad reach',
    age: [['18–24', 18], ['25–34', 24], ['35–44', 23], ['45–54', 19], ['55+', 16]],
    segments: ['Shoppers', 'Families', 'Commuters'],
    shape: [0.62, 0.66, 0.70, 0.78, 0.90, 1.0, 0.84], peakDay: 'Sat', peakWin: '11:00–16:00',
  },
  Hospitality: {
    index: 112, dwell: 68, gender: [52, 48], affluence: 'C1 social',
    age: [['18–24', 29], ['25–34', 34], ['35–44', 19], ['45–54', 11], ['55+', 7]],
    segments: ['Night-out crowd', 'Young adults', 'Music fans'],
    shape: [0.42, 0.40, 0.46, 0.62, 0.88, 1.0, 0.78], peakDay: 'Sat', peakWin: '18:00–23:00',
  },
}

export const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export type ProfileKey = keyof typeof AUD_PROFILES

// OpenOOH Venue Taxonomy id → audience bucket (spec'd mapping; see F3 taxonomy).
const OPENOOH_ID_PROFILE: Record<number, ProfileKey> = {
  401: 'Gym', 40101: 'Gym', 40102: 'Gym',
  803: 'Football',
  801: 'Golf',
  804: 'Hospitality', 805: 'Hospitality', 806: 'Hospitality', 807: 'Hospitality', 809: 'Hospitality', 810: 'Hospitality',
  205: 'Retail',
}

// Map a venue onto one of the five audience buckets. Keyed on the OpenOOH
// Venue Taxonomy id (stable, language-independent) — the raw type-string
// matcher is kept only as a last-resort fallback for venues with no id yet.
export function profileKeyFor(openOohTypeId: number | undefined, type?: string): ProfileKey {
  const id = openOohTypeId || 0
  if (id > 0) {
    if (OPENOOH_ID_PROFILE[id]) return OPENOOH_ID_PROFILE[id]
    if (id >= 20500 && id < 20600) return 'Retail' // 205xx retail sub-categories
    return 'Retail'
  }
  // Legacy fallback — only reached when the id is missing (id === 0).
  const t = (type || '').toLowerCase()
  if (/(golf)/.test(t)) return 'Golf'
  if (/(gym|fitness|leisure|health)/.test(t)) return 'Gym'
  if (/(football|\bfc\b|stadium|sport|rugby|cricket)/.test(t)) return 'Football'
  if (/(bar|pub|restaurant|cafe|caf|hospitality|hotel|club|venue|music)/.test(t)) return 'Hospitality'
  return 'Retail'
}

// Icon per audience bucket (keys of the BOLT icon set).
export const TYPE_ICON: Record<ProfileKey, string> = {
  Gym: 'bolt',
  Football: 'users',
  Golf: 'pin',
  Retail: 'cart',
  Hospitality: 'home',
}

export function iconForType(type: string, openOohTypeId?: number): string {
  return TYPE_ICON[profileKeyFor(openOohTypeId, type)] || 'pin'
}

export interface Audience extends AudProfile {
  byDay: number[]
  footfallReal: boolean   // true when byDay came from the API, false for the synthetic mock
}

// Synthetic profile keyed on venue type — the fallback when the API has no data.
function mockAudienceFor(v: VenueVM): Audience {
  const p = AUD_PROFILES[profileKeyFor(v.openOohTypeId, v.type)] || AUD_PROFILES.Retail
  const dailyAvg = v.footfall / 30
  return { ...p, byDay: p.shape.map(s => Math.round(dailyAvg * 1.7 * s)), footfallReal: false }
}

// Reactive per-venue audience cache, populated lazily by loadAudience() from the
// live API. Reactive so every consumer of audienceFor() re-renders the moment a
// venue's real audience lands.
const audienceCache = reactive(new Map<string, Audience>())

// Synchronous accessor used throughout the UI. Prefers real cached audience,
// falls back to the type-based mock so the panel always has something to show.
export function audienceFor(v: VenueVM): Audience {
  return audienceCache.get(v.id) ?? mockAudienceFor(v)
}

export const WEEKS_PER_MONTH = 4.345

// Monthly impressions for a venue — the single source of truth so the hover card
// and the detail panel always agree. Precedence: the CPM rate-card's forecast
// (server-computed, nightly-refreshed) → the real measured daily series (sum the
// week, scale to a month) → the venue's impressionsPerMonth → footfall.
// Reactive via audienceFor(): updates when a venue's real audience loads.
export function monthlyImpressions(v: VenueVM): number {
  if (v.forecastMonthlyImpressions > 0) return Math.round(v.forecastMonthlyImpressions)
  const a = audienceFor(v)
  return a.footfallReal
    ? Math.round(a.byDay.reduce((s, n) => s + n, 0) * WEEKS_PER_MONTH)
    : (v.impressionsPerMonth || v.footfall)
}

// Mon→Sun, matching footfallByDay ordering and FootfallSection's DAY_INDEX.
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Coerce to a finite number, treating null/undefined/''/NaN as absent — so a
// null field from a partial API rollout falls back rather than becoming 0.
function num(x: any): number | undefined {
  if (x == null || x === '') return undefined
  const n = Number(x)
  return isFinite(n) ? n : undefined
}

// Merge a live /venues/{id}/audience response onto the mock profile, field by
// field, so partial data (real where it exists, null elsewhere) still yields a
// complete Audience. Keeps the Audience shape stable so the viz needs no changes.
function mergeAudience(v: VenueVM, api: any): Audience {
  const mock = mockAudienceFor(v)
  const a = api?.audience ?? {}

  let gender = mock.gender
  const gm = num(a.gender?.male)
  const gf = num(a.gender?.female)
  if (gm != null && gf != null) gender = [Math.round(gm), Math.round(gf)]

  let age = mock.age
  if (Array.isArray(a.age)) {
    const mapped = a.age
      .filter((x: any) => x && x.band != null && num(x.pct) != null)
      .map((x: any) => [String(x.band), Math.round(num(x.pct)!)] as [string, number])
    if (mapped.length) age = mapped
  }

  const segments = Array.isArray(a.segments) && a.segments.length
    ? a.segments.map(String)
    : mock.segments

  let byDay = mock.byDay
  let peakDay = mock.peakDay
  let footfallReal = false
  const fbd = api?.footfallByDay
  if (Array.isArray(fbd) && fbd.length === 7 && fbd.every((n: any) => num(n) != null)) {
    byDay = fbd.map((n: any) => Math.round(num(n)!))
    peakDay = DAY_NAMES[byDay.indexOf(Math.max(...byDay))] ?? mock.peakDay
    footfallReal = true
  }

  const index = num(a.index)
  const dwell = num(a.avgDwellMinutes)
  return {
    index: index != null ? Math.round(index) : mock.index,
    dwell: dwell != null ? Math.round(dwell) : mock.dwell,
    gender,
    affluence: a.affluence ? String(a.affluence) : mock.affluence,
    age,
    segments,
    shape: mock.shape,
    peakDay,
    peakWin: api?.peakWindow ? String(api.peakWindow) : mock.peakWin,
    byDay,
    footfallReal,
  }
}

// Lazily fetch + cache a venue's real audience/footfall. Idempotent: returns the
// cache hit if present. On any failure returns the mock WITHOUT caching, so a
// later reopen can retry.
export async function loadAudience(v: VenueVM): Promise<Audience> {
  const hit = audienceCache.get(v.id)
  if (hit) return hit
  try {
    const res = await fetch(`${API_BASE}/venues/${encodeURIComponent(v.id)}/audience`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const aud = mergeAudience(v, await res.json())
    audienceCache.set(v.id, aud)
    return aud
  } catch (e) {
    console.warn('[BOLT] audience fetch failed for', v.id, e)
    return mockAudienceFor(v)
  }
}

// ─────────────── live record → view model ───────────────
export function toVM(rec: any): VenueVM | null {
  const coords = rec?.location?.coordinates
  if (!Array.isArray(coords) || coords.length < 2) return null
  const lng = Number(coords[0])
  const lat = Number(coords[1])
  if (!isFinite(lat) || !isFinite(lng)) return null
  return {
    id: String(rec.id ?? rec._id ?? rec.name),
    name: rec.name ?? 'Venue',
    city: rec.city ?? '',
    type: rec.type ?? 'Venue',
    img: rec.image ?? '',
    footfall: Number(rec.footfallPerMonth) || 0,
    screens: Number(rec.screenCount) || 1,
    hot: false,
    lat, lng,
    rate: Number(rec.rate) || 0,
    isRatePerScreen: !!rec.isRatePerScreen,
    impressionsPerMonth: Number(rec.impressionsPerMonth) || 0,
    openOohTypeId: Number(rec.openOohVenueTypeId) || 0,
    cpm: Number(rec.cpm) || 0,
    forecastMonthlyImpressions: Number(rec.forecastMonthlyImpressions) || 0,
    impressionsSource: rec.impressionsSource ?? '',
    level: rec.level ?? 'Blue',
    description: rec.description ?? '',
    partner: rec.partner,
    raw: rec,
  }
}

// Build the venue list, flagging the top ~30% by monthly reach as "hot".
export function buildVenues(records: any[]): VenueVM[] {
  const vms = (records || []).map(toVM).filter(Boolean) as VenueVM[]
  if (!vms.length) return vms
  const sorted = [...vms].sort((a, b) => b.footfall - a.footfall)
  const hotCount = Math.max(3, Math.round(sorted.length * 0.3))
  const hotIds = new Set(sorted.slice(0, hotCount).map(v => v.id))
  vms.forEach(v => { v.hot = hotIds.has(v.id) && v.footfall > 0 })
  return vms
}

export interface Network { venues: number; screens: number; impressions: number }

export function networkOf(vms: VenueVM[]): Network {
  return {
    venues: vms.length,
    screens: vms.reduce((s, v) => s + v.screens, 0),
    impressions: vms.reduce((s, v) => s + v.footfall, 0),
  }
}

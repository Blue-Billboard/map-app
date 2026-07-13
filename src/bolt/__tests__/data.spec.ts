/* Unit tests for src/bolt/data.ts — toVM wire mapping, monthlyImpressions
   precedence, and profileKeyFor's OpenOOH id → audience bucket lookup. */

import { describe, it, expect, vi } from 'vitest'
import { toVM, monthlyImpressions, profileKeyFor, loadAudience, WEEKS_PER_MONTH, type VenueVM } from '../data'

// Minimal valid /api/public/venues wire record. Overrides layer on top so each
// test only spells out the fields it cares about.
function rawVenue(overrides: Record<string, any> = {}) {
  return {
    id: 'raw-1',
    name: 'Test Venue',
    city: 'London',
    type: 'Gym',
    location: { coordinates: [-0.1, 51.5] },
    image: '',
    footfallPerMonth: 1000,
    screenCount: 2,
    rate: 50,
    isRatePerScreen: false,
    impressionsPerMonth: 900,
    openOohVenueTypeId: 401,
    cpm: 8,
    forecastMonthlyImpressions: 1500,
    impressionsSource: 'Forecast',
    level: 'Gold',
    description: 'desc',
    ...overrides,
  }
}

let idCounter = 0
// Full VenueVM builder for tests that don't need to go via the wire shape.
// Each call gets a unique id so the module-level audienceCache in data.ts
// never leaks state between tests.
function makeVenue(overrides: Partial<VenueVM> = {}): VenueVM {
  idCounter += 1
  return {
    id: `venue-${idCounter}`,
    name: 'Venue',
    city: 'City',
    type: 'Retail',
    img: '',
    footfall: 0,
    screens: 1,
    hot: false,
    lat: 51.5,
    lng: -0.1,
    rate: 0,
    isRatePerScreen: false,
    impressionsPerMonth: 0,
    openOohTypeId: 0,
    cpm: 0,
    forecastMonthlyImpressions: 0,
    impressionsSource: '',
    level: 'Blue',
    description: '',
    raw: {},
    ...overrides,
  }
}

describe('toVM', () => {
  it('maps the CPM/forecast fields from the real wire field name (openOohVenueTypeId)', () => {
    const vm = toVM(rawVenue())!
    expect(vm).not.toBeNull()
    expect(vm.openOohTypeId).toBe(401)
    expect(vm.cpm).toBe(8)
    expect(vm.forecastMonthlyImpressions).toBe(1500)
    expect(vm.impressionsSource).toBe('Forecast')
  })

  it('coerces string numerics (Number()) and defaults missing fields', () => {
    const vm = toVM(rawVenue({
      openOohVenueTypeId: '803',
      cpm: '12.5',
      forecastMonthlyImpressions: undefined,
      impressionsSource: undefined,
    }))!
    expect(vm.openOohTypeId).toBe(803)
    expect(vm.cpm).toBe(12.5)
    expect(vm.forecastMonthlyImpressions).toBe(0)
    expect(vm.impressionsSource).toBe('')
  })

  it('returns null when location coordinates are missing (unchanged guard)', () => {
    expect(toVM(rawVenue({ location: undefined }))).toBeNull()
  })
})

describe('monthlyImpressions precedence', () => {
  it('prefers forecastMonthlyImpressions over impressionsPerMonth/footfall', () => {
    const v = makeVenue({ forecastMonthlyImpressions: 5000, impressionsPerMonth: 999, footfall: 111 })
    expect(monthlyImpressions(v)).toBe(5000)
  })

  it('falls back to impressionsPerMonth when there is no forecast or cached real audience', () => {
    const v = makeVenue({ forecastMonthlyImpressions: 0, impressionsPerMonth: 2000, footfall: 500 })
    expect(monthlyImpressions(v)).toBe(2000)
  })

  it('falls back to footfall as the last resort', () => {
    const v = makeVenue({ forecastMonthlyImpressions: 0, impressionsPerMonth: 0, footfall: 777 })
    expect(monthlyImpressions(v)).toBe(777)
  })

  it('prefers cached real measured audience over impressionsPerMonth once loaded', async () => {
    const v = makeVenue({ forecastMonthlyImpressions: 0, impressionsPerMonth: 9999, footfall: 111 })
    const byDay = [10, 20, 30, 40, 50, 60, 70] // sum = 280
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ footfallByDay: byDay }),
    })))
    await loadAudience(v)
    const expected = Math.round(byDay.reduce((s, n) => s + n, 0) * WEEKS_PER_MONTH)
    expect(monthlyImpressions(v)).toBe(expected)
    vi.unstubAllGlobals()
  })
})

describe('profileKeyFor — OpenOOH id → audience bucket', () => {
  it.each([
    [401, 'Gym'],
    [803, 'Football'],
    [801, 'Golf'],
    [804, 'Hospitality'],
    [205, 'Retail'],
  ] as const)('maps OpenOOH id %i to %s', (id, expected) => {
    expect(profileKeyFor(id)).toBe(expected)
  })

  it('falls back to the string-type matcher only when the id is missing', () => {
    expect(profileKeyFor(0, 'Golf Club')).toBe('Golf')
    expect(profileKeyFor(undefined, 'Local Gym')).toBe('Gym')
  })
})

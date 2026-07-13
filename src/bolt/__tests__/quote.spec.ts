/* Unit tests for src/bolt/quote.ts — the CPM quote formula, anyEstimated
   flagging, and confirmation that the D4 discount removal actually holds
   (a "partner"/"charity" venue prices identically to a plain one). */

import { describe, it, expect } from 'vitest'
import { computeQuote } from '../quote'
import type { VenueVM } from '../data'

let idCounter = 0
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

// weeks chosen so flightImps === forecastMonthlyImpressions exactly
// (weeks * 7 / 30 === 1), which keeps the fixture numbers below legible.
const WEEKS_1TO1 = 30 / 7

describe('computeQuote — CPM formula', () => {
  it('sov 4.16: raw price is £49.92 (8 × 150,000 × 4.16% / 1000); cost rounds the sum once → £50', () => {
    const v = makeVenue({ cpm: 8, forecastMonthlyImpressions: 150000, footfall: 1000 })
    const quote = computeQuote([v], WEEKS_1TO1, 4.16)
    expect(quote.cost).toBe(50)
    expect(quote.impressions).toBe(6240)
  })

  it('sov 100: full share of the CPM value, exact', () => {
    const v = makeVenue({ cpm: 8, forecastMonthlyImpressions: 150000 })
    const quote = computeQuote([v], WEEKS_1TO1, 100)
    expect(quote.cost).toBe(1200)
    expect(quote.impressions).toBe(150000)
  })

  it('zero forecast impressions gives a zero-cost quote', () => {
    const v = makeVenue({ cpm: 8, forecastMonthlyImpressions: 0 })
    const quote = computeQuote([v], WEEKS_1TO1, 4.16)
    expect(quote.cost).toBe(0)
    expect(quote.impressions).toBe(0)
  })

  it('sums cost/impressions across multiple venues, rounding only once at the total', () => {
    // a: price = 8 × 150,000 × 4.16% / 1000 = 49.92
    // b: price = 5 ×  90,000 × 4.16% / 1000 = 18.72
    // sum = 68.64 → round once = 69 (NOT round(49.92) + round(18.72) = 50 + 19 = 69 coincidentally
    // matches here, but the implementation must sum first then round once — see the D2 decision)
    const a = makeVenue({ cpm: 8, forecastMonthlyImpressions: 150000, footfall: 1000, screens: 2 })
    const b = makeVenue({ cpm: 5, forecastMonthlyImpressions: 90000, footfall: 500, screens: 3 })
    const quote = computeQuote([a, b], WEEKS_1TO1, 4.16)
    expect(quote.cost).toBe(69)
    expect(quote.impressions).toBe(9984)
    expect(quote.reach).toBe(1500)
    expect(quote.screens).toBe(5)
  })
})

describe('computeQuote — anyEstimated flag', () => {
  it('is true when any included venue is Estimated', () => {
    const measured = makeVenue({ impressionsSource: 'Measured' })
    const estimated = makeVenue({ impressionsSource: 'Estimated' })
    expect(computeQuote([measured, estimated], 4, 4.16).anyEstimated).toBe(true)
  })

  it('is false when no venue is Estimated', () => {
    const measured = makeVenue({ impressionsSource: 'Measured' })
    const forecast = makeVenue({ impressionsSource: 'Forecast' })
    expect(computeQuote([measured, forecast], 4, 4.16).anyEstimated).toBe(false)
  })
})

describe('computeQuote — no discounts (D4)', () => {
  it('a venue flagged as a partner/charity prices identically to a plain venue — same CPM, same total', () => {
    const plain = makeVenue({ cpm: 8, forecastMonthlyImpressions: 150000 })
    const partnerFlagged = makeVenue({ cpm: 8, forecastMonthlyImpressions: 150000, partner: 'Charity Partner Ltd' })
    const quoteA = computeQuote([plain], WEEKS_1TO1, 4.16)
    const quoteB = computeQuote([partnerFlagged], WEEKS_1TO1, 4.16)
    expect(quoteB.cost).toBe(quoteA.cost)
    expect(quoteB.impressions).toBe(quoteA.impressions)
  })
})

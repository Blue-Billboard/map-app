/* Quote maths + shared QuoteData shape — used by QuoteBuilder and QuoteDocument
   so both agree on numbers. Uses REAL per-venue rates from the live API, falling
   back to the prototype's indicative rate only where a venue has none. */

import type { VenueVM } from './data'

export const RATE = 420               // £ / screen / month — indicative fallback only
export const IMPRESSION_RATE = 0.12   // plays per footfall — fallback when no live impressions
export const SALES_EMAIL = 'sales@bluebillboard.co.uk'

export interface Contact {
  name: string
  email: string
  phone: string
  company: string
}

export interface QuoteTotals {
  reach: number         // combined footfall / month
  screens: number
  months: number        // flight length in months
  cost: number          // indicative media total for the flight (£)
  impressions: number   // estimated plays over the flight
}

// Media for one venue for one month.
function venueMonthly(v: VenueVM): number {
  if (v.rate > 0) return v.isRatePerScreen ? v.rate * v.screens : v.rate
  return RATE * v.screens
}

export function computeQuote(plan: VenueVM[], weeks: number): QuoteTotals {
  const reach = plan.reduce((s, v) => s + v.footfall, 0)
  const screens = plan.reduce((s, v) => s + v.screens, 0)
  const months = weeks / 4.345
  const media = plan.reduce((s, v) => s + venueMonthly(v), 0)
  const cost = Math.round(media * months)
  const impBase = plan.reduce(
    (s, v) => s + (v.impressionsPerMonth > 0 ? v.impressionsPerMonth : v.footfall * IMPRESSION_RATE),
    0,
  )
  const impressions = Math.round(impBase * months)
  return { reach, screens, months, cost, impressions }
}

export interface QuoteData extends QuoteTotals {
  ref: string
  contact: Contact
  campaign: string
  startDate: string
  weeks: number
  plan: VenueVM[]
  date: string
}

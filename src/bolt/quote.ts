/* Quote maths + shared QuoteData shape — used by QuoteBuilder and QuoteDocument
   so both agree on numbers. CPM-based: every venue carries a rate-card CPM and
   a forecast monthly impressions figure resolved server-side, so the quote is
   the raw CPM price for the flight — no discounts, no per-venue fallback rate. */

import type { VenueVM } from './data'

export const SALES_EMAIL = 'sales@bluebillboard.co.uk'

export interface Contact {
  name: string
  email: string
  phone: string
  company: string
}

export interface QuoteTotals {
  reach: number         // combined footfall / month (unchanged, footfall-based)
  screens: number
  cost: number          // indicative media total for the flight (£), CPM-based, rounded once
  impressions: number   // estimated plays over the flight at the given SoV
  anyEstimated: boolean // true when any included venue's impressions figure is Estimated (not Measured/Forecast)
}

// flightImps = forecastMonthlyImpressions × weeks × 7 / 30 (a month's forecast, scaled to the flight length)
// price = cpm × flightImps × sov/100 / 1000 (CPM = £ per 1000 impressions, sov = the tier's share of plays)
export function computeQuote(plan: VenueVM[], weeks: number, sov: number): QuoteTotals {
  const reach = plan.reduce((s, v) => s + v.footfall, 0)
  const screens = plan.reduce((s, v) => s + v.screens, 0)
  const share = sov / 100
  let cost = 0
  let impressions = 0
  plan.forEach(v => {
    const flightImps = v.forecastMonthlyImpressions * weeks * 7 / 30
    cost += v.cpm * flightImps * share / 1000
    impressions += flightImps * share
  })
  const anyEstimated = plan.some(v => v.impressionsSource === 'Estimated')
  return { reach, screens, cost: Math.round(cost), impressions: Math.round(impressions), anyEstimated }
}

export interface QuoteData extends QuoteTotals {
  ref: string
  contact: Contact
  campaign: string
  startDate: string
  weeks: number
  sov: number
  plan: VenueVM[]
  date: string
}

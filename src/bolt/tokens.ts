/* BOLT design tokens — mirrors the design-system `T` object from the prototype
   (admin-redesign/chrome.jsx). Components bind these via inline :style so the
   Vue port stays faithful to the source. */

export const T = {
  bg:         '#F5F1EA',
  bg2:        '#EDE8DF',
  surface:    '#FFFFFF',
  surfaceAlt: '#FAF7F1',
  ink:        '#141414',
  inkMid:     '#3F3A33',
  inkDim:     'rgba(20,20,20,0.58)',
  inkFaint:   'rgba(20,20,20,0.35)',
  hair:       'rgba(20,20,20,0.10)',
  hairSoft:   'rgba(20,20,20,0.06)',
  nav:        '#0D1B2A',
  navTint:    '#0A1523',
  blue:       '#2E6BFF',
  mint:       '#1EC8A5',
  pink:       '#EC407A',
  amber:      '#FFB84A',
  green:      '#22C55E',
  red:        '#EF4444',
  display:    "'Bricolage Grotesque', sans-serif",
  body:       "'General Sans', 'Inter', sans-serif",
  mono:       "ui-monospace, 'JetBrains Mono', SFMono-Regular, Menlo, monospace",
} as const

export type Tokens = typeof T

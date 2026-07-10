<script setup lang="ts">
/* Footfall-by-day block: 7 vertical bars, busiest day in blue.
   Ports the prototype's FootfallSection + WeekBars. */
import { computed } from 'vue'
import { T } from './tokens'
import { DAYS, type Audience } from './data'

const props = defineProps<{ aud: Audience }>()

const DAY_INDEX: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }

const peakIdx = computed(() => DAY_INDEX[props.aud.peakDay] ?? 5)
const max = computed(() => Math.max(...props.aud.byDay) || 1)
const fmt = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1) + 'k' : '' + n)
</script>

<template>
  <div>
    <!-- section label -->
    <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }">
      <span :style="{ fontFamily: T.mono, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: T.inkDim }">Impressions by day</span>
      <span :style="{ fontFamily: T.mono, fontSize: '11px', color: T.inkDim }">busiest <b :style="{ color: T.ink }">{{ aud.peakDay }}</b> · {{ aud.peakWin }}</span>
    </div>

    <!-- bars -->
    <div>
      <div :style="{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '96px' }">
        <div
          v-for="(n, i) in aud.byDay"
          :key="i"
          :style="{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', height: '100%', justifyContent: 'flex-end' }"
        >
          <span :style="{ fontFamily: T.mono, fontSize: '9.5px', color: i === peakIdx ? T.blue : T.inkFaint, fontWeight: i === peakIdx ? 700 : 500, fontVariantNumeric: 'tabular-nums' }">{{ fmt(n) }}</span>
          <div :style="{ width: '100%', height: `${(n / max) * 100}%`, minHeight: '4px', borderRadius: '5px 5px 3px 3px', background: i === peakIdx ? T.blue : 'rgba(46,107,255,0.20)' }" />
        </div>
      </div>
      <div :style="{ display: 'flex', gap: '8px', marginTop: '8px' }">
        <span
          v-for="(d, i) in DAYS"
          :key="i"
          :style="{ flex: 1, textAlign: 'center', fontFamily: T.mono, fontSize: '10px', fontWeight: i === peakIdx ? 700 : 500, color: i === peakIdx ? T.ink : T.inkFaint }"
        >{{ d }}</span>
      </div>
    </div>
  </div>
</template>

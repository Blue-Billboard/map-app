<script setup lang="ts">
/* Floating plan bar — bottom-center. Shows plan count, combined reach + screens,
   clear, and a "Build quote" CTA. Slides in when the plan is non-empty. */
import { computed } from 'vue'
import { T } from './tokens'
import { fmtK, type VenueVM } from './data'
import Icon from './Icon.vue'

const props = defineProps<{ plan: VenueVM[] }>()
const emit = defineEmits<{ (e: 'open'): void; (e: 'clear'): void }>()

const show = computed(() => props.plan.length > 0)
const reach = computed(() => props.plan.reduce((s, v) => s + v.footfall, 0))
const screens = computed(() => props.plan.reduce((s, v) => s + v.screens, 0))
</script>

<template>
  <div :style="{
    position: 'absolute',
    left: '50%',
    bottom: '26px',
    transform: `translateX(-50%) translateY(${show ? 0 : 120}px)`,
    transition: 'transform 340ms cubic-bezier(.3,.85,.25,1)',
    zIndex: 110,
  }">
    <div :style="{
      display: 'flex',
      alignItems: 'center',
      gap: '18px',
      background: T.nav,
      color: '#FFF',
      borderRadius: '999px',
      padding: '11px 12px 11px 22px',
      boxShadow: '0 20px 50px rgba(13,27,42,0.4)',
    }">
      <div :style="{ display: 'flex', alignItems: 'center', gap: '20px' }">
        <span :style="{ display: 'flex', alignItems: 'baseline', gap: '7px' }">
          <b :style="{ fontFamily: T.display, fontWeight: 700, fontSize: '20px', letterSpacing: '-0.03em' }">{{ plan.length }}</b>
          <span :style="{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)' }">venue{{ plan.length !== 1 ? 's' : '' }} in plan</span>
        </span>
        <span :style="{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.16)' }" />
        <span :style="{ fontFamily: T.mono, fontSize: '12.5px', color: 'rgba(255,255,255,0.85)', fontVariantNumeric: 'tabular-nums' }">{{ fmtK(reach) }} reach · {{ screens }} screens</span>
      </div>
      <button
        title="Clear plan"
        @click="emit('clear')"
        :style="{
          width: '32px', height: '32px', borderRadius: '999px', border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', display: 'grid', placeItems: 'center',
        }"
      >
        <Icon name="trash" :size="15" stroke="rgba(255,255,255,0.7)" />
      </button>
      <button
        @click="emit('open')"
        :style="{
          display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none',
          background: T.mint, color: '#04261F', borderRadius: '999px', padding: '10px 18px',
          fontFamily: T.body, fontWeight: 700, fontSize: '13.5px', whiteSpace: 'nowrap',
        }"
      >
        <Icon name="pound" :size="15" :width="2" stroke="#04261F" /> Build quote →
      </button>
    </div>
  </div>
</template>

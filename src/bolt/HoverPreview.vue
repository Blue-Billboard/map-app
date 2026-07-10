<script setup lang="ts">
/* Animated hover preview card that floats above a pin (or below, when the pin
   is near the top edge). The parent positions this at the pin's projected pixel
   point; this component keeps the pop transform + animation. */
import { computed } from 'vue'
import { T } from './tokens'
import { fmtK, coverBg, monthlyImpressions, type VenueVM } from './data'
import Chip from './Chip.vue'

const props = withDefaults(defineProps<{ v: VenueVM; above?: boolean }>(), { above: true })

const heroStyle = computed(() => ({ height: '118px', background: coverBg(props.v.img) }))

const rootStyle = computed(() => ({
  position: 'absolute' as const,
  transform: props.above ? 'translate(-50%, calc(-100% - 74px))' : 'translate(-50%, 22px)',
  zIndex: 70,
  pointerEvents: 'none' as const,
  animation: `${props.above ? 'vm-pop' : 'vm-pop-down'} 200ms cubic-bezier(.2,.8,.2,1) both`,
  transformOrigin: props.above ? 'center bottom' : 'center top',
}))

const pointerStyle = computed(() =>
  props.above
    ? {
        position: 'absolute' as const, left: '50%', bottom: '-7px', width: '14px', height: '14px',
        transform: 'translateX(-50%) rotate(45deg)', background: T.surface,
        borderRight: `1px solid ${T.hair}`, borderBottom: `1px solid ${T.hair}`,
      }
    : {
        position: 'absolute' as const, left: '50%', top: '-7px', width: '14px', height: '14px',
        transform: 'translateX(-50%) rotate(45deg)', background: T.surface,
        borderLeft: `1px solid ${T.hair}`, borderTop: `1px solid ${T.hair}`,
      },
)
</script>

<template>
  <div :style="rootStyle">
    <div :style="{
      width: '236px',
      background: T.surface,
      borderRadius: '16px',
      border: `1px solid ${T.hair}`,
      boxShadow: '0 20px 48px rgba(20,20,20,0.26)',
      overflow: 'hidden',
    }">
      <div :style="heroStyle" />
      <div :style="{ padding: '12px 14px 14px' }">
        <div :style="{ display: 'flex', alignItems: 'center', gap: '7px' }">
          <span :style="{ fontFamily: T.display, fontWeight: 700, fontSize: '16px', letterSpacing: '-0.02em', color: T.ink }">{{ v.name }}</span>
          <Chip v-if="v.hot" tone="mint" size="sm">Top reach</Chip>
        </div>
        <div :style="{ fontSize: '12px', color: T.inkDim, marginTop: '2px' }">{{ v.type }} · {{ v.city }}</div>
        <div :style="{ display: 'flex', gap: '16px', marginTop: '11px' }">
          <div>
            <div :style="{ fontFamily: T.mono, fontSize: '9.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: T.inkFaint }">Impressions / mo</div>
            <div :style="{ fontFamily: T.mono, fontWeight: 700, fontSize: '15px', color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: '2px' }">{{ fmtK(monthlyImpressions(v)) }}</div>
          </div>
          <div>
            <div :style="{ fontFamily: T.mono, fontSize: '9.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: T.inkFaint }">Screens</div>
            <div :style="{ fontFamily: T.mono, fontWeight: 700, fontSize: '15px', color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: '2px' }">{{ v.screens }}</div>
          </div>
        </div>
        <div :style="{ marginTop: '11px', fontFamily: T.mono, fontSize: '10.5px', letterSpacing: '0.06em', color: T.blue }">CLICK FOR FULL PROFILE →</div>
      </div>
    </div>
    <div :style="pointerStyle" />
  </div>
</template>

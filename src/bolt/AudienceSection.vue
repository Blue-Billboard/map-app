<script setup lang="ts">
/* Audience data-viz block: quality index, gender split, age distribution,
   affluence + segment chips. Ports the prototype's AudienceSection + atoms. */
import { computed } from 'vue'
import { T } from './tokens'
import type { Audience } from './data'
import Chip from './Chip.vue'

const props = defineProps<{ aud: Audience }>()

const indexDelta = computed(() => {
  const d = props.aud.index - 100
  return d > 0 ? `+${d}%` : `${d}%`
})
const ageMax = computed(() => Math.max(...props.aud.age.map(a => a[1])))
</script>

<template>
  <div>
    <!-- section label -->
    <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }">
      <span :style="{ fontFamily: T.mono, fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: T.inkDim }">Audience</span>
      <Chip tone="blue" size="sm">{{ aud.affluence }}</Chip>
    </div>

    <!-- index -->
    <div :style="{ display: 'flex', alignItems: 'baseline', gap: '10px' }">
      <span :style="{ fontFamily: T.display, fontWeight: 700, fontSize: '38px', letterSpacing: '-0.04em', color: T.blue, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }">{{ aud.index }}</span>
      <span :style="{ fontSize: '12px', color: T.inkDim }">index · <b :style="{ color: T.inkMid }">{{ indexDelta }}</b> vs UK avg</span>
    </div>

    <!-- gender bar -->
    <div :style="{ marginTop: '18px' }">
      <div :style="{ display: 'flex', height: '14px', borderRadius: '999px', overflow: 'hidden' }">
        <div :style="{ width: `${aud.gender[0]}%`, background: T.blue }" />
        <div :style="{ width: `${aud.gender[1]}%`, background: T.pink }" />
      </div>
      <div :style="{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontFamily: T.mono, fontSize: '11px', fontVariantNumeric: 'tabular-nums' }">
        <span :style="{ color: T.blue, fontWeight: 700 }">Male {{ aud.gender[0] }}%</span>
        <span :style="{ color: T.pink, fontWeight: 700 }">{{ aud.gender[1] }}% Female</span>
      </div>
    </div>

    <!-- age distribution -->
    <div :style="{ marginTop: '20px' }">
      <div :style="{ fontFamily: T.mono, fontSize: '9.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: T.inkFaint, marginBottom: '11px' }">Age profile</div>
      <div :style="{ display: 'flex', flexDirection: 'column', gap: '9px' }">
        <div v-for="[label, pct] in aud.age" :key="label" :style="{ display: 'flex', alignItems: 'center', gap: '12px' }">
          <span :style="{ width: '44px', fontFamily: T.mono, fontSize: '11px', color: T.inkMid, flexShrink: 0 }">{{ label }}</span>
          <div :style="{ flex: 1, height: '8px', background: T.bg2, borderRadius: '999px', overflow: 'hidden' }">
            <div :style="{ width: `${(pct / ageMax) * 100}%`, height: '100%', background: T.ink, borderRadius: '999px' }" />
          </div>
          <span :style="{ width: '34px', textAlign: 'right', fontFamily: T.mono, fontSize: '11px', fontWeight: 700, color: T.ink, fontVariantNumeric: 'tabular-nums' }">{{ pct }}%</span>
        </div>
      </div>
    </div>

    <!-- segments -->
    <div :style="{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '18px' }">
      <Chip v-for="s in aud.segments" :key="s" tone="neutral" size="sm">{{ s }}</Chip>
    </div>
  </div>
</template>

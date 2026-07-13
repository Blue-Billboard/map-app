<script setup lang="ts">
/* Right-docked venue detail panel — hero, headline stats, audience + footfall
   data-viz, and add-to-plan / get-a-quote footer. Slides in when a venue is
   selected. Ports the prototype's VenueDetail. */
import { computed, ref, watch } from 'vue'
import { T } from './tokens'
import { audienceFor, loadAudience, monthlyImpressions, profileKeyFor, fmtK, coverBg, type VenueVM } from './data'
import Icon from './Icon.vue'
import Chip from './Chip.vue'
import BoltButton from './BoltButton.vue'
import AudienceSection from './AudienceSection.vue'
import FootfallSection from './FootfallSection.vue'

const props = defineProps<{ v: VenueVM | null; inPlan: boolean; showQuote?: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'add'): void; (e: 'quote'): void }>()

const open = computed(() => !!props.v)
// hold the last venue so the panel keeps its content during the slide-out
const d = ref<VenueVM | null>(props.v)
watch(() => props.v, nv => { if (nv) { d.value = nv; loadAudience(nv) } }, { immediate: true })

const aud = computed(() => (d.value ? audienceFor(d.value) : null))

// Broader audience grouping (e.g. "Gym", "Retail") — shown as a muted secondary
// chip only when it's a genuinely different label to the venue's own type, so
// the panel doesn't repeat itself with two identical chips.
const parentGroup = computed(() => {
  if (!d.value) return null
  const group = profileKeyFor(d.value.openOohTypeId, d.value.type)
  // Suppress the group chip when it just echoes the category label (case-insensitive, and
  // ignoring singular/plural — e.g. category "Gyms" vs group "Gym" should show one chip).
  const norm = (s: string) => s.toLowerCase().replace(/s$/, '')
  const type = d.value.type ?? ''
  const redundant = norm(group) === norm(type) || type.toLowerCase().includes(group.toLowerCase());
  return redundant ? null : group
})
// "verified" vs "estimated" sub-label for the Impressions/mo stat. When the F6 forecast drives
// the displayed number (forecastMonthlyImpressions > 0), key off its source — Measured/Forecast
// are visitor-data-backed ("verified"), Estimated is the fallback. Otherwise fall back to whether
// a real audience series loaded.
const impressionsVerified = computed(() => {
  if (!d.value) return false
  if (d.value.forecastMonthlyImpressions > 0) return d.value.impressionsSource !== 'Estimated'
  return !!aud.value?.footfallReal
})
const heroStyle = computed(() => ({
  position: 'relative' as const,
  height: '236px',
  flexShrink: 0,
  background: d.value ? coverBg(d.value.img, '#222') : '#222',
}))

const stats = computed(() => {
  if (!d.value || !aud.value) return []
  return [
    { label: 'Impressions / mo', value: fmtK(monthlyImpressions(d.value)), sub: impressionsVerified.value ? 'verified' : 'estimated' },
    { label: 'Avg dwell', value: `${aud.value.dwell}m`, sub: 'per visit' },
    { label: 'Screens', value: String(d.value.screens), sub: 'Full HD' },
  ]
})
</script>

<template>
  <div :style="{
    position: 'absolute', top: 0, right: 0, bottom: 0, width: '480px', zIndex: 120,
    transform: open ? 'translateX(0)' : 'translateX(104%)',
    transition: 'transform 320ms cubic-bezier(.3,.8,.25,1)',
    background: T.surface, boxShadow: '-30px 0 80px rgba(20,20,20,0.22)',
    display: 'flex', flexDirection: 'column',
  }">
    <template v-if="d && aud">
      <!-- hero -->
      <div :style="heroStyle">
        <div :style="{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(13,27,42,0.28) 0%, rgba(13,27,42,0) 36%, rgba(0,0,0,0.6) 100%)' }" />
        <button
          @click="emit('close')"
          :style="{
            position: 'absolute', top: '18px', left: '18px', display: 'inline-flex', alignItems: 'center', gap: '7px',
            border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
            borderRadius: '999px', padding: '8px 14px', fontSize: '12.5px', fontWeight: 600, color: T.ink, whiteSpace: 'nowrap',
          }"
        >
          <Icon name="chevL" :size="14" :stroke="T.ink" /> All venues
        </button>
        <div :style="{ position: 'absolute', left: '26px', right: '26px', bottom: '20px' }">
          <div :style="{ display: 'flex', gap: '7px', marginBottom: '11px' }">
            <Chip tone="blue" size="sm">{{ d.type }}</Chip>
            <Chip v-if="parentGroup" tone="neutral" size="sm">{{ parentGroup }}</Chip>
            <Chip v-if="d.hot" tone="mint" size="sm">Top reach</Chip>
          </div>
          <h1 :style="{ margin: 0, fontFamily: T.display, fontWeight: 700, fontSize: '34px', letterSpacing: '-0.04em', lineHeight: 0.98, color: '#FFF' }">{{ d.name }}</h1>
          <div :style="{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '8px', color: 'rgba(255,255,255,0.85)', fontSize: '13px' }">
            <Icon name="pin" :size="13" stroke="rgba(255,255,255,0.85)" /> {{ d.city }}
          </div>
        </div>
      </div>

      <!-- body -->
      <div :style="{ flex: 1, overflow: 'auto', padding: '22px 30px', display: 'flex', flexDirection: 'column', gap: '26px' }">
        <div :style="{ display: 'flex', gap: '18px' }">
          <div v-for="s in stats" :key="s.label" :style="{ flex: 1 }">
            <div :style="{ fontFamily: T.mono, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: T.inkDim }">{{ s.label }}</div>
            <div :style="{ fontFamily: T.display, fontWeight: 700, fontSize: '26px', letterSpacing: '-0.035em', color: T.ink, lineHeight: 1, marginTop: '7px', fontVariantNumeric: 'tabular-nums' }">{{ s.value }}</div>
            <div :style="{ fontSize: '11px', color: T.inkFaint, marginTop: '5px' }">{{ s.sub }}</div>
          </div>
        </div>
        <div :style="{ borderTop: `1px solid ${T.hair}`, paddingTop: '24px' }"><AudienceSection :aud="aud" /></div>
        <div :style="{ borderTop: `1px solid ${T.hair}`, paddingTop: '24px' }"><FootfallSection :aud="aud" /></div>
      </div>

      <!-- footer (quote feature only) -->
      <div v-if="showQuote" :style="{ padding: '14px 30px', borderTop: `1px solid ${T.hair}`, background: T.surfaceAlt, display: 'flex', alignItems: 'center', gap: '12px' }">
        <button
          @click="emit('add')"
          :style="{
            flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', cursor: 'pointer',
            border: `1px solid ${inPlan ? T.mint : T.hair}`, background: inPlan ? '#D6F5EC' : 'transparent', color: inPlan ? '#0B7A63' : T.ink,
            borderRadius: '999px', padding: '10px 16px', fontFamily: T.body, fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', transition: 'all 140ms',
          }"
        >
          <Icon :name="inPlan ? 'check' : 'plus'" :size="15" :width="2" :stroke="inPlan ? '#0B7A63' : T.ink" /> {{ inPlan ? 'In plan' : 'Add to plan' }}
        </button>
        <BoltButton variant="ink" icon="pound" :style="{ flex: 1.2, justifyContent: 'center', whiteSpace: 'nowrap' }" @click="emit('quote')">Get a quote →</BoltButton>
      </div>
    </template>
  </div>
</template>

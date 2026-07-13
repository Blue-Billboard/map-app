<script setup lang="ts">
/* Branded, printable BOLT quote proposal. Rendered from the QuoteData assembled
   by the builder. #quote-doc is targeted by the global print rules. */
import { T } from './tokens'
import { audienceFor, fmtK, money, coverBg, type VenueVM } from './data'
import { SALES_EMAIL, type QuoteData } from './quote'
import Icon from './Icon.vue'
import Chip from './Chip.vue'
import BoltButton from './BoltButton.vue'
import BlueBillboardLockup from './BlueBillboardLockup.vue'

const props = defineProps<{ data: QuoteData }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const hair = '#E7E1D6'
const print = () => window.print()

// per-venue mini stats for the "Included venues" list
const venueStats = (v: VenueVM) => {
  const aud = audienceFor(v)
  return [
    { label: 'Reach', value: fmtK(v.footfall) },
    { label: 'Screens', value: String(v.screens) },
    { label: 'Index', value: String(aud.index) },
  ]
}
</script>

<template>
  <div
    id="quote-doc"
    :style="{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(13,27,42,0.55)', backdropFilter: 'blur(6px)', overflow: 'auto', padding: '40px 0', animation: 'vm-fade 180ms ease both' }"
  >
    <!-- toolbar -->
    <div class="doc-toolbar" :style="{ position: 'fixed', top: '20px', right: '24px', display: 'flex', gap: '10px', zIndex: 2 }">
      <BoltButton variant="white" icon="printer" @click="print">Print / Save PDF</BoltButton>
      <BoltButton variant="ink" icon="x" @click="emit('close')">Close</BoltButton>
    </div>

    <!-- the paper -->
    <div :style="{ width: '820px', maxWidth: '94%', margin: '0 auto', background: '#FFFFFF', borderRadius: '6px', boxShadow: '0 40px 120px rgba(13,27,42,0.5)', overflow: 'hidden', fontFamily: T.body, color: T.ink, animation: 'vm-rise 260ms cubic-bezier(.2,.8,.2,1) both' }">
      <!-- letterhead -->
      <div :style="{ background: T.nav, color: '#FFF', padding: '34px 48px', position: 'relative' }">
        <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }">
          <BlueBillboardLockup :size="30" color="#FFF" mark-color="#FFF" />
          <div :style="{ textAlign: 'right', fontFamily: T.mono, fontSize: '11px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }">
            <div>REF · {{ data.ref }}</div>
            <div>{{ data.date }}</div>
          </div>
        </div>
        <div :style="{ fontFamily: T.mono, fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: T.mint, marginTop: '30px' }">Campaign proposal</div>
        <h1 :style="{ margin: '10px 0 0', fontFamily: T.display, fontWeight: 700, fontSize: '40px', letterSpacing: '-0.04em', lineHeight: 1 }">{{ data.campaign }}</h1>
        <div :style="{ position: 'absolute', left: 0, right: 0, bottom: '-1px', height: '3px', background: `linear-gradient(90deg,${T.pink},#FF2D6F)` }" />
      </div>

      <div :style="{ padding: '36px 48px 48px' }">
        <!-- prepared for + campaign -->
        <div :style="{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px', paddingBottom: '30px', borderBottom: `1px solid ${hair}` }">
          <div>
            <div :style="{ fontFamily: T.mono, fontSize: '9.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: T.inkDim, marginBottom: '10px' }">Prepared for</div>
            <div :style="{ fontFamily: T.display, fontWeight: 700, fontSize: '19px', letterSpacing: '-0.02em' }">{{ data.contact.name || '—' }}</div>
            <div v-if="data.contact.company" :style="{ fontSize: '13.5px', color: T.inkMid, marginTop: '2px' }">{{ data.contact.company }}</div>
            <div :style="{ fontSize: '13px', color: T.inkDim, marginTop: '8px', lineHeight: 1.6 }">
              {{ data.contact.email }}<template v-if="data.contact.phone"><br />{{ data.contact.phone }}</template>
            </div>
          </div>
          <div>
            <div :style="{ fontFamily: T.mono, fontSize: '9.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: T.inkDim, marginBottom: '10px' }">Campaign</div>
            <div :style="{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }">
              <div :style="{ display: 'flex', justifyContent: 'space-between', gap: '12px', whiteSpace: 'nowrap' }"><span :style="{ color: T.inkDim }">Starts</span><b>{{ data.startDate }}</b></div>
              <div :style="{ display: 'flex', justifyContent: 'space-between', gap: '12px', whiteSpace: 'nowrap' }"><span :style="{ color: T.inkDim }">Flight length</span><b>{{ data.weeks }} weeks</b></div>
              <div :style="{ display: 'flex', justifyContent: 'space-between', gap: '12px', whiteSpace: 'nowrap' }"><span :style="{ color: T.inkDim }">Venues</span><b>{{ data.plan.length }}</b></div>
            </div>
          </div>
        </div>

        <!-- headline metrics -->
        <div :style="{ display: 'flex', gap: '24px', padding: '28px 0', borderBottom: `1px solid ${hair}` }">
          <div v-for="m in [{ label: 'Screens', value: String(data.screens), sub: 'Full HD, network-managed' }, { label: 'Combined reach', value: fmtK(data.reach), sub: 'people / month' }, { label: 'Est. plays', value: fmtK(data.impressions), sub: 'over the flight' }]" :key="m.label" :style="{ flex: 1 }">
            <div :style="{ fontFamily: T.mono, fontSize: '9.5px', letterSpacing: '0.12em', textTransform: 'uppercase', color: T.inkDim }">{{ m.label }}</div>
            <div :style="{ fontFamily: T.display, fontWeight: 700, fontSize: '26px', letterSpacing: '-0.035em', color: T.ink, lineHeight: 1, marginTop: '6px', fontVariantNumeric: 'tabular-nums' }">{{ m.value }}</div>
            <div :style="{ fontSize: '11px', color: T.inkFaint, marginTop: '4px' }">{{ m.sub }}</div>
          </div>
        </div>

        <!-- venues -->
        <div :style="{ padding: '28px 0', borderBottom: `1px solid ${hair}` }">
          <div :style="{ fontFamily: T.mono, fontSize: '9.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: T.inkDim, marginBottom: '16px' }">Included venues</div>
          <div :style="{ display: 'flex', flexDirection: 'column', gap: '12px' }">
            <div v-for="v in data.plan" :key="v.id" :style="{ display: 'flex', alignItems: 'center', gap: '16px', breakInside: 'avoid' }">
              <div :style="{ width: '88px', height: '64px', borderRadius: '8px', flexShrink: 0, background: coverBg(v.img) }" />
              <div :style="{ flex: 1, minWidth: 0 }">
                <div :style="{ display: 'flex', alignItems: 'center', gap: '8px' }">
                  <span :style="{ fontFamily: T.display, fontWeight: 700, fontSize: '16px', letterSpacing: '-0.02em' }">{{ v.name }}</span>
                  <Chip tone="blue" size="sm">{{ v.type }}</Chip>
                  <Chip v-if="v.hot" tone="mint" size="sm">Top reach</Chip>
                </div>
                <div :style="{ fontSize: '12.5px', color: T.inkDim, marginTop: '3px' }">{{ v.city }} · {{ audienceFor(v).affluence }} · avg dwell {{ audienceFor(v).dwell }}m</div>
              </div>
              <div :style="{ display: 'flex', gap: '22px', textAlign: 'right', flexShrink: 0 }">
                <div v-for="s in venueStats(v)" :key="s.label">
                  <div :style="{ fontFamily: T.mono, fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: T.inkFaint }">{{ s.label }}</div>
                  <div :style="{ fontFamily: T.mono, fontSize: '14px', fontWeight: 700, color: T.ink, fontVariantNumeric: 'tabular-nums', marginTop: '2px' }">{{ s.value }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- pricing -->
        <div :style="{ padding: '28px 0 0' }">
          <div :style="{ fontFamily: T.mono, fontSize: '9.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: T.inkDim, marginBottom: '16px' }">Indicative pricing</div>
          <div :style="{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', fontSize: '13.5px', color: T.inkMid }">
            <span>Media placement — {{ data.screens }} screens across {{ data.plan.length }} venue{{ data.plan.length !== 1 ? 's' : '' }} × {{ data.weeks }} week{{ data.weeks !== 1 ? 's' : '' }}</span>
            <span :style="{ fontFamily: T.mono, fontWeight: 600, color: T.ink }">{{ money(data.cost) }}</span>
          </div>
          <div :style="{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', fontSize: '13.5px', color: T.inkMid }">
            <span>Content scheduling &amp; delivery</span>
            <span :style="{ fontFamily: T.mono, fontWeight: 600, color: '#0F7A35' }">Included</span>
          </div>
          <div :style="{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px 0 0', marginTop: '8px', borderTop: `2px solid ${T.ink}` }">
            <span :style="{ fontFamily: T.display, fontWeight: 700, fontSize: '18px' }">Indicative total</span>
            <span :style="{ fontFamily: T.display, fontWeight: 700, fontSize: '28px', letterSpacing: '-0.03em', color: T.ink, fontVariantNumeric: 'tabular-nums' }">{{ money(data.cost) }}<span :style="{ fontSize: '13px', color: T.inkDim, fontWeight: 500 }"> +VAT</span></span>
          </div>
          <div v-if="data.anyEstimated" :style="{ marginTop: '10px', fontSize: '11.5px', color: T.inkFaint }">
            * Visitor numbers for one or more venues in this plan are estimated.
          </div>
        </div>

        <!-- footer -->
        <div :style="{ marginTop: '36px', padding: '22px 26px', background: T.bg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }">
          <div :style="{ fontSize: '12px', color: T.inkDim, lineHeight: 1.6, maxWidth: '440px' }">
            This proposal is indicative and subject to availability. Final pricing and schedule will be confirmed by the Blue Billboard team. Prices exclude VAT.
          </div>
          <div :style="{ textAlign: 'right', flexShrink: 0 }">
            <div :style="{ fontFamily: T.mono, fontSize: '9.5px', letterSpacing: '0.12em', textTransform: 'uppercase', color: T.inkDim }">Questions?</div>
            <div :style="{ fontFamily: T.body, fontWeight: 700, fontSize: '13.5px', color: T.ink, marginTop: '4px' }">{{ SALES_EMAIL }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

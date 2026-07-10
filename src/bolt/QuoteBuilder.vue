<script setup lang="ts">
/* BOLT quote builder dialog — build → contact → sent. Live venue plan on the
   left, a navy estimate panel on the right. Emits the assembled QuoteData when
   the user asks to view their branded document. Ports the prototype QuoteBuilder,
   wired to real per-venue pricing via computeQuote. */
import { computed, onMounted, reactive, ref } from 'vue'
import { T } from './tokens'
import { API_BASE, audienceFor, loadAudience, fmtK, money, coverBg, type VenueVM } from './data'
import { computeQuote, SALES_EMAIL, type QuoteData } from './quote'
import Icon from './Icon.vue'

const props = defineProps<{ plan: VenueVM[]; weeks: number }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'remove', id: string): void
  (e: 'view-doc', data: QuoteData): void
  (e: 'update:weeks', n: number): void
}>()

type Step = 'build' | 'contact' | 'sent'
const step = ref<Step>('build')
const c = reactive({ name: '', email: '', phone: '', company: '' })
const campaign = ref('Summer launch')
const startDate = ref('14 Jul 2026')
const refCode = ref('BB-2026-' + Math.floor(1000 + Math.random() * 9000))
const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

// Warm the reactive audience cache so plan rows / the quote doc show real
// index + affluence for any venue the user reached without opening its panel.
onMounted(() => props.plan.forEach(loadAudience))

const totals = computed(() => computeQuote(props.plan, props.weeks))
const valid = computed(() => !!c.name.trim() && /\S+@\S+\.\S+/.test(c.email))

const quoteData = computed<QuoteData>(() => ({
  ref: refCode.value,
  contact: { ...c },
  campaign: campaign.value,
  startDate: startDate.value,
  weeks: props.weeks,
  plan: props.plan,
  ...totals.value,
  date: dateStr,
}))

const title = computed(() =>
  step.value === 'contact' ? 'Where should we send it?' : step.value === 'sent' ? 'Quote on its way' : 'Build your plan',
)

const qInput = {
  width: '100%', border: `1px solid ${T.hair}`, borderRadius: '10px', padding: '11px 14px', background: T.surfaceAlt,
  fontFamily: T.body, fontSize: '14px', fontWeight: 500, color: T.ink, outline: 'none',
}

const estRows = computed(() => [
  { label: 'Venues', value: String(props.plan.length), big: false },
  { label: 'Screens', value: String(totals.value.screens), big: false },
  { label: 'Combined reach / mo', value: fmtK(totals.value.reach), big: false },
  { label: 'Flight', value: `${props.weeks} wks`, big: false },
  { label: 'Indicative total', value: money(totals.value.cost), big: true },
])

const onSlider = (e: Event) => emit('update:weeks', parseInt((e.target as HTMLInputElement).value, 10))

const submitting = ref(false)
const submitError = ref('')

// Send the quote request to the API, which emails a branded proposal to the
// prospect and copies the sales team. Only advance to the confirmation screen
// once the server has actually accepted it.
async function submit() {
  if (!valid.value || submitting.value) return
  submitting.value = true
  submitError.value = ''
  try {
    const res = await fetch(`${API_BASE}/quote-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref: refCode.value,
        contact: { ...c },
        campaign: campaign.value,
        startDate: startDate.value,
        weeks: props.weeks,
        venueIds: props.plan.map(v => v.id),
        totals: {
          reach: totals.value.reach,
          screens: totals.value.screens,
          cost: totals.value.cost,
          impressions: totals.value.impressions,
        },
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json().catch(() => ({} as any))
    if (json && json.ok === false) throw new Error('server rejected the request')
    if (json && typeof json.ref === 'string' && json.ref) refCode.value = json.ref
    step.value = 'sent'
  } catch (e) {
    console.error('[BOLT] quote request failed', e)
    submitError.value = `We couldn't send your quote just now — please try again, or email ${SALES_EMAIL}.`
  } finally {
    submitting.value = false
  }
}

const viewDoc = () => { emit('view-doc', quoteData.value); emit('close') }
</script>

<template>
  <div :style="{
    position: 'absolute', inset: 0, zIndex: 200, display: 'grid', placeItems: 'center',
    background: 'rgba(13,27,42,0.4)', backdropFilter: 'blur(6px)', animation: 'vm-fade 180ms ease both',
  }">
    <div :style="{
      width: '980px', maxWidth: '94%', maxHeight: '90%', background: T.surface, borderRadius: '22px', overflow: 'hidden',
      boxShadow: '0 40px 120px rgba(13,27,42,0.5)', display: 'flex', flexDirection: 'column',
      animation: 'vm-rise 260ms cubic-bezier(.2,.8,.2,1) both',
    }">
      <!-- header -->
      <div :style="{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px 26px', borderBottom: `1px solid ${T.hair}` }">
        <span :style="{ width: '42px', height: '42px', borderRadius: '12px', background: T.ink, display: 'grid', placeItems: 'center' }">
          <Icon :name="step === 'sent' ? 'check' : 'pound'" :size="20" stroke="#FFF" :width="2" />
        </span>
        <div>
          <div :style="{ fontFamily: T.mono, fontSize: '10.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: T.inkDim }">Quote builder<template v-if="step !== 'build'"> · {{ refCode }}</template></div>
          <h2 :style="{ margin: '3px 0 0', fontFamily: T.display, fontWeight: 700, fontSize: '24px', letterSpacing: '-0.03em', color: T.ink }">{{ title }}</h2>
        </div>
        <button
          @click="emit('close')"
          :style="{ marginLeft: 'auto', width: '36px', height: '36px', borderRadius: '10px', border: `1px solid ${T.hair}`, background: 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center', color: T.inkMid }"
        >
          <Icon name="x" :size="16" :stroke="T.inkMid" :width="2" />
        </button>
      </div>

      <!-- SENT -->
      <div v-if="step === 'sent'" :style="{ padding: '52px 60px 46px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }">
        <span :style="{ width: '64px', height: '64px', borderRadius: '999px', background: '#D6F5EC', display: 'grid', placeItems: 'center' }">
          <Icon name="check" :size="32" stroke="#0B7A63" :width="2.4" />
        </span>
        <h3 :style="{ margin: '22px 0 0', fontFamily: T.display, fontWeight: 700, fontSize: '30px', letterSpacing: '-0.03em', color: T.ink }">Your quote is on its way</h3>
        <p :style="{ margin: '14px 0 0', fontSize: '15px', lineHeight: 1.6, color: T.inkMid, maxWidth: '520px' }">
          We've emailed a BOLT-branded proposal to <b :style="{ color: T.ink }">{{ c.email }}</b> and copied our team at <b :style="{ color: T.ink }">{{ SALES_EMAIL }}</b>. A specialist will follow up within one working day.
        </p>
        <div :style="{ display: 'flex', gap: '22px', margin: '26px 0 30px', fontFamily: T.mono, fontSize: '12px', color: T.inkDim }">
          <span>REF <b :style="{ color: T.ink }">{{ refCode }}</b></span>
          <span>{{ plan.length }} VENUES</span>
          <span>{{ money(totals.cost) }} INDICATIVE</span>
        </div>
        <div :style="{ display: 'flex', gap: '12px' }">
          <button @click="emit('close')" :style="{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'transparent', color: T.ink, border: `1px solid ${T.hair}`, borderRadius: '999px', padding: '9px 16px', fontWeight: 600, fontFamily: T.body, fontSize: '13px', cursor: 'pointer' }">Done</button>
          <button @click="viewDoc" :style="{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: T.ink, color: '#FFF', border: `1px solid ${T.ink}`, borderRadius: '999px', padding: '9px 16px', fontWeight: 600, fontFamily: T.body, fontSize: '13px', cursor: 'pointer' }">
            <Icon name="eye" :size="14" :width="2" stroke="#FFF" /> View your quote
          </button>
        </div>
      </div>

      <!-- BUILD / CONTACT -->
      <div v-else :style="{ display: 'grid', gridTemplateColumns: '1fr 340px', flex: 1, minHeight: 0 }">
        <div :style="{ padding: '24px 28px', overflow: 'auto' }">
          <!-- BUILD -->
          <template v-if="step === 'build'">
            <div :style="{ fontFamily: T.mono, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: T.inkDim, marginBottom: '12px' }">Your venues · {{ plan.length }}</div>
            <div :style="{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '26px' }">
              <div
                v-for="v in plan"
                :key="v.id"
                :style="{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', border: `1px solid ${T.hair}`, background: T.surfaceAlt }"
              >
                <div :style="{ width: '52px', height: '52px', borderRadius: '9px', flexShrink: 0, background: coverBg(v.img) }" />
                <div :style="{ flex: 1, minWidth: 0 }">
                  <div :style="{ fontFamily: T.display, fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em', color: T.ink }">{{ v.name }}</div>
                  <div :style="{ fontFamily: T.mono, fontSize: '11px', color: T.inkDim, marginTop: '2px', fontVariantNumeric: 'tabular-nums' }">{{ v.type }} · {{ fmtK(v.footfall) }} reach · {{ v.screens }} screens · index {{ audienceFor(v).index }}</div>
                </div>
                <button @click="emit('remove', v.id)" :style="{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center', color: T.inkFaint }">
                  <Icon name="x" :size="15" :stroke="T.inkFaint" />
                </button>
              </div>
            </div>
            <div :style="{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }">
              <label :style="{ display: 'block' }">
                <div :style="{ fontFamily: T.mono, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: T.inkDim, marginBottom: '8px' }">Campaign name</div>
                <input v-model="campaign" :style="qInput" />
              </label>
              <label :style="{ display: 'block' }">
                <div :style="{ fontFamily: T.mono, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: T.inkDim, marginBottom: '8px' }">Start date</div>
                <input v-model="startDate" :style="qInput" />
              </label>
            </div>
            <div :style="{ marginTop: '22px' }">
              <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }">
                <span :style="{ fontFamily: T.mono, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: T.inkDim }">Flight length</span>
                <span :style="{ fontFamily: T.mono, fontSize: '13px', fontWeight: 700, color: T.ink, fontVariantNumeric: 'tabular-nums' }">{{ weeks }} weeks</span>
              </div>
              <input type="range" min="1" max="26" :value="weeks" @input="onSlider" :style="{ width: '100%', accentColor: T.blue, cursor: 'pointer' }" />
              <div :style="{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontFamily: T.mono, fontSize: '10px', color: T.inkFaint }">
                <span>1 WEEK</span><span>6 MONTHS</span>
              </div>
            </div>
          </template>

          <!-- CONTACT -->
          <template v-else>
            <button @click="step = 'build'" :style="{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: T.inkDim, fontFamily: T.body, fontSize: '13px', fontWeight: 600, padding: 0, marginBottom: '20px' }">
              <Icon name="chevL" :size="14" :stroke="T.inkDim" /> Back to plan
            </button>
            <p :style="{ margin: '0 0 22px', fontSize: '14px', lineHeight: 1.6, color: T.inkMid }">
              Tell us where to send your proposal. We'll email it to you and to our sales team, who'll follow up to confirm availability and final pricing.
            </p>
            <div :style="{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', rowGap: '18px' }">
              <label :style="{ display: 'block' }">
                <div :style="{ fontFamily: T.mono, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: T.inkDim, marginBottom: '8px' }">Full name<span :style="{ color: T.pink }"> *</span></div>
                <input v-model="c.name" placeholder="Jane Smith" :style="qInput" />
              </label>
              <label :style="{ display: 'block' }">
                <div :style="{ fontFamily: T.mono, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: T.inkDim, marginBottom: '8px' }">Company</div>
                <input v-model="c.company" placeholder="Acme Ltd" :style="qInput" />
              </label>
              <label :style="{ display: 'block' }">
                <div :style="{ fontFamily: T.mono, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: T.inkDim, marginBottom: '8px' }">Email<span :style="{ color: T.pink }"> *</span></div>
                <input v-model="c.email" placeholder="jane@acme.co.uk" type="email" :style="qInput" />
              </label>
              <label :style="{ display: 'block' }">
                <div :style="{ fontFamily: T.mono, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: T.inkDim, marginBottom: '8px' }">Phone</div>
                <input v-model="c.phone" placeholder="07700 900000" :style="qInput" />
              </label>
            </div>
          </template>
        </div>

        <!-- estimate panel -->
        <div :style="{ background: T.nav, color: '#FFF', padding: '26px 28px', display: 'flex', flexDirection: 'column' }">
          <div :style="{ fontFamily: T.mono, fontSize: '10.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }">Estimated plan</div>
          <div :style="{ fontFamily: T.display, fontWeight: 700, fontSize: '44px', letterSpacing: '-0.04em', lineHeight: 1, marginTop: '14px', fontVariantNumeric: 'tabular-nums' }">{{ fmtK(totals.impressions) }}</div>
          <div :style="{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', marginTop: '6px' }">estimated plays over the flight</div>
          <div :style="{ marginTop: '22px' }">
            <div
              v-for="row in estRows"
              :key="row.label"
              :style="{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                padding: row.big ? '12px 0 2px' : '7px 0',
                borderTop: row.big ? '1px solid rgba(255,255,255,0.14)' : 'none',
                marginTop: row.big ? '6px' : 0,
              }"
            >
              <span :style="{ fontSize: row.big ? '13.5px' : '12.5px', color: 'rgba(255,255,255,0.7)', fontWeight: row.big ? 600 : 500 }">{{ row.label }}</span>
              <span :style="{ fontFamily: T.mono, fontWeight: 700, fontSize: row.big ? '22px' : '14px', color: '#FFF', fontVariantNumeric: 'tabular-nums' }">{{ row.value }}</span>
            </div>
          </div>
          <div :style="{ marginTop: 'auto' }">
            <button
              v-if="step === 'build'"
              @click="step = 'contact'"
              :style="{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', border: 'none', background: T.mint, color: '#04261F', borderRadius: '999px', padding: '13px 18px', fontFamily: T.body, fontWeight: 700, fontSize: '14px' }"
            >
              Request this quote <Icon name="chevR" :size="15" :width="2.4" stroke="#04261F" />
            </button>
            <button
              v-else
              @click="submit"
              :disabled="!valid || submitting"
              :style="{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: (valid && !submitting) ? 'pointer' : 'not-allowed', opacity: (valid && !submitting) ? 1 : 0.5, border: 'none', background: T.mint, color: '#04261F', borderRadius: '999px', padding: '13px 18px', fontFamily: T.body, fontWeight: 700, fontSize: '14px' }"
            >
              {{ submitting ? 'Sending…' : 'Send my quote' }}
              <Icon v-if="!submitting" name="chevR" :size="15" :width="2.4" stroke="#04261F" />
            </button>
            <div v-if="submitError" :style="{ fontSize: '12px', color: '#FF9DB1', marginTop: '12px', textAlign: 'center', lineHeight: 1.5 }">
              {{ submitError }}
            </div>
            <div :style="{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '12px', textAlign: 'center', lineHeight: 1.5 }">
              Indicative only — final pricing confirmed by the Blue Billboard team.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

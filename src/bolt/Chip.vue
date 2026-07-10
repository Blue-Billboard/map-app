<script setup lang="ts">
/* Pill / chip — mirrors the prototype `Chip`. Tones map to soft bg + strong fg. */
import { computed } from 'vue'
import { T } from './tokens'

type Tone = 'neutral' | 'blue' | 'mint' | 'pink' | 'amber' | 'green' | 'red' | 'ink'

const props = withDefaults(defineProps<{
  tone?: Tone
  solid?: boolean
  size?: 'sm' | 'md'
}>(), {
  tone: 'neutral',
  solid: false,
  size: 'md',
})

const TONES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: T.bg2,    fg: T.ink },
  blue:    { bg: '#E5EDFF', fg: '#1B47C2' },
  mint:    { bg: '#D6F5EC', fg: '#0B7A63' },
  pink:    { bg: '#FCE4ED', fg: '#B0335E' },
  amber:   { bg: '#FFF1D6', fg: '#8A5A00' },
  green:   { bg: '#DCFCE7', fg: '#0F7A35' },
  red:     { bg: '#FEE2E2', fg: '#B91C1C' },
  ink:     { bg: T.ink,    fg: '#FFF' },
}

const style = computed(() => {
  const c = TONES[props.tone]
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: props.size === 'sm' ? '2px 8px' : '3px 10px',
    borderRadius: '999px',
    background: props.solid ? c.fg : c.bg,
    color: props.solid ? '#FFF' : c.fg,
    fontSize: props.size === 'sm' ? '11px' : '12px',
    fontWeight: 600,
    letterSpacing: '-0.005em',
    whiteSpace: 'nowrap' as const,
    fontFamily: T.body,
  }
})
</script>

<template>
  <span :style="style"><slot /></span>
</template>

<script setup lang="ts">
/* BOLT button — mirrors the prototype `Button`. Pill, optional leading icon. */
import { computed } from 'vue'
import { T } from './tokens'
import Icon from './Icon.vue'

type Variant = 'ink' | 'ghost' | 'blue' | 'green' | 'white' | 'mint'

const props = withDefaults(defineProps<{
  variant?: Variant
  icon?: string
  size?: 'sm' | 'md'
  disabled?: boolean
}>(), {
  variant: 'ink',
  size: 'md',
  disabled: false,
})

const VARIANTS: Record<Variant, { bg: string; fg: string; border: string }> = {
  ink:   { bg: T.ink,        fg: '#FFF',    border: T.ink },
  ghost: { bg: 'transparent', fg: T.ink,    border: T.hair },
  blue:  { bg: T.blue,       fg: '#FFF',    border: T.blue },
  green: { bg: T.green,      fg: '#06270F', border: T.green },
  white: { bg: '#FFF',       fg: T.ink,     border: T.hair },
  mint:  { bg: T.mint,       fg: '#04261F', border: T.mint },
}

const style = computed(() => {
  const v = VARIANTS[props.variant]
  const sizing = props.size === 'sm'
    ? { padding: '7px 12px', fontSize: '12px' }
    : { padding: '9px 16px', fontSize: '13px' }
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    background: v.bg,
    color: v.fg,
    border: `1px solid ${v.border}`,
    borderRadius: '999px',
    fontWeight: 600,
    fontFamily: T.body,
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    opacity: props.disabled ? 0.5 : 1,
    letterSpacing: '-0.005em',
    ...sizing,
  }
})

const iconStroke = computed(() => VARIANTS[props.variant].fg)
</script>

<template>
  <button type="button" :style="style" :disabled="disabled">
    <Icon v-if="icon" :name="icon" :size="14" :width="2" :stroke="iconStroke" />
    <slot />
  </button>
</template>

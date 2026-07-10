<script setup lang="ts">
/* BOLT lockup — brand mark + "BOLT" wordmark. */
import { computed } from 'vue'
import BoltMark from './BoltMark.vue'

const props = withDefaults(defineProps<{
  size?: number
  color?: string
  cutColor?: string
  gap?: number
}>(), {
  size: 32,
  color: '#0A0A0A',
  cutColor: '#FFFFFF',
  gap: 10,
})

const wordStyle = computed(() => ({
  fontFamily: "'Bricolage Grotesque', sans-serif",
  fontWeight: 800,
  fontSize: `${props.size * 0.92}px`,
  letterSpacing: '-0.04em',
  color: props.color,
  lineHeight: 1,
  whiteSpace: 'nowrap' as const,
}))
</script>

<template>
  <span :style="{ display: 'inline-flex', alignItems: 'center', gap: `${gap}px`, lineHeight: 1 }">
    <BoltMark :size="size" :color="color" :cut-color="cutColor" />
    <span :style="wordStyle">BOLT</span>
  </span>
</template>

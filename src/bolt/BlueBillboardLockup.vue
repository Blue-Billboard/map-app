<script setup lang="ts">
/* Blue Billboard lockup — brand mark + wordmark. */
import { computed } from 'vue'
import BlueBillboardMark from './BlueBillboardMark.vue'

const props = withDefaults(defineProps<{
  size?: number
  color?: string
  markColor?: string
  gap?: number
}>(), {
  size: 32,
  color: '#0A0A0A',
  markColor: '#2C5697',
  gap: 10,
})

const wordStyle = computed(() => ({
  fontFamily: "'Bricolage Grotesque', sans-serif",
  fontWeight: 800,
  fontSize: `${props.size * 0.6}px`,
  letterSpacing: '-0.03em',
  color: props.color,
  lineHeight: 1,
  whiteSpace: 'nowrap' as const,
}))
</script>

<template>
  <span :style="{ display: 'inline-flex', alignItems: 'center', gap: `${gap}px`, lineHeight: 1 }">
    <BlueBillboardMark :size="size" :color="markColor" />
    <span :style="wordStyle">Blue Billboard</span>
  </span>
</template>

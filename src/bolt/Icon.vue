<script setup lang="ts">
/* Stroke icon — mirrors the prototype `Icon` component. */
import { computed } from 'vue'
import { I } from './icons'

const props = withDefaults(defineProps<{
  name: string
  size?: number
  stroke?: string
  fill?: string
  width?: number
}>(), {
  size: 16,
  stroke: 'currentColor',
  fill: 'none',
  width: 1.6,
})

const d = computed(() => I[props.name] || I.pin)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    :fill="fill"
    :stroke="stroke"
    :stroke-width="width"
    stroke-linecap="round"
    stroke-linejoin="round"
    style="display:block;flex-shrink:0"
  >
    <path :d="d" />
  </svg>
</template>

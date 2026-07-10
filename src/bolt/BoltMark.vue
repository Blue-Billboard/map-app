<script setup lang="ts">
/* BOLT brand mark — the lightning glyph in a rounded square. */
withDefaults(defineProps<{
  size?: number
  color?: string
  cutColor?: string
  radius?: number
}>(), {
  size: 40,
  color: '#0A0A0A',
  cutColor: '#FFFFFF',
  radius: 10,
})
</script>

<template>
  <svg
    viewBox="0 0 140 140"
    :width="size"
    :height="size"
    style="display:block"
    fill="none"
    aria-label="BOLT"
  >
    <rect x="0" y="0" width="140" height="140" :rx="radius * (140 / 40)" :fill="color" />
    <path d="M 82 28 L 48 78 L 68 78 L 56 112 L 96 62 L 74 62 L 92 28 Z" :fill="cutColor" />
  </svg>
</template>

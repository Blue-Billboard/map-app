<script setup lang="ts">
/* Blue Billboard brand mark — the billboard totem glyph. */
withDefaults(defineProps<{
  size?: number
  color?: string
}>(), {
  size: 40,
  color: '#2C5697',
})
</script>

<template>
  <svg
    viewBox="0 0 100 100"
    :width="size"
    :height="size"
    style="display:block"
    fill="none"
    aria-label="Blue Billboard"
  >
    <!-- display frame (portrait screen) -->
    <rect
      x="28.5" y="8.5" width="43" height="63" rx="8"
      :stroke="color" stroke-width="9"
    />
    <!-- stem -->
    <rect x="42" y="72" width="16" height="13" :fill="color" />
    <!-- base foot -->
    <rect x="35" y="84" width="30" height="8" rx="2.5" :fill="color" />
  </svg>
</template>

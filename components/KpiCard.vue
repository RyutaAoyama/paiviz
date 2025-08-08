<template>
  <div class="rounded-xl border border-border bg-surface p-4 shadow-card">
    <div class="text-xs text-muted">{{ label }}</div>
    <div class="mt-1 text-2xl font-semibold tabular-nums">{{ value }}</div>
    <slot />
  </div>
</template>
<script setup lang="ts">
defineProps<{ label: string; value: string | number }>()
</script>

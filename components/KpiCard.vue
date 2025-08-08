<template>
  <div class="rounded-2xl border border-[#242A33] bg-[#161A20] p-4">
    <div class="text-xs text-gray-400">{{ label }}</div>
    <div class="mt-1 text-2xl font-semibold">{{ value }}</div>
    <slot />
  </div>
</template>
<script setup lang="ts">
defineProps<{ label: string; value: string | number }>()
</script>

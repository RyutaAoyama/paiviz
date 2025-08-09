<template>
  <svg :width="width" :height="height" viewBox="0 0 100 24" preserveAspectRatio="none">
    <polyline :points="points" fill="none" stroke="currentColor" stroke-width="2" opacity="0.9" />
  </svg>
</template>
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  data: number[];
  width?: number | string;
  height?: number | string;
}>();
const width = computed(() => props.width ?? 100);
const height = computed(() => props.height ?? 24);
const points = computed(() => {
  if (!props.data?.length) return '';
  const max = Math.max(...props.data);
  const min = Math.min(...props.data);
  const spread = Math.max(1, max - min);
  return props.data
    .map((v, i) => {
      const x = (i / (props.data.length - 1)) * 100;
      const y = 24 - ((v - min) / spread) * 24;
      return `${x},${y}`;
    })
    .join(' ');
});
</script>
<style scoped>
svg {
  display: block;
}
</style>

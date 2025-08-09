<template>
  <div
    :style="{ width, height }"
    class="flex items-center justify-center border border-[#242A33] bg-[#161A20] text-xs text-gray-400"
  >
    AD SLOT {{ type }}
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ type?: string; width?: string; height?: string }>();
const width = props.width ?? '100%';
const height = props.height ?? '250px';
</script>

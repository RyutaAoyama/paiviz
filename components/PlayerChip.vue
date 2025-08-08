<template>
  <NuxtLink
    :to="`/player/${encodeURIComponent(name)}`"
    class="rounded-xl border border-border bg-surface px-3 py-2 text-sm hover:bg-[#11151b]"
  >
    {{ name }}
  </NuxtLink>
</template>
<script setup lang="ts">
defineProps<{ name: string }>()
</script>

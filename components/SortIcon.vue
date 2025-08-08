<template>
  <span class="inline-block w-3">
    <svg v-if="dir==='asc'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M7 14l5-5 5 5z"/></svg>
    <svg v-else-if="dir==='desc'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
  </span>
</template>
<script setup lang="ts">
defineProps<{ dir: 'asc' | 'desc' | 'none' }>()
</script>

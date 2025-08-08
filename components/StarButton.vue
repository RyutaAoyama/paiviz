<template>
  <button
    class="rounded-full border border-border bg-surface/60 px-3 py-1 text-sm text-muted hover:text-text"
    @click="onClick"
    :aria-pressed="active"
  >
    <span v-if="active">★ お気に入り</span>
    <span v-else>☆ お気に入り</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// useFavorites is auto-imported (Nuxt composables)
const props = defineProps<{ name: string }>()
const { isFav, toggle } = useFavorites()
const active = computed(() => isFav(props.name))
function onClick() { toggle(props.name) }
</script>

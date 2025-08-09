<template>
  <button class="inline-flex items-center" :aria-pressed="on" @click.stop="toggle()">
    <span class="mr-1 text-xs text-gray-400">★</span>
    <span :class="on ? 'text-teal-400' : 'text-gray-500'">{{ on ? 'お気に入り' : '追加' }}</span>
  </button>
</template>
<script setup lang="ts">
const props = defineProps<{ name: string }>()
const { has, toggle: t } = useFavorites()
const on = computed(() => has(props.name))
const toggle = () => t(props.name)
</script>

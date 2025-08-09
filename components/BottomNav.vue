<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-[#242A33] bg-[#0F1115]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0F1115]/75"
    :style="{
      height: 'var(--bottom-nav-h)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)'
    }"
  >
    <ul class="mx-auto grid h-full max-w-3xl grid-cols-4">
      <li v-for="i in items" :key="i.to" class="flex items-center justify-center">
        <NuxtLink
          :to="i.to"
          class="flex h-12 flex-col items-center justify-center gap-0.5 rounded-md px-3 text-xs text-gray-400 hover:text-gray-200"
          :class="{ 'text-teal-300': isActive(i.to) }"
        >
          <span v-html="i.icon"></span>
          <span>{{ i.label }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const items = [
  { to: '/', label: 'ホーム', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-10.5Z" stroke="currentColor" stroke-width="1.5"/></svg>' },
  { to: '/rankings', label: 'ランキング', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 21V10m7 11V3m7 18v-7" stroke="currentColor" stroke-width="1.5"/></svg>' },
  { to: '/compare', label: '比較', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 5h5a4 4 0 1 1 0 8H7V5Zm10 14h-5a4 4 0 1 1 0-8h5v8Z" stroke="currentColor" stroke-width="1.5"/></svg>' },
  { to: '/about', label: 'About', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 17v-6m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="1.5"/></svg>' },
]
function isActive(to:string){ return route.path === to }
</script>

<style scoped>
@supports (padding: env(safe-area-inset-bottom)) {
  nav { padding-bottom: env(safe-area-inset-bottom); }
}
</style>

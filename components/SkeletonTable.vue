<template>
  <div class="rounded-2xl border border-border bg-surface">
    <div class="sticky top-0 grid grid-cols-[72px_1fr_90px_160px_90px] gap-3 border-b border-border bg-surface/80 px-3 py-2 text-xs text-muted backdrop-blur">
      <div>#</div><div>名前</div><div>Rate</div><div>直近</div><div>対局数</div>
    </div>
    <div class="divide-y divide-border">
      <div v-for="i in rows" :key="i" class="grid grid-cols-[72px_1fr_90px_160px_90px] items-center gap-3 px-3 py-2">
        <div class="h-4 w-10 animate-pulse rounded bg-[#1b2230]" />
        <div class="h-4 w-40 animate-pulse rounded bg-[#1b2230]" />
        <div class="h-4 w-12 animate-pulse rounded bg-[#1b2230]" />
        <div class="h-4 w-28 animate-pulse rounded bg-[#1b2230]" />
        <div class="h-4 w-12 animate-pulse rounded bg-[#1b2230]" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 10 })
</script>

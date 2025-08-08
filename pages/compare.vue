<template>
  <section class="space-y-4">
    <h1 class="text-2xl font-bold">プレイヤー比較</h1>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <PlayerSummaryMock :name="a" />
      <PlayerSummaryMock :name="b" />
    </div>
    <div class="rounded-2xl border border-border bg-surface p-4">
      <div class="text-sm text-muted">URL 例: /compare?a=Aさん&b=Bさん</div>
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute()
const a = computed(() => String(route.query.a ?? 'Player_A'))
const b = computed(() => String(route.query.b ?? 'Player_B'))
</script>

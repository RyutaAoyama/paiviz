<template>
  <section class="space-y-6">
    <h1 class="text-2xl font-bold">{{ decodeURIComponent(route.params.name as string) }}</h1>
    <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      <KpiCard label="和了率" :value="'--%'" />
      <KpiCard label="放銃率" :value="'--%'" />
      <KpiCard label="立直率" :value="'--%'" />
      <KpiCard label="副露率" :value="'--%'" />
      <KpiCard label="平均順位" :value="'--'" />
    </div>
    <AdSlot type="mid" />
    <div class="rounded-2xl border border-[#242A33] bg-[#161A20] p-8 text-sm text-gray-400">推移チャート（モック）</div>
    <div class="rounded-2xl border border-[#242A33] bg-[#161A20] p-8 text-sm text-gray-400">直近の対局（モック, ▶公式へ）</div>
  </section>
</template>
<script setup lang="ts">
const route = useRoute()
</script>

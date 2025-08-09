<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ displayName }}</h1>
      <StarButton :name="displayName" />
    </div>
    <div v-if="loading" class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      <SkeletonCard v-for="i in 5" :key="i" />
    </div>
    <div
      v-else-if="!profile"
      class="rounded-xl border border-border p-10 text-center text-sm text-muted"
    >
      データが見つかりませんでした
    </div>
    <div v-else class="space-y-6">
      <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard
          label="和了率"
          :value="pct(profile.kpi.agari)"
          :tone="toneForKpi('agari', profile.kpi.agari)"
        />
        <KpiCard
          label="放銃率"
          :value="pct(profile.kpi.houju)"
          :tone="toneForKpi('houju', profile.kpi.houju)"
        />
        <KpiCard
          label="立直率"
          :value="pct(profile.kpi.riichi)"
          :tone="toneForKpi('riichi', profile.kpi.riichi)"
        />
        <KpiCard
          label="副露率"
          :value="pct(profile.kpi.furo)"
          :tone="toneForKpi('furo', profile.kpi.furo)"
        />
        <KpiCard
          label="平均順位"
          :value="profile.kpi.avgRank.toFixed(2)"
          :tone="toneForKpi('avgRank', profile.kpi.avgRank)"
        />
      </div>
      <AdSlot type="mid" />
      <div class="rounded-2xl border border-border bg-surface p-4">
        <div class="mb-2 text-sm text-muted">Rate 推移</div>
        <div ref="chartBox" style="height: 280px"></div>
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <RankTrendChart :ranks="visibleRanks" />
        <RankDonut :counts="rankCounts" />
      </div>
      <div>
        <div class="mb-2 text-sm text-muted">直近20対局</div>
        <MatchTable :rows="profile.matches" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, onMounted, onBeforeUnmount } from 'vue';
import { getPlayerProfile, type PlayerProfile } from '~/utils/player';
import { pct, toneForKpi } from '~/utils/kpi';
import { getLineOptions } from '~/utils/chartTheme';
import { useOnVisible } from '~/composables/useOnVisible';

const route = useRoute();
const router = useRouter();
const displayName = computed(() => decodeURIComponent(route.params.name as string));

const url = useRequestURL();
useHead(() => {
  const canonical = url.origin + url.pathname;
  const ttl = `${displayName.value} — Paiviz`;
  const img = `/api/og?title=${encodeURIComponent(displayName.value)}&subtitle=Profile&badge=Paiviz`;
  return {
    title: ttl,
    link: [{ rel: 'canonical', href: canonical }],
    meta: [
      { property: 'og:title', content: ttl },
      { property: 'og:image', content: img },
      { name: 'twitter:title', content: ttl },
      { name: 'twitter:image', content: img },
    ],
  };
});

const loading = ref(true);
const profile = ref<PlayerProfile | null>(null);
const { push } = useRecent();

onMounted(async () => {
  try {
    profile.value = await getPlayerProfile(displayName.value);
    push(displayName.value);
  } catch {
    profile.value = null;
  } finally {
    loading.value = false;
  }
});

const rwindow = ref<number>(Number(route.query.rwindow ?? 120) || 120);
watchEffect(() => {
  const q = { ...route.query, rwindow: String(rwindow.value) };
  router.replace({ query: q });
});

const visibleRanks = computed(() => {
  const n = rwindow.value >= 9999 ? (profile.value?.ranks.length ?? 0) : rwindow.value;
  return profile.value?.ranks.slice(-n) ?? [];
});

const rankCounts = computed(() => {
  const c = [0, 0, 0, 0];
  for (const r of visibleRanks.value) if (r >= 1 && r <= 4) c[r - 1]++;
  return c;
});

let chart: any;
const chartBox = ref<HTMLElement | null>(null);
const renderChart = async () => {
  if (!chartBox.value || !profile.value) return;
  const echarts = await import('echarts');
  chart = echarts.init(chartBox.value);
  const opt = getLineOptions(profile.value.rate.y, profile.value.rate.x, {
    maWindow: 7,
    showMA: true,
  });
  chart.setOption(opt);
};
useOnVisible(chartBox, renderChart);
onBeforeUnmount(() => chart?.dispose());
</script>

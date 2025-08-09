<template>
  <section ref="wrap" class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">比較</h1>
      <button class="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white" @click="share">
        共有
      </button>
    </div>

    <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
      <PlayerSelect ref="aRef" v-model="aInput" placeholder="A のプレイヤー" />
      <PlayerSelect ref="bRef" v-model="bInput" placeholder="B のプレイヤー" />
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div v-for="i in 2" :key="i" class="rounded-2xl border border-[#242A33] bg-[#161A20] p-4">
        <div class="mb-2 h-6 w-16 rounded bg-[#242A33]"></div>
        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <div v-for="j in 5" :key="j" class="h-16 rounded-xl bg-[#242A33]"></div>
        </div>
      </div>
    </div>

    <template v-else-if="!a || !b">
      <div
        class="rounded-2xl border border-[#242A33] bg-[#161A20] p-6 text-center text-sm text-gray-400"
      >
        比較対象が不足しています
      </div>
      <div class="flex justify-center">
        <button class="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white" @click="reload">
          再読み込み
        </button>
      </div>
    </template>

    <template v-else>
      <div class="relative overflow-hidden">
        <div
          class="flex transition-transform duration-300 ease-out"
          :style="{ transform: `translateX(${offset}%)` }"
        >
          <!-- A -->
          <div class="w-full shrink-0 pr-2">
            <div class="rounded-2xl border border-[#242A33] bg-[#161A20] p-4">
              <h2 class="mb-2 font-semibold">A</h2>
              <div class="mb-4 flex items-center gap-4">
                <RankSparkline class="flex-1" :ranks="a.ranks" />
                <RankDonutMini :dist="a.dist" />
              </div>
              <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                <KpiCard
                  label="和了率"
                  :value="pct(a.kpi.agari)"
                  :tone="toneForKpi('agari', a.kpi.agari)"
                />
                <KpiCard
                  label="放銃率"
                  :value="pct(a.kpi.houju)"
                  :tone="toneForKpi('houju', a.kpi.houju)"
                />
                <KpiCard
                  label="立直率"
                  :value="pct(a.kpi.riichi)"
                  :tone="toneForKpi('riichi', a.kpi.riichi)"
                />
                <KpiCard
                  label="副露率"
                  :value="pct(a.kpi.furo)"
                  :tone="toneForKpi('furo', a.kpi.furo)"
                />
                <KpiCard
                  label="平均順位"
                  :value="a.kpi.avgRank.toFixed(2)"
                  :tone="toneForKpi('avgRank', a.kpi.avgRank)"
                />
              </div>
            </div>
          </div>
          <!-- B -->
          <div class="w-full shrink-0 pl-2">
            <div class="rounded-2xl border border-[#242A33] bg-[#161A20] p-4">
              <h2 class="mb-2 font-semibold">B</h2>
              <div class="mb-4 flex items-center gap-4">
                <RankSparkline class="flex-1" :ranks="b.ranks" />
                <RankDonutMini :dist="b.dist" />
              </div>
              <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                <KpiCard
                  label="和了率"
                  :value="pct(b.kpi.agari)"
                  :tone="toneForKpi('agari', b.kpi.agari)"
                />
                <KpiCard
                  label="放銃率"
                  :value="pct(b.kpi.houju)"
                  :tone="toneForKpi('houju', b.kpi.houju)"
                />
                <KpiCard
                  label="立直率"
                  :value="pct(b.kpi.riichi)"
                  :tone="toneForKpi('riichi', b.kpi.riichi)"
                />
                <KpiCard
                  label="副露率"
                  :value="pct(b.kpi.furo)"
                  :tone="toneForKpi('furo', b.kpi.furo)"
                />
                <KpiCard
                  label="平均順位"
                  :value="b.kpi.avgRank.toFixed(2)"
                  :tone="toneForKpi('avgRank', b.kpi.avgRank)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- ヒント -->
        <div
          class="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-black/40 px-2 py-1 text-xs text-gray-200"
        >
          Alt+S で入替 / スワイプで切替
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button class="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white" @click="swap">
          A↔B 入替
        </button>
        <div class="text-xs text-gray-400">現在: {{ active === 0 ? 'A' : 'B' }} を表示中</div>
      </div>

      <KpiDiffTable :a="a.kpi" :b="b.kpi" :highlight="highlight" class="mt-4" />
    </template>
  </section>
</template>

<script setup lang="ts">
const { aName, bName, a, b, loading, reload } = useCompare();
const route = useRoute();
const router = useRouter();
const wrap = ref<HTMLElement | null>(null);
const active = ref(0);
const offset = computed(() => (active.value === 0 ? 0 : -100));
import { pct, toneForKpi } from '~/utils/kpi';
const toast = useToast();
const aRef = ref<any>(null);
const bRef = ref<any>(null);
const aInput = ref('');
const bInput = ref('');
const highlight = ref(true);

watch(
  () => route.query,
  () => {
    aInput.value = String(route.query.a || '');
    bInput.value = String(route.query.b || '');
  },
  { immediate: true }
);

watch(aInput, (v) => router.replace({ query: { ...route.query, a: v } }));
watch(bInput, (v) => router.replace({ query: { ...route.query, b: v } }));
const url = useRequestURL();
useHead(() => {
  const aLabel = aName.value || 'A';
  const bLabel = bName.value || 'B';
  const ttl = `比較: ${aLabel} vs ${bLabel} — Paiviz`;
  const desc = `${aLabel} と ${bLabel} の成績比較`;
  const img = `/api/og?title=${encodeURIComponent('比較')}&subtitle=${encodeURIComponent(`${aLabel} vs ${bLabel}`)}&badge=Paiviz&theme=violet`;
  const canonical = url.origin + url.pathname;
  return {
    title: ttl,
    link: [{ rel: 'canonical', href: canonical }],
    meta: [
      { property: 'og:title', content: ttl },
      { property: 'og:description', content: desc },
      { property: 'og:image', content: img },
      { name: 'twitter:title', content: ttl },
      { name: 'twitter:description', content: desc },
      { name: 'twitter:image', content: img },
      { name: 'description', content: desc },
    ],
  };
});

const swap = (): void => {
  const q = { ...route.query };
  const a0 = q.a as string | undefined;
  q.a = q.b;
  q.b = a0;
  router.replace({ query: q });
};
const toggle = (): void => {
  active.value = active.value ? 0 : 1;
};

const share = (): void => {
  const url = location.href;
  navigator.clipboard
    .writeText(url)
    .then(() => toast.push('URLをコピーしました'))
    .catch(() => toast.push('コピーに失敗しました'));
};

onMounted(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.altKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      swap();
    }
    if (e.altKey && e.key === '1') {
      e.preventDefault();
      const el = aRef.value?.$el?.querySelector('input') as HTMLInputElement | null;
      el?.focus();
    }
    if (e.altKey && e.key === '2') {
      e.preventDefault();
      const el = bRef.value?.$el?.querySelector('input') as HTMLInputElement | null;
      el?.focus();
    }
    if (e.altKey && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      highlight.value = !highlight.value;
    }
    if (e.key === 'ArrowLeft') active.value = 0;
    if (e.key === 'ArrowRight') active.value = 1;
  };
  window.addEventListener('keydown', onKey);
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
});

let x0 = 0;
let y0 = 0;
let act = false;
const down = (e: PointerEvent): void => {
  x0 = e.clientX;
  y0 = e.clientY;
  act = true;
};
const up = (e: PointerEvent): void => {
  if (!act) return;
  const dx = e.clientX - x0;
  const dy = e.clientY - y0;
  act = false;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) toggle();
};
onMounted(() => {
  const el = wrap.value;
  if (!el) return;
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointerup', up);
});
onBeforeUnmount(() => {
  const el = wrap.value;
  if (!el) return;
  el.removeEventListener('pointerdown', down);
  el.removeEventListener('pointerup', up);
});
</script>

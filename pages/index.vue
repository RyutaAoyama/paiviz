<template>
  <section class="space-y-8">
    <!-- HERO -->
    <div class="space-y-3">
      <h1 class="text-3xl font-bold">天鳳の成績を、見やすく。</h1>
      <SearchBox />
    </div>

    <AdSlot type="header" height="90px" />

    <!-- ランキング抜粋（安全にガード） -->
    <div>
      <div class="mb-2 flex items-center justify-between">
        <h2 class="text-xl font-semibold">今月のランキング（抜粋）</h2>
        <NuxtLink to="/rankings" class="text-teal-400">もっと見る →</NuxtLink>
      </div>

      <div class="rounded-2xl border border-border bg-surface">
        <div
          class="grid grid-cols-[64px_1fr_90px_140px_90px] gap-3 border-b border-border px-3 py-2 text-xs text-muted"
        >
          <div>#</div>
          <div>名前</div>
          <div>Rate</div>
          <div>直近</div>
          <div>対局数</div>
        </div>

        <div v-if="rowsSafe.length === 0" class="p-6 text-sm text-muted">
          データがありません。時間をおいて再度お試しください。
        </div>

        <div v-else>
          <div
            v-for="(r, i) in rowsSafe"
            :key="r.id"
            class="grid grid-cols-[64px_1fr_90px_140px_90px] items-center gap-3 border-t border-border px-3 py-2"
          >
            <div class="tabular-nums text-muted">{{ i + 1 }}</div>
            <div class="truncate">
              <span v-if="isFav(r.name)" class="mr-1 text-jade">★</span>
              {{ r.name }}
            </div>
            <div class="tabular-nums">{{ r.rate }}</div>
            <div class="text-jade">
              <Sparkline :data="r.spark || []" />
            </div>
            <div class="tabular-nums text-muted">{{ r.games }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 注目プレイヤー（お気に入り/最近ベース、空状態あり） -->
    <div>
      <div class="mb-2 flex items-center justify-between">
        <h2 class="text-xl font-semibold">注目プレイヤー</h2>
      </div>

      <div
        v-if="featuredSafe.length === 0"
        class="rounded-2xl border border-border bg-surface p-6 text-sm text-muted"
      >
        お気に入りや最近のプレイヤーがありません。<br />
        右上の検索からプレイヤーを探して、プレイヤーページで ★
        を押すとここに表示されます。
      </div>

      <div v-else class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="p in featuredSafe"
          :key="p"
          class="rounded-2xl border border-border bg-surface p-4 hover:outline hover:outline-1 hover:outline-[#1b2230]"
        >
          <div class="mb-2 text-base font-semibold truncate">
            <span class="mr-1 text-jade">★</span>{{ p }}
          </div>
          <div class="text-sm text-muted">小KPI: 和了率/放銃率/平均順位</div>
          <div class="mt-3">
            <NuxtLink
              :to="`/player/${encodeURIComponent(p)}`"
              class="text-teal-400"
              >詳細へ →</NuxtLink
            >
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// SSRでも安全な“空配列”初期化
type Row = {
  id: number;
  name: string;
  rate: number;
  games: number;
  spark: number[];
};

const { isFav, list: favs } = useFavorites();
const { recent } = useRecent();

// --- ランキング抜粋（モック） ---
// SSRで Date などの非POJOを返すと Nuxt が payload 化で警告するので、POJOのみ使用
const rows = ref<Row[]>([]);
onMounted(() => {
  // クライアント側でだけ擬似データ投入（SSR時は空 → 0件表示で安全）
  rows.value = Array.from({ length: 10 }).map((_, i) => ({
    id: i,
    name: `Player_${i.toString().padStart(4, "0")}`,
    rate: Math.floor(1800 + Math.random() * 600),
    games: Math.floor(50 + Math.random() * 300),
    spark: Array.from({ length: 12 }, () => Math.floor(1 + Math.random() * 4)),
  }));
});

// null セーフな派生
const rowsSafe = computed<Row[]>(() =>
  Array.isArray(rows.value) ? rows.value : []
);
const favSafe = computed<string[]>(() =>
  Array.isArray(favs.value) ? favs.value : []
);
const recSafe = computed<string[]>(() =>
  Array.isArray(recent.value) ? recent.value : []
);

// 注目プレイヤー: お気に入り優先 → 最近 → シード
const featuredSafe = computed<string[]>(() => {
  const out: string[] = [];
  for (const n of favSafe.value) {
    if (out.length >= 6) break;
    if (n) out.push(n);
  }
  for (const n of recSafe.value) {
    if (out.length >= 6) break;
    if (n && !out.includes(n)) out.push(n);
  }
  if (out.length < 6) {
    const seed = [
      "ASAPIN",
      "独歩",
      "就活生＠川村軍",
      "福地誠",
      "コーラください",
      "太くないお",
      "すずめクレイジー",
    ];
    for (const n of seed) {
      if (out.length >= 6) break;
      if (!out.includes(n)) out.push(n);
    }
  }
  return out;
});
</script>

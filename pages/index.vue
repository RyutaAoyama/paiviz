<template>
  <section class="space-y-8">
    <div class="aurora rounded-2xl border border-border p-8">
      <h1 class="text-3xl font-bold">天鳳の成績を、見やすく。</h1>
      <p class="mt-2 text-muted">
        検索してすぐに、プレイヤーのKPIと推移をチェック。
      </p>
      <div class="mt-4 max-w-xl">
        <SearchBox />
      </div>
    </div>

    <AdSlot type="header" height="90px" />

    <div>
      <div class="mb-2 flex items-center justify-between">
        <h2 class="text-xl font-semibold">今月のランキング（抜粋）</h2>
        <NuxtLink to="/rankings" class="text-jade hover:underline"
          >もっと見る →</NuxtLink
        >
      </div>
      <div
        class="rounded-2xl border border-border bg-surface p-4 text-sm text-muted"
      >
        ランキング表（モック）
      </div>
    </div>
  </section>

  <section class="mt-8 space-y-6">
    <div v-if="favs.length">
      <h2 class="mb-2 text-xl font-semibold">お気に入り</h2>
      <div class="flex flex-wrap gap-2">
        <PlayerChip v-for="n in favs" :key="'fav-' + n" :name="n" />
      </div>
    </div>
    <div v-if="recents.length">
      <h2 class="mb-2 text-xl font-semibold">最近見たプレイヤー</h2>
      <div class="flex flex-wrap gap-2">
        <PlayerChip v-for="n in recents" :key="'recent-' + n" :name="n" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// useFavorites/useRecent are auto-imported (Nuxt)
const { favs } = useFavorites();
const { recents } = useRecent();
</script>

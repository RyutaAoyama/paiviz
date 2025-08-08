<template>
  <section class="space-y-8">
    <div class="space-y-3">
      <h1 class="text-3xl font-bold">天鳳の成績を、見やすく。</h1>
      <SearchBox />
    </div>
    <AdSlot type="header" height="90px" />
    <div>
      <div class="mb-2 flex items-center justify-between">
        <h2 class="text-xl font-semibold">今月のランキング（抜粋）</h2>
        <NuxtLink to="/rankings" class="text-teal-400">もっと見る →</NuxtLink>
      </div>
      <div class="rounded-2xl border border-[#242A33] bg-[#161A20] p-4 text-sm text-gray-400">ランキング表（モック）</div>
    </div>
  </section>
</template>

<template>
  <header class="sticky top-0 z-40 border-b border-[#242A33] bg-[#0F1115]/90 backdrop-blur">
    <div class="container mx-auto flex items-center gap-4 px-4 py-3">
      <NuxtLink to="/" class="font-bold text-xl">Paiviz</NuxtLink>
      <SearchBox class="ml-auto max-w-md flex-1" />
      <nav class="ml-4 flex items-center gap-4 text-sm text-gray-300">
        <NuxtLink to="/rankings">ランキング</NuxtLink>
        <NuxtLink to="/about">About</NuxtLink>
      </nav>
    </div>
  </header>
</template>

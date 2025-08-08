<template>
  <header class="sticky top-0 z-40 border-b border-border bg-[color:rgb(11_15_20_/_0.9)] backdrop-blur">
    <div class="container mx-auto flex items-center gap-4 px-4 py-3">
      <NuxtLink to="/" class="font-bold text-xl">Paiviz</NuxtLink>
      <SearchBox class="ml-auto max-w-md flex-1" />
      <nav class="ml-4 flex items-center gap-4 text-sm text-muted">
        <NuxtLink to="/rankings">ランキング</NuxtLink>
        <NuxtLink to="/about">About</NuxtLink>
        <span class="hidden sm:inline text-xs text-muted/80">⌘K</span>
      </nav>
    </div>
  </header>
</template>

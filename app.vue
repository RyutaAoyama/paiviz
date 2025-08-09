<template>
  <div class="min-h-screen bg-[#0F1115] text-gray-200">
    <AppHeader />
    <main
      class="container mx-auto px-4 py-6"
      :style="{
        paddingBottom: 'calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px))',
      }"
    >
      <NuxtPage />
    </main>
    <Toast />
    <AppFooter />
    <BottomNav />
  </div>
</template>

<style>
:root {
  --bottom-nav-h: 64px;
}
</style>

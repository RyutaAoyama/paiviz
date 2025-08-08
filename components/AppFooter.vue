<template>
  <footer class="border-t border-[#242A33] mt-12 py-6 text-sm text-gray-400">
    <div
      class="container mx-auto px-4 flex flex-col md:flex-row gap-2 md:items-center md:justify-between"
    >
      <div>© {{ new Date().getFullYear() }} Paiviz</div>
      <div class="flex gap-4">
        <NuxtLink to="/about">About</NuxtLink>
        <NuxtLink to="/privacy">Privacy</NuxtLink>
        <a href="https://tenhou.net/" target="_blank" rel="noopener"
          >出典: 天鳳</a
        >
      </div>
    </div>
  </footer>
</template>

<template>
  <footer class="mt-12 border-t border-[#242A33] py-6 text-sm text-gray-400">
    <div
      class="container mx-auto flex flex-col gap-2 px-4 md:flex-row md:items-center md:justify-between"
    >
      <div>© {{ new Date().getFullYear() }} Paiviz</div>
      <div class="flex gap-4">
        <NuxtLink to="/about">About</NuxtLink>
        <NuxtLink to="/privacy">Privacy</NuxtLink>
        <a href="https://tenhou.net/" target="_blank" rel="noopener">出典: 天鳳</a>
      </div>
    </div>
  </footer>
</template>

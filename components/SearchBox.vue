<template>
  <div class="relative">
    <input
      v-model="q"
      class="w-full rounded-xl bg-[#161A20] px-4 py-2 outline-none ring-1 ring-[#242A33]"
      placeholder="プレイヤー名/IDを検索"
      @keydown.enter="go"
    />
  </div>
</template>
<script setup lang="ts">
const q = ref('')
const go = () => { if (q.value.trim()) navigateTo(`/player/${encodeURIComponent(q.value.trim())}`) }
</script>

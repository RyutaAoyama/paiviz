<template>
  <div class="relative flex gap-2">
    <input
      v-model="q"
      class="w-full rounded-xl bg-[#161A20] px-4 py-2 outline-none ring-1 ring-[#242A33]"
      placeholder="プレイヤー名/IDを検索（Enterで決定）"
      @keydown.enter="go"
    />
    <button
      class="rounded-xl bg-teal-600 px-3 text-sm text-white hover:bg-teal-500"
      @click="go"
    >
      検索
    </button>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { navigateTo } from "nuxt/app";

const q = ref("");
const go = () => {
  if (q.value.trim())
    navigateTo(`/player/${encodeURIComponent(q.value.trim())}`);
};
</script>

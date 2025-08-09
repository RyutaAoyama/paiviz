<template>
  <section class="space-y-4">
    <h1 class="text-2xl font-bold">Labs: サジェスト辞書管理</h1>
    <p class="text-sm text-gray-400">サジェスト候補を編集します（KV seed:players）</p>
    <textarea v-model="text" class="w-full h-60 rounded-lg border border-border bg-surface p-3 text-sm"></textarea>
    <div class="flex gap-2">
      <button
        class="rounded-lg border border-border px-3 py-2 text-sm hover:text-text"
        @click="load"
      >
        再読み込み
      </button>
      <button
        class="rounded-lg border border-border px-3 py-2 text-sm hover:text-text"
        @click="save"
      >
        保存
      </button>
    </div>
    <div v-if="status" class="text-sm text-muted">{{ status }}</div>
  </section>
</template>

<script setup lang="ts">
import { getSuggestSeeds, saveSuggestSeeds } from "@/utils/api";

const text = ref("");
const status = ref("");

const load = async (): Promise<void> => {
  status.value = "";
  try {
    text.value = (await getSuggestSeeds()).join("\n");
  } catch {
    status.value = "読み込みに失敗しました";
  }
};

const save = async (): Promise<void> => {
  status.value = "";
  try {
    const seeds = text.value
      .split(/\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    await saveSuggestSeeds(seeds);
    status.value = "保存しました";
  } catch {
    status.value = "保存に失敗しました";
  }
};

onMounted(load);
</script>

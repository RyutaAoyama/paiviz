<template>
  <section class="space-y-4">
    <h1 class="text-2xl font-bold">共有リンク</h1>
    <div v-if="loading" class="space-y-2">
      <div class="h-6 w-32 animate-pulse rounded bg-[#161A20]" />
    </div>
    <div v-else-if="expired" class="space-y-4 text-center">
      <p class="text-sm text-muted">リンク期限切れ</p>
      <div class="flex justify-center gap-2">
        <NuxtLink to="/" class="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white"
          >トップへ</NuxtLink
        >
        <NuxtLink to="/rankings" class="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white"
          >ランキング</NuxtLink
        >
      </div>
    </div>
    <div v-else-if="fail" class="space-y-4 text-center">
      <p class="text-sm text-muted">読み込みに失敗しました</p>
      <button class="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white" @click="load">
        再試行
      </button>
    </div>
    <div v-else class="space-y-2">
      <p class="text-sm text-muted">{{ summary }}</p>
      <NuxtLink :to="target" class="text-teal-400 hover:underline">▶ 詳細を見る</NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getSnapshot, type SnapshotPayload, type ApiError } from '~/utils/api';

const route = useRoute();
const id = route.params.id as string;

const loading = ref(true);
const expired = ref(false);
const fail = ref(false);
const payload = ref<SnapshotPayload | null>(null);
const toast = useToast();

const load = async () => {
  loading.value = true;
  expired.value = false;
  fail.value = false;
  try {
    payload.value = await getSnapshot(id);
    if (!payload.value) expired.value = true;
  } catch (e: unknown) {
    const err = e as ApiError | undefined;
    const st = err?.status ?? 0;
    if (st === 404 || st === 410) {
      expired.value = true;
    } else {
      fail.value = true;
      toast.push('取得に失敗しました');
    }
  } finally {
    loading.value = false;
  }
};

onMounted(load);

const target = computed(() => {
  const p = payload.value;
  if (!p) return '/';
  const data = (p.data || {}) as Record<string, unknown>;
  if (p.kind === 'rankings') {
    const q = new URLSearchParams({
      mode: String(data.mode ?? ''),
      from: String(data.from ?? ''),
      to: String(data.to ?? ''),
      tableType: String(data.tableType ?? ''),
      rule: String(data.rule ?? ''),
      dense: String(data.dense ?? ''),
      favOnly: String(data.favOnly ?? ''),
      sortKey: String(data.sortKey ?? ''),
      sortDir: String(data.sortDir ?? ''),
    });
    return `/rankings?${q}`;
  }
  if (p.kind === 'compare') {
    const q = new URLSearchParams({
      a: String(data.a ?? ''),
      b: String(data.b ?? ''),
      rwindow: String(data.rwindow ?? ''),
    });
    return `/compare?${q}`;
  }
  if (p.kind === 'player') {
    const name = String(data.name ?? '');
    return `/player/${encodeURIComponent(name)}`;
  }
  return '/';
});

const summary = computed(() => {
  const p = payload.value;
  if (!p) return '';
  const d = (p.data || {}) as Record<string, unknown>;
  if (p.kind === 'rankings') return `ランキング共有 (${d.tableType ?? ''}/${d.rule ?? ''})`;
  if (p.kind === 'compare') return `比較共有 (${d.a ?? ''} vs ${d.b ?? ''})`;
  if (p.kind === 'player') return `プレイヤー共有 (${d.name ?? ''})`;
  return '';
});

const img = computed(
  () =>
    `/api/og?title=${encodeURIComponent('共有リンク')}&subtitle=${encodeURIComponent(summary.value)}&badge=Paiviz`
);
useHead(() => ({
  title: '共有リンク — Paiviz',
  meta: [
    { property: 'og:title', content: '共有リンク — Paiviz' },
    { property: 'og:description', content: summary.value },
    { property: 'og:image', content: img.value },
    { name: 'twitter:title', content: '共有リンク — Paiviz' },
    { name: 'twitter:description', content: summary.value },
    { name: 'twitter:image', content: img.value },
  ],
}));
</script>

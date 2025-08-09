<template>
  <section class="mx-auto max-w-3xl space-y-6">
    <h1 class="text-2xl font-bold">Seeds 管理</h1>

    <div class="space-y-4 rounded-2xl border border-[#242A33] bg-[#161A20] p-4">
      <div class="flex gap-2">
        <input ref="fileRef" type="file" class="hidden" @change="onFile" />
        <button
          class="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white"
          @click="() => fileRef?.click()"
        >
          CSVインポート
        </button>
        <button class="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white" @click="exportCsv">
          CSVエクスポート
        </button>
      </div>
      <textarea
        v-model="bulk"
        class="h-32 w-full rounded-xl bg-[#0F1115] p-2 text-sm ring-1 ring-[#242A33]"
        placeholder="一括登録 (1行=1名, #始まりはコメント)"
      />
      <div class="flex gap-2">
        <input
          v-model="name"
          class="w-full rounded-xl bg-[#0F1115] px-3 py-2 ring-1 ring-[#242A33]"
          placeholder="プレイヤー名を追加"
        />
        <button class="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white" @click="add">
          追加
        </button>
        <button class="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white" @click="bulkAdd">
          一括登録
        </button>
      </div>
      <div>
        <div class="text-xs text-muted">一覧（{{ items.length }}件）</div>
        <ul class="mt-1 divide-y divide-[#242A33]">
          <li v-for="it in items" :key="it.name" class="flex items-center justify-between py-2">
            <span>{{ it.name }}</span>
            <button class="text-xs text-red-400 hover:underline" @click="del(it.name)">削除</button>
          </li>
        </ul>
      </div>
    </div>

    <div class="rounded-2xl border border-[#242A33] bg-[#161A20] p-4">
      <div class="mb-2 text-sm text-muted">Turnstile（ボット対策）</div>
      <div class="rounded-lg bg-[#0F1115] p-3 text-xs text-muted">
        このページは一時的に管理トークンのみで保護しています（Turnstileは将来の公開管理UIに使用）。
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { listSeeds, addSeed, deleteSeed } from '~/utils/api';
import { downloadCsv } from '~/utils/csv';
const items = ref<{ name: string }[]>([]);
const name = ref('');
const bulk = ref('');
const fileRef = ref<HTMLInputElement | null>(null);
const toast = useToast();

const admin = ref('');
onMounted(async () => {
  admin.value = localStorage.getItem('paiviz_admin') || prompt('ADMIN_TOKEN を入力') || '';
  if (admin.value) localStorage.setItem('paiviz_admin', admin.value);
  await reload();
});

const reload = async (): Promise<void> => {
  try {
    const res = await listSeeds();
    const set = new Set(res.map((r) => r.name.trim()).filter(Boolean));
    items.value = [...set].sort((a, b) => a.localeCompare(b)).map((n) => ({ name: n }));
  } catch {
    items.value = [];
  }
};

const saveNames = async (names: string[]): Promise<void> => {
  const before = items.value.length;
  for (const n of names) {
    try {
      await addSeed(n, admin.value as any);
    } catch {
      toast.push(`登録失敗: ${n}`);
    }
  }
  await reload();
  const diff = items.value.length - before;
  toast.push(`追加 ${diff}件 (計${items.value.length}件)`);
};

const add = async (): Promise<void> => {
  const n = name.value.trim();
  if (!n) return;
  await saveNames([n]);
  name.value = '';
};

const bulkAdd = async (): Promise<void> => {
  const lines = bulk.value.split(/\r?\n/);
  const names = lines.map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  bulk.value = '';
  await saveNames(names);
};

const del = async (n: string): Promise<void> => {
  if (!confirm(`${n} を削除しますか？`)) return;
  try {
    await deleteSeed(n, admin.value as any);
    await reload();
    toast.push('削除しました');
  } catch {
    toast.push('削除に失敗しました');
  }
};

const exportCsv = (): void => {
  const content = ['name', ...items.value.map((i) => i.name)].join('\n');
  downloadCsv('seeds.csv', content);
};

const onFile = async (e: Event): Promise<void> => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const text = await file.text();
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  const names: string[] = [];
  const hasHeader = lines[0]?.toLowerCase().includes('name');
  for (let i = hasHeader ? 1 : 0; i < lines.length; i++) {
    const col = lines[i].split(',')[0]?.replace(/"/g, '').trim();
    if (col) names.push(col);
  }
  await saveNames(names);
  (e.target as HTMLInputElement).value = '';
};
</script>

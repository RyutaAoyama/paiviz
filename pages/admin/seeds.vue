<template>
  <section class="mx-auto max-w-3xl space-y-6">
    <h1 class="text-2xl font-bold">Seeds 管理</h1>

    <div class="rounded-2xl border border-[#242A33] bg-[#161A20] p-4">
      <div class="mb-3 text-sm text-muted">サジェスト候補（KV seed:players）</div>
      <div class="flex gap-2">
        <input v-model="name" class="w-full rounded-xl bg-[#0F1115] px-3 py-2 ring-1 ring-[#242A33]" placeholder="プレイヤー名を追加" />
        <button class="rounded-lg bg-teal-600 px-3 py-2 text-sm" @click="add">追加</button>
      </div>
      <div class="mt-3">
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
import { listSeeds, addSeed, deleteSeed } from '~/utils/api'
const runtime = useRuntimeConfig()
const ITEMS_PER_LOAD = 200
const items = ref<{name:string}[]>([])
const name = ref('')

// 最低限の簡易ガード：管理トークンを毎回要求（Pages Functions 側で検証）
const admin = ref('')
onMounted(async () => {
  admin.value = localStorage.getItem('paiviz_admin') || prompt('ADMIN_TOKEN を入力') || ''
  if (admin.value) localStorage.setItem('paiviz_admin', admin.value)
  await reload()
})

async function reload(){
  try { items.value = await listSeeds() } catch { items.value = [] }
}
async function add(){
  const n = name.value.trim(); if (!n) return
  try { await addSeed(n, admin.value as any); name.value=''; await reload() } catch {}
}
async function del(n: string){
  if (!confirm(`${n} を削除しますか？`)) return
  try { await deleteSeed(n, admin.value as any); await reload() } catch {}
}
</script>

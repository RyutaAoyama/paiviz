<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">プレイヤー比較</h1>
      <div class="flex items-center gap-2 text-sm text-muted">
        <button class="rounded-lg border border-border px-2 py-1 hover:text-text" @click="shareCurrent">共有</button>
        <button class="rounded-lg border border-border px-2 py-1 hover:text-text" @click="swap" title="Alt+S でも入れ替え">
          入れ替え
        </button>
      </div>
    </div>

    <div class="grid gap-2 md:grid-cols-2">
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted w-12">A</span>
        <PlayerSelect v-model="a" placeholder="プレイヤーA（お気に入り/最近から候補）" />
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted w-12">B</span>
        <PlayerSelect v-model="b" placeholder="プレイヤーB（お気に入り/最近から候補）" />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <PlayerSummary :name="a" :peerKpi="kpiB" :rwindow="rwindow" />
      <PlayerSummary :name="b" :peerKpi="kpiA" :rwindow="rwindow" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { createShareLink } from '~/utils/share'

const route = useRoute()
const router = useRouter()
const { push: pushToast } = useToast()

const a = ref<string>(String(route.query.a ?? 'Player_A'))
const b = ref<string>(String(route.query.b ?? 'Player_B'))
const rwindow = ref<number>(Number(route.query.rwindow ?? 120) || 120)

watch([a, b, rwindow], () => {
  router.replace({ query: { ...route.query, a: a.value, b: b.value, rwindow: String(rwindow.value) } })
})

const dataA = usePlayerData(a)
const dataB = usePlayerData(b)
const kpiA = computed(() => dataA.kpi.value)
const kpiB = computed(() => dataB.kpi.value)

async function shareCurrent() {
  try {
    const short = await createShareLink('compare', { a: a.value, b: b.value, rwindow: rwindow.value })
    await navigator.clipboard.writeText(short)
    pushToast('共有リンクを作成してコピーしました', 'success')
  } catch {
    pushToast('共有リンクの作成に失敗しました', 'error')
  }
}

function swap() {
  const tmp = a.value; a.value = b.value; b.value = tmp
  pushToast('A/Bを入れ替えました', 'success')
}

onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.altKey && (e.key === 's' || e.key === 'S')) {
      e.preventDefault()
      swap()
    }
  }
  window.addEventListener('keydown', handler)
  onBeforeUnmount(() => window.removeEventListener('keydown', handler))
})
</script>

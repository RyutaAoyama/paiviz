<template>
  <div class="relative w-full">
    <input
      v-model="q"
      class="w-full rounded-xl bg-[#161A20] px-4 py-2 outline-none ring-1 ring-[#242A33]"
      placeholder="プレイヤー名/IDを検索（2文字以上）"
      @keydown.enter.prevent="go(activeOrCurrent)"
      @keydown.arrow-down.prevent="move(1)"
      @keydown.arrow-up.prevent="move(-1)"
      @focus="open = true"
      @blur="onBlur"
    />
    <div v-if="open && (hasAny || q.length>=2)" class="absolute left-0 right-0 mt-1 rounded-xl border border-[#242A33] bg-[#0F1115] shadow-2xl">
      <!-- お気に入り -->
      <div v-if="(favList?.length || 0) > 0" class="px-3 pt-3 text-xs text-muted">お気に入り</div>
      <ul v-if="(favList?.length || 0) > 0" class="max-h-48 overflow-auto py-1">
        <li v-for="(n, i) in favList" :key="'f:'+n">
          <button class="item" :class="cls(i,'fav')" @mousedown.prevent="go(n)" @mouseenter="setActive('fav', i)">
            ★ <span v-html="hl(n)"></span>
          </button>
        </li>
      </ul>

      <!-- 最近 -->
      <div v-if="(recentList?.length || 0) > 0" class="px-3 pt-3 text-xs text-muted">最近</div>
      <ul v-if="(recentList?.length || 0) > 0" class="max-h-48 overflow-auto py-1">
        <li v-for="(n, i) in recentList" :key="'r:'+n">
          <button class="item" :class="cls(i,'recent')" @mousedown.prevent="go(n)" @mouseenter="setActive('recent', i)">
            <span v-html="hl(n)"></span>
          </button>
        </li>
      </ul>

      <!-- サジェスト -->
      <div class="px-3 pt-3 text-xs text-muted">サジェスト</div>
      <ul class="max-h-64 overflow-auto py-1">
        <li v-if="q.length<2" class="px-3 py-2 text-xs text-muted">2文字以上入力すると候補が表示されます</li>
        <li v-else-if="loading" class="px-3 py-2 text-xs text-muted">検索中…</li>
        <li v-else-if="(suggestions?.length || 0) === 0" class="px-3 py-2 text-xs text-muted">候補が見つかりません</li>
        <li v-for="(s, i) in suggestions" :key="'s:'+s.name">
          <button class="item" :class="cls(i,'suggest')" @mousedown.prevent="go(s.name)" @mouseenter="setActive('suggest', i)">
            <span v-html="hl(s.name)"></span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getSuggest } from '~/utils/api'
import type { SuggestItem } from '~/utils/api'

type Section = 'fav' | 'recent' | 'suggest'

const q = ref('')
const open = ref(false)
const loading = ref(false)
const suggestions = ref<SuggestItem[]>([])

const { list: favs } = useFavorites()
const favList = computed<string[]>(() => filterLocal(favs.value ?? [], q.value ?? ''))
const { recent, addRecent } = useRecent()
const recentList = computed<string[]>(() => filterLocal(recent.value ?? [], q.value ?? ''))

const hasAny = computed<boolean>(() =>
  (favList.value?.length || 0) > 0 ||
  (recentList.value?.length || 0) > 0 ||
  (suggestions.value?.length || 0) > 0
)

let activeIndex = ref(0)
let activeSection = ref<Section>('suggest')
const activeOrCurrent = computed<string>(() => {
  const s = activeSection.value
  const i = activeIndex.value
  if (s==='suggest') return suggestions.value?.[i]?.name || q.value
  if (s==='fav') return favList.value?.[i] || q.value
  return recentList.value?.[i] || q.value
})

watch(q, () => {
  if ((q.value || '').length >= 2) fetchSuggest(q.value)
  else suggestions.value = []
})

async function fetchSuggest(text: string) {
  loading.value = true
  try {
    suggestions.value = await getSuggest(text, 10)
    activeSection.value = 'suggest'
    activeIndex.value = 0
  } catch (e: any) {
    suggestions.value = []
    const { push } = useToast()
    const status = e?.status
    if (status === 429) push('検索が混み合っています。少し待ってから再試行してください。')
    else push('検索に失敗しました。ネットワークをご確認ください。')
  } finally {
    loading.value = false
  }
}

function move(d: number) {
  const pools: Record<Section, string[] | SuggestItem[]> = {
    fav: favList.value || [],
    recent: recentList.value || [],
    suggest: suggestions.value || []
  }
  const order: Section[] = ['fav','recent','suggest']
  let s = activeSection.value
  let i = (activeIndex.value ?? 0) + d
  const len = (pools[s] || []).length
  if (i >= 0 && i < len) { activeIndex.value = i; return }
  // セクション跨ぎ
  let idx = order.indexOf(s)
  for (let guard = 0; guard < order.length; guard++) {
    idx = (idx + (d>0?1:-1) + order.length) % order.length
    const ns = order[idx]
    const nlen = (pools[ns] || []).length
    if (nlen > 0 || ns==='suggest') {
      activeSection.value = ns
      activeIndex.value = d > 0 ? 0 : Math.max(0, nlen - 1)
      break
    }
  }
}

function go(name: string) {
  if (!name) return
  addRecent(name)
  open.value = false
  q.value = name
  navigateTo(`/player/${encodeURIComponent(name)}`)
}

function onBlur() {
  // クリック選択のため少し待つ
  setTimeout(() => { open.value = false }, 120)
}

function setActive(s: Section, i: number){
  activeSection.value = s
  activeIndex.value = i
}

function cls(i: number, s: Section){
  return [
    'w-full px-3 py-2 text-left hover:bg-[#11161e] focus:bg-[#11161e] text-sm',
    (activeSection.value===s && activeIndex.value===i) ? 'bg-[#10151d]' : ''
  ]
}

function filterLocal(list: string[], q: string) {
  const safeList = Array.isArray(list) ? list : []
  const safeQ = (q || '').toLowerCase()
  if (!safeQ) return safeList.slice(0, 5)
  return safeList.filter(n => (n || '').toLowerCase().includes(safeQ)).slice(0, 5)
}

function hl(name: string){
  const qq = q.value || ''
  if (!qq) return escapeHtml(name || '')
  const lower = (name || '').toLowerCase()
  const idx = lower.indexOf(qq.toLowerCase())
  if (idx < 0) return escapeHtml(name || '')
  const before = escapeHtml((name || '').slice(0, idx))
  const hit = escapeHtml((name || '').slice(idx, idx + qq.length))
  const after = escapeHtml((name || '').slice(idx + qq.length))
  return `${before}<mark class="bg-teal-900/40 text-teal-300">${hit}</mark>${after}`
}
function escapeHtml(s: string){ return (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] as string)) }
</script>

<style scoped>
.item { width: 100%; }
</style>

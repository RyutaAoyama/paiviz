<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[1000] bg-black/50" @click="close">
      <div
        class="mx-auto mt-24 w-[min(720px,90vw)] rounded-2xl border border-border bg-surface p-4 shadow-card"
        @click.stop
      >
        <div class="mb-3 flex items-center gap-2">
          <input
            ref="inputEl"
            v-model="q"
            placeholder="プレイヤー名/IDを検索（Enterで決定）"
            class="focus-ring w-full rounded-xl bg-[#0F141B] px-4 py-3 outline-none ring-1 ring-border"
            @keydown.enter="enter"
          />
          <button
            class="rounded-xl border border-border px-3 py-2 text-sm text-muted hover:text-text"
            @click="close"
          >
            ESC
          </button>
        </div>
        <div class="max-h-[50vh] space-y-4 overflow-auto">
          <div v-if="favs.length" class="space-y-1">
            <div class="mb-1 text-xs uppercase tracking-wider text-muted">お気に入り</div>
            <ul class="flex flex-wrap gap-2">
              <li v-for="n in favs" :key="'fav-' + n">
                <button
                  class="rounded-lg border border-border px-3 py-1 hover:bg-[#11151b]"
                  @click="openPlayer(n)"
                >
                  {{ n }}
                </button>
              </li>
            </ul>
          </div>
          <div v-if="recents.length" class="space-y-1">
            <div class="mb-1 text-xs uppercase tracking-wider text-muted">最近見たプレイヤー</div>
            <ul class="flex flex-wrap gap-2">
              <li v-for="n in recents" :key="'recent-' + n">
                <button
                  class="rounded-lg border border-border px-3 py-1 hover:bg-[#11151b]"
                  @click="openPlayer(n)"
                >
                  {{ n }}
                </button>
              </li>
            </ul>
          </div>
          <div class="mb-2 text-xs uppercase tracking-wider text-muted">アクション</div>
          <ul class="space-y-1">
            <li>
              <button
                class="w-full rounded-lg px-3 py-2 text-left hover:bg-[#11151b]"
                @click="goRankings"
              >
                ランキングを表示
              </button>
            </li>
            <li>
              <button
                class="w-full rounded-lg px-3 py-2 text-left hover:bg-[#11151b]"
                @click="enter"
              >
                プレイヤー「{{ q || '...' }}」を開く
              </button>
            </li>
          </ul>
        </div>
        <div class="mt-3 text-right text-xs text-muted">
          ショートカット: <kbd>⌘K</kbd> / <kbd>Ctrl+K</kbd>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
// useFavorites/useRecent are auto-imported (composables)
const open = ref(false);
const q = ref('');
const inputEl = ref<HTMLInputElement | null>(null);
const { favs } = useFavorites();
const { recents } = useRecent();

function onKey(e: KeyboardEvent) {
  const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
  const isEsc = e.key === 'Escape';
  if (isCmdK) {
    e.preventDefault();
    open.value = true;
    nextTick(() => inputEl.value?.focus());
  } else if (isEsc && open.value) {
    e.preventDefault();
    open.value = false;
  }
}
function enter() {
  if (!q.value.trim()) return;
  navigateTo(`/player/${encodeURIComponent(q.value.trim())}`);
  open.value = false;
}
function goRankings() {
  navigateTo('/rankings');
  open.value = false;
}
function close() {
  open.value = false;
}
function openPlayer(n: string) {
  navigateTo('/player/' + encodeURIComponent(n));
  open.value = false;
}

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

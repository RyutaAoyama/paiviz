import { ref } from 'vue'

const KEY = 'recent.players'
const recents = ref<string[]>([])

function load() {
  try {
    const s = localStorage.getItem(KEY)
    recents.value = s ? JSON.parse(s) : []
  } catch {
    recents.value = []
  }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(recents.value)) } catch {}
}

export function useRecent() {
  if (!recents.value.length) load()
  function push(name: string) {
    if (!name) return
    recents.value = [name, ...recents.value.filter(n => n !== name)].slice(0, 50)
    save()
  }
  return { recents, push }
}

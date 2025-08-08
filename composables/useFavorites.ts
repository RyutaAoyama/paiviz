import { ref } from 'vue'

const KEY = 'fav.players'
const favs = ref<string[]>([])

function load() {
  try {
    const s = localStorage.getItem(KEY)
    favs.value = s ? JSON.parse(s) : []
  } catch {
    favs.value = []
  }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(favs.value)) } catch {}
}

export function useFavorites() {
  if (!favs.value.length) load()
  function isFav(name: string) { return favs.value.includes(name) }
  function toggle(name: string) {
    const i = favs.value.indexOf(name)
    if (i >= 0) favs.value.splice(i, 1)
    else favs.value.unshift(name)
    favs.value = [...new Set(favs.value)].slice(0, 50)
    save()
  }
  return { favs, isFav, toggle }
}

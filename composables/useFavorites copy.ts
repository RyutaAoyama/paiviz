export function useFavorites(){
  const key = 'paiviz:favs'
  const list = ref<string[]>([])
  if (process.client) {
    try {
      const raw = localStorage.getItem(key)
      if (raw) list.value = JSON.parse(raw)
    } catch {}
  }
  function toggle(name: string){
    const set = new Set(list.value)
    if (set.has(name)) set.delete(name); else set.add(name)
    list.value = Array.from(set).slice(0, 200)
    if (process.client) localStorage.setItem(key, JSON.stringify(list.value))
  }
  const isFav = (name: string) => list.value.includes(name)
  return { list, toggle, isFav }
}

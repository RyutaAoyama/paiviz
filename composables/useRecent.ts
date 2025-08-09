export function useRecent() {
  const key = "paiviz:recent";
  const recent = ref<string[]>([]);
  if (process.client) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) recent.value = JSON.parse(raw);
    } catch {}
  }
  function addRecent(name: string) {
    const set = new Set([name, ...recent.value]);
    recent.value = Array.from(set).slice(0, 20);
    if (process.client) localStorage.setItem(key, JSON.stringify(recent.value));
  }
  return { recent, addRecent };
}

const KEY = "paiviz:favs";
const favs = ref<Set<string>>(new Set());

const load = () => {
  try {
    const s = localStorage.getItem(KEY);
    favs.value = new Set(JSON.parse(s || "[]"));
  } catch {
    favs.value = new Set();
  }
};
const save = (): void => {
  if (process.client) {
    localStorage.setItem(KEY, JSON.stringify([...favs.value]));
  }
};

export const useFavorites = () => {
  if (process.client && favs.value.size === 0) load();
  const toggle = (name: string) => {
    favs.value.has(name) ? favs.value.delete(name) : favs.value.add(name);
    save();
  };
  const has = (name: string) => favs.value.has(name);
  const list = computed(() => [...favs.value]);
  // 後方互換のために has を isFav エイリアスとしても公開
  return { list, has, isFav: has, toggle };
};

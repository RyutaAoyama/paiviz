import { ref, watch, computed, toValue } from 'vue'

function seeded(name: string) {
  // simple deterministic PRNG based on string hash
  let h = 2166136261
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  let s = (h >>> 0) / 0xffffffff
  return () => {
    s = (1103515245 * s + 12345) % 2147483647
    return (s / 2147483647)
  }
}

export type PlayerKpi = {
  agari: number; houju: number; riichi: number; furo: number; avgRank: number
}

export function usePlayerData(nameRef: any) {
  const name = ref<string>(toValue(nameRef) || 'Player')
  const kpi = ref<PlayerKpi>({ agari: .24, houju: .11, riichi: .19, furo: .31, avgRank: 2.48 })
  const rate = ref<number[]>([])
  const ranks = ref<number[]>([])
  const matches = ref<any[]>([])

  function regenerate() {
    const rnd = seeded(name.value)
    // KPIs with slight variance
    kpi.value = {
      agari: 0.20 + rnd()*0.08,
      houju: 0.08 + rnd()*0.08,
      riichi: 0.14 + rnd()*0.10,
      furo: 0.20 + rnd()*0.20,
      avgRank: +(2.2 + rnd()*0.6).toFixed(2)
    }
    // Rate series (60 points)
    const base = 1700 + rnd()*500
    rate.value = Array.from({ length: 60 }).map((_, i) =>
      Math.round(base + Math.sin(i/6)*80 + (rnd()-0.5)*60)
    )
    // Ranks (240)
    ranks.value = Array.from({ length: 240 }).map(() => {
      const r = rnd()
      if (r < 0.27) return 1
      if (r < 0.27 + 0.26) return 2
      if (r < 0.27 + 0.26 + 0.25) return 3
      return 4
    })
    // Matches (latest 20)
    const today = new Date()
    matches.value = Array.from({ length: 20 }).map((_, i) => {
      const d = new Date(today.getTime() - i*86400000)
      const rank = ranks.value[ranks.value.length - 1 - i] || Math.ceil(rnd()*4)
      const points = 20000 + Math.round(rnd()*40000)
      const table = ['一般東南','上東南','特上東南','鳳凰東南'][Math.floor(rnd()*4)]
      const rule = rnd() > .5 ? '喰断アリ' : '喰断ナシ'
      return {
        date: d.toISOString().slice(0,10),
        table, rule, rank, points,
        link: '#'
      }
    })
  }

  watch(() => toValue(nameRef), (v) => { name.value = String(v || 'Player'); regenerate() }, { immediate: true })

  return {
    name,
    kpi,
    rate,
    ranks,
    matches
  }
}

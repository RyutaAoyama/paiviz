export type Tone = 'good' | 'bad' | 'neutral'

export interface KpiThresholds {
  agari: { good: number }        // 和了率 >= good → good
  houju: { bad: number }         // 放銃率 >= bad → bad
  riichi: { good: number }
  furo: { good: number }
  avgRank: { good: number }      // 平均順位 <= good → good, >= bad → bad (bad optional)
  avgPoint?: { good?: number, bad?: number }
}

export const defaultThresholds: KpiThresholds = {
  agari: { good: 0.23 },
  houju: { bad: 0.12 },
  riichi: { good: 0.18 },
  furo: { good: 0.30 },
  avgRank: { good: 2.5 }
}

export function toneForKpi(key: keyof KpiThresholds, value: number, th = defaultThresholds): Tone {
  switch (key) {
    case 'agari': return value >= th.agari.good ? 'good' : 'neutral'
    case 'houju': return value >= th.houju.bad ? 'bad' : 'neutral'
    case 'riichi': return value >= th.riichi.good ? 'good' : 'neutral'
    case 'furo': return value >= th.furo.good ? 'good' : 'neutral'
    case 'avgRank': return value <= th.avgRank.good ? 'good' : (value >= 3.0 ? 'bad' : 'neutral')
    default: return 'neutral'
  }
}

export function pct(n: number, digits = 1) {
  return (n * 100).toFixed(digits) + '%'
}

export interface LineOptionsExtras {
  maWindow?: number
  showMA?: boolean
}
export function getLineOptions(y: number[], x?: (string|number)[], extras: LineOptionsExtras = {}) {
  const xs = x ?? Array.from({ length: y.length }).map((_, i) => i + 1)
  const { maWindow = 7, showMA = true } = extras
  const ma = movingAverage(y, maWindow)

  return {
    grid: { left: 36, right: 12, top: 20, bottom: 24 },
    textStyle: { color: getCss('--muted'), fontFamily: 'Inter, Noto Sans JP' },
    xAxis: {
      type: 'category',
      data: xs,
      axisLine: { lineStyle: { color: getCss('--border') } },
      axisLabel: { color: getCss('--muted') }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#1B2230' } },
      axisLabel: { color: getCss('--muted') }
    },
    series: [
      {
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: y,
        lineStyle: { width: 2, color: getCss('--jade') },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(22,196,184,.28)' },
              { offset: 1, color: 'rgba(22,196,184,0)' }
            ]
          }
        },
        z: 2
      },
      ...(showMA ? [{
        type: 'line',
        smooth: true,
        showSymbol: false,
        data: ma,
        lineStyle: { width: 1.5, color: getCss('--plum'), opacity: 0.9 },
        z: 3
      }] : [])
    ],
    animationDuration: 300
  }
}

function movingAverage(arr: number[], window: number) {
  const out: (number|null)[] = []
  let sum = 0
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i]
    if (i >= window) sum -= arr[i - window]
    out.push(i + 1 >= window ? +(sum / Math.min(i + 1, window)).toFixed(2) : null)
  }
  return out
}

function getCss(name: string) {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function getLineOptions(y: number[], x?: (string|number)[]) {
  const xs = x ?? Array.from({ length: y.length }).map((_, i) => i + 1)
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
        }
      }
    ],
    animationDuration: 300
  }
}

function getCss(name: string) {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

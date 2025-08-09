export function toCsv(rows: any[], headers: { key:string; label:string }[]) {
  const esc = (s:any)=> `"${String(s ?? '').replace(/"/g,'""')}"`
  const head = headers.map(h=>esc(h.label)).join(',')
  const lines = rows.map(r=> headers.map(h=>esc(r[h.key])).join(','))
  return [head, ...lines].join('\n')
}
export function downloadCsv(name: string, content: string) {
  const blob = new Blob([content], { type:'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

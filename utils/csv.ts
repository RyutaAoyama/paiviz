export function downloadCsv(filename: string, rows: any[], headerOrder?: string[], headerLabel?: Record<string, string>) {
  if (!rows?.length) return
  const keys = headerOrder && headerOrder.length ? headerOrder : Object.keys(rows[0])
  const header = keys.map(k => headerLabel?.[k] ?? k)
  const escape = (v: any) => {
    if (v == null) return ''
    const s = String(v)
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
    return s
  }
  const lines = [header.join(',')]
  for (const r of rows) lines.push(keys.map(k => escape(r[k])).join(','))
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  URL.revokeObjectURL(a.href)
  a.remove()
}

export const toCsv = <T extends Record<string, unknown>>(
  rows: T[],
  headers: { key: keyof T; label: string }[]
): string => {
  const esc = (s: unknown): string => `"${String(s ?? '').replace(/"/g, '""')}"`;
  const head = headers.map((h) => esc(h.label)).join(',');
  const lines = rows.map((r) => headers.map((h) => esc(r[h.key as keyof T])).join(','));
  return [head, ...lines].join('\n');
};

export const downloadCsv = (name: string, content: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
};

export function todayYMD(d = new Date()): string {
  const z = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

export function addDays(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + delta);
  return todayYMD(dt);
}

// モード→from/to
export function resolveRange(mode: string, now = new Date()) {
  const y = now.getFullYear(),
    m = now.getMonth();
  const firstThis = new Date(y, m, 1);
  const firstPrev = new Date(y, m - 1, 1);
  const lastPrev = new Date(y, m, 0); // 前月末日
  const toYMD = todayYMD(now);
  const firstThisYMD = todayYMD(firstThis);
  const firstPrevYMD = todayYMD(firstPrev);
  const lastPrevYMD = todayYMD(lastPrev);

  switch (mode) {
    case 'this':
      return { from: firstThisYMD, to: toYMD };
    case 'prev':
      return { from: firstPrevYMD, to: lastPrevYMD };
    case 'last30d':
      return { from: addDays(toYMD, -29), to: toYMD };
    case 'last90d':
      return { from: addDays(toYMD, -89), to: toYMD };
    default:
      return {};
  }
}

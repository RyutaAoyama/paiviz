export type Tone = "good" | "bad" | "neutral";

export function toneForKpi(
  key: string,
  value: number,
  th = {
    agari: { good: 0.24, bad: 0.18 },
    houju: { good: 0.09, bad: 0.13 },
    riichi: { good: 0.2, bad: 0.12 },
    furo: { good: 0.4, bad: 0.2 },
    avgRank: { good: 2.25, bad: 2.75 },
  }
): Tone {
  const rev = new Set(["houju", "avgRank"]);
  const t = (th as any)[key];
  if (!t) return "neutral";
  if (rev.has(key)) {
    if (value < t.good) return "good";
    if (value > t.bad) return "bad";
  } else {
    if (value > t.good) return "good";
    if (value < t.bad) return "bad";
  }
  return "neutral";
}

export function toneForDiff(key: string, delta: number): Tone {
  if (Math.abs(delta) < 1e-9) return "neutral";
  const rev = new Set(["houju", "avgRank"]);
  const positiveIsGood = !rev.has(key);
  const good = delta > 0 ? positiveIsGood : !positiveIsGood;
  return good ? "good" : "bad";
}

export function pct(n: number, digits = 1) {
  return (n * 100).toFixed(digits) + "%";
}

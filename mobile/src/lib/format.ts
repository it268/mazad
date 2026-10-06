/** Arabic formatting helpers that survive Hermes' limited Intl support. */

export function fmtSAR(n: number | string | undefined | null): string {
  const v = typeof n === "string" ? Number(n) : (n ?? 0);
  if (!Number.isFinite(v)) return "-";
  return groupDigits(Math.round(v)) + " ر.س";
}

export function fmtNumber(n: number | string | undefined | null): string {
  const v = typeof n === "string" ? Number(n) : (n ?? 0);
  if (!Number.isFinite(v)) return "-";
  return groupDigits(v);
}

function groupDigits(v: number): string {
  const neg = v < 0 ? "-" : "";
  const [int, frac] = Math.abs(v).toString().split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return neg + grouped + (frac ? "." + frac : "");
}

const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export function fmtDate(d: string | Date | undefined | null): string {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "-";
  return `${date.getDate()} ${MONTHS_AR[date.getMonth()]} ${date.getFullYear()}`;
}

export function fmtDateTime(d: string | Date | undefined | null): string {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "-";
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${fmtDate(date)} — ${hh}:${mm}`;
}

export function timeLeft(target: string | Date): {
  ended: boolean;
  d: number;
  h: number;
  m: number;
  s: number;
} {
  const ms = new Date(target).getTime() - Date.now();
  if (ms <= 0) return { ended: true, d: 0, h: 0, m: 0, s: 0 };
  return {
    ended: false,
    d: Math.floor(ms / 86_400_000),
    h: Math.floor((ms / 3_600_000) % 24),
    m: Math.floor((ms / 60_000) % 60),
    s: Math.floor((ms / 1000) % 60),
  };
}

export function maskName(name: string | undefined | null): string {
  if (!name) return "مزايد";
  const first = name.trim().split(/\s+/)[0];
  return `${first} •••`;
}

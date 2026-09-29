const sarFmt = new Intl.NumberFormat("ar-SA-u-nu-latn", {
  style: "currency",
  currency: "SAR",
  maximumFractionDigits: 0,
});

export function fmtSAR(n: number | string | undefined | null): string {
  const v = typeof n === "string" ? Number(n) : (n ?? 0);
  if (!Number.isFinite(v)) return "-";
  return sarFmt.format(v);
}

export function fmtNumber(n: number | string | undefined | null): string {
  const v = typeof n === "string" ? Number(n) : (n ?? 0);
  if (!Number.isFinite(v)) return "-";
  return new Intl.NumberFormat("ar-SA-u-nu-latn").format(v);
}

const dateFmt = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFmt = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
  hour: "numeric",
  minute: "2-digit",
});

export function fmtDate(d: string | Date | undefined | null): string {
  if (!d) return "-";
  return dateFmt.format(new Date(d));
}

export function fmtDateTime(d: string | Date | undefined | null): string {
  if (!d) return "-";
  const date = new Date(d);
  return `${dateFmt.format(date)} — ${timeFmt.format(date)}`;
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

/** Show only the first name — bid feed privacy. */
export function maskName(name: string | undefined | null): string {
  if (!name) return "مزايد";
  const first = name.trim().split(/\s+/)[0];
  return `${first} ${"•".repeat(3)}`;
}

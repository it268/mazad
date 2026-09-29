import type { ReactNode } from "react";

export function Badge({
  label,
  color,
}: {
  label: string;
  color?: string;
}) {
  return (
    <span className={`badge ${color || "bg-sand text-ink-soft"}`}>{label}</span>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-block h-6 w-6 animate-spin rounded-full border-2 border-teal border-t-transparent ${className}`}
      role="status"
      aria-label="جارٍ التحميل"
    />
  );
}

export function Loading({ text = "جارٍ التحميل…" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-ink-soft">
      <Spinner />
      <span className="text-sm font-semibold">{text}</span>
    </div>
  );
}

export function EmptyState({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="text-4xl">🐎</div>
      <h3 className="text-lg font-extrabold text-ink">{title}</h3>
      {sub && <p className="max-w-md text-sm text-ink-soft">{sub}</p>}
      {action}
    </div>
  );
}

export function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p className="rounded-lg bg-crimson/10 px-3 py-2 text-sm font-semibold text-crimson">
      {children}
    </p>
  );
}

export function PageHero({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-l from-navy to-teal-deep py-14 text-white">
      <div
        className="pattern-bg absolute inset-0 opacity-10"
        aria-hidden
      />
      <div className="container-x relative">
        <span className="eyebrow !text-orange-soft">{eyebrow}</span>
        <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">{title}</h1>
        {sub && <p className="mt-3 max-w-2xl text-white/80">{sub}</p>}
      </div>
    </section>
  );
}

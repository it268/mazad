import { useEffect, useState } from "react";
import { timeLeft } from "#/lib/format";

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({
  target,
  onEnd,
  compact = false,
}: {
  target: string;
  onEnd?: () => void;
  compact?: boolean;
}) {
  const [t, setT] = useState<ReturnType<typeof timeLeft> | null>(null);

  useEffect(() => {
    setT(timeLeft(target));
    const id = setInterval(() => {
      const next = timeLeft(target);
      setT((prev) => {
        if (prev && !prev.ended && next.ended) onEnd?.();
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [target, onEnd]);

  if (!t) return <span className="tabular-nums">--:--:--</span>;
  if (t.ended) return <span className="font-extrabold text-crimson">انتهى</span>;

  const cells = [
    { v: t.d, l: "يوم" },
    { v: t.h, l: "ساعة" },
    { v: t.m, l: "دقيقة" },
    { v: t.s, l: "ثانية" },
  ].filter((c) => c.v > 0 || c.l === "ثانية" || c.l === "دقيقة");

  if (compact) {
    return (
      <span className="tabular-nums font-extrabold" dir="ltr">
        {t.d > 0 ? `${t.d}d ` : ""}
        {pad(t.h)}:{pad(t.m)}:{pad(t.s)}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5" dir="ltr">
      {cells.map((c) => (
        <div
          key={c.l}
          className="flex min-w-11 flex-col items-center rounded-lg bg-white/10 px-1.5 py-1"
        >
          <span className="tabular-nums text-lg font-extrabold leading-none">
            {pad(c.v)}
          </span>
          <span className="mt-0.5 text-[0.6rem] text-white/70">{c.l}</span>
        </div>
      ))}
    </div>
  );
}

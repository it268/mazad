import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPb } from "#/lib/pb";
import { fmtSAR, fmtDateTime } from "#/lib/format";
import { listingStatusLabels, listingStatusColors } from "#/lib/constants";
import { Badge, ErrorText, Loading } from "#/components/ui";

export const Route = createFileRoute("/admin/auctions")({
  component: AdminAuctions,
});

function AdminAuctions() {
  const pb = getPb();
  const qc = useQueryClient();
  const [error, setError] = useState("");

  const q = useQuery({
    queryKey: ["admin-auctions"],
    queryFn: () =>
      pb
        .collection("listings")
        .getFullList({ filter: 'type="auction"', sort: "-created", expand: "horse" }),
    refetchInterval: 10_000,
  });

  const setStatus = async (l: any, status: string) => {
    setError("");
    try {
      await pb.collection("listings").update(l.id, { status });
      qc.invalidateQueries({ queryKey: ["admin-auctions"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (e: any) {
      setError(e.message || "تعذر التحديث");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">المزادات</h1>
      <p className="mt-1 text-sm text-ink-soft">
        راقب المزادات المباشرة، ابدأ المزادات المجدولة، أو أنهِ مزاداً الآن —
        عند الانتهاء يُسجّل أعلى مزايد ويُنشأ بند الصفقة تلقائياً.
      </p>

      <div className="mt-4">
        <ErrorText>{error}</ErrorText>
      </div>

      {q.isPending ? (
        <Loading />
      ) : (
        <div className="mt-4 grid gap-4">
          {(q.data || []).map((l: any) => (
            <div key={l.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-ink">
                    {l.expand?.horse?.name || "حصان"}
                  </span>
                  <Badge
                    label={listingStatusLabels[l.status] || l.status}
                    color={listingStatusColors[l.status]}
                  />
                </div>
                <p className="mt-1 text-sm text-ink-soft">
                  البداية: {fmtSAR(l.start_price)} · الزيادة: {fmtSAR(l.min_increment)} ·{" "}
                  {l.ends_at ? `ينتهي: ${fmtDateTime(l.ends_at)}` : "لا يوجد وقت نهاية"}
                </p>
                {l.current_top_bid ? (
                  <p className="mt-1 text-sm font-bold text-teal">
                    أعلى مزايدة: {fmtSAR(l.current_top_bid)}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {l.status === "scheduled" && (
                  <button className="btn btn-primary !py-2.5" onClick={() => setStatus(l, "live")}>
                    بدء الآن
                  </button>
                )}
                {l.status === "live" && (
                  <button className="btn btn-danger !py-2.5" onClick={() => setStatus(l, "ended")}>
                    إنهاء الآن
                  </button>
                )}
                <Link to="/auctions/$id" params={{ id: l.id }} className="btn btn-ghost-dark !py-2.5">
                  غرفة المزاد
                </Link>
              </div>
            </div>
          ))}
          {(q.data || []).length === 0 && (
            <p className="text-sm text-ink-soft">
              لا توجد مزادات — أنشئ مزاداً من صفحة الخيل والعروض.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

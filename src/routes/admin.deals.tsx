import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPb } from "#/lib/pb";
import { fmtSAR, fmtDateTime } from "#/lib/format";
import {
  dealTypeLabels,
  dealStatusLabels,
  dealStatusColors,
  listingStatusLabels,
} from "#/lib/constants";
import { Badge, ErrorText, Loading } from "#/components/ui";

export const Route = createFileRoute("/admin/deals")({
  component: AdminDeals,
});

function AdminDeals() {
  const pb = getPb();
  const qc = useQueryClient();
  const [error, setError] = useState("");
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const q = useQuery({
    queryKey: ["admin-deals"],
    queryFn: () =>
      pb.collection("deals").getFullList({
        sort: "-created",
        expand: "horse,seller,buyer,listing",
      }),
    refetchInterval: 15_000,
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-deals"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const setStatus = async (d: any, status: string) => {
    setError("");
    try {
      await pb.collection("deals").update(d.id, { status });
      refresh();
    } catch (e: any) {
      setError(e.message || "تعذر التحديث");
    }
  };

  const saveNote = async (d: any) => {
    setError("");
    try {
      await pb.collection("deals").update(d.id, {
        payment_note: noteDraft[d.id] ?? d.payment_note ?? "",
      });
      refresh();
    } catch (e: any) {
      setError(e.message || "تعذر حفظ الملاحظة");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">الصفقات</h1>
      <p className="mt-1 text-sm text-ink-soft">
        أكد الصفقات بعد استلام المبلغ (تحويل بنكي أو نقداً)، وسجّل ملاحظة
        الدفع. تأكيد الصفقة ينقل ملكية الحصان ويُغلق العرض تلقائياً.
      </p>

      <div className="mt-4">
        <ErrorText>{error}</ErrorText>
      </div>

      {q.isPending ? (
        <Loading />
      ) : (
        <div className="mt-4 grid gap-4">
          {(q.data || []).map((d: any) => (
            <div key={d.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-extrabold text-ink">
                      {d.expand?.horse?.name || "حصان"}
                    </span>
                    <span className="badge bg-sand text-ink-soft">
                      {dealTypeLabels[d.type] || d.type}
                    </span>
                    <Badge
                      label={dealStatusLabels[d.status] || d.status}
                      color={dealStatusColors[d.status]}
                    />
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    البائع: {d.expand?.seller?.name || "-"} · المشتري:{" "}
                    {d.expand?.buyer?.name || "-"} · {fmtDateTime(d.created)}
                  </p>
                  {d.expand?.listing && (
                    <p className="text-sm text-ink-soft">
                      العرض:{" "}
                      {d.expand.listing.type === "auction"
                        ? `مزاد (${listingStatusText(d.expand.listing.status)})`
                        : "بيع مباشر"}
                    </p>
                  )}
                </div>
                <div className="text-end">
                  <span className="block text-xs font-bold text-ink-soft">المبلغ</span>
                  <span className="latin text-2xl font-extrabold text-teal">
                    {fmtSAR(d.amount)}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                <input
                  className="field w-72"
                  placeholder="ملاحظة الدفع (البنك، رقم التحويل…)"
                  defaultValue={d.payment_note || ""}
                  onChange={(e) => setNoteDraft((n) => ({ ...n, [d.id]: e.target.value }))}
                />
                <button className="btn btn-ghost-dark !py-2.5" onClick={() => saveNote(d)}>
                  حفظ الملاحظة
                </button>
                {d.status === "pending" && (
                  <>
                    <button className="btn btn-teal !py-2.5" onClick={() => setStatus(d, "confirmed")}>
                      تأكيد الصفقة
                    </button>
                    <button className="btn btn-danger !py-2.5" onClick={() => setStatus(d, "cancelled")}>
                      إلغاء
                    </button>
                  </>
                )}
                {d.status === "confirmed" && (
                  <button className="btn btn-primary !py-2.5" onClick={() => setStatus(d, "completed")}>
                    إتمام الصفقة
                  </button>
                )}
              </div>
            </div>
          ))}
          {(q.data || []).length === 0 && (
            <p className="text-sm text-ink-soft">لا توجد صفقات بعد.</p>
          )}
        </div>
      )}
    </div>
  );
}

function listingStatusText(s: string): string {
  return listingStatusLabels[s] || s;
}

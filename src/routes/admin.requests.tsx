import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ClientResponseError } from "pocketbase";
import { getPb } from "#/lib/pb";
import { useAuth } from "#/lib/auth";
import { fmtSAR, fmtDateTime, fmtNumber } from "#/lib/format";
import {
  saleRequestStatusLabels,
  saleRequestStatusColors,
  genderLabels,
} from "#/lib/constants";
import { Badge, ErrorText, Loading } from "#/components/ui";

export const Route = createFileRoute("/admin/requests")({
  component: AdminRequests,
});

function AdminRequests() {
  const pb = getPb();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState<Record<string, string>>({});

  const q = useQuery({
    queryKey: ["admin-requests"],
    queryFn: () =>
      pb.collection("sale_requests").getFullList({
        sort: "-created",
        expand: "horse,seller",
      }),
    refetchInterval: 20_000,
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-requests"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
    qc.invalidateQueries({ queryKey: ["admin-horses"] });
  };

  const buy = async (r: any, amount: number) => {
    setError("");
    setBusy(r.id);
    try {
      await pb.collection("deals").create({
        type: "admin_buys_from_client",
        horse: r.horse,
        seller: r.seller,
        buyer: user!.id,
        amount,
      });
      refresh();
    } catch (e: any) {
      setError(
        e instanceof ClientResponseError && e.message ? e.message : "تعذر إتمام الشراء",
      );
    } finally {
      setBusy("");
    }
  };

  const reject = async (r: any) => {
    setError("");
    setBusy(r.id);
    try {
      await pb.collection("sale_requests").update(r.id, {
        status: "rejected",
        admin_note: note[r.id] || "",
      });
      refresh();
    } catch (e: any) {
      setError(
        e instanceof ClientResponseError && e.message ? e.message : "تعذر التحديث",
      );
    } finally {
      setBusy("");
    }
  };

  const accept = async (r: any) => {
    setError("");
    setBusy(r.id);
    try {
      await pb.collection("sale_requests").update(r.id, {
        status: "accepted",
        admin_note: note[r.id] || "",
      });
      refresh();
    } catch (e: any) {
      setError("تعذر التحديث");
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">طلبات البيع</h1>
      <p className="mt-1 text-sm text-ink-soft">
        راجع طلبات العملاء: قبل القبول، اشترِ الحصان بالسعر المطلوب أو بسعر
        تفاوضي، أو ارفض الطلب مع ملاحظة.
      </p>

      <div className="mt-4">
        <ErrorText>{error}</ErrorText>
      </div>

      {q.isPending ? (
        <Loading />
      ) : (
        <div className="mt-4 grid gap-4">
          {(q.data || []).map((r: any) => {
            const h = r.expand?.horse;
            const seller = r.expand?.seller;
            return (
              <div key={r.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to="/horses/$id"
                        params={{ id: h?.id || "" }}
                        className="text-lg font-extrabold text-ink hover:text-teal"
                      >
                        {h?.name || "حصان"}
                      </Link>
                      <Badge
                        label={saleRequestStatusLabels[r.status] || r.status}
                        color={saleRequestStatusColors[r.status]}
                      />
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">
                      {h?.breed} · {genderLabels[h?.gender] || ""} ·{" "}
                      {fmtNumber(h?.age_years || 0)} سنوات · {h?.color}
                    </p>
                    <p className="mt-1 text-sm text-ink-soft">
                      البائع: <b>{seller?.name}</b> (
                      <span className="latin" dir="ltr">
                        {seller?.phone}
                      </span>
                      ) · {fmtDateTime(r.created)}
                    </p>
                    {h?.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-ink-soft">
                        {h.description}
                      </p>
                    )}
                    {r.note && (
                      <p className="mt-1 text-sm font-semibold text-teal">
                        ملاحظة العميل: {r.note}
                      </p>
                    )}
                  </div>
                  <div className="text-end">
                    <span className="block text-xs font-bold text-ink-soft">
                      السعر المطلوب
                    </span>
                    <span className="latin text-2xl font-extrabold text-orange-deep">
                      {fmtSAR(r.asking_price)}
                    </span>
                  </div>
                </div>

                {h?.images?.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {h.images.map((img: string) => (
                      <img
                        key={img}
                        src={pb.files.getURL(h, img, "200x150")}
                        alt=""
                        className="h-20 w-28 shrink-0 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}

                {r.status === "pending" && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                    <input
                      className="field w-64"
                      placeholder="ملاحظة للعميل (اختياري)"
                      value={note[r.id] || ""}
                      onChange={(e) => setNote((n) => ({ ...n, [r.id]: e.target.value }))}
                    />
                    <button
                      className="btn btn-primary !py-2.5"
                      disabled={busy === r.id}
                      onClick={() => buy(r, r.asking_price)}
                    >
                      {busy === r.id ? "…" : `شراء بالسعر المطلوب (${fmtSAR(r.asking_price)})`}
                    </button>
                    <NegotiatedBuy r={r} onBuy={buy} busy={busy === r.id} />
                    <button
                      className="btn btn-teal !py-2.5"
                      disabled={busy === r.id}
                      onClick={() => accept(r)}
                    >
                      قبول فقط
                    </button>
                    <button
                      className="btn btn-danger !py-2.5"
                      disabled={busy === r.id}
                      onClick={() => reject(r)}
                    >
                      رفض
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {(q.data || []).length === 0 && (
            <p className="text-sm text-ink-soft">لا توجد طلبات بيع.</p>
          )}
        </div>
      )}
    </div>
  );
}

function NegotiatedBuy({
  r,
  onBuy,
  busy,
}: {
  r: any;
  onBuy: (r: any, amount: number) => void;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState("");
  if (!open) {
    return (
      <button className="btn btn-ghost-dark !py-2.5" onClick={() => setOpen(true)}>
        شراء بسعر تفاوضي
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <input
        className="field tabular-nums w-40"
        type="number"
        min="1"
        placeholder="السعر النهائي"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        dir="ltr"
      />
      <button
        className="btn btn-primary !py-2.5"
        disabled={busy || !price}
        onClick={() => onBuy(r, Number(price))}
      >
        تأكيد الشراء
      </button>
      <button className="btn btn-ghost-dark !py-2.5" onClick={() => setOpen(false)}>
        إلغاء
      </button>
    </div>
  );
}

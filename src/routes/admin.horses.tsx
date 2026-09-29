import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ClientResponseError } from "pocketbase";
import { getPb, fileUrl } from "#/lib/pb";
import { fmtSAR, fmtDateTime } from "#/lib/format";
import {
  horseStatusLabels,
  horseStatusColors,
  listingStatusLabels,
  listingStatusColors,
  genderLabels,
  breedOptions,
  colorOptions,
} from "#/lib/constants";
import { Badge, ErrorText, Loading } from "#/components/ui";

export const Route = createFileRoute("/admin/horses")({
  component: AdminHorses,
});

const emptyHorse = {
  name: "",
  breed: breedOptions[0],
  gender: "male",
  age_years: "",
  color: colorOptions[0],
  height_cm: "",
  lineage: "",
  description: "",
};

function AdminHorses() {
  const pb = getPb();
  const qc = useQueryClient();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyHorse);
  const [files, setFiles] = useState<File[]>([]);
  // listing form state: which horse + which mode
  const [listingFor, setListingFor] = useState<{ id: string; mode: "sale" | "auction" } | null>(null);
  const [lp, setLp] = useState({ price: "", start_price: "", min_increment: "1000", starts_at: "", ends_at: "" });

  const horses = useQuery({
    queryKey: ["admin-horses"],
    queryFn: () =>
      pb.collection("horses").getFullList({
        sort: "-created",
        expand: "owner",
      }),
    refetchInterval: 20_000,
  });

  const listings = useQuery({
    queryKey: ["admin-listings"],
    queryFn: () =>
      pb.collection("listings").getFullList({
        sort: "-created",
      }),
    refetchInterval: 20_000,
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-horses"] });
    qc.invalidateQueries({ queryKey: ["admin-listings"] });
    qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const addHorse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy("add");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("breed", form.breed);
      fd.append("gender", form.gender);
      if (form.age_years) fd.append("age_years", form.age_years);
      if (form.color) fd.append("color", form.color);
      if (form.height_cm) fd.append("height_cm", form.height_cm);
      if (form.lineage) fd.append("lineage", form.lineage);
      if (form.description) fd.append("description", form.description);
      files.forEach((f) => fd.append("images", f));
      await pb.collection("horses").create(fd);
      setForm(emptyHorse);
      setFiles([]);
      setShowAdd(false);
      refresh();
    } catch (err: any) {
      setError(
        err instanceof ClientResponseError && err.message ? err.message : "تعذر إضافة الحصان",
      );
    } finally {
      setBusy("");
    }
  };

  const createListing = async (horseId: string) => {
    setError("");
    if (!listingFor) return;
    setBusy(horseId);
    try {
      if (listingFor.mode === "sale") {
        await pb.collection("listings").create({
          type: "direct_sale",
          horse: horseId,
          price: Number(lp.price),
        });
      } else {
        await pb.collection("listings").create({
          type: "auction",
          horse: horseId,
          start_price: Number(lp.start_price),
          min_increment: Number(lp.min_increment),
          starts_at: lp.starts_at ? new Date(lp.starts_at).toISOString() : "",
          ends_at: lp.ends_at ? new Date(lp.ends_at).toISOString() : "",
        });
      }
      setListingFor(null);
      setLp({ price: "", start_price: "", min_increment: "1000", starts_at: "", ends_at: "" });
      refresh();
    } catch (err: any) {
      setError(
        err instanceof ClientResponseError && err.message ? err.message : "تعذر إنشاء العرض",
      );
    } finally {
      setBusy("");
    }
  };

  const cancelListing = async (l: any) => {
    setError("");
    setBusy(l.id);
    try {
      await pb.collection("listings").update(l.id, { status: "cancelled" });
      refresh();
    } catch (err: any) {
      setError("تعذر الإلغاء");
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">الخيل والعروض</h1>
          <p className="mt-1 text-sm text-ink-soft">
            أضف خيل الإدارة، واعرضها للبيع المباشر أو أنشئ لها مزاداً.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "إخفاء النموذج" : "+ إضافة حصان"}
        </button>
      </div>

      <div className="mt-4">
        <ErrorText>{error}</ErrorText>
      </div>

      {showAdd && (
        <form onSubmit={addHorse} className="card mt-4 grid gap-4 p-6 md:grid-cols-2">
          <div>
            <label className="label">اسم الحصان *</label>
            <input className="field" required value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className="label">السلالة *</label>
            <select className="field" value={form.breed} onChange={(e) => set("breed", e.target.value)}>
              {breedOptions.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">النوع *</label>
            <select className="field" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              {Object.entries(genderLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">العمر (سنوات) *</label>
            <input className="field tabular-nums" type="number" min="1" required value={form.age_years} onChange={(e) => set("age_years", e.target.value)} />
          </div>
          <div>
            <label className="label">اللون *</label>
            <select className="field" value={form.color} onChange={(e) => set("color", e.target.value)}>
              {colorOptions.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">الارتفاع (سم)</label>
            <input className="field tabular-nums" type="number" value={form.height_cm} onChange={(e) => set("height_cm", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="label">النسب / السجل</label>
            <input className="field" value={form.lineage} onChange={(e) => set("lineage", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="label">الوصف</label>
            <textarea className="field min-h-24" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="label">الصور</label>
            <input className="field" type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
          </div>
          <div className="md:col-span-2">
            <button className="btn btn-primary" disabled={busy === "add"}>
              {busy === "add" ? "جارٍ الإضافة…" : "إضافة الحصان"}
            </button>
          </div>
        </form>
      )}

      {horses.isPending || listings.isPending ? (
        <Loading />
      ) : (
        <div className="mt-6 grid gap-4">
          {(horses.data || []).map((h: any) => {
            const horseListings = (listings.data || []).filter(
              (l: any) => l.horse === h.id && l.status !== "cancelled",
            );
            const activeListing = horseListings.find((l: any) =>
              ["active", "reserved", "scheduled", "live"].includes(l.status),
            );
            return (
              <div key={h.id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl">
                      {h.images?.[0] ? (
                        <img src={fileUrl(h, h.images[0], "200x150")} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-sand text-2xl">🐎</div>
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link to="/horses/$id" params={{ id: h.id }} className="text-lg font-extrabold text-ink hover:text-teal">
                          {h.name}
                        </Link>
                        <Badge label={horseStatusLabels[h.status] || h.status} color={horseStatusColors[h.status]} />
                      </div>
                      <p className="mt-0.5 text-sm text-ink-soft">
                        {h.breed} · {genderLabels[h.gender] || h.gender} · {h.color} · المالك:{" "}
                        {h.expand?.owner?.name || "-"}
                      </p>
                    </div>
                  </div>

                  {h.status === "owned_by_admin" && !activeListing && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="btn btn-teal !py-2.5"
                        onClick={() => setListingFor({ id: h.id, mode: "sale" })}
                      >
                        عرض للبيع المباشر
                      </button>
                      <button
                        className="btn btn-primary !py-2.5"
                        onClick={() => setListingFor({ id: h.id, mode: "auction" })}
                      >
                        إنشاء مزاد
                      </button>
                    </div>
                  )}
                  {activeListing && (
                    <div className="flex items-center gap-2">
                      <Badge
                        label={listingStatusLabels[activeListing.status] || activeListing.status}
                        color={listingStatusColors[activeListing.status]}
                      />
                      {["active", "scheduled", "live"].includes(activeListing.status) && (
                        <button
                          className="btn btn-danger !py-2.5"
                          disabled={busy === activeListing.id}
                          onClick={() => cancelListing(activeListing)}
                        >
                          إلغاء العرض
                        </button>
                      )}
                      {["scheduled", "live", "ended"].includes(activeListing.status) && (
                        <Link
                          to="/auctions/$id"
                          params={{ id: activeListing.id }}
                          className="btn btn-ghost-dark !py-2.5"
                        >
                          غرفة المزاد
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {listingFor?.id === h.id && (
                  <div className="mt-4 rounded-xl border border-line bg-sand/40 p-4">
                    {listingFor.mode === "sale" ? (
                      <div className="flex flex-wrap items-end gap-3">
                        <div>
                          <label className="label">سعر البيع (ر.س) *</label>
                          <input
                            className="field tabular-nums w-44"
                            type="number"
                            min="1"
                            value={lp.price}
                            onChange={(e) => setLp({ ...lp, price: e.target.value })}
                            dir="ltr"
                          />
                        </div>
                        <button
                          className="btn btn-primary !py-2.5"
                          disabled={busy === h.id || !lp.price}
                          onClick={() => createListing(h.id)}
                        >
                          نشر العرض
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-4">
                        <div>
                          <label className="label">سعر البداية *</label>
                          <input
                            className="field tabular-nums"
                            type="number"
                            min="1"
                            value={lp.start_price}
                            onChange={(e) => setLp({ ...lp, start_price: e.target.value })}
                            dir="ltr"
                          />
                        </div>
                        <div>
                          <label className="label">أقل زيادة *</label>
                          <input
                            className="field tabular-nums"
                            type="number"
                            min="1"
                            value={lp.min_increment}
                            onChange={(e) => setLp({ ...lp, min_increment: e.target.value })}
                            dir="ltr"
                          />
                        </div>
                        <div>
                          <label className="label">بداية المزاد</label>
                          <input
                            className="field"
                            type="datetime-local"
                            value={lp.starts_at}
                            onChange={(e) => setLp({ ...lp, starts_at: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="label">نهاية المزاد *</label>
                          <input
                            className="field"
                            type="datetime-local"
                            required
                            value={lp.ends_at}
                            onChange={(e) => setLp({ ...lp, ends_at: e.target.value })}
                          />
                        </div>
                        <div className="flex gap-2 md:col-span-4">
                          <button
                            className="btn btn-primary !py-2.5"
                            disabled={busy === h.id || !lp.start_price || !lp.ends_at}
                            onClick={() => createListing(h.id)}
                          >
                            إنشاء المزاد
                          </button>
                          <button className="btn btn-ghost-dark !py-2.5" onClick={() => setListingFor(null)}>
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {horseListings.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
                    {horseListings.map((l: any) => (
                      <span key={l.id} className="badge bg-white text-ink-soft border border-line">
                        {l.type === "auction" ? "مزاد" : "بيع مباشر"} ·{" "}
                        {listingStatusLabels[l.status] || l.status} ·{" "}
                        {fmtSAR(l.current_top_bid || l.price || l.start_price)}
                        {l.ends_at ? ` · ${fmtDateTime(l.ends_at)}` : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {(horses.data || []).length === 0 && (
            <p className="text-sm text-ink-soft">لا يوجد خيل بعد — أضف أول حصان.</p>
          )}
        </div>
      )}
    </div>
  );
}

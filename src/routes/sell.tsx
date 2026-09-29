import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ClientResponseError } from "pocketbase";
import { getPb } from "#/lib/pb";
import { useAuth } from "#/lib/auth";
import { breedOptions, colorOptions, genderLabels } from "#/lib/constants";
import { ErrorText, PageHero } from "#/components/ui";

export const Route = createFileRoute("/sell")({
  component: SellPage,
});

const empty = {
  name: "",
  breed: breedOptions[0],
  gender: "male",
  age_years: "",
  color: colorOptions[0],
  height_cm: "",
  lineage: "",
  description: "",
  asking_price: "",
  note: "",
};

function SellPage() {
  const { user, isAdmin } = useAuth();
  const pb = getPb();
  const [form, setForm] = useState(empty);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!user) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="text-2xl font-extrabold">سجّل الدخول لعرض حصانك للبيع</h1>
        <p className="mt-3 text-ink-soft">
          إنشاء الحساب يستغرق أقل من دقيقة برقم جوالك.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/login" className="btn btn-primary">
            دخول
          </Link>
          <Link to="/register" className="btn btn-teal">
            حساب جديد
          </Link>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="text-2xl font-extrabold">أنت مسجّل كإدارة</h1>
        <p className="mt-3 text-ink-soft">
          أضف الخيل واعرضها للبيع أو المزاد مباشرة من{" "}
          <Link to="/admin/horses" className="font-bold text-teal">
            لوحة الإدارة
          </Link>
          .
        </p>
      </div>
    );
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
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

      const horse = await pb.collection("horses").create(fd);

      await pb.collection("sale_requests").create({
        horse: horse.id,
        asking_price: Number(form.asking_price),
        note: form.note,
      });

      setDone(true);
    } catch (err: any) {
      setError(
        err instanceof ClientResponseError && err.message
          ? err.message
          : "تعذر إرسال الطلب، تحقق من الحقول وحاول مجدداً",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="container-x py-20">
        <div className="card mx-auto max-w-xl p-10 text-center">
          <div className="text-5xl">🐴</div>
          <h1 className="mt-4 text-2xl font-extrabold text-ink">
            تم إرسال طلب بيع حصانك
          </h1>
          <p className="mt-3 leading-8 text-ink-soft">
            ستراجع الإدارة طلبك وتعاين الحصان، وستجد حالة الطلب في{" "}
            <Link to="/account" className="font-bold text-teal">
              صفحة حسابي
            </Link>
            .
          </p>
          <Link to="/" className="btn btn-teal mt-6">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        eyebrow="بيع حصانك"
        title="اعرض حصانك للبيع للإدارة"
        sub="املأ بيانات حصانك وأرفق صوراً واضحة، وستراجع الإدارة الطلب قبل عرضه للبيع أو المزاد."
      />
      <section className="container-x py-10">
        <form onSubmit={submit} className="mx-auto max-w-3xl">
          <div className="card p-6 md:p-8">
            <h2 className="mb-5 text-lg font-extrabold text-ink">بيانات الحصان</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">اسم الحصان *</label>
                <input
                  className="field"
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="مثال: سهم الفرسان"
                />
              </div>
              <div>
                <label className="label">السلالة *</label>
                <select
                  className="field"
                  value={form.breed}
                  onChange={(e) => set("breed", e.target.value)}
                >
                  {breedOptions.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">النوع *</label>
                <select
                  className="field"
                  value={form.gender}
                  onChange={(e) => set("gender", e.target.value)}
                >
                  {Object.entries(genderLabels).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">العمر (سنوات) *</label>
                <input
                  className="field tabular-nums"
                  type="number"
                  min="1"
                  max="40"
                  required
                  value={form.age_years}
                  onChange={(e) => set("age_years", e.target.value)}
                />
              </div>
              <div>
                <label className="label">اللون *</label>
                <select
                  className="field"
                  value={form.color}
                  onChange={(e) => set("color", e.target.value)}
                >
                  {colorOptions.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">الارتفاع (سم)</label>
                <input
                  className="field tabular-nums"
                  type="number"
                  min="80"
                  max="220"
                  value={form.height_cm}
                  onChange={(e) => set("height_cm", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">النسب / السجل</label>
                <input
                  className="field"
                  value={form.lineage}
                  onChange={(e) => set("lineage", e.target.value)}
                  placeholder="مثال: ابن الوسيم — من نسل الحمّاني"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">وصف الحصان</label>
                <textarea
                  className="field min-h-28"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="أخبرنا عن صفاته، تدريبه، سجله في السباقات، حالته الصحية…"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">صور الحصان (حتى 6 صور)</label>
                <input
                  className="field"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                />
                <p className="mt-1.5 text-xs text-ink-soft">
                  يفضل صور واضحة في النهار تُظهر الجسم والحركة.
                </p>
              </div>
            </div>
          </div>

          <div className="card mt-5 p-6 md:p-8">
            <h2 className="mb-5 text-lg font-extrabold text-ink">طلب البيع</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">السعر المطلوب (ر.س) *</label>
                <input
                  className="field tabular-nums"
                  type="number"
                  min="1"
                  required
                  value={form.asking_price}
                  onChange={(e) => set("asking_price", e.target.value)}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="label">ملاحظات للإدارة</label>
                <input
                  className="field"
                  value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                  placeholder="وقت مناسب للمعاينة، أسباب البيع…"
                />
              </div>
            </div>
            <div className="mt-6">
              <ErrorText>{error}</ErrorText>
            </div>
            <button className="btn btn-primary mt-5 w-full md:w-auto" disabled={submitting}>
              {submitting ? "جارٍ الإرسال…" : "إرسال طلب البيع"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

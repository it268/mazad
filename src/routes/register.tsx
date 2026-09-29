import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ClientResponseError } from "pocketbase";
import { getPb } from "#/lib/pb";
import { arError } from "#/lib/errors";
import { ErrorText } from "#/components/ui";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const pb = getPb();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    passwordConfirm: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.passwordConfirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    setBusy(true);
    try {
      await pb.collection("users").create({
        name: form.name.trim(),
        phone: form.phone.trim(),
        password: form.password,
        passwordConfirm: form.passwordConfirm,
      });
      await pb.collection("users").authWithPassword(form.phone.trim(), form.password);
      navigate({ to: "/account" });
    } catch (err) {
      if (err instanceof ClientResponseError) {
        const data: any = err.response?.data || {};
        if (data.phone?.code === "validation_not_unique") {
          setError("رقم الجوال مسجّل مسبقاً — جرّب تسجيل الدخول");
        } else {
          setError(arError(err, "تعذر إنشاء الحساب، تحقق من البيانات"));
        }
      } else {
        setError("تعذر إنشاء الحساب، حاول مجدداً");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-x flex justify-center py-16">
      <form onSubmit={submit} className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-extrabold text-ink">حساب جديد</h1>
        <p className="mt-2 text-sm text-ink-soft">
          انضم إلى منصة مزادات خيل العرب — بيع وشراء ومزايدة بثقة.
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="label">الاسم الكامل *</label>
            <input
              className="field"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="مثال: عبدالله المطيري"
            />
          </div>
          <div>
            <label className="label">رقم الجوال *</label>
            <input
              className="field tabular-nums"
              dir="ltr"
              required
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="05xxxxxxxx"
            />
          </div>
          <div>
            <label className="label">كلمة المرور *</label>
            <input
              className="field"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="8 أحرف على الأقل"
            />
          </div>
          <div>
            <label className="label">تأكيد كلمة المرور *</label>
            <input
              className="field"
              type="password"
              required
              value={form.passwordConfirm}
              onChange={(e) => set("passwordConfirm", e.target.value)}
            />
          </div>
          <ErrorText>{error}</ErrorText>
          <button className="btn btn-primary w-full" disabled={busy}>
            {busy ? "جارٍ الإنشاء…" : "إنشاء الحساب"}
          </button>
        </div>
        <p className="mt-5 text-center text-sm text-ink-soft">
          عندك حساب؟{" "}
          <Link to="/login" className="font-bold text-teal hover:text-orange">
            سجّل الدخول
          </Link>
        </p>
      </form>
    </div>
  );
}

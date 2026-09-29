import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { getPb } from "#/lib/pb";
import { arError } from "#/lib/errors";
import { ErrorText } from "#/components/ui";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const pb = getPb();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await pb.collection("users").authWithPassword(phone.trim(), password);
      const role = pb.authStore.record?.role;
      navigate({ to: role === "admin" ? "/admin" : "/account" });
    } catch (err) {
      setError(arError(err, "تعذر تسجيل الدخول، حاول مجدداً"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-x flex justify-center py-16">
      <form onSubmit={submit} className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-extrabold text-ink">تسجيل الدخول</h1>
        <p className="mt-2 text-sm text-ink-soft">
          ادخل برقم جوالك وكلمة المرور للمزايدة والبيع.
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="label">رقم الجوال</label>
            <input
              className="field tabular-nums"
              dir="ltr"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xxxxxxxx"
            />
          </div>
          <div>
            <label className="label">كلمة المرور</label>
            <input
              className="field"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <ErrorText>{error}</ErrorText>
          <button className="btn btn-primary w-full" disabled={busy}>
            {busy ? "جارٍ الدخول…" : "دخول"}
          </button>
        </div>
        <p className="mt-5 text-center text-sm text-ink-soft">
          ما عندك حساب؟{" "}
          <Link to="/register" className="font-bold text-teal hover:text-orange">
            أنشئ حساباً جديداً
          </Link>
        </p>
      </form>
    </div>
  );
}

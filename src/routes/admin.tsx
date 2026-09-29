import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useAuth } from "#/lib/auth";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const links = [
  { to: "/admin", label: "لوحة القيادة" },
  { to: "/admin/requests", label: "طلبات البيع" },
  { to: "/admin/horses", label: "الخيل والعروض" },
  { to: "/admin/auctions", label: "المزادات" },
  { to: "/admin/deals", label: "الصفقات" },
  { to: "/admin/clients", label: "العملاء" },
];

function AdminLayout() {
  const { user, isAdmin } = useAuth();
  const matchRoute = useMatchRoute();

  if (!user) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="text-2xl font-extrabold">لوحة الإدارة</h1>
        <p className="mt-3 text-ink-soft">سجّل الدخول بحساب الإدارة للمتابعة.</p>
        <Link to="/login" className="btn btn-primary mt-6">
          دخول
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="text-2xl font-extrabold text-crimson">غير مصرح</h1>
        <p className="mt-3 text-ink-soft">هذه المنطقة مخصصة لإدارة المنصة.</p>
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <div className="grid gap-8 lg:grid-cols-[14rem_1fr]">
        <aside className="card h-fit p-3">
          <p className="px-3 py-2 text-xs font-bold text-ink-soft">لوحة الإدارة</p>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {links.map((l) => {
              const active = matchRoute({ to: l.to, fuzzy: true });
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`shrink-0 rounded-lg px-3.5 py-2.5 text-sm font-bold transition-colors ${
                    active
                      ? "bg-teal text-white"
                      : "text-ink hover:bg-sand"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

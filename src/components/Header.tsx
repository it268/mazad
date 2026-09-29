import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { getPb } from "#/lib/pb";
import { useAuth } from "#/lib/auth";

const navLinks = [
  { to: "/", label: "الرئيسية" },
  { to: "/horses", label: "الخيل" },
  { to: "/auctions", label: "المزادات" },
  { to: "/sell", label: "بيع حصانك" },
];

export default function Header() {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pb = getPb();

  const logout = () => {
    pb.authStore.clear();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-gradient-to-l from-navy to-teal-deep py-1.5 text-center text-[0.75rem] font-semibold text-white/90">
        منصة مزادات وبيع وشراء خيل العرب الأصيلة — الجودة قبل الكمية، والثقة قبل
        كل صفقة
      </div>
      <div className="glass-header border-b border-line">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="مزاد الفروسية" className="h-10 w-auto" />
            <span className="text-lg font-extrabold text-teal">مزاد الفروسية</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-[0.95rem] font-bold text-ink transition-colors hover:text-orange"
                activeProps={{ className: "text-orange" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2.5 md:flex">
            {user ? (
              <>
                {isAdmin ? (
                  <Link to="/admin" className="btn btn-ghost-dark !px-4 !py-2">
                    لوحة الإدارة
                  </Link>
                ) : (
                  <Link to="/account" className="btn btn-ghost-dark !px-4 !py-2">
                    حسابي
                  </Link>
                )}
                <span className="text-sm font-bold text-ink-soft">
                  {String(user.name || user.phone || "")}
                </span>
                <button onClick={logout} className="btn btn-danger !px-4 !py-2">
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost-dark !px-4 !py-2">
                  دخول
                </Link>
                <Link to="/register" className="btn btn-primary !px-4 !py-2">
                  حساب جديد
                </Link>
              </>
            )}
          </div>

          <button
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="القائمة"
          >
            <span className="h-0.5 w-6 rounded bg-teal" />
            <span className="h-0.5 w-6 rounded bg-teal" />
            <span className="h-0.5 w-6 rounded bg-teal" />
          </button>
        </div>

        {open && (
          <div className="border-t border-line bg-cream px-5 pb-5 md:hidden">
            <nav className="flex flex-col gap-1 py-3">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 font-bold text-ink hover:bg-sand"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-wrap gap-2">
              {user ? (
                <>
                  {isAdmin ? (
                    <Link to="/admin" className="btn btn-ghost-dark !py-2">
                      لوحة الإدارة
                    </Link>
                  ) : (
                    <Link to="/account" className="btn btn-ghost-dark !py-2">
                      حسابي
                    </Link>
                  )}
                  <button onClick={logout} className="btn btn-danger !py-2">
                    خروج
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost-dark !py-2">
                    دخول
                  </Link>
                  <Link to="/register" className="btn btn-primary !py-2">
                    حساب جديد
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

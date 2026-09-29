import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPb } from "#/lib/pb";
import { useAuth } from "#/lib/auth";
import { fmtSAR, fmtDateTime } from "#/lib/format";
import { Loading } from "#/components/ui";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const pb = getPb();
  const { user } = useAuth();

  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [pendingReq, live, scheduled, activeSales, pendingDeals, sold] =
        await Promise.all([
          pb.collection("sale_requests").getList(1, 1, { filter: 'status="pending"' }),
          pb.collection("listings").getList(1, 1, { filter: 'type="auction" && status="live"' }),
          pb.collection("listings").getList(1, 1, { filter: 'type="auction" && status="scheduled"' }),
          pb.collection("listings").getList(1, 1, { filter: 'type="direct_sale" && status="active"' }),
          pb.collection("deals").getList(1, 1, { filter: 'status="pending"' }),
          pb.collection("deals").getList(1, 1, { filter: 'status="completed"' }),
        ]);
      return {
        pendingReq: pendingReq.totalItems,
        live: live.totalItems,
        scheduled: scheduled.totalItems,
        activeSales: activeSales.totalItems,
        pendingDeals: pendingDeals.totalItems,
        sold: sold.totalItems,
      };
    },
    refetchInterval: 30_000,
  });

  const recentRequests = useQuery({
    queryKey: ["admin-recent-requests"],
    queryFn: () =>
      pb.collection("sale_requests").getList(1, 5, {
        filter: 'status="pending"',
        sort: "-created",
        expand: "horse,seller",
      }),
    refetchInterval: 30_000,
  });

  if (stats.isPending) return <Loading />;

  const s = stats.data;

  const cards = [
    { n: s?.pendingReq, l: "طلبات بيع بانتظار المراجعة", to: "/admin/requests", c: "text-amber-600" },
    { n: s?.live, l: "مزادات مباشرة الآن", to: "/admin/auctions", c: "text-crimson" },
    { n: s?.scheduled, l: "مزادات مجدولة", to: "/admin/auctions", c: "text-navy" },
    { n: s?.activeSales, l: "معروضات بيع نشطة", to: "/admin/horses", c: "text-teal" },
    { n: s?.pendingDeals, l: "صفقات بانتظار التأكيد", to: "/admin/deals", c: "text-orange-deep" },
    { n: s?.sold, l: "صفقات مكتملة", to: "/admin/deals", c: "text-teal" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">
        أهلاً بك، {String(user?.name || "إدارة")}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        نظرة سريعة على الوضع اليوم.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.l} to={c.to} className="card p-5 transition-transform hover:-translate-y-0.5">
            <div className={`latin tabular-nums text-3xl font-extrabold ${c.c}`}>
              {c.n ?? "-"}
            </div>
            <div className="mt-1 text-sm font-bold text-ink-soft">{c.l}</div>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 mb-4 text-lg font-extrabold text-ink">
        أحدث طلبات البيع
      </h2>
      {recentRequests.data?.items.length ? (
        <div className="grid gap-3">
          {recentRequests.data.items.map((r: any) => (
            <div key={r.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <span className="font-extrabold text-ink">
                  {r.expand?.horse?.name}
                </span>
                <span className="ms-2 text-sm text-ink-soft">
                  من {r.expand?.seller?.name} · {fmtSAR(r.asking_price)} ·{" "}
                  {fmtDateTime(r.created)}
                </span>
              </div>
              <Link to="/admin/requests" className="btn btn-ghost-dark !px-4 !py-2">
                مراجعة
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-soft">لا توجد طلبات جديدة.</p>
      )}
    </div>
  );
}

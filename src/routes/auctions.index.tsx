import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAuctions } from "#/lib/api";
import { AuctionCard } from "#/components/cards";
import { EmptyState, Loading, PageHero } from "#/components/ui";

export const Route = createFileRoute("/auctions/")({
  validateSearch: (search: Record<string, unknown>) => ({
    status: (search.status as string) || undefined,
  }),
  loader: () => fetchAuctions({ status: ["live", "scheduled"], perPage: 24 }),
  component: AuctionsPage,
});

const tabs = [
  { key: "live", label: "مباشر الآن" },
  { key: "scheduled", label: "مزادات قادمة" },
  { key: "ended", label: "منتهية" },
];

function AuctionsPage() {
  const status = Route.useSearch().status || "live";
  const navigate = Route.useNavigate();
  const initial = Route.useLoaderData();

  const q = useQuery({
    queryKey: ["auctions", status],
    queryFn: () =>
      status === "live"
        ? fetchAuctions({ status: ["live", "scheduled"], perPage: 24 })
        : fetchAuctions({ status: [status], perPage: 24 }),
    placeholderData: (prev) => prev,
    refetchInterval: 15_000,
  });

  const items = q.data?.items || (status === "live" ? initial.items : []);

  return (
    <div>
      <PageHero
        eyebrow="المزادات"
        title="مزادات خيل العرب"
        sub="زايد مباشرة في الوقت الحقيقي — أعلى مزايدة عند انتهاء الوقت تفوز بالحصان."
      />

      <section className="container-x py-10">
        <div className="mb-8 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => navigate({ search: { status: t.key } })}
              className={`btn !px-6 !py-2.5 ${
                status === t.key ? "btn-teal" : "btn-ghost-dark"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {q.isPending ? (
          <Loading />
        ) : items.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((l) => (
              <AuctionCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={
              status === "live"
                ? "لا توجد مزادات مباشرة الآن"
                : status === "scheduled"
                  ? "لا توجد مزادات قادمة حالياً"
                  : "لا توجد مزادات منتهية بعد"
            }
            sub="تُعلن الإدارة عن مزادات جديدة بشكل دوري — تابعنا."
            action={
              <Link to="/horses" className="btn btn-primary mt-2">
                تصفح الخيل المعروضة
              </Link>
            }
          />
        )}
      </section>
    </div>
  );
}

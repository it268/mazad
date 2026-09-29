import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAuctions, fetchSaleListings, fetchCounts } from "#/lib/api";
import { AuctionCard, SaleCard } from "#/components/cards";
import { EmptyState } from "#/components/ui";
import { fmtNumber } from "#/lib/format";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [auctions, sales, counts] = await Promise.all([
      fetchAuctions({ status: ["live", "scheduled"], perPage: 6 }),
      fetchSaleListings({ perPage: 6 }),
      fetchCounts().catch(() => ({ soldHorses: 0, auctions: 0, clients: 0 })),
    ]);
    return { auctions, sales, counts };
  },
  component: Home,
});

const steps = [
  {
    n: "١",
    t: "أنشئ حسابك",
    d: "سجّل برقم جوالك في أقل من دقيقة وابدأ رحلتك في عالم خيل العرب.",
  },
  {
    n: "٢",
    t: "اعرض حصانك أو زايد",
    d: "أصحاب الخيل يرفعون طلب بيع للإدارة، والمشترون يزايدون في المزادات المباشرة.",
  },
  {
    n: "٣",
    t: "اعتماد الإدارة",
    d: "تتم معاينة الخيل والتحقق من الأصالة قبل عرضها للبيع أو المزاد.",
  },
  {
    n: "٤",
    t: "صفقة آمنة",
    d: "يتم إتمام البيع والتسليم بالتنسيق المباشر مع الإدارة، بثقة قبل كل شيء.",
  },
];

function Home() {
  const initial = Route.useLoaderData();

  const auctions = useQuery({
    queryKey: ["auctions", "home"],
    queryFn: () => fetchAuctions({ status: ["live", "scheduled"], perPage: 6 }),
    initialData: initial.auctions,
    refetchInterval: 20_000,
  });

  const sales = useQuery({
    queryKey: ["sales", "home"],
    queryFn: () => fetchSaleListings({ perPage: 6 }),
    initialData: initial.sales,
    refetchInterval: 60_000,
  });

  const counts = initial.counts;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-navy via-navy-deep to-teal-deep text-white">
        <div className="pattern-bg absolute inset-0 opacity-10" aria-hidden />
        <div className="container-x relative grid items-center gap-10 py-20 md:py-28 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="eyebrow !text-orange-soft">مزاد الفروسية</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.3] md:text-5xl md:leading-[1.3]">
              المزاد الذي يجمع البائع والمشتري في عالم{" "}
              <span className="text-orange-soft">خيل العرب الأصيلة</span>
            </h1>
            <p className="mt-5 max-w-xl text-white/80 md:text-lg">
              الحصان العربي ليس مجرد سلعة، بل كنز لا يقدَّر بثمن وتاريخ ونسب.
              هنا تُعرض الخيل المنتقاة بعناية، وتُدار المزادات بشفافية — الجودة
              قبل الكمية، والثقة قبل أي صفقة.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auctions" className="btn btn-primary">
                تصفح المزادات
              </Link>
              <Link to="/horses" className="btn btn-ghost">
                الخيل المعروضة للبيع
              </Link>
              <Link to="/sell" className="btn btn-ghost">
                اعرض حصانك للبيع
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { n: counts.soldHorses, l: "حصان تم بيعه" },
              { n: counts.auctions, l: "مزاد" },
              { n: counts.clients, l: "عضو موثوق" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl border border-white/15 bg-white/10 px-3 py-6 text-center backdrop-blur"
              >
                <div className="latin tabular-nums text-3xl font-extrabold text-orange-soft">
                  {fmtNumber(s.n)}
                </div>
                <div className="mt-1.5 text-xs text-white/75">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live auctions */}
      <section className="container-x py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow">المزادات</span>
            <h2 className="section-title mt-2">مزادات مباشرة ومقبلة</h2>
          </div>
          <Link
            to="/auctions"
            className="shrink-0 font-bold text-teal hover:text-orange"
          >
            كل المزادات ←
          </Link>
        </div>
        {auctions.data.items.length === 0 ? (
          <EmptyState
            title="لا توجد مزادات حالياً"
            sub="تابعنا قريباً — تُعلن الإدارة عن مزادات جديدة لخيل منتقاة بشكل دوري."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {auctions.data.items.map((l) => (
              <AuctionCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      {/* Horses for sale */}
      <section className="bg-sand/60 py-16">
        <div className="container-x">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <span className="eyebrow">معروضات الإدارة</span>
              <h2 className="section-title mt-2">خيل معروضة للبيع الآن</h2>
            </div>
            <Link
              to="/horses"
              className="shrink-0 font-bold text-teal hover:text-orange"
            >
              كل الخيل ←
            </Link>
          </div>
          {sales.data.items.length === 0 ? (
            <EmptyState
              title="لا توجد خيل معروضة حالياً"
              sub="تُعرض الخيل بعد معاينتها واعتمادها من الإدارة."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sales.data.items.map((l) => (
                <SaleCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="container-x py-16">
        <div className="mb-10 text-center">
          <span className="eyebrow justify-center">كيف يعمل المزاد</span>
          <h2 className="section-title mt-2">أربع خطوات نحو صفقة موثوقة</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-bl from-orange to-crimson text-xl font-extrabold text-white">
                {s.n}
              </div>
              <h3 className="mt-4 text-lg font-extrabold text-ink">{s.t}</h3>
              <p className="mt-2 text-sm leading-7 text-ink-soft">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust CTA */}
      <section className="container-x pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-orange to-crimson px-8 py-14 text-center text-white">
          <div className="pattern-bg absolute inset-0 opacity-10" aria-hidden />
          <div className="relative">
            <h2 className="text-2xl font-extrabold md:text-3xl">
              عندك حصان أصيل للبيع؟
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">
              ارفع طلب بيع للإدارة مع صور ومواصفات حصانك، وبعد المعاينة نعرضه
              للبيع المباشر أو في مزاد يصل إلى المشترين الجادين.
            </p>
            <Link
              to="/sell"
              className="btn mt-7 bg-white !text-crimson hover:!bg-cream"
            >
              ابدأ طلب البيع
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

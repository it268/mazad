import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { RecordModel } from "pocketbase";
import { getPb } from "#/lib/pb";
import { useAuth } from "#/lib/auth";
import { fmtSAR, fmtDateTime, fmtNumber } from "#/lib/format";
import {
  saleRequestStatusLabels,
  saleRequestStatusColors,
  dealStatusLabels,
  dealStatusColors,
  dealTypeLabels,
  horseStatusLabels,
  horseStatusColors,
  listingStatusLabels,
  listingStatusColors,
} from "#/lib/constants";
import { Badge, EmptyState, Loading, PageHero } from "#/components/ui";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-extrabold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function AccountPage() {
  const { user, isAdmin } = useAuth();
  const pb = getPb();

  const uid = user?.id || "";

  const requests = useQuery({
    queryKey: ["my-requests", uid],
    queryFn: () =>
      pb.collection("sale_requests").getFullList({
        filter: `seller="${uid}"`,
        sort: "-created",
        expand: "horse",
      }),
    enabled: !!uid && !isAdmin,
  });

  const bids = useQuery({
    queryKey: ["my-bids", uid],
    queryFn: async () => {
      const items = await pb.collection("bids").getFullList({
        filter: `bidder="${uid}"`,
        sort: "-created",
        expand: "listing",
      });
      const ids = [...new Set(items.map((b: any) => b.listing))];
      const listings = ids.length
        ? await pb
            .collection("listings")
            .getFullList({ filter: ids.map((i) => `id="${i}"`).join(" || "), expand: "horse" })
        : [];
      const byId = Object.fromEntries(listings.map((l: any) => [l.id, l]));
      return items.map((b: any) => ({ ...b, listing: byId[b.listing] }));
    },
    enabled: !!uid && !isAdmin,
  });

  const deals = useQuery({
    queryKey: ["my-deals", uid],
    queryFn: () =>
      pb.collection("deals").getFullList({
        filter: `buyer="${uid}" || seller="${uid}"`,
        sort: "-created",
        expand: "horse,listing",
      }),
    enabled: !!uid && !isAdmin,
  });

  const horses = useQuery({
    queryKey: ["my-horses", uid],
    queryFn: () =>
      pb.collection("horses").getFullList({
        filter: `owner="${uid}"`,
        sort: "-created",
      }),
    enabled: !!uid && !isAdmin,
  });

  if (!user) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="text-2xl font-extrabold">سجّل الدخول لعرض حسابك</h1>
        <Link to="/login" className="btn btn-primary mt-6">
          دخول
        </Link>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="text-2xl font-extrabold">هذه الصفحة للعملاء</h1>
        <p className="mt-3 text-ink-soft">
          ادارة كل شيء من{" "}
          <Link to="/admin" className="font-bold text-teal">
            لوحة الإدارة
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        eyebrow="حسابي"
        title={`أهلاً، ${String(user.name || "")}`}
        sub="تابع طلبات بيعك، مزايداتك، وصفقاتك من مكان واحد."
      />
      <div className="container-x pb-16">
        {/* Sale requests */}
        <Section title="طلبات بيع خيلي">
          {requests.isPending ? (
            <Loading />
          ) : (requests.data || []).length === 0 ? (
            <EmptyState
              title="لا توجد طلبات بيع بعد"
              sub="اعرض حصانك للبيع للإدارة وابدأ أول صفقة."
              action={
                <Link to="/sell" className="btn btn-primary mt-2">
                  اعرض حصانك للبيع
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4">
              {(requests.data as RecordModel[]).map((r: any) => (
                <div key={r.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
                  <div>
                    <Link
                      to="/horses/$id"
                      params={{ id: r.expand?.horse?.id }}
                      className="font-extrabold text-ink hover:text-teal"
                    >
                      {r.expand?.horse?.name || "حصان"}
                    </Link>
                    <p className="text-sm text-ink-soft">
                      السعر المطلوب: {fmtSAR(r.asking_price)} · {fmtDateTime(r.created)}
                    </p>
                    {r.admin_note && (
                      <p className="mt-1 text-sm font-semibold text-crimson">
                        ملاحظة الإدارة: {r.admin_note}
                      </p>
                    )}
                  </div>
                  <Badge
                    label={saleRequestStatusLabels[r.status] || r.status}
                    color={saleRequestStatusColors[r.status]}
                  />
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* My bids */}
        <Section title="مزايداتي">
          {bids.isPending ? (
            <Loading />
          ) : (bids.data || []).length === 0 ? (
            <EmptyState
              title="لم تشارك في مزادات بعد"
              sub="ادخل أول مزاد وشاهد المزايدة المباشرة."
              action={
                <Link to="/auctions" className="btn btn-teal mt-2">
                  تصفح المزادات
                </Link>
              }
            />
          ) : (
            <div className="grid gap-4">
              {(bids.data as RecordModel[]).map((b: any) => (
                <div key={b.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
                  <div>
                    <Link
                      to="/auctions/$id"
                      params={{ id: b.listing?.id || "" }}
                      className="font-extrabold text-ink hover:text-teal"
                    >
                      {b.listing?.expand?.horse?.name || "مزاد"}
                    </Link>
                    <p className="text-sm text-ink-soft">
                      {listingStatusLabels[b.listing?.status] || ""} ·{" "}
                      {fmtDateTime(b.created)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="latin tabular-nums font-extrabold text-teal">
                      {fmtSAR(b.amount)}
                    </span>
                    {b.listing && (
                      <Badge
                        label={listingStatusLabels[b.listing.status] || b.listing.status}
                        color={listingStatusColors[b.listing.status]}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Deals */}
        <Section title="صفقاتي">
          {deals.isPending ? (
            <Loading />
          ) : (deals.data || []).length === 0 ? (
            <EmptyState title="لا توجد صفقات بعد" />
          ) : (
            <div className="grid gap-4">
              {(deals.data as RecordModel[]).map((d: any) => (
                <div key={d.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
                  <div>
                    <span className="font-extrabold text-ink">
                      {d.expand?.horse?.name || "حصان"}
                    </span>
                    <p className="text-sm text-ink-soft">
                      {dealTypeLabels[d.type] || d.type} · {fmtSAR(d.amount)} ·{" "}
                      {fmtDateTime(d.created)}
                    </p>
                    {d.payment_note && (
                      <p className="mt-1 text-sm text-ink-soft">{d.payment_note}</p>
                    )}
                  </div>
                  <Badge
                    label={dealStatusLabels[d.status] || d.status}
                    color={dealStatusColors[d.status]}
                  />
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* My horses */}
        <Section title="خيلي">
          {horses.isPending ? (
            <Loading />
          ) : (horses.data || []).length === 0 ? (
            <EmptyState title="لم تُضف أي خيل لحسابك بعد" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(horses.data as RecordModel[]).map((h: any) => (
                <div key={h.id} className="card p-5">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to="/horses/$id"
                      params={{ id: h.id }}
                      className="font-extrabold text-ink hover:text-teal"
                    >
                      {h.name}
                    </Link>
                    <Badge
                      label={horseStatusLabels[h.status] || h.status}
                      color={horseStatusColors[h.status]}
                    />
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">
                    {h.breed} · {fmtNumber(h.age_years || 0)} سنوات
                  </p>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

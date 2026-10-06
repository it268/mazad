import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClientResponseError } from "pocketbase";
import { fetchHorse, fetchHorseListings } from "#/lib/api";
import { getPb, fileUrl } from "#/lib/pb";
import { useAuth } from "#/lib/auth";
import {
  fmtSAR,
  fmtNumber,
  fmtDateTime,
} from "#/lib/format";
import {
  genderLabels,
  listingStatusLabels,
  listingStatusColors,
  horseStatusLabels,
  horseStatusColors,
} from "#/lib/constants";
import { Badge, ErrorText, PageHero } from "#/components/ui";
import { Countdown } from "#/components/Countdown";

export const Route = createFileRoute("/horses/$id")({
  loader: ({ params }) => fetchHorse(params.id),
  component: HorseDetail,
});

function HorseDetail() {
  const horseId = Route.useParams().id;
  const initial = Route.useLoaderData();
  const { user, isAdmin } = useAuth();
  const pb = getPb();

  const [imgIdx, setImgIdx] = useState(0);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState("");
  const [bought, setBought] = useState(false);

  const listings = useQuery({
    queryKey: ["horse-listings", horseId],
    queryFn: () => fetchHorseListings(horseId),
    placeholderData: [],
    refetchInterval: 20_000,
  });

  if (!initial || (initial as any).code === 404) {
    return (
      <div className="container-x py-20">
        <h1 className="text-2xl font-extrabold">لم يتم العثور على الحصان</h1>
        <Link to="/horses" className="btn btn-teal mt-6">
          العودة للخيل المعروضة
        </Link>
      </div>
    );
  }

  const horse = initial as any;
  const images = horse.images || [];
  const owner = horse.expand?.owner;

  const buyNow = async (listingId: string) => {
    setBuyError("");
    setBuying(true);
    try {
      await pb.collection("deals").create({
        listing: listingId,
        type: "direct_sale",
      });
      setBought(true);
    } catch (e: any) {
      setBuyError(
        e instanceof ClientResponseError ? e.message : "تعذر إرسال الطلب",
      );
    } finally {
      setBuying(false);
    }
  };

  const specs: [string, string][] = [
    ["السلالة", horse.breed || "-"],
    ["النوع", genderLabels[horse.gender] || horse.gender || "-"],
    ["العمر", horse.age_years ? `${fmtNumber(horse.age_years)} سنوات` : "-"],
    ["اللون", horse.color || "-"],
    [
      "الارتفاع",
      horse.height_cm ? `${fmtNumber(horse.height_cm)} سم` : "-",
    ],
    ["النسب", horse.lineage || "-"],
  ];

  return (
    <div>
      <PageHero
        eyebrow="بطاقة الحصان"
        title={horse.name}
        sub={`${horse.breed} · ${genderLabels[horse.gender] || ""}`}
      />

      <section className="container-x grid gap-10 py-12 lg:grid-cols-[1.1fr_1fr]">
        {/* Gallery */}
        <div>
          <div className="card h-96 overflow-hidden">
            {images.length > 0 ? (
              <img
                src={fileUrl(horse, images[imgIdx], "900x700")}
                alt={horse.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-bl from-teal/15 to-navy/15 text-7xl">
                🐎
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {images.map((img: string, i: number) => (
                <button
                  key={img + i}
                  onClick={() => setImgIdx(i)}
                  className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    i === imgIdx ? "border-orange" : "border-transparent opacity-70"
                  }`}
                >
                  <img
                    src={fileUrl(horse, img, "220x160")}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Specs */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              label={horseStatusLabels[horse.status] || horse.status}
              color={horseStatusColors[horse.status]}
            />
          </div>
          <div className="card mt-4 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {specs.map(([k, v]) => (
                  <tr key={k} className="border-b border-line last:border-0">
                    <td className="bg-sand/50 px-4 py-3 font-bold text-ink-soft w-32">
                      {k}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {horse.description && (
            <div className="mt-5">
              <h3 className="mb-2 font-extrabold text-ink">عن الحصان</h3>
              <p className="whitespace-pre-line leading-8 text-ink-soft">
                {horse.description}
              </p>
            </div>
          )}
          {owner && !isAdmin && (
            <p className="mt-5 rounded-xl bg-teal/5 px-4 py-3 text-sm text-teal">
              البيع والتسليم يتم بالتنسيق المباشر مع إدارة المنصة.
            </p>
          )}
        </div>
      </section>

      {/* Listings */}
      <section className="container-x pb-16">
        <h2 className="section-title mb-6">عروض هذا الحصان</h2>
        <ErrorText>{buyError}</ErrorText>
        {bought && (
          <p className="mb-4 rounded-xl bg-teal/10 px-4 py-3 font-semibold text-teal">
            تم إرسال طلب الشراء بنجاح — ستصلك بيانات إتمام الصفقة من الإدارة.
          </p>
        )}
        {listings.data.length === 0 ? (
          <p className="text-ink-soft">لا توجد عروض نشطة لهذا الحصان حالياً.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {listings.data.map((l: any) => (
              <div key={l.id} className="card p-6">
                <div className="flex items-center justify-between gap-3">
                  <Badge
                    label={listingStatusLabels[l.status] || l.status}
                    color={listingStatusColors[l.status]}
                  />
                  {l.type === "auction" && l.ends_at && l.status === "live" && (
                    <Countdown target={l.ends_at} compact />
                  )}
                </div>
                {l.type === "direct_sale" ? (
                  <>
                    <div className="mt-3 text-2xl font-extrabold text-orange-deep">
                      {fmtSAR(l.price)}
                    </div>
                    {l.status === "active" &&
                      (user && !isAdmin ? (
                        <button
                          className="btn btn-primary mt-4 w-full"
                          disabled={buying}
                          onClick={() => buyNow(l.id)}
                        >
                          {buying ? "جارٍ الإرسال…" : "اشترِ الآن"}
                        </button>
                      ) : user ? (
                        <p className="mt-4 text-sm font-semibold text-ink-soft">
                          هذا العرض مخصص للمشترين من العملاء.
                        </p>
                      ) : (
                        <Link
                          to="/login"
                          className="btn btn-primary mt-4 w-full"
                        >
                          سجّل الدخول للشراء
                        </Link>
                      ))}
                  </>
                ) : (
                  <>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-sm font-bold text-ink-soft">
                        {l.current_top_bid ? "أعلى مزايدة" : "سعر البداية"}
                      </span>
                      <span className="text-2xl font-extrabold text-teal">
                        {fmtSAR(l.current_top_bid || l.start_price)}
                      </span>
                    </div>
                    {l.starts_at && (
                      <p className="mt-1 text-xs text-ink-soft">
                        يبدأ: {fmtDateTime(l.starts_at)}
                      </p>
                    )}
                    <Link
                      to="/auctions/$id"
                      params={{ id: l.id }}
                      className="btn btn-teal mt-4 w-full"
                    >
                      ادخل غرفة المزاد
                    </Link>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

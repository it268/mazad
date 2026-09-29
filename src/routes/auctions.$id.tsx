import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ClientResponseError } from "pocketbase";
import { fetchAuction, fetchBids } from "#/lib/api";
import { getPb, fileUrl } from "#/lib/pb";
import { useAuth } from "#/lib/auth";
import { fmtSAR, fmtNumber, fmtDateTime, maskName } from "#/lib/format";
import { genderLabels, listingStatusLabels, listingStatusColors } from "#/lib/constants";
import { Badge, ErrorText, Loading } from "#/components/ui";
import { Countdown } from "#/components/Countdown";

export const Route = createFileRoute("/auctions/$id")({
  loader: ({ params }) =>
    fetchAuction(params.id).catch(() => null),
  component: AuctionRoom,
});

function AuctionRoom() {
  const { id } = Route.useParams();
  const initial = Route.useLoaderData();
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const pb = getPb();

  const [amount, setAmount] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [bidOk, setBidOk] = useState(false);

  const listing = useQuery({
    queryKey: ["auction", id],
    queryFn: () => fetchAuction(id),
    initialData: initial ?? undefined,
    refetchInterval: 20_000,
  });

  const bids = useQuery({
    queryKey: ["bids", id],
    queryFn: () => fetchBids(id),
    placeholderData: [],
    refetchInterval: 15_000,
  });

  // Realtime: new bids + listing status changes
  useEffect(() => {
    const subs = [
      pb.collection("bids").subscribe("*", (e) => {
        if (e.record.listing === id) {
          qc.invalidateQueries({ queryKey: ["bids", id] });
          qc.invalidateQueries({ queryKey: ["auction", id] });
        }
      }),
      pb.collection("listings").subscribe(id, () => {
        qc.invalidateQueries({ queryKey: ["auction", id] });
      }),
    ];
    return () => {
      subs.forEach((p) => p.then((unsub) => unsub()).catch(() => {}));
    };
  }, [id, pb, qc]);

  if (!initial) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="text-2xl font-extrabold">لم يتم العثور على المزاد</h1>
        <Link to="/auctions" className="btn btn-teal mt-6">
          العودة للمزادات
        </Link>
      </div>
    );
  }

  const l: any = listing.data;
  if (!l) return <Loading />;
  const horse = l.expand?.horse;
  const topBidder = l.expand?.top_bidder;
  const top = l.current_top_bid || l.start_price || 0;
  const minNext = top + (l.min_increment || 0);
  const isLive = l.status === "live";
  const isEnded = l.status === "ended" || l.status === "sold";
  const canBid = !!user && !isAdmin && isLive;
  const iAmWinner = isEnded && topBidder && user && topBidder.id === user.id;

  const placeBid = async () => {
    setError("");
    const v = Number(amount);
    if (!Number.isFinite(v) || v <= 0) {
      setError("أدخل مبلغاً صحيحاً");
      return;
    }
    setPlacing(true);
    try {
      await pb.collection("bids").create({ listing: id, amount: v });
      setAmount("");
      setBidOk(true);
      qc.invalidateQueries({ queryKey: ["bids", id] });
      qc.invalidateQueries({ queryKey: ["auction", id] });
    } catch (e: any) {
      setError(
        e instanceof ClientResponseError && e.message
          ? e.message
          : "تعذر تسجيل المزايدة، حاول مجدداً",
      );
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container-x py-10">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge
          label={listingStatusLabels[l.status] || l.status}
          color={listingStatusColors[l.status]}
        />
        <Link to="/auctions" className="text-sm font-bold text-teal hover:text-orange">
          ← كل المزادات
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Horse panel */}
        <div>
          <div className="card h-80 overflow-hidden md:h-96">
            {horse?.images?.[0] ? (
              <img
                src={fileUrl(horse, horse.images[0], "900x700")}
                alt={horse.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-bl from-teal/15 to-navy/15 text-7xl">
                🐎
              </div>
            )}
          </div>
          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-ink md:text-3xl">
                {horse?.name || "-"}
              </h1>
              <p className="mt-1 text-ink-soft">
                {horse?.breed} · {genderLabels[horse?.gender] || ""}
                {horse?.age_years ? ` · ${fmtNumber(horse.age_years)} سنوات` : ""}
                {horse?.color ? ` · ${horse.color}` : ""}
              </p>
            </div>
            {horse && (
              <Link
                to="/horses/$id"
                params={{ id: horse.id }}
                className="shrink-0 text-sm font-bold text-teal hover:text-orange"
              >
                بطاقة الحصان ←
              </Link>
            )}
          </div>
          {horse?.description && (
            <p className="mt-4 whitespace-pre-line leading-8 text-ink-soft">
              {horse.description}
            </p>
          )}

          <div className="card mt-6 grid grid-cols-2 gap-4 p-5 text-sm md:grid-cols-3">
            <div>
              <span className="block text-xs font-bold text-ink-soft">سعر البداية</span>
              <span className="font-extrabold text-ink">{fmtSAR(l.start_price)}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-ink-soft">أقل زيادة</span>
              <span className="font-extrabold text-ink">{fmtSAR(l.min_increment)}</span>
            </div>
            {l.starts_at && (
              <div>
                <span className="block text-xs font-bold text-ink-soft">البداية</span>
                <span className="font-bold text-ink">{fmtDateTime(l.starts_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bidding panel */}
        <div className="flex flex-col gap-5">
          <div
            className={`rounded-2xl p-6 text-white ${
              isLive
                ? "bg-gradient-to-bl from-navy to-teal-deep"
                : isEnded
                  ? "bg-ink"
                  : "bg-gradient-to-bl from-teal to-teal-deep"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-white/75">
                {l.current_top_bid ? "أعلى مزايدة حالياً" : "بانتظار أول مزايدة"}
              </span>
              {isLive && l.ends_at && (
                <span className="badge bg-white/15 text-white">
                  <Countdown target={l.ends_at} compact />
                </span>
              )}
            </div>
            <div className="latin tabular-nums mt-2 text-4xl font-extrabold text-orange-soft">
              {fmtSAR(top)}
            </div>
            {topBidder && (
              <p className="mt-1 text-sm text-white/75">
                بواسطة: {isAdmin || iAmWinner ? topBidder.name || topBidder.phone : maskName(topBidder.name)}
              </p>
            )}

            {isLive && l.ends_at && (
              <div className="mt-5 rounded-xl bg-white/10 p-4">
                <span className="mb-2 block text-xs font-bold text-white/70">
                  ينتهي المزاد بعد
                </span>
                <Countdown
                  target={l.ends_at}
                  onEnd={() => qc.invalidateQueries({ queryKey: ["auction", id] })}
                />
              </div>
            )}
            {l.status === "scheduled" && l.starts_at && (
              <div className="mt-5 rounded-xl bg-white/10 p-4">
                <span className="mb-2 block text-xs font-bold text-white/70">
                  يبدأ المزاد بعد
                </span>
                <Countdown target={l.starts_at} />
              </div>
            )}
            {isEnded && (
              <p className="mt-4 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold">
                {iAmWinner
                  ? "مبروك! فزت بأعلى مزايدة — سيتواصل معك قسم الصفقات لإتمام البيع."
                  : topBidder
                    ? `انتهى المزاد — الفائز: ${isAdmin ? topBidder.name || topBidder.phone : maskName(topBidder.name)}`
                    : "انتهى المزاد دون مزايدات."}
              </p>
            )}
          </div>

          {/* Bid form */}
          {canBid && (
            <div className="card p-5">
              <label className="label">
                مبلغ المزايدة (الحد الأدنى {fmtSAR(minNext)})
              </label>
              <div className="flex gap-2">
                <input
                  className="field tabular-nums"
                  type="number"
                  min={minNext}
                  step={l.min_increment || 1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={String(minNext)}
                  dir="ltr"
                />
                <button
                  className="btn btn-primary shrink-0"
                  disabled={placing}
                  onClick={placeBid}
                >
                  {placing ? "جارٍ التسجيل…" : "زايد الآن"}
                </button>
              </div>
              <div className="mt-3">
                <ErrorText>{error}</ErrorText>
                {bidOk && !error && (
                  <p className="text-sm font-bold text-teal">
                    تم تسجيل مزايدتك — بالتوفيق!
                  </p>
                )}
              </div>
            </div>
          )}
          {isLive && !user && (
            <div className="card p-5 text-center">
              <p className="font-bold text-ink">سجّل الدخول للمزايدة في هذا المزاد</p>
              <Link to="/login" className="btn btn-primary mt-3">
                دخول
              </Link>
            </div>
          )}

          {/* Bid feed */}
          <div className="card overflow-hidden">
            <h3 className="border-b border-line bg-sand/50 px-5 py-3 font-extrabold text-ink">
              سجل المزايدات ({fmtNumber(bids.data.length)})
            </h3>
            {bids.data.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-ink-soft">
                لا توجد مزايدات بعد — كن أول المزايدين.
              </p>
            ) : (
              <ul className="max-h-96 divide-y divide-line overflow-y-auto">
                {bids.data.map((b: any, i: number) => (
                  <li key={b.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold ${
                          i === 0 ? "bg-orange text-white" : "bg-sand text-ink-soft"
                        }`}
                      >
                        {fmtNumber(bids.data.length - i)}
                      </span>
                      <div>
                        <span className="block text-sm font-bold text-ink">
                          {isAdmin || (user && b.expand?.bidder?.id === user.id)
                            ? b.expand?.bidder?.name || b.expand?.bidder?.phone
                            : maskName(b.expand?.bidder?.name)}
                        </span>
                        <span className="block text-[0.7rem] text-ink-soft">
                          {fmtDateTime(b.created)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`latin tabular-nums font-extrabold ${
                        i === 0 ? "text-orange-deep" : "text-ink"
                      }`}
                    >
                      {fmtSAR(b.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

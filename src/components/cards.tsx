import { Link } from "@tanstack/react-router";
import { fileUrl } from "#/lib/pb";
import { fmtSAR, fmtNumber } from "#/lib/format";
import {
  genderLabels,
  listingStatusLabels,
  listingStatusColors,
} from "#/lib/constants";
import { Badge } from "./ui";

export type HorseRecord = {
  id: string;
  collectionId: string;
  name: string;
  breed: string;
  gender: string;
  age_years?: number;
  color?: string;
  images?: string[];
  expand?: Record<string, any>;
};

export type ListingRecord = {
  id: string;
  collectionId: string;
  type: string;
  status: string;
  price?: number;
  start_price?: number;
  min_increment?: number;
  starts_at?: string;
  ends_at?: string;
  current_top_bid?: number;
  expand?: Record<string, any>;
};

function HorseImage({
  horse,
  className = "",
}: {
  horse: HorseRecord;
  className?: string;
}) {
  const img = horse.images?.[0];
  if (img) {
    return (
      <img
        src={fileUrl(horse, img, "600x400")}
        alt={horse.name}
        loading="lazy"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-bl from-teal/15 to-navy/15 text-5xl ${className}`}
      aria-label="لا توجد صورة"
    >
      🐎
    </div>
  );
}

/** Auction card (live / scheduled / ended). */
export function AuctionCard({ listing }: { listing: ListingRecord }) {
  const horse = listing.expand?.horse as HorseRecord | undefined;
  if (!horse) return null;
  const top = listing.current_top_bid || listing.start_price || 0;
  const isLive = listing.status === "live";

  return (
    <Link
      to="/auctions/$id"
      params={{ id: listing.id }}
      className="card group block overflow-hidden transition-transform hover:-translate-y-1"
    >
      <div className="relative h-52 overflow-hidden">
        <HorseImage horse={horse} className="transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-3 start-3">
          <Badge
            label={listingStatusLabels[listing.status] || listing.status}
            color={listingStatusColors[listing.status]}
          />
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-extrabold text-ink">{horse.name}</h3>
        <p className="mt-0.5 text-sm text-ink-soft">
          {horse.breed} · {genderLabels[horse.gender] || horse.gender}
          {horse.age_years ? ` · ${fmtNumber(horse.age_years)} سنوات` : ""}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="block text-[0.7rem] font-bold text-ink-soft">
              {listing.current_top_bid ? "أعلى مزايدة" : "سعر البداية"}
            </span>
            <span className="text-lg font-extrabold text-teal">
              {fmtSAR(top)}
            </span>
          </div>
          {isLive && listing.ends_at && (
            <span className="badge bg-crimson text-white">
              مباشر الآن
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/** Direct-sale listing card. */
export function SaleCard({ listing }: { listing: ListingRecord }) {
  const horse = listing.expand?.horse as HorseRecord | undefined;
  if (!horse) return null;

  return (
    <Link
      to="/horses/$id"
      params={{ id: horse.id }}
      className="card group block overflow-hidden transition-transform hover:-translate-y-1"
    >
      <div className="relative h-52 overflow-hidden">
        <HorseImage horse={horse} className="transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-extrabold text-ink">{horse.name}</h3>
        <p className="mt-0.5 text-sm text-ink-soft">
          {horse.breed} · {genderLabels[horse.gender] || horse.gender}
          {horse.age_years ? ` · ${fmtNumber(horse.age_years)} سنوات` : ""}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-extrabold text-orange-deep">
            {fmtSAR(listing.price)}
          </span>
          <span className="text-sm font-bold text-teal group-hover:text-orange">
            التفاصيل ←
          </span>
        </div>
      </div>
    </Link>
  );
}

export { HorseImage };

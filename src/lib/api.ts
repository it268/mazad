import { getPb } from "./pb";

export type Paged<T = any> = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
};

const auctionVisible =
  'type="auction" && (status="live" || status="scheduled" || status="ended")';

export async function fetchAuctions(
  opts: { status?: string[]; page?: number; perPage?: number } = {},
): Promise<Paged> {
  const statusFilter = opts.status?.length
    ? `&& (${opts.status.map((s) => `status="${s}"`).join(" || ")})`
    : "";
  return getPb().collection("listings").getList(opts.page ?? 1, opts.perPage ?? 12, {
    filter: auctionVisible + statusFilter,
    sort: "ends_at",
    expand: "horse",
  });
}

export async function fetchAuction(id: string) {
  return getPb().collection("listings").getOne(id, {
    expand: "horse,top_bidder",
  });
}

export async function fetchSaleListings(
  opts: {
    page?: number;
    perPage?: number;
    gender?: string;
    breed?: string;
    maxPrice?: number;
  } = {},
): Promise<Paged> {
  const parts = ['type="direct_sale"', '(status="active" || status="reserved")'];
  if (opts.gender) parts.push(`horse.gender="${opts.gender}"`);
  if (opts.breed) parts.push(`horse.breed="${opts.breed}"`);
  if (opts.maxPrice) parts.push(`price<=${opts.maxPrice}`);
  return getPb().collection("listings").getList(opts.page ?? 1, opts.perPage ?? 12, {
    filter: parts.join(" && "),
    sort: "-created",
    expand: "horse",
  });
}

export async function fetchHorse(id: string) {
  return getPb().collection("horses").getOne(id, {
    expand: "owner",
  });
}

export async function fetchHorseListings(horseId: string) {
  return getPb().collection("listings").getFullList({
    filter: `horse="${horseId}" && status!="cancelled"`,
    sort: "-created",
  });
}

export async function fetchBids(listingId: string) {
  return getPb().collection("bids").getFullList({
    filter: `listing="${listingId}"`,
    sort: "-amount",
    expand: "bidder",
  });
}

export async function fetchCounts() {
  try {
    const res = await fetch(`${getPb().baseURL.replace(/\/$/, "")}/api/mazad/stats`);
    if (!res.ok) throw new Error(`stats ${res.status}`);
    return res.json();
  } catch (e) {
    console.error("[fetchCounts] error=", String(e));
    return { soldHorses: 0, auctions: 0, clients: 0 };
  }
}

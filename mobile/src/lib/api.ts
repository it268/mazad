import { pb } from "./pb";

export type Paged<T = any> = {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
};

export async function fetchAuctions(
  opts: { status?: string[]; page?: number; perPage?: number } = {},
): Promise<Paged> {
  const base = 'type="auction" && (status="live" || status="scheduled" || status="ended")';
  const statusFilter = opts.status?.length
    ? ` && (${opts.status.map((s) => `status="${s}"`).join(" || ")})`
    : "";
  return pb.collection("listings").getList(opts.page ?? 1, opts.perPage ?? 15, {
    filter: base + statusFilter,
    sort: "ends_at",
    expand: "horse",
  });
}

export async function fetchAuction(id: string) {
  return pb.collection("listings").getOne(id, { expand: "horse,top_bidder" });
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
  return pb.collection("listings").getList(opts.page ?? 1, opts.perPage ?? 15, {
    filter: parts.join(" && "),
    sort: "-created",
    expand: "horse",
  });
}

export async function fetchHorse(id: string) {
  return pb.collection("horses").getOne(id, { expand: "owner" });
}

export async function fetchHorseListings(horseId: string) {
  return pb.collection("listings").getFullList({
    filter: `horse="${horseId}" && status!="cancelled"`,
    sort: "-created",
  });
}

export async function fetchBids(listingId: string) {
  return pb.collection("bids").getFullList({
    filter: `listing="${listingId}"`,
    sort: "-amount",
    expand: "bidder",
  });
}

export type Stats = { soldHorses: number; auctions: number; clients: number };

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(pb.buildURL("/api/mazad/stats"));
  if (!res.ok) throw new Error(`stats ${res.status}`);
  return res.json();
}

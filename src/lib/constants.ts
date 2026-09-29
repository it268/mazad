export const horseStatusLabels: Record<string, string> = {
  pending_review: "قيد المراجعة",
  owned_by_admin: "مملوك للإدارة",
  listed: "معروض للبيع",
  in_auction: "داخل مزاد",
  sold: "تم البيع",
  rejected: "مرفوض",
};

export const saleRequestStatusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  accepted: "مقبول",
  rejected: "مرفوض",
  purchased: "تم الشراء",
  cancelled: "ملغي",
};

export const listingStatusLabels: Record<string, string> = {
  scheduled: "مزاد مجدول",
  live: "مزاد مباشر",
  active: "معروض للبيع",
  reserved: "محجوز",
  ended: "انتهى المزاد",
  sold: "تم البيع",
  cancelled: "ملغي",
};

export const dealTypeLabels: Record<string, string> = {
  admin_buys_from_client: "شراء من عميل",
  direct_sale: "بيع مباشر",
  auction_win: "مزاد",
};

export const dealStatusLabels: Record<string, string> = {
  pending: "بانتظار التأكيد",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export const genderLabels: Record<string, string> = {
  male: "حصان (ذكر)",
  female: "فرس (أنثى)",
};

export const breedOptions = [
  "عربي أصيل",
  "إنجليزي أصيل",
  "مخيوط",
  "هجين",
];

export const colorOptions = [
  "خمري",
  "أشقر",
  "أسود",
  "أبيض",
  "رملي",
  "أبلق",
  "كحيل",
  "سماء",
];

export const horseStatusColors: Record<string, string> = {
  pending_review: "bg-amber-100 text-amber-800",
  owned_by_admin: "bg-teal/10 text-teal",
  listed: "bg-orange/10 text-orange-deep",
  in_auction: "bg-navy/10 text-navy",
  sold: "bg-crimson/10 text-crimson",
  rejected: "bg-crimson/10 text-crimson",
};

export const saleRequestStatusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-teal/10 text-teal",
  rejected: "bg-crimson/10 text-crimson",
  purchased: "bg-orange/10 text-orange-deep",
  cancelled: "bg-ink/10 text-ink-soft",
};

export const listingStatusColors: Record<string, string> = {
  scheduled: "bg-navy/10 text-navy",
  live: "bg-crimson text-white animate-pulse",
  active: "bg-orange/10 text-orange-deep",
  reserved: "bg-amber-100 text-amber-800",
  ended: "bg-ink/10 text-ink-soft",
  sold: "bg-crimson/10 text-crimson",
  cancelled: "bg-ink/10 text-ink-soft",
};

export const dealStatusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-teal/10 text-teal",
  completed: "bg-teal text-white",
  cancelled: "bg-ink/10 text-ink-soft",
};

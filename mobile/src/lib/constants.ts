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

export const breedOptions = ["عربي أصيل", "إنجليزي أصيل", "مخيوط", "هجين"];

export const colorOptions = [
  "خمري", "أشقر", "أسود", "أبيض", "رملي", "أبلق", "كحيل", "سماء",
];

export const listStatusLabels = {
  ...horseStatusLabels,
  ...saleRequestStatusLabels,
  ...listingStatusLabels,
  ...dealStatusLabels,
};

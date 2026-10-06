// af brand palette — ported from the alfursya deck (see ../web/src/styles.css)
export const colors = {
  teal: "#0e5f82",
  tealDeep: "#0a4a66",
  navy: "#2f3382",
  navyDeep: "#232663",
  orange: "#f5730f",
  orangeSoft: "#ff9a45",
  orangeDeep: "#d95f04",
  crimson: "#7d1300",
  cream: "#f6f3ec",
  sand: "#ece5d8",
  ink: "#191510",
  inkSoft: "#4c463d",
  line: "rgba(14, 95, 130, 0.16)",
  white: "#ffffff",
};

export const font = {
  regular: "Alexandria_400Regular",
  medium: "Alexandria_500Medium",
  semibold: "Alexandria_600SemiBold",
  bold: "Alexandria_700Bold",
  extrabold: "Alexandria_800ExtraBold",
};

export const statusColors: Record<string, string> = {
  pending_review: "rgba(180,120,0,0.14)",
  owned_by_admin: "rgba(14,95,130,0.12)",
  listed: "rgba(245,115,15,0.14)",
  in_auction: "rgba(47,51,130,0.14)",
  sold: "rgba(125,19,0,0.14)",
  rejected: "rgba(125,19,0,0.14)",
  scheduled: "rgba(47,51,130,0.14)",
  live: colors.crimson,
  active: "rgba(245,115,15,0.14)",
  reserved: "rgba(180,120,0,0.14)",
  ended: "rgba(25,21,16,0.12)",
  cancelled: "rgba(25,21,16,0.12)",
  pending: "rgba(180,120,0,0.14)",
  accepted: "rgba(14,95,130,0.12)",
  purchased: "rgba(245,115,15,0.14)",
  confirmed: "rgba(14,95,130,0.12)",
  completed: colors.teal,
};

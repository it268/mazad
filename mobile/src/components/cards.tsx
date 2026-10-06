import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { fileUrl } from "../lib/pb";
import { fmtSAR, fmtNumber } from "../lib/format";
import { genderLabels } from "../lib/constants";
import { colors, font } from "../lib/theme";
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

export function HorseImage({
  horse,
  style,
}: {
  horse: HorseRecord;
  style?: any;
}) {
  const img = horse.images?.[0];
  if (img) {
    return (
      <Image
        source={{ uri: fileUrl(horse, img, "600x400") }}
        style={[styles.image, style]}
        resizeMode="cover"
      />
    );
  }
  return (
    <View style={[styles.placeholder, style]}>
      <Text style={{ fontSize: 34 }}>🐎</Text>
    </View>
  );
}

export function AuctionCard({ listing }: { listing: ListingRecord }) {
  const horse = listing.expand?.horse as HorseRecord | undefined;
  const router = useRouter();
  if (!horse) return null;
  const top = listing.current_top_bid || listing.start_price || 0;

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/auction/${listing.id}`)}
    >
      <HorseImage horse={horse} style={styles.cardImage} />
      <View style={styles.badgeWrap}>
        <Badge status={listing.status} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{horse.name}</Text>
        <Text style={styles.cardSub}>
          {horse.breed} · {genderLabels[horse.gender] || horse.gender}
          {horse.age_years ? ` · ${fmtNumber(horse.age_years)} سنوات` : ""}
        </Text>
        <View style={styles.cardRow}>
          <View>
            <Text style={styles.cardLabel}>
              {listing.current_top_bid ? "أعلى مزايدة" : "سعر البداية"}
            </Text>
            <Text style={styles.cardPrice}>{fmtSAR(top)}</Text>
          </View>
          {listing.status === "live" && (
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>مباشر</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export function SaleCard({ listing }: { listing: ListingRecord }) {
  const horse = listing.expand?.horse as HorseRecord | undefined;
  const router = useRouter();
  if (!horse) return null;

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/horse/${horse.id}`)}
    >
      <HorseImage horse={horse} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{horse.name}</Text>
        <Text style={styles.cardSub}>
          {horse.breed} · {genderLabels[horse.gender] || horse.gender}
          {horse.age_years ? ` · ${fmtNumber(horse.age_years)} سنوات` : ""}
        </Text>
        <View style={styles.cardRow}>
          <Text style={[styles.cardPrice, { color: colors.orangeDeep }]}>
            {fmtSAR(listing.price)}
          </Text>
          <Text style={styles.detailsLink}>التفاصيل ←</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    marginBottom: 14,
  },
  cardImage: { height: 170, width: "100%" },
  image: { height: 170, width: "100%" },
  placeholder: {
    height: 170,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(14,95,130,0.08)",
  },
  badgeWrap: { position: "absolute", top: 10, right: 10 },
  cardBody: { padding: 14 },
  cardTitle: {
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.ink,
  },
  cardSub: {
    marginTop: 2,
    fontSize: 12,
    color: colors.inkSoft,
    fontFamily: font.regular,
  },
  cardRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLabel: { fontSize: 10, fontFamily: font.bold, color: colors.inkSoft },
  cardPrice: {
    fontSize: 17,
    fontFamily: font.extrabold,
    color: colors.teal,
    marginTop: 2,
  },
  detailsLink: { fontSize: 12, fontFamily: font.bold, color: colors.teal },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.crimson,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  liveText: { color: "#fff", fontSize: 11, fontFamily: font.bold },
});

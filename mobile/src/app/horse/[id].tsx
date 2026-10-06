import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ClientResponseError } from "pocketbase";
import { fetchHorse, fetchHorseListings } from "../../lib/api";
import { fileUrl, pb } from "../../lib/pb";
import { useAuth } from "../../lib/auth";
import { fmtSAR, fmtNumber, fmtDateTime } from "../../lib/format";
import { genderLabels } from "../../lib/constants";
import { colors, font } from "../../lib/theme";
import { Badge, ErrorText, Loading, SuccessText } from "../../components/ui";
import { Btn } from "../../components/form";
import Countdown from "../../components/Countdown";

const WIDTH = Dimensions.get("window").width;

export default function HorseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const [imgIdx, setImgIdx] = useState(0);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState("");
  const [bought, setBought] = useState(false);

  const horse = useQuery({ queryKey: ["horse", id], queryFn: () => fetchHorse(id!) });
  const listings = useQuery({
    queryKey: ["horse-listings", id],
    queryFn: () => fetchHorseListings(id!),
    placeholderData: [] as any[],
    refetchInterval: 20_000,
  });

  if (horse.isPending) return <Loading />;
  if (horse.isError || !horse.data) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>لم يتم العثور على الحصان</Text>
        <Btn title="العودة" variant="teal" onPress={() => router.back()} />
      </View>
    );
  }

  const h: any = horse.data;
  const images: string[] = h.images || [];

  const buyNow = async (listingId: string) => {
    setBuyError("");
    setBuying(true);
    try {
      await pb.collection("deals").create({ listing: listingId, type: "direct_sale" });
      setBought(true);
    } catch (e: any) {
      setBuyError(
        e instanceof ClientResponseError && e.message ? e.message : "تعذر إرسال الطلب",
      );
    } finally {
      setBuying(false);
    }
  };

  const specs: [string, string][] = [
    ["السلالة", h.breed || "-"],
    ["النوع", genderLabels[h.gender] || h.gender || "-"],
    ["العمر", h.age_years ? `${fmtNumber(h.age_years)} سنوات` : "-"],
    ["اللون", h.color || "-"],
    ["الارتفاع", h.height_cm ? `${fmtNumber(h.height_cm)} سم` : "-"],
    ["النسب", h.lineage || "-"],
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.cream }} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Gallery */}
      <View>
        {images.length > 0 ? (
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setImgIdx(Math.round(e.nativeEvent.contentOffset.x / WIDTH))
            }
            renderItem={({ item }) => (
              <Image
                source={{ uri: fileUrl(h, item, "900x700") }}
                style={{ width: WIDTH, height: 280 }}
                resizeMode="cover"
              />
            )}
            keyExtractor={(img) => img}
          />
        ) : (
          <View style={[styles.noImage, { width: "100%" }]}>
            <Text style={{ fontSize: 60 }}>🐎</Text>
          </View>
        )}
        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, i === imgIdx && styles.dotActive]} />
            ))}
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.body}>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <Badge status={h.status} />
        </View>
        <Text style={styles.name}>{h.name}</Text>
        <View style={styles.specsCard}>
          {specs.map(([k, v]) => (
            <View key={k} style={styles.specRow}>
              <Text style={styles.specKey}>{k}</Text>
              <Text style={styles.specVal}>{v}</Text>
            </View>
          ))}
        </View>
        {h.description ? (
          <>
            <Text style={styles.aboutTitle}>عن الحصان</Text>
            <Text style={styles.aboutText}>{h.description}</Text>
          </>
        ) : null}

        {/* Offers */}
        <Text style={styles.offersTitle}>عروض هذا الحصان</Text>
        <ErrorText>{buyError}</ErrorText>
        {bought && (
          <SuccessText>
            تم إرسال طلب الشراء بنجاح — ستصلك بيانات إتمام الصفقة من الإدارة.
          </SuccessText>
        )}
        {(listings.data || []).length === 0 ? (
          <Text style={styles.noOffers}>لا توجد عروض نشطة لهذا الحصان حالياً.</Text>
        ) : (
          (listings.data as any[]).map((l) => (
            <View key={l.id} style={styles.offerCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Badge status={l.status} />
                {l.type === "auction" && l.status === "live" && l.ends_at ? (
                  <Countdown target={l.ends_at} compact />
                ) : null}
              </View>
              {l.type === "direct_sale" ? (
                <>
                  <Text style={styles.offerPrice}>{fmtSAR(l.price)}</Text>
                  {l.status === "active" &&
                    (user && !isAdmin ? (
                      <Btn
                        title={buying ? "جارٍ الإرسال…" : "اشترِ الآن"}
                        onPress={() => buyNow(l.id)}
                        disabled={buying}
                      />
                    ) : user ? (
                      <Text style={styles.offerHint}>هذا العرض مخصص للمشترين من العملاء.</Text>
                    ) : (
                      <Btn title="سجّل الدخول للشراء" onPress={() => router.push("/login")} />
                    ))}
                </>
              ) : (
                <>
                  <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 10 }}>
                    <Text style={styles.offerLabel}>
                      {l.current_top_bid ? "أعلى مزايدة" : "سعر البداية"}
                    </Text>
                    <Text style={[styles.offerPrice, { color: colors.teal, marginTop: 0 }]}>
                      {fmtSAR(l.current_top_bid || l.start_price)}
                    </Text>
                  </View>
                  {l.starts_at ? (
                    <Text style={styles.offerStarts}>يبدأ: {fmtDateTime(l.starts_at)}</Text>
                  ) : null}
                  <Btn
                    title="ادخل غرفة المزاد"
                    variant="teal"
                    onPress={() => router.push(`/auction/${l.id}`)}
                  />
                </>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream, gap: 12 },
  notFound: { fontSize: 17, fontFamily: font.extrabold, color: colors.ink },
  noImage: {
    height: 280,
    backgroundColor: "rgba(14,95,130,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginTop: -18,
    marginBottom: 8,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.6)" },
  dotActive: { backgroundColor: colors.orange, width: 18 },
  body: { padding: 16 },
  name: {
    fontSize: 24,
    fontFamily: font.extrabold,
    color: colors.ink,
    marginTop: 10,
  },
  specsCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 12,
    overflow: "hidden",
  },
  specRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  specKey: {
    width: 100,
    backgroundColor: "rgba(236,229,216,0.5)",
    padding: 11,
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.inkSoft,
  },
  specVal: { flex: 1, padding: 11, fontSize: 12.5, fontFamily: font.semibold, color: colors.ink },
  aboutTitle: { fontSize: 15, fontFamily: font.extrabold, color: colors.ink, marginTop: 18 },
  aboutText: { fontSize: 13, lineHeight: 24, color: colors.inkSoft, marginTop: 6 },
  offersTitle: {
    fontSize: 17,
    fontFamily: font.extrabold,
    color: colors.ink,
    marginTop: 24,
    marginBottom: 4,
  },
  noOffers: { fontSize: 13, color: colors.inkSoft, marginTop: 8 },
  offerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    marginTop: 10,
    gap: 4,
  },
  offerPrice: {
    fontSize: 22,
    fontFamily: font.extrabold,
    color: colors.orangeDeep,
    marginTop: 8,
    marginBottom: 8,
  },
  offerLabel: { fontSize: 12, fontFamily: font.bold, color: colors.inkSoft },
  offerStarts: { fontSize: 11, color: colors.inkSoft, marginBottom: 10 },
  offerHint: { fontSize: 12, color: colors.inkSoft, marginTop: 8 },
});

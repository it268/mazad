import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ClientResponseError } from "pocketbase";
import { fetchAuction, fetchBids } from "../../lib/api";
import { fileUrl, pb } from "../../lib/pb";
import { useAuth } from "../../lib/auth";
import { fmtSAR, fmtNumber, fmtDateTime, maskName } from "../../lib/format";
import { genderLabels } from "../../lib/constants";
import { colors, font } from "../../lib/theme";
import { Badge, ErrorText, Loading } from "../../components/ui";
import { Btn } from "../../components/form";
import Countdown from "../../components/Countdown";

export default function AuctionRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { user, isAdmin } = useAuth();

  const [amount, setAmount] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [bidOk, setBidOk] = useState(false);

  const listing = useQuery({
    queryKey: ["auction", id],
    queryFn: () => fetchAuction(id!),
    refetchInterval: 20_000,
  });
  const bids = useQuery({
    queryKey: ["bids", id],
    queryFn: () => fetchBids(id!),
    placeholderData: [] as any[],
    refetchInterval: 15_000,
  });

  // realtime: new bids + listing status changes
  useEffect(() => {
    if (!id) return;
    const subs = [
      pb.collection("bids").subscribe("*", (e: any) => {
        if (e.record?.listing === id) {
          qc.invalidateQueries({ queryKey: ["bids", id] });
          qc.invalidateQueries({ queryKey: ["auction", id] });
        }
      }),
      pb.collection("listings").subscribe(id!, () => {
        qc.invalidateQueries({ queryKey: ["auction", id] });
      }),
    ];
    return () => {
      subs.forEach((p: any) => p.then((u: any) => u()).catch(() => {}));
    };
  }, [id, qc]);

  if (listing.isPending) return <Loading />;
  if (listing.isError || !listing.data) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>لم يتم العثور على المزاد</Text>
        <Btn title="العودة" variant="teal" onPress={() => router.back()} />
      </View>
    );
  }

  const l: any = listing.data;
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.cream }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Horse */}
        {horse?.images?.[0] ? (
          <Image
            source={{ uri: fileUrl(horse, horse.images[0], "900x700") }}
            style={{ width: "100%", height: 230 }}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImage}>
            <Text style={{ fontSize: 54 }}>🐎</Text>
          </View>
        )}

        <View style={styles.body}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Badge status={l.status} />
            <Text
              style={styles.horseLink}
              onPress={() => horse && router.push(`/horse/${horse.id}`)}
            >
              بطاقة الحصان ←
            </Text>
          </View>
          <Text style={styles.horseName}>{horse?.name || "-"}</Text>
          <Text style={styles.horseSub}>
            {horse?.breed}
            {horse?.gender ? ` · ${genderLabels[horse.gender] || ""}` : ""}
            {horse?.age_years ? ` · ${fmtNumber(horse.age_years)} سنوات` : ""}
            {horse?.color ? ` · ${horse.color}` : ""}
          </Text>

          {/* Live panel */}
          <View
            style={[
              styles.panel,
              isEnded && { backgroundColor: colors.ink },
            ]}
          >
            <Text style={styles.panelLabel}>
              {l.current_top_bid
                ? isEnded
                  ? "أعلى مزايدة عند الانتهاء"
                  : "أعلى مزايدة حالياً"
                : "بانتظار أول مزايدة"}
            </Text>
            <Text style={styles.panelTop}>{fmtSAR(top)}</Text>
            {topBidder ? (
              <Text style={styles.panelBidder}>
                بواسطة:{" "}
                {isAdmin || iAmWinner
                  ? topBidder.name || topBidder.phone
                  : maskName(topBidder.name)}
              </Text>
            ) : null}

            {isLive && l.ends_at ? (
              <View style={styles.panelTimer}>
                <Text style={styles.panelTimerLabel}>ينتهي المزاد بعد</Text>
                <Countdown
                  target={l.ends_at}
                  light
                  onEnd={() => qc.invalidateQueries({ queryKey: ["auction", id] })}
                />
              </View>
            ) : null}
            {l.status === "scheduled" && l.starts_at ? (
              <View style={styles.panelTimer}>
                <Text style={styles.panelTimerLabel}>يبدأ المزاد بعد</Text>
                <Countdown target={l.starts_at} light />
              </View>
            ) : null}
            {isEnded ? (
              <Text style={styles.panelEnded}>
                {iAmWinner
                  ? "مبروك! فزت بأعلى مزايدة — سيتواصل معك قسم الصفقات لإتمام البيع."
                  : topBidder
                    ? `انتهى المزاد — الفائز: ${isAdmin || iAmWinner ? topBidder.name || topBidder.phone : maskName(topBidder.name)}`
                    : top > 0
                      ? "انتهى المزاد — سيتواصل قسم الصفقات مع الفائز."
                      : "انتهى المزاد دون مزايدات."}
              </Text>
            ) : null}
          </View>

          {/* Bid form */}
          {canBid ? (
            <View style={styles.bidCard}>
              <Text style={styles.bidLabel}>
                مبلغ المزايدة (الحد الأدنى {fmtSAR(minNext)})
              </Text>
              <View style={styles.bidRow}>
                <TextInput
                  style={styles.bidInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="number-pad"
                  placeholder={String(minNext)}
                  placeholderTextColor="rgba(76,70,61,0.45)"
                />
                <Btn
                  title={placing ? "…" : "زايد الآن"}
                  onPress={placeBid}
                  disabled={placing}
                  style={{ paddingHorizontal: 18 }}
                />
              </View>
              <ErrorText>{error}</ErrorText>
              {!error && bidOk ? (
                <Text style={styles.bidOk}>تم تسجيل مزايدتك — بالتوفيق!</Text>
              ) : null}
            </View>
          ) : isLive && !user ? (
            <View style={styles.bidCard}>
              <Text style={styles.bidLabel}>سجّل الدخول للمزايدة في هذا المزاد</Text>
              <Btn title="دخول" onPress={() => router.push("/login")} />
            </View>
          ) : null}

          {/* Bids feed */}
          <View style={styles.feedCard}>
            <View style={styles.feedHead}>
              <Text style={styles.feedTitle}>
                سجل المزايدات ({fmtNumber(bids.data?.length || 0)})
              </Text>
            </View>
            {(bids.data || []).length === 0 ? (
              <Text style={styles.feedEmpty}>
                لا توجد مزايدات بعد — كن أول المزايدين.
              </Text>
            ) : (
              (bids.data as any[]).map((b, i) => (
                <View key={b.id} style={styles.feedRow}>
                  <View style={[styles.rank, i === 0 && styles.rankTop]}>
                    <Text style={[styles.rankText, i === 0 && { color: "#fff" }]}>
                      {fmtNumber(bids.data!.length - i)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bidderName}>
                      {isAdmin || (user && b.expand?.bidder?.id === user.id)
                        ? b.expand?.bidder?.name || b.expand?.bidder?.phone
                        : maskName(b.expand?.bidder?.name)}
                    </Text>
                    <Text style={styles.bidTime}>{fmtDateTime(b.created)}</Text>
                  </View>
                  <Text
                    style={[
                      styles.bidAmount,
                      i === 0 && { color: colors.orangeDeep },
                    ]}
                  >
                    {fmtSAR(b.amount)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.cream, gap: 12 },
  notFound: { fontSize: 17, fontFamily: font.extrabold, color: colors.ink },
  noImage: {
    height: 230,
    backgroundColor: "rgba(14,95,130,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: 16 },
  horseLink: { fontSize: 12, fontFamily: font.bold, color: colors.teal },
  horseName: { fontSize: 22, fontFamily: font.extrabold, color: colors.ink, marginTop: 8 },
  horseSub: { fontSize: 12.5, color: colors.inkSoft, marginTop: 2 },
  panel: {
    backgroundColor: colors.navy,
    borderRadius: 18,
    padding: 18,
    marginTop: 14,
  },
  panelLabel: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: font.bold },
  panelTop: {
    color: colors.orangeSoft,
    fontSize: 30,
    fontFamily: font.extrabold,
    marginTop: 4,
  },
  panelBidder: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },
  panelTimer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },
  panelTimerLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontFamily: font.bold,
    marginBottom: 8,
  },
  panelEnded: {
    color: "#fff",
    fontSize: 12.5,
    fontFamily: font.semibold,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    lineHeight: 20,
  },
  bidCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginTop: 14,
  },
  bidLabel: { fontSize: 12, fontFamily: font.bold, color: colors.inkSoft, marginBottom: 8 },
  bidRow: { flexDirection: "row", gap: 8 },
  bidInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    backgroundColor: colors.cream,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 15,
    fontFamily: font.semibold,
    textAlign: "left",
    color: colors.ink,
  },
  bidOk: { fontSize: 12.5, fontFamily: font.bold, color: colors.teal, marginTop: 6 },
  feedCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 14,
    overflow: "hidden",
  },
  feedHead: {
    backgroundColor: "rgba(236,229,216,0.5)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  feedTitle: { fontSize: 13.5, fontFamily: font.extrabold, color: colors.ink },
  feedEmpty: { padding: 24, textAlign: "center", fontSize: 12.5, color: colors.inkSoft },
  feedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(14,95,130,0.08)",
  },
  rank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.sand,
    alignItems: "center",
    justifyContent: "center",
  },
  rankTop: { backgroundColor: colors.orange },
  rankText: { fontSize: 12, fontFamily: font.extrabold, color: colors.inkSoft },
  bidderName: { fontSize: 13, fontFamily: font.bold, color: colors.ink },
  bidTime: { fontSize: 10.5, color: colors.inkSoft, marginTop: 1 },
  bidAmount: { fontSize: 14, fontFamily: font.extrabold, color: colors.ink },
});

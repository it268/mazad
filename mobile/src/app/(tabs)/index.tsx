import { useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchAuctions, fetchSaleListings, fetchStats } from "../../lib/api";
import { AuctionCard, SaleCard } from "../../components/cards";
import { EmptyState } from "../../components/ui";
import { colors, font } from "../../lib/theme";
import { fmtNumber } from "../../lib/format";

export default function Home() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const auctions = useQuery({
    queryKey: ["auctions", "home"],
    queryFn: () => fetchAuctions({ status: ["live", "scheduled"], perPage: 4 }),
    refetchInterval: 20_000,
  });
  const sales = useQuery({
    queryKey: ["sales", "home"],
    queryFn: () => fetchSaleListings({ perPage: 4 }),
    refetchInterval: 60_000,
  });
  const stats = useQuery({ queryKey: ["stats"], queryFn: fetchStats });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      auctions.refetch(),
      sales.refetch(),
      stats.refetch(),
    ]);
    setRefreshing(false);
  };

  const statBoxes = [
    { n: stats.data?.soldHorses ?? 0, l: "حصان تم بيعه" },
    { n: stats.data?.auctions ?? 0, l: "مزاد" },
    { n: stats.data?.clients ?? 0, l: "عضو موثوق" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.navy }} edges={["top"]}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.cream }}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroBrand}>مزاد الفروسية</Text>
          <Text style={styles.heroTitle}>
            المزاد الذي يجمع البائع والمشتري في عالم{" "}
            <Text style={{ color: colors.orangeSoft }}>خيل العرب الأصيلة</Text>
          </Text>
          <Text style={styles.heroSub}>
            الجودة قبل الكمية، والثقة قبل أي صفقة.
          </Text>
          <View style={styles.statsRow}>
            {statBoxes.map((s) => (
              <View key={s.l} style={styles.statBox}>
                <Text style={styles.statNum}>{fmtNumber(s.n)}</Text>
                <Text style={styles.statLabel}>{s.l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Live auctions */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>مزادات مباشرة ومقبلة</Text>
          <Text
            style={styles.sectionLink}
            onPress={() => router.push("/(tabs)/auctions")}
          >
            الكل ←
          </Text>
        </View>
        {auctions.data && auctions.data.items.length > 0 ? (
          auctions.data.items.map((l: any) => (
            <AuctionCard key={l.id} listing={l} />
          ))
        ) : (
          <EmptyState
            title="لا توجد مزادات حالياً"
            sub="تُعلن الإدارة عن مزادات جديدة بشكل دوري — تابعنا."
          />
        )}

        {/* Horses for sale */}
        <View style={[styles.sectionHead, { marginTop: 10 }]}>
          <Text style={styles.sectionTitle}>خيل معروضة للبيع</Text>
          <Text
            style={styles.sectionLink}
            onPress={() => router.push("/(tabs)/horses")}
          >
            الكل ←
          </Text>
        </View>
        {sales.data && sales.data.items.length > 0 ? (
          sales.data.items.map((l: any) => (
            <SaleCard key={l.id} listing={l} />
          ))
        ) : (
          <EmptyState
            title="لا توجد خيل معروضة حالياً"
            sub="تُعرض الخيل بعد معاينتها واعتمادها من الإدارة."
          />
        )}

        {/* Sell CTA */}
        <Pressable style={styles.cta} onPress={() => router.push("/sell")}>
          <Text style={styles.ctaTitle}>عندك حصان أصيل للبيع؟</Text>
          <Text style={styles.ctaSub}>
            ارفع طلب بيع للإدارة مع صور ومواصفات حصانك.
          </Text>
          <Text style={styles.ctaBtn}>ابدأ طلب البيع</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.navyDeep,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 22,
  },
  heroBrand: { color: colors.orangeSoft, fontSize: 13, fontFamily: font.bold },
  heroTitle: {
    color: "#fff",
    fontSize: 24,
    fontFamily: font.extrabold,
    lineHeight: 40,
    marginTop: 8,
  },
  heroSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontFamily: font.regular,
    marginTop: 8,
  },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    paddingVertical: 14,
  },
  statNum: { color: colors.orangeSoft, fontSize: 20, fontFamily: font.extrabold },
  statLabel: { color: "rgba(255,255,255,0.75)", fontSize: 10, marginTop: 4 },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontFamily: font.extrabold, color: colors.ink },
  sectionLink: { fontSize: 12, fontFamily: font.bold, color: colors.teal },
  cta: {
    backgroundColor: colors.orange,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 22,
    alignItems: "center",
  },
  ctaTitle: { color: "#fff", fontSize: 18, fontFamily: font.extrabold },
  ctaSub: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  ctaBtn: {
    color: "#fff",
    fontFamily: font.extrabold,
    fontSize: 14,
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
    overflow: "hidden",
  },
});

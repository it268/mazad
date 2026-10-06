import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchAuctions } from "../../lib/api";
import { AuctionCard } from "../../components/cards";
import { EmptyState, Loading } from "../../components/ui";
import { colors, font } from "../../lib/theme";

const tabs = [
  { key: "live", label: "مباشر الآن" },
  { key: "scheduled", label: "قادمة" },
  { key: "ended", label: "منتهية" },
];

export default function Auctions() {
  const [tab, setTab] = useState("live");

  const q = useQuery({
    queryKey: ["auctions", tab],
    queryFn: () =>
      tab === "live"
        ? fetchAuctions({ status: ["live", "scheduled"], perPage: 30 })
        : fetchAuctions({ status: [tab], perPage: 30 }),
    placeholderData: (prev: any) => prev,
    refetchInterval: 15_000,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.navy }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>المزادات</Text>
        <Text style={styles.title}>مزادات خيل العرب</Text>
        <Text style={styles.sub}>
          زايد مباشرة في الوقت الحقيقي — أعلى مزايدة عند الانتهاء تفوز بالحصان.
        </Text>
      </View>

      <View style={{ flex: 1, backgroundColor: colors.cream }}>
        <View style={styles.tabRow}>
          {tabs.map((t) => (
            <Text
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.tab, tab === t.key && styles.tabActive]}
            >
              {t.label}
            </Text>
          ))}
        </View>

        {q.isPending ? (
          <Loading />
        ) : q.data && q.data.items.length > 0 ? (
          <FlatList
            data={q.data.items}
            keyExtractor={(l: any) => l.id}
            renderItem={({ item }) => <AuctionCard listing={item} />}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            onRefresh={q.refetch}
            refreshing={q.isRefetching}
          />
        ) : (
          <EmptyState
            title={
              tab === "live"
                ? "لا توجد مزادات مباشرة الآن"
                : tab === "scheduled"
                  ? "لا توجد مزادات قادمة حالياً"
                  : "لا توجد مزادات منتهية بعد"
            }
            sub="تُعلن الإدارة عن مزادات جديدة بشكل دوري — تابعنا."
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  eyebrow: { color: colors.orangeSoft, fontSize: 12, fontFamily: font.bold },
  title: { color: "#fff", fontSize: 21, fontFamily: font.extrabold, marginTop: 4 },
  sub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 20,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.cream,
  },
  tab: {
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.teal,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  tabActive: { backgroundColor: colors.teal, borderColor: colors.teal, color: "#fff" },
});

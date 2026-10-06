import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { pb } from "../../lib/pb";
import { useAuth } from "../../lib/auth";
import { colors, font } from "../../lib/theme";
import { fmtSAR, fmtDateTime } from "../../lib/format";
import {
  saleRequestStatusLabels,
  dealTypeLabels,
  horseStatusLabels,
  listingStatusLabels,
} from "../../lib/constants";
import { Badge, EmptyState, Loading } from "../../components/ui";
import { Btn } from "../../components/form";

export default function Account() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const uid = user?.id || "";

  const requests = useQuery({
    queryKey: ["my-requests", uid],
    queryFn: () =>
      pb.collection("sale_requests").getFullList({
        filter: `seller="${uid}"`,
        sort: "-created",
        expand: "horse",
      }),
    enabled: !!uid && !isAdmin,
  });
  const bids = useQuery({
    queryKey: ["my-bids", uid],
    queryFn: async () => {
      const items = await pb.collection("bids").getFullList({
        filter: `bidder="${uid}"`,
        sort: "-created",
        expand: "listing",
      });
      const ids = [...new Set(items.map((b: any) => b.listing))];
      const listings = ids.length
        ? await pb
            .collection("listings")
            .getFullList({ filter: ids.map((i) => `id="${i}"`).join(" || "), expand: "horse" })
        : [];
      const byId = Object.fromEntries(listings.map((l: any) => [l.id, l]));
      return items.map((b: any) => ({ ...b, listing: byId[b.listing] }));
    },
    enabled: !!uid && !isAdmin,
  });
  const deals = useQuery({
    queryKey: ["my-deals", uid],
    queryFn: () =>
      pb.collection("deals").getFullList({
        filter: `buyer="${uid}" || seller="${uid}"`,
        sort: "-created",
        expand: "horse",
      }),
    enabled: !!uid && !isAdmin,
  });

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }} edges={["top"]}>
        <View style={styles.guestWrap}>
          <Text style={styles.guestEmoji}>🐎</Text>
          <Text style={styles.guestTitle}>سجّل الدخول للمزايدة والبيع</Text>
          <Text style={styles.guestSub}>
            إنشاء الحساب يستغرق أقل من دقيقة برقم جوالك.
          </Text>
          <Btn title="دخول" onPress={() => router.push("/login")} style={styles.guestBtn} />
          <Btn
            title="حساب جديد"
            variant="teal"
            onPress={() => router.push("/register")}
            style={styles.guestBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (isAdmin) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }} edges={["top"]}>
        <View style={styles.guestWrap}>
          <Text style={styles.guestEmoji}>🛠️</Text>
          <Text style={styles.guestTitle}>أنت مسجّل كإدارة</Text>
          <Text style={styles.guestSub}>
            لوحة الإدارة الكاملة متاحة على الموقع: mazad.alfrusiyaar.com/admin
          </Text>
          <Btn
            title="تسجيل الخروج"
            variant="danger"
            onPress={() => pb.authStore.clear()}
            style={styles.guestBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const Row = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.row}>{children}</View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>حسابي</Text>
          <Text style={styles.title}>أهلاً، {String(user.name || "")}</Text>
          <Text
            style={styles.logout}
            onPress={() => pb.authStore.clear()}
          >
            تسجيل الخروج
          </Text>
        </View>

        {/* Sale requests */}
        <Section title="طلبات بيع خيلي">
          {requests.isPending ? (
            <Loading />
          ) : (requests.data || []).length === 0 ? (
            <EmptyState
              emoji="🐴"
              title="لا توجد طلبات بيع بعد"
              sub="اعرض حصانك للبيع للإدارة وابدأ أول صفقة."
            />
          ) : (
            (requests.data as any[]).map((r) => (
              <Row key={r.id}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>
                    {r.expand?.horse?.name || "حصان"}
                  </Text>
                  <Text style={styles.rowSub}>
                    {fmtSAR(r.asking_price)} · {fmtDateTime(r.created)}
                  </Text>
                  {r.admin_note ? (
                    <Text style={styles.rowNote}>ملاحظة الإدارة: {r.admin_note}</Text>
                  ) : null}
                </View>
                <Badge status={r.status} />
              </Row>
            ))
          )}
        </Section>

        {/* Bids */}
        <Section title="مزايداتي">
          {bids.isPending ? (
            <Loading />
          ) : (bids.data || []).length === 0 ? (
            <EmptyState
              emoji="⏱️"
              title="لم تشارك في مزادات بعد"
              sub="ادخل أول مزاد وشاهد المزايدة المباشرة."
            />
          ) : (
            (bids.data as any[]).map((b) => (
              <Row key={b.id}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>
                    {b.listing?.expand?.horse?.name || "مزاد"}
                  </Text>
                  <Text style={styles.rowSub}>
                    {listingStatusLabels[b.listing?.status] || ""} ·{" "}
                    {fmtDateTime(b.created)}
                  </Text>
                </View>
                <Text style={styles.amount}>{fmtSAR(b.amount)}</Text>
              </Row>
            ))
          )}
        </Section>

        {/* Deals */}
        <Section title="صفقاتي">
          {deals.isPending ? (
            <Loading />
          ) : (deals.data || []).length === 0 ? (
            <EmptyState emoji="🤝" title="لا توجد صفقات بعد" />
          ) : (
            (deals.data as any[]).map((d) => (
              <Row key={d.id}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>
                    {d.expand?.horse?.name || "حصان"}
                  </Text>
                  <Text style={styles.rowSub}>
                    {dealTypeLabels[d.type] || d.type} · {fmtSAR(d.amount)}
                  </Text>
                </View>
                <Badge status={d.status} />
              </Row>
            ))
          )}
        </Section>

        <Text style={styles.hint}>
          حالات الطلب: {Object.values(saleRequestStatusLabels).join(" · ")}
        </Text>
        <Text style={styles.hint}>
          حالات الخيل: {Object.values(horseStatusLabels).slice(0, 4).join(" · ")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  guestWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  guestEmoji: { fontSize: 46 },
  guestTitle: {
    fontSize: 19,
    fontFamily: font.extrabold,
    color: colors.ink,
    marginTop: 12,
    textAlign: "center",
  },
  guestSub: {
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  guestBtn: { alignSelf: "stretch", marginTop: 12 },
  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
  },
  eyebrow: { color: colors.orangeSoft, fontSize: 12, fontFamily: font.bold },
  title: { color: "#fff", fontSize: 20, fontFamily: font.extrabold, marginTop: 4 },
  logout: {
    color: colors.orangeSoft,
    fontSize: 12,
    fontFamily: font.bold,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.ink,
    marginBottom: 10,
  },
  row: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowTitle: { fontSize: 14, fontFamily: font.extrabold, color: colors.ink },
  rowSub: { fontSize: 11.5, color: colors.inkSoft, marginTop: 2 },
  rowNote: { fontSize: 11.5, color: colors.crimson, marginTop: 4, fontWeight: "600" },
  amount: { fontSize: 14, fontFamily: font.extrabold, color: colors.teal },
  hint: {
    fontSize: 10.5,
    color: colors.inkSoft,
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 24,
  },
});

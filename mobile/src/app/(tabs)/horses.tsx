import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchSaleListings } from "../../lib/api";
import { SaleCard } from "../../components/cards";
import { EmptyState, Loading } from "../../components/ui";
import { colors, font } from "../../lib/theme";
import { breedOptions, genderLabels } from "../../lib/constants";

export default function Horses() {
  const [gender, setGender] = useState("");
  const [breed, setBreed] = useState("");

  const q = useQuery({
    queryKey: ["sales", { gender, breed }],
    queryFn: () =>
      fetchSaleListings({
        gender: gender || undefined,
        breed: breed || undefined,
        perPage: 30,
      }),
    placeholderData: (prev: any) => prev,
  });

  const Chip = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <Text
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      {label}
    </Text>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.navy }} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>معروضات الإدارة</Text>
        <Text style={styles.title}>خيل معروضة للبيع</Text>
        <Text style={styles.sub}>خيل منتقاة ومعتمدة من الإدارة للبيع المباشر.</Text>
      </View>

      <View style={{ flex: 1, backgroundColor: colors.cream }}>
        <View style={styles.filters}>
          <View style={styles.filterGroup}>
            {Object.entries(genderLabels).map(([k, v]) => (
              <Chip
                key={k}
                label={v}
                active={gender === k}
                onPress={() => setGender(gender === k ? "" : k)}
              />
            ))}
          </View>
          <View style={styles.filterGroup}>
            {breedOptions.map((b) => (
              <Chip
                key={b}
                label={b}
                active={breed === b}
                onPress={() => setBreed(breed === b ? "" : b)}
              />
            ))}
          </View>
        </View>

        {q.isPending ? (
          <Loading />
        ) : q.data && q.data.items.length > 0 ? (
          <FlatList
            data={q.data.items}
            keyExtractor={(l: any) => l.id}
            renderItem={({ item }) => <SaleCard listing={item} />}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            onRefresh={q.refetch}
            refreshing={q.isRefetching}
          />
        ) : (
          <EmptyState
            title="لا توجد نتائج مطابقة"
            sub="جرّب تعديل الفلاتر أو عد لاحقاً — تُضاف معروضات جديدة باستمرار."
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
  filters: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  filterGroup: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    fontSize: 12,
    fontFamily: font.medium,
    color: colors.inkSoft,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.cream,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 6,
    overflow: "hidden",
  },
  chipActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
    color: "#fff",
    fontFamily: font.bold,
  },
});

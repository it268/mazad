import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ClientResponseError } from "pocketbase";
import { pb } from "../lib/pb";
import { useAuth } from "../lib/auth";
import { colors, font } from "../lib/theme";
import { breedOptions, colorOptions, genderLabels } from "../lib/constants";
import { Btn, Field, Select } from "../components/form";
import { ErrorText, SuccessText } from "../components/ui";

const empty = {
  name: "",
  breed: breedOptions[0],
  gender: "male",
  age_years: "",
  color: colorOptions[0],
  height_cm: "",
  lineage: "",
  description: "",
  asking_price: "",
  note: "",
};

export default function Sell() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [assets, setAssets] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!user) {
    return (
      <View style={styles.gate}>
        <Text style={styles.gateTitle}>سجّل الدخول لعرض حصانك للبيع</Text>
        <Text style={styles.gateSub}>إنشاء الحساب يستغرق أقل من دقيقة.</Text>
        <Btn title="دخول" onPress={() => router.push("/login")} style={{ alignSelf: "stretch" }} />
        <Btn
          title="حساب جديد"
          variant="teal"
          onPress={() => router.push("/register")}
          style={{ alignSelf: "stretch", marginTop: 10 }}
        />
      </View>
    );
  }

  if (isAdmin) {
    return (
      <View style={styles.gate}>
        <Text style={styles.gateTitle}>أنت مسجّل كإدارة</Text>
        <Text style={styles.gateSub}>
          أضف الخيل واعرضها من لوحة الإدارة على الموقع.
        </Text>
      </View>
    );
  }

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const pickImages = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 6,
      quality: 0.8,
    });
    if (!res.canceled) {
      setAssets((prev) => [...prev, ...res.assets].slice(0, 6));
    }
  };

  const submit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("breed", form.breed);
      fd.append("gender", form.gender);
      if (form.age_years) fd.append("age_years", form.age_years);
      if (form.color) fd.append("color", form.color);
      if (form.height_cm) fd.append("height_cm", form.height_cm);
      if (form.lineage) fd.append("lineage", form.lineage);
      if (form.description) fd.append("description", form.description);
      for (const a of assets) {
        // RN upload shape; web uses Blob directly
        const file: any = {
          uri: a.uri,
          name: `horse_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.jpg`,
          type: a.mimeType || "image/jpeg",
        };
        if (typeof a.file !== "undefined" && a.file) file.file = a.file;
        fd.append("images", file);
      }

      const horse = await pb.collection("horses").create(fd);
      await pb.collection("sale_requests").create({
        horse: (horse as any).id,
        asking_price: Number(form.asking_price),
        note: form.note,
      });
      setDone(true);
    } catch (err: any) {
      setError(
        err instanceof ClientResponseError && err.message
          ? err.message
          : "تعذر إرسال الطلب، تحقق من الحقول وحاول مجدداً",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <View style={styles.gate}>
        <Text style={{ fontSize: 44 }}>🐴</Text>
        <Text style={styles.gateTitle}>تم إرسال طلب بيع حصانك</Text>
        <Text style={styles.gateSub}>
          ستراجع الإدارة طلبك وتعاين الحصان، وستجد حالة الطلب في صفحة حسابي.
        </Text>
        <Btn
          title="العودة للرئيسية"
          variant="teal"
          onPress={() => router.replace("/(tabs)" as any)}
          style={{ alignSelf: "stretch", marginTop: 14 }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.cream }}
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.sectionTitle}>بيانات الحصان</Text>
      <View style={styles.card}>
        <Field label="اسم الحصان" value={form.name} onChangeText={(t) => set("name", t)} placeholder="مثال: سهم الفرسان" required />
        <Select
          label="السلالة"
          value={form.breed}
          items={breedOptions.map((b) => ({ key: b, label: b }))}
          onChange={(k) => set("breed", k)}
        />
        <Select
          label="النوع"
          value={form.gender}
          items={Object.entries(genderLabels).map(([k, v]) => ({ key: k, label: v }))}
          onChange={(k) => set("gender", k)}
        />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field label="العمر (سنوات)" value={form.age_years} onChangeText={(t) => set("age_years", t)} keyboardType="number-pad" required />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="الارتفاع (سم)" value={form.height_cm} onChangeText={(t) => set("height_cm", t)} keyboardType="number-pad" />
          </View>
        </View>
        <Select
          label="اللون"
          value={form.color}
          items={colorOptions.map((c) => ({ key: c, label: c }))}
          onChange={(k) => set("color", k)}
        />
        <Field label="النسب / السجل" value={form.lineage} onChangeText={(t) => set("lineage", t)} placeholder="مثال: ابن الوسيم — من نسل الحمّاني" />
        <Field label="وصف الحصان" value={form.description} onChangeText={(t) => set("description", t)} placeholder="الصفات، التدريب، السجل، الحالة الصحية…" />
        <View style={{ marginTop: 4 }}>
          <Text style={styles.imgLabel}>صور الحصان (حتى 6 صور)</Text>
          <Pressable style={styles.pickBtn} onPress={pickImages}>
            <Text style={styles.pickText}>+ اختر صوراً</Text>
          </Pressable>
          {assets.length > 0 ? (
            <View style={styles.thumbRow}>
              {assets.map((a, i) => (
                <Pressable
                  key={a.uri}
                  style={styles.thumb}
                  onPress={() => setAssets((p) => p.filter((_, j) => j !== i))}
                >
                  <Image source={{ uri: a.uri }} style={styles.thumbImg} resizeMode="cover" />
                  <Text style={styles.thumbX}>×</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      </View>

      <Text style={styles.sectionTitle}>طلب البيع</Text>
      <View style={styles.card}>
        <Field label="السعر المطلوب (ر.س)" value={form.asking_price} onChangeText={(t) => set("asking_price", t)} keyboardType="number-pad" dirLTR required />
        <Field label="ملاحظات للإدارة" value={form.note} onChangeText={(t) => set("note", t)} placeholder="وقت مناسب للمعاينة، أسباب البيع…" />
        <ErrorText>{error}</ErrorText>
        <Btn
          title={submitting ? "جارٍ الإرسال…" : "إرسال طلب البيع"}
          onPress={submit}
          disabled={submitting}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  gate: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cream,
    padding: 32,
  },
  gateTitle: {
    fontSize: 19,
    fontFamily: font.extrabold,
    color: colors.ink,
    marginTop: 12,
    textAlign: "center",
  },
  gateSub: {
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  wrap: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 17,
    fontFamily: font.extrabold,
    color: colors.ink,
    marginTop: 14,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
  },
  imgLabel: {
    fontSize: 12,
    fontFamily: font.bold,
    color: colors.inkSoft,
    marginBottom: 6,
  },
  pickBtn: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.teal,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  pickText: { color: colors.teal, fontFamily: font.bold, fontSize: 13 },
  thumbRow: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  thumb: { width: 64, height: 64, borderRadius: 10, overflow: "hidden" },
  thumbImg: { width: "100%", height: "100%" },
  thumbX: {
    position: "absolute",
    top: 0,
    end: 0,
    backgroundColor: "rgba(125,19,0,0.8)",
    color: "#fff",
    fontSize: 12,
    paddingHorizontal: 5,
    borderBottomLeftRadius: 8,
  },
});

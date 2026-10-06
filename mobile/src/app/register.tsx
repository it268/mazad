import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ClientResponseError } from "pocketbase";
import { pb } from "../lib/pb";
import { colors, font } from "../lib/theme";
import { Btn, Field } from "../components/form";
import { ErrorText } from "../components/ui";
import { arError } from "./login";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    passwordConfirm: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError("");
    if (form.password !== form.passwordConfirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    setBusy(true);
    try {
      await pb.collection("users").create({
        name: form.name.trim(),
        phone: form.phone.trim(),
        password: form.password,
        passwordConfirm: form.passwordConfirm,
      });
      await pb
        .collection("users")
        .authWithPassword(form.phone.trim(), form.password);
      router.replace("/(tabs)" as any);
    } catch (err) {
      if (err instanceof ClientResponseError) {
        const data: any = err.response?.data || {};
        if (data.phone?.code === "validation_not_unique") {
          setError("رقم الجوال مسجّل مسبقاً — جرّب تسجيل الدخول");
        } else {
          setError(arError(err, "تعذر إنشاء الحساب، تحقق من البيانات"));
        }
      } else {
        setError("تعذر إنشاء الحساب، حاول مجدداً");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.cream }}
      contentContainerStyle={styles.wrap}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>حساب جديد</Text>
      <Text style={styles.sub}>
        انضم إلى منصة مزادات خيل العرب — بيع وشراء ومزايدة بثقة.
      </Text>
      <View style={styles.form}>
        <Field
          label="الاسم الكامل"
          value={form.name}
          onChangeText={(t) => set("name", t)}
          placeholder="مثال: عبدالله المطيري"
          required
        />
        <Field
          label="رقم الجوال"
          value={form.phone}
          onChangeText={(t) => set("phone", t)}
          placeholder="05xxxxxxxx"
          keyboardType="phone-pad"
          dirLTR
          required
        />
        <Field
          label="كلمة المرور"
          value={form.password}
          onChangeText={(t) => set("password", t)}
          secureTextEntry
          placeholder="8 أحرف على الأقل"
          required
        />
        <Field
          label="تأكيد كلمة المرور"
          value={form.passwordConfirm}
          onChangeText={(t) => set("passwordConfirm", t)}
          secureTextEntry
          required
        />
        <ErrorText>{error}</ErrorText>
        <Btn
          title={busy ? "جارٍ الإنشاء…" : "إنشاء الحساب"}
          onPress={submit}
          disabled={busy}
        />
      </View>
      <Text style={styles.switchText}>
        عندك حساب؟{" "}
        <Text style={styles.switchLink} onPress={() => router.push("/login")}>
          سجّل الدخول
        </Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingTop: 40 },
  title: { fontSize: 22, fontFamily: font.extrabold, color: colors.ink },
  sub: { fontSize: 13, color: colors.inkSoft, marginTop: 6, lineHeight: 22 },
  form: { marginTop: 22 },
  switchText: {
    textAlign: "center",
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 18,
  },
  switchLink: { color: colors.teal, fontFamily: font.bold },
});

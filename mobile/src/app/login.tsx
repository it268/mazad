import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ClientResponseError } from "pocketbase";
import { pb } from "../lib/pb";
import { colors, font } from "../lib/theme";
import { Btn, Field } from "../components/form";
import { ErrorText } from "../components/ui";

export function arError(e: unknown, fallback: string): string {
  if (e instanceof ClientResponseError) {
    if (e.message === "Failed to authenticate.")
      return "رقم الجوال أو كلمة المرور غير صحيحة.";
    const data: any = e.response?.data;
    if (data && typeof data === "object") {
      const first = Object.values(data)[0] as any;
      if (first?.message) return first.message;
    }
    return e.message || fallback;
  }
  return fallback;
}

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await pb.collection("users").authWithPassword(phone.trim(), password);
      const role = pb.authStore.record?.role;
      router.replace("/(tabs)" as any);
      if (role === "admin") {
        // admins manage from the web panel; keep them signed in
      }
    } catch (err) {
      setError(arError(err, "تعذر تسجيل الدخول، حاول مجدداً"));
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
      <Text style={styles.title}>تسجيل الدخول</Text>
      <Text style={styles.sub}>ادخل برقم جوالك وكلمة المرور للمزايدة والبيع.</Text>
      <View style={styles.form}>
        <Field
          label="رقم الجوال"
          value={phone}
          onChangeText={setPhone}
          placeholder="05xxxxxxxx"
          keyboardType="phone-pad"
          dirLTR
          required
        />
        <Field
          label="كلمة المرور"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          required
        />
        <ErrorText>{error}</ErrorText>
        <Btn title={busy ? "جارٍ الدخول…" : "دخول"} onPress={submit} disabled={busy} />
      </View>
      <Text style={styles.switchText}>
        ما عندك حساب؟{" "}
        <Text style={styles.switchLink} onPress={() => router.push("/register")}>
          أنشئ حساباً جديداً
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

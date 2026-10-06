import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, font } from "../lib/theme";

export function Btn({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "teal" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}) {
  const bg =
    variant === "primary"
      ? styles.primary
      : variant === "teal"
        ? styles.teal
        : variant === "danger"
          ? styles.danger
          : styles.ghost;
  const fg =
    variant === "ghost" || variant === "danger" ? styles.ghostText : styles.solidText;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        bg,
        (disabled || loading) && { opacity: 0.55 },
        pressed && !disabled && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={[styles.btnText, fg]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  dirLTR,
  required,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "phone-pad" | "number-pad";
  secureTextEntry?: boolean;
  dirLTR?: boolean;
  required?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>
        {label}
        {required ? " *" : ""}
      </Text>
      <TextInput
        style={[styles.input, dirLTR && { textAlign: "left" }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(76,70,61,0.45)"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

export function Select({
  label,
  value,
  items,
  onChange,
}: {
  label: string;
  value: string;
  items: { key: string; label: string }[];
  onChange: (k: string) => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipsRow}>
        {items.map((it) => {
          const active = it.key === value;
          return (
            <Pressable
              key={it.key}
              onPress={() => onChange(it.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  active && { color: "#fff", fontFamily: font.bold },
                ]}
              >
                {it.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function PageHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <View style={styles.pageHeader}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.pageTitle}>{title}</Text>
      {sub ? <Text style={styles.pageSub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: colors.orange },
  teal: { backgroundColor: colors.teal },
  ghost: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.line },
  danger: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: "rgba(125,19,0,0.35)" },
  solidText: { color: "#fff" },
  ghostText: { color: colors.teal },
  btnText: { fontSize: 14, fontFamily: font.bold },
  fieldWrap: { marginBottom: 14 },
  label: {
    fontSize: 12,
    fontFamily: font.bold,
    color: colors.inkSoft,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: font.regular,
    color: colors.ink,
    textAlign: "right",
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: "#fff",
  },
  chipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipText: { fontSize: 12, color: colors.inkSoft, fontFamily: font.medium },
  pageHeader: {
    backgroundColor: colors.navy,
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 26,
  },
  eyebrow: { color: colors.orangeSoft, fontSize: 12, fontFamily: font.bold },
  pageTitle: {
    color: "#fff",
    fontSize: 22,
    fontFamily: font.extrabold,
    marginTop: 6,
  },
  pageSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4, lineHeight: 22 },
});

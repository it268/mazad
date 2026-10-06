import React from "react";
import { ActivityIndicator, Text, View, StyleSheet } from "react-native";
import { colors, font, statusColors } from "../lib/theme";
import { listStatusLabels } from "../lib/constants";

export function Badge({ status }: { status: string }) {
  const label = listStatusLabels[status] || status;
  const bg = statusColors[status] || colors.sand;
  const isPill = status === "live" || status === "completed";
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text
        style={[
          styles.badgeText,
          isPill && { color: "#fff" },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export function Loading({ text = "جارٍ التحميل…" }: { text?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.teal} size="large" />
      <Text style={styles.loadingText}>{text}</Text>
    </View>
  );
}

export function EmptyState({
  emoji = "🐎",
  title,
  sub,
}: {
  emoji?: string;
  title: string;
  sub?: string;
}) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {sub ? <Text style={styles.emptySub}>{sub}</Text> : null}
    </View>
  );
}

export function ErrorText({ children }: { children?: string | null }) {
  if (!children) return null;
  return (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{children}</Text>
    </View>
  );
}

export function SuccessText({ children }: { children?: string | null }) {
  if (!children) return null;
  return (
    <View style={styles.successBox}>
      <Text style={styles.successText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11,
    fontFamily: font.bold,
    color: colors.inkSoft,
  },
  center: { alignItems: "center", justifyContent: "center", padding: 32 },
  loadingText: {
    marginTop: 10,
    color: colors.inkSoft,
    fontSize: 13,
    fontFamily: font.medium,
  },
  empty: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 32,
    marginHorizontal: 16,
  },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.ink,
    textAlign: "center",
  },
  emptySub: {
    marginTop: 6,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: "center",
    lineHeight: 22,
  },
  errorBox: {
    backgroundColor: "rgba(125,19,0,0.08)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 6,
  },
  errorText: { color: colors.crimson, fontSize: 13, fontFamily: font.semibold },
  successBox: {
    backgroundColor: "rgba(14,95,130,0.1)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 6,
  },
  successText: { color: colors.teal, fontSize: 13, fontFamily: font.semibold },
});

import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { timeLeft } from "../lib/format";
import { colors, font } from "../lib/theme";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Countdown({
  target,
  onEnd,
  compact = false,
  light = false,
}: {
  target: string;
  onEnd?: () => void;
  compact?: boolean;
  light?: boolean;
}) {
  const [t, setT] = useState(() => timeLeft(target));

  useEffect(() => {
    setT(timeLeft(target));
    const id = setInterval(() => {
      const next = timeLeft(target);
      setT((prev) => {
        if (prev && !prev.ended && next.ended) onEnd?.();
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [target, onEnd]);

  if (t.ended) {
    return (
      <Text style={[styles.ended, light && { color: "#ffb4a0" }]}>انتهى</Text>
    );
  }

  if (compact) {
    return (
      <Text style={[styles.compact, { color: light ? "#fff" : colors.ink }]}>
        {t.d > 0 ? `${t.d}ي ` : ""}
        {pad(t.h)}:{pad(t.m)}:{pad(t.s)}
      </Text>
    );
  }

  const cells = [
    { v: t.d, l: "يوم" },
    { v: t.h, l: "ساعة" },
    { v: t.m, l: "دقيقة" },
    { v: t.s, l: "ثانية" },
  ];

  return (
    <View style={styles.row}>
      {cells.map((c) => (
        <View
          key={c.l}
          style={[styles.cell, { backgroundColor: light ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.9)" }]}
        >
          <Text style={[styles.cellNum, { color: light ? "#fff" : colors.ink }]}>
            {pad(c.v)}
          </Text>
          <Text style={[styles.cellLabel, { color: light ? "rgba(255,255,255,0.75)" : colors.inkSoft }]}>
            {c.l}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  cell: {
    minWidth: 46,
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  cellNum: { fontSize: 17, fontFamily: font.extrabold },
  cellLabel: { fontSize: 10, marginTop: 2 },
  compact: { fontSize: 14, fontFamily: font.extrabold },
  ended: { color: colors.crimson, fontFamily: font.extrabold, fontSize: 14 },
});

import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";

type Variant = "green" | "blue";

const COLORS: Record<Variant, { bg: string; accent: string }> = {
  green: { bg: "#E9F5EE", accent: "#23864F" },
  blue: { bg: "#E8F0FD", accent: "#3A6FE0" },
};

interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  variant?: Variant;
  onPress?: () => void;
}

/** One reusable card: icon circle, title, subtitle, chevron. */
export function ActionCard({
  title,
  subtitle,
  icon,
  variant = "green",
  onPress,
}: ActionCardProps) {
  const { bg, accent } = COLORS[variant];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: bg },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconCircle, { backgroundColor: accent }]}>
          {icon}
        </View>
        <Text style={[styles.chevron, { color: accent }]}>›</Text>
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

/* ---- Styles ---- */

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  cell: {
    flexGrow: 1,
    flexBasis: 260, // two per row when there's room, stacks on narrow screens
  },
  card: {
    flexGrow: 1, // was flex: 1
    gap: 12,
    padding: 14,
    borderRadius: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pressed: {
    opacity: 0.85,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C2A24",
  },
  subtitle: {
    fontSize: 12.5,
    color: "#5D6B64",
  },
  chevron: {
    fontSize: 26,
    lineHeight: 28,
  },
});

const iconStyles = StyleSheet.create({
  plus: {
    color: "#fff",
    fontSize: 26,
    lineHeight: 28,
    fontWeight: "500",
  },
  doc: {
    width: 18,
    height: 22,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 3,
    paddingHorizontal: 3,
    justifyContent: "center",
    gap: 3,
  },
  docLine: {
    height: 2,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 1,
  },
});

// components/ingredientRow.tsx
import { ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

type IngredientRowProps = {
  title: string;
  subtitle?: string;          // e.g. "Expires in 2 days"
  subtitleColor?: string;     // e.g. red for expiring items
  badge?: string;             // e.g. "LOW"
  value?: string;             // right side, big: "300 g"
  valueSub?: string;          // right side, small: "Fridge"
  icon?: ReactNode;           // goes inside the circle on the left
  onPress?: () => void;
};

export default function IngredientRow({
  title,
  subtitle,
  subtitleColor = Colors.textMuted,
  badge,
  value,
  valueSub,
  icon,
  onPress,
}: IngredientRowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      {icon ? <View style={styles.iconCircle}>{icon}</View> : null}

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{title}</Text>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>
        ) : null}
      </View>

      {value || valueSub ? (
        <View style={styles.right}>
          {value ? <Text style={styles.value}>{value}</Text> : null}
          {valueSub ? <Text style={styles.valueSub}>{valueSub}</Text> : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DCEFE4",
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, gap: 2 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontSize: 16, fontWeight: "600", color: Colors.primaryDark },
  subtitle: { fontSize: 12 },
  badge: {
    backgroundColor: "#FDE2E2",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#C62828" },
  right: { alignItems: "flex-end", gap: 2 },
  value: { fontSize: 16, fontWeight: "700", color: Colors.primaryDark },
  valueSub: { fontSize: 12, color: Colors.textMuted },
});
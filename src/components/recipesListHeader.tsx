import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

type Props = {
  count: number;
  sortLabel?: string;
  onSortPress?: () => void;
};

export default function RecipesListHeader({ count, sortLabel = "Newest", onSortPress }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.title}>My recipes</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>{count}</Text></View>
      </View>
      <Pressable style={styles.sort} onPress={onSortPress}>
        <Text style={styles.sortText}>Sort by: {sortLabel}</Text>
        <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 12 },
  left: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 20, fontWeight: "700", color: Colors.primaryDark },
  badge: { backgroundColor: Colors.border, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 12, color: Colors.primaryDark },
  sort: { flexDirection: "row", alignItems: "center", gap: 4 },
  sortText: { color: Colors.textMuted },
});
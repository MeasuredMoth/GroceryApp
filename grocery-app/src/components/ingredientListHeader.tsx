import { View, Text, StyleSheet } from "react-native";

type Props = {
  count: number;
};

export default function IngredientsListHeader({ count }: Props) {
  return (
    <View style={styles.countRow}>
      <Text style={styles.sectionTitle}>Your ingredients</Text>
      <Text style={styles.count}>{count} items</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingBottom: 8,
  },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#0f4d3a" },
  count: { color: "#6b7a74" },
});
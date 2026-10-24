import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CATEGORIES = ["All items", "Proteins", "Carbs", "Vegetables", "Dairy", "Other"];

type Props = {
  search: string;
  onSearchChange: (text: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  count: number;
  onAddPress: () => void;
  onFilterPress: () => void;
};


//AI generated header for the ingredient list 
export default function IngredientsListHeader({
  search, onSearchChange, category, onCategoryChange, count, onAddPress, onFilterPress,
}: Props) {
  return (
    <View style={styles.container}>
      {/* Title row + add button */}
      {/* <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Your ingredient database</Text>
          <Text style={styles.subtitle}>
            Save nutrition, prices and details once. Reuse them in every recipe.
          </Text>
        </View>
        <Pressable style={styles.addButton} onPress={onAddPress}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addLabel}>Add ingredient</Text>
        </Pressable>
      </View> */}

      {/* Info banner */}

      {/* Search + filter button */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#7a8a84" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={onSearchChange}
            placeholder="Search ingredients"
          />
        </View>
        <Pressable style={styles.filterButton} onPress={onFilterPress} hitSlop={8}>
          <Ionicons name="options-outline" size={22} color="#0f4d3a" />
        </Pressable>
      </View>

      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            onPress={() => onCategoryChange(c)}
            style={[styles.chip, c === category && styles.chipActive]}
          >
            <Text style={[styles.chipText, c === category && styles.chipTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Section title + count */}
      <View style={styles.countRow}>
        <Text style={styles.sectionTitle}>Your ingredients</Text>
        <Text style={styles.count}>{count} items</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14, paddingBottom: 8 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  title: { fontSize: 22, fontWeight: "700", color: "#0f4d3a" },
  subtitle: { fontSize: 13, color: "#6b7a74", marginTop: 2 },
  addButton: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#0f4d3a", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999,
  },
  addLabel: { color: "white", fontWeight: "600" },
  banner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#e8f3ee", padding: 12, borderRadius: 12,
  },
  bannerText: { color: "#0f4d3a", flex: 1 },
  searchRow: { flexDirection: "row", gap: 10 },
  searchBox: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderColor: "#dfe8e3", borderRadius: 14, paddingHorizontal: 12,
  },
  searchInput: { flex: 1, paddingVertical: 12 },
  filterButton: {
    width: 48, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#dfe8e3", borderRadius: 14,
  },
  chips: { gap: 8 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999,
    borderWidth: 1, borderColor: "#cfe3d9",
  },
  chipActive: { backgroundColor: "#0f4d3a", borderColor: "#0f4d3a" },
  chipText: { color: "#0f4d3a" },
  chipTextActive: { color: "white" },
  countRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#0f4d3a" },
  count: { color: "#6b7a74" },
});
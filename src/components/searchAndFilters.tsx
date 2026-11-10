import { Ionicons } from "@expo/vector-icons";
import { Pressable, TextInput, View, Text, StyleSheet, ScrollView } from "react-native";

interface Props {
  search: string;
  onSearchChange: (text: string) => void;
  onFilterPress: () => void;
  categories: string[];
  category: string;
  onCategoryChange: (category: string) => void;
  placeholder?: string;
}

export default function SearchAndFilters({
  search,
  onSearchChange,
  onFilterPress,
  categories,
  category,
  onCategoryChange,
  placeholder,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#7a8a84" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={onSearchChange}
            placeholder= {placeholder}
            placeholderTextColor="#7a8a84"
          />
        </View>

        <Pressable style={styles.filterButton} onPress={onFilterPress} hitSlop={8}>
          <Ionicons name="options-outline" size={22} color="#0f4d3a" />
        </Pressable>
      </View>

      {/* Category chips (horizontal scroll only) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {categories.map((c) => (
          <Pressable
            key={c}
            onPress={() => onCategoryChange(c)}
            style={[styles.chip, c === category && styles.chipActive]}
          >
            <Text style={[styles.chipText, c === category && styles.chipTextActive]}>
              {c}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, paddingHorizontal: 16, paddingBottom: 8 },
  searchRow: { flexDirection: "row", gap: 10 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#dfe8e3",
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, paddingVertical: 12 },
  filterButton: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#dfe8e3",
    borderRadius: 14,
  },
  chips: { gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cfe3d9",
  },
  chipActive: { backgroundColor: "#0f4d3a", borderColor: "#0f4d3a" },
  chipText: { color: "#0f4d3a" },
  chipTextActive: { color: "white" },
});
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

const LETTERS = ["M", "T", "W", "T", "F", "S", "S"]; // week starts Monday

type Props = {
  days: Date[];
  selected: number;
  onSelect: (index: number) => void;
};

export default function DaySelector({ days, selected, onSelect }: Props) {
  return (
    <View style={styles.row}>
      {days.map((d, i) => {
        const active = i === selected;
        return (
          <Pressable
            key={i}
            style={[styles.day, active && styles.dayActive]}
            onPress={() => onSelect(i)}
          >
            <Text style={[styles.letter, active && styles.textActive]}>{LETTERS[i]}</Text>
            <Text style={[styles.date, active && styles.textActive]}>{d.getDate()}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, paddingHorizontal: 16 },
  day: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cfe3d9",
    backgroundColor: Colors.card,
  },
  dayActive: { backgroundColor: "#0f4d3a", borderColor: "#0f4d3a" },
  letter: { fontSize: 12, color: Colors.textMuted },
  date: { fontSize: 16, fontWeight: "600", color: Colors.primaryDark },
  textActive: { color: "white" },
});
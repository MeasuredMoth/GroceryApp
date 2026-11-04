import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { Colors } from "@/constants/Colors";

export type Totals = { kcal: number; protein: number; carbs: number; fat: number };

type Props = { totals: Totals; goals: Totals };

const SIZE = 130;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

function MacroBar({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = Math.min(value / goal, 1);
  return (
    <View style={styles.macro}>
      <View style={styles.macroTop}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroLeft}>{Math.max(goal - value, 0)}g left</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function NutritionSummary({ totals, goals }: Props) {
  const progress = Math.min(totals.kcal / goals.kcal, 1);
  const left = Math.max(goals.kcal - totals.kcal, 0);

  return (
    <View style={styles.card}>
      <View style={styles.ringWrap}>
 <Svg width={SIZE} height={SIZE}>
  <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke="#DCEFE4" strokeWidth={STROKE} fill="none" />
  <G transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
    <Circle
      cx={SIZE / 2}
      cy={SIZE / 2}
      r={R}
      stroke="#0f4d3a"
      strokeWidth={STROKE}
      fill="none"
      strokeLinecap="round"
      strokeDasharray={CIRC}
      strokeDashoffset={CIRC * (1 - progress)}
    />
  </G>
</Svg>
        <View style={styles.ringCenter}>
          <Text style={styles.kcal}>{left}</Text>
          <Text style={styles.kcalLabel}>KCAL LEFT</Text>
        </View>
      </View>

      <View style={styles.macros}>
        <MacroBar label="Carbs" value={totals.carbs} goal={goals.carbs} color="#2E7D4F" />
        <MacroBar label="Protein" value={totals.protein} goal={goals.protein} color="#4BA3C7" />
        <MacroBar label="Fat" value={totals.fat} goal={goals.fat} color="#E0A93B" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#E9F4EE",
  },
  ringWrap: { width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" },
  ringCenter: { position: "absolute", alignItems: "center" },
  kcal: { fontSize: 28, fontWeight: "700", color: Colors.primaryDark },
  kcalLabel: { fontSize: 10, letterSpacing: 1, color: Colors.textMuted },
  macros: { flex: 1, gap: 12 },
  macro: { gap: 4 },
  macroTop: { flexDirection: "row", justifyContent: "space-between" },
  macroLabel: { fontSize: 12, fontWeight: "600", color: Colors.primaryDark },
  macroLeft: { fontSize: 12, color: Colors.textMuted },
  track: { height: 6, borderRadius: 3, backgroundColor: "#cfe3d9", overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
});
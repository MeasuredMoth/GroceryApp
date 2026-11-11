import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Same greens used by ActionCard / DayScreen so everything matches.
const BG = "#E9F5EE";
const ACCENT = "#23864F";
const DARK = "#0f4d3a";
const MUTED = "#5D6B64";

interface BannerProps {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  onPress?: () => void;
}

export function Banner({
  title = "Keep your dietologist's plan up to date",
  subtitle = "Change a meal, adjust its time, or add a note.",
  buttonLabel = "Edit this week",
  onPress,
}: BannerProps) {
  return (
    <View style={styles.card}>
      {/* Soft decorative leaf, echoes the logo. Sits behind the text. */}
      <Ionicons
        name="leaf"
        size={120}
        color={ACCENT}
        style={styles.leaf}
        pointerEvents="none"
      />

      <View style={styles.header}>
        <View style={styles.iconChip}>
          <Ionicons name="calendar-outline" size={18} color="white" />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      <Text style={styles.subtitle}>{subtitle}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={buttonLabel}
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Ionicons name="create-outline" size={18} color="white" />
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BG,
    borderRadius: 20,
    padding: 18,
    gap: 12,
    overflow: "hidden", // clips the leaf at the corner
  },
  leaf: {
    position: "absolute",
    right: -22,
    top: -22,
    opacity: 0.1,
    transform: [{ rotate: "15deg" }],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1, // lets long titles wrap instead of pushing off-screen
    fontSize: 18,
    fontWeight: "700",
    color: DARK,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: DARK,
    borderRadius: 999,
    paddingVertical: 12,
    marginTop: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
});

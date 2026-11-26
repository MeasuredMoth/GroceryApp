// "−  2 servings  +" control used when creating a recipe and when adding one to a meal.

import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { MAX_SERVINGS } from "../../data/recipe/recipe";

export function ServingsStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (servings: number) => void;
}) {
  const canLess = value > 1;
  const canMore = value < MAX_SERVINGS;

  return (
    <View style={styles.box}>
      <Pressable
        onPress={() => canLess && onChange(value - 1)}
        disabled={!canLess}
        hitSlop={6}
        style={[styles.button, !canLess && styles.disabled]}
        accessibilityRole="button"
        accessibilityLabel="Fewer servings"
      >
        <Ionicons name="remove" size={18} color={Colors.primaryDark} />
      </Pressable>
      <Text style={styles.value} accessibilityLiveRegion="polite">
        {value} {value === 1 ? "serving" : "servings"}
      </Text>
      <Pressable
        onPress={() => canMore && onChange(value + 1)}
        disabled={!canMore}
        hitSlop={6}
        style={[styles.button, !canMore && styles.disabled]}
        accessibilityRole="button"
        accessibilityLabel="More servings"
      >
        <Ionicons name="add" size={18} color={Colors.primaryDark} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    borderRadius: 999,
    padding: 4,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.35 },
  value: {
    minWidth: 86,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textDark,
  },
});

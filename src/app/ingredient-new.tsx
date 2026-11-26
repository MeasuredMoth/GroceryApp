// Add a new ingredient to the ingredient database (opened from the Today tab's "Add ingredient" card,
// or from the new recipe screen with ?name=<what was searched>).

import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { ChipRow, FormChip } from "@/components/formChip";
import { saveIngredient, useAppData } from "@/storage/appStore";
import { createIngredient } from "../../data/recipe/ingredient";
import { INGREDIENT_CATEGORY, MEASUREMENT_TYPE } from "../../data/util/types";

const MEASURE_OPTIONS: { type: MEASUREMENT_TYPE; label: string }[] = [
  { type: MEASUREMENT_TYPE.MASS, label: "Weight (g, kg, oz)" },
  { type: MEASUREMENT_TYPE.VOLUME, label: "Volume (ml, l, cup)" },
  { type: MEASUREMENT_TYPE.COUNT, label: "Pieces" },
];

export default function NewIngredientScreen() {
  const params = useLocalSearchParams<{ name?: string }>();
  const { ingredients } = useAppData();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(params.name ?? "");
  const [category, setCategory] = useState<INGREDIENT_CATEGORY>(
    INGREDIENT_CATEGORY.OTHER,
  );
  const [measures, setMeasures] = useState<MEASUREMENT_TYPE[]>([
    MEASUREMENT_TYPE.MASS,
  ]);

  const trimmed = name.trim();
  const duplicate = ingredients.some(
    (i) => i.name.toLowerCase() === trimmed.toLowerCase(),
  );
  const canSave = trimmed !== "" && !duplicate && measures.length > 0;

  const toggleMeasure = (type: MEASUREMENT_TYPE) =>
    setMeasures((current) =>
      current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type],
    );

  const save = () => {
    if (!canSave) return;
    saveIngredient(createIngredient(trimmed, measures, category));
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.titleBar}>
        <View style={styles.titleIcon}>
          <Ionicons
            name="nutrition-outline"
            size={20}
            color={Colors.primaryDark}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>New ingredient</Text>
          <Text style={styles.subtitle}>
            Save it to your ingredient database
          </Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={18} color={Colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            style={styles.textField}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Tofu"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="done"
          />

          {duplicate && (
            <Text style={styles.error}>
              {trimmed} is already in your ingredients
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Category</Text>
          <ChipRow>
            {Object.values(INGREDIENT_CATEGORY).map((c) => (
              <FormChip
                key={c}
                label={c}
                active={c === category}
                onPress={() => setCategory(c)}
              />
            ))}
          </ChipRow>
        </View>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Measured in (pick one or more)</Text>
          <ChipRow>
            {MEASURE_OPTIONS.map((m) => (
              <FormChip
                key={m.type}
                label={m.label}
                active={measures.includes(m.type)}
                onPress={() => toggleMeasure(m.type)}
              />
            ))}
          </ChipRow>
          {measures.length === 0 && (
            <Text style={styles.error}>Pick at least one</Text>
          )}
        </View>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}
      >
        <Pressable
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={save}
          disabled={!canSave}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave }}
        >
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text style={styles.saveButtonText}>Save ingredient</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  titleBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  titleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: Colors.primaryDark },
  subtitle: { fontSize: 13, color: Colors.textMuted },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: Colors.textMuted },
  textField: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 15,
    color: Colors.textDark,
  },
  error: { fontSize: 12, color: Colors.danger },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#0f4d3a",
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: { opacity: 0.4 },
  saveButtonText: { color: "white", fontSize: 16, fontWeight: "700" },
});

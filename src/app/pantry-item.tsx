// Add to pantry (opened by "+ Add item"), or edit an entry (opened with ?id=<entry id> from the swipe menu).

import { ReactNode, useMemo, useState } from "react";
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
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { Colors } from "@/constants/Colors";
import { saveIngredient, savePantryEntry, useAppData } from "@/storage/appStore";
import {
  createIngredient,
  Ingredient,
} from "../../data/recipe/ingredient";
import { createPantryEntry, PantryEntry } from "../../data/recipe/pantry";
import { INGREDIENT_CATEGORY, LITERAL_UNIT, METRIC_UNIT, UNITS } from "../../data/util/types";
import { DateKey, toDateKey } from "../../data/util/util";
import { canConvert, ConvertableUnits, convertUnit, DefaultUnit, MeasurementTypes, systemIsConvertable } from "../../data/util/unit";
import { createQuantity } from "../../data/recipe/quantity";

/* ---------- Small helpers ---------- */

const CATEGORY_ICONS: Record<INGREDIENT_CATEGORY, keyof typeof Ionicons.glyphMap> = {
  [INGREDIENT_CATEGORY.PROTEIN]: "egg-outline",
  [INGREDIENT_CATEGORY.CARB]: "nutrition-outline",
  [INGREDIENT_CATEGORY.VEGETABLE]: "leaf-outline",
  [INGREDIENT_CATEGORY.DIARY]: "water-outline",
  [INGREDIENT_CATEGORY.FRUIT]: "color-fill-outline",
  [INGREDIENT_CATEGORY.GRAIN]: "cube-outline",
  [INGREDIENT_CATEGORY.FAT]: "cube-outline",
  [INGREDIENT_CATEGORY.SEASONING]: "cube-outline",
  [INGREDIENT_CATEGORY.OTHER]: "cube-outline",
};

// What a new custom ingredient can be measured in
const UNIT_GROUPS: { label: string; units: UNITS[] }[] = [
  { label: "Weight (g, kg)", units: [METRIC_UNIT.GRAM, METRIC_UNIT.KILOGRAM] },
  { label: "Pieces", units: [METRIC_UNIT.LITER, METRIC_UNIT.MILILITER] },
  { label: "Volume (ml, l)", units: [LITERAL_UNIT.PIECE] },
];


const EXPIRY_SHORTCUTS = [
  { label: "3 days", days: 3 },
  { label: "1 week", days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "1 month", days: 30 },
];

const MAX_MATCHES = 6;

/** How much one tap on - or + changes the amount, so each unit feels reasonable. */
function stepFor(unit: UNITS): number {
  if (unit === "g" || unit === "ml") return 50;
  if (unit === "kg" || unit === "l") return 0.5;
  return 1;
}

/** Keeps up to 2 decimals and drops trailing zeros: 1.50 -> "1.5". */
function formatAmount(n: number): string {
  return String(Math.round(n * 100) / 100);
}

/** Accepts "1,5" as well as "1.5". Returns NaN for anything that isn't a number. */
function parseAmount(text: string): number {
  const cleaned = text.replace(",", ".").trim();
  return /^\d*\.?\d+$/.test(cleaned) ? Number(cleaned) : NaN;
}

function addDays(key: DateKey | undefined, days: number): DateKey {
  const base = key ? dayjs(key) : dayjs().startOf("day");
  return toDateKey(base.add(days, "day").toDate());
}

/* ---------- Screen ---------- */

export default function PantryItemScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { ingredients, pantry } = useAppData();
  const insets = useSafeAreaInsets();

  const editing = id ? pantry.find((e) => e.id === id) : undefined;
  const isEdit = editing !== undefined;

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(editing?.ingredientId ?? null);
  const [amountText, setAmountText] = useState(editing ? formatAmount(editing.quantity.amount) : "");
  const [unit, setUnit] = useState<UNITS | null>(editing?.quantity.unit ?? null);
  const [expiresOn, setExpiresOn] = useState<DateKey | undefined>(editing?.expiresOn);
  const [creating, setCreating] = useState(false);

  const selected = ingredients.find((i) => i.id === selectedId) ?? null;

  // An entry saved in a unit the ingredient no longer allows can still be edited in that unit
  const units: UNITS[] = selected
    ? Array.from(new Set([...(editing?.quantity ? [editing.quantity.unit] : [])]))
    : [];

  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    return ingredients
      .filter((i) => i.id !== selectedId && i.name.toLowerCase().includes(query))
      .slice(0, query ? MAX_MATCHES : ingredients.length);
  }, [ingredients, search, selectedId]);

  const select = (ingredient: Ingredient) => {
    setSelectedId(ingredient.id);
    setUnit(DefaultUnit[ingredient.allowedUnits[0]]);
    setAmountText("");
    setExpiresOn(undefined); // a date picked for another ingredient doesn't carry over
    setCreating(false);
  };

  const amount = parseAmount(amountText);
  // Editing can set the amount to 0 ("I'm out of it"), a new entry needs something in it
  const amountOk = Number.isFinite(amount) && (isEdit ? amount >= 0 : amount > 0);
  const canSave = selected !== null && unit !== null && amountOk;

  const step = (direction: 1 | -1) => {
    if (!unit) return;
    const current = Number.isFinite(amount) ? amount : 0;
    setAmountText(formatAmount(Math.max(0, current + direction * stepFor(unit))));
  };

  // When adding, the row this will be summed into (same ingredient and expiry date), so the user knows
  const mergeTarget: PantryEntry | undefined =
    !isEdit && selected && unit
      ? pantry.find(
          (e) =>
            e.ingredientId === selected.id &&
            (e.expiresOn ?? null) === (expiresOn ?? null) &&
            canConvert(unit, e.quantity.unit),
        )
      : undefined;
  const mergedTotal =
    mergeTarget && unit && amountOk && systemIsConvertable(unit, mergeTarget.quantity.unit)
      ? mergeTarget.quantity.amount + convertUnit(unit as ConvertableUnits, mergeTarget.quantity.unit as ConvertableUnits, amount)
      : null;

  const markRunOut = () => {
    if (!editing) return;
    savePantryEntry({ ...editing, quantity: createQuantity(0, editing.quantity.unit) });
    router.back();
  };

  const save = () => {
    if (!selected || !unit || !amountOk) return;
    if (editing) {
      savePantryEntry({ ...editing, ingredientId: selected.id, quantity: createQuantity(0, editing.quantity.unit) , expiresOn });
    } else {
      savePantryEntry(createPantryEntry(selected, createQuantity(amount, unit), expiresOn));
    }
    router.back();
  };

  if (id && !editing) {
    // The entry was removed while this screen was open
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.muted}>This item is no longer in your pantry.</Text>
        <Pressable onPress={() => router.back()} style={{ padding: 12 }}>
          <Text style={styles.link}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const otherMatchesTitle = search.trim()
    ? `Other matches for "${search.trim()}"`
    : selected
      ? "Other ingredients"
      : "Pick an ingredient";

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Title bar */}
      <View style={styles.titleBar}>
        <View style={styles.titleIcon}>
          <Ionicons name="basket-outline" size={20} color={Colors.primaryDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{isEdit ? "Edit pantry item" : "Add to pantry"}</Text>
          <Text style={styles.subtitle}>
            {isEdit ? "Update the amount or expiry date" : "Track inventory & fresh batches"}
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
        showsVerticalScrollIndicator={false}
      >
        {!isEdit && (
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search ingredients"
              placeholderTextColor={Colors.textMuted}
              autoCorrect={false}
            />
            {search !== "" && (
              <Pressable onPress={() => setSearch("")} hitSlop={8} accessibilityLabel="Clear search">
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </Pressable>
            )}
          </View>
        )}

        {/* Selected ingredient with amount, unit and expiry */}
        {selected && unit && (
          <Animated.View
            entering={FadeIn.duration(200)}
            layout={LinearTransition}
            style={styles.selectedCard}
          >
            <View style={styles.row}>
              <IngredientIcon ingredient={selected} />
              <View style={{ flex: 1 }}>
                <View style={styles.row}>
                  <Text style={styles.selectedName}>{selected.name}</Text>
                  <View style={styles.categoryChip}>
                    <Text style={styles.categoryChipText}>{selected.ingredientCategory}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="checkmark-circle" size={22} color={Colors.primaryDark} />
            </View>

            <View style={styles.amountRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Amount</Text>
                <View style={styles.amountBox}>
                  <Pressable onPress={() => step(-1)} hitSlop={6} accessibilityLabel="Less">
                    <Ionicons name="remove" size={18} color={Colors.primaryDark} />
                  </Pressable>
                  <TextInput
                    style={styles.amountInput}
                    value={amountText}
                    onChangeText={setAmountText}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                    selectTextOnFocus
                  />
                  <Pressable onPress={() => step(1)} hitSlop={6} accessibilityLabel="More">
                    <Ionicons name="add" size={18} color={Colors.primaryDark} />
                  </Pressable>
                </View>
              </View>

              <View style={{ flex: 1.3 }}>
                <Text style={styles.fieldLabel}>Unit</Text>
                <View style={styles.segment}>
                  {units.map((u) => (
                    <Pressable
                      key={u}
                      style={[styles.segmentItem, u === unit && styles.segmentItemActive]}
                      onPress={() => setUnit(u)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: u === unit }}
                    >
                      <Text style={[styles.segmentText, u === unit && styles.segmentTextActive]}>
                        {u}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            {amountText !== "" && !amountOk && (
              <Text style={styles.error}>
                {isEdit ? "Enter an amount of 0 or more" : "Enter an amount greater than 0"}
              </Text>
            )}

            <ExpiryField value={expiresOn} onChange={setExpiresOn} />

            {mergeTarget && (
              <View style={styles.mergeNote}>
                <Ionicons name="git-merge-outline" size={16} color={Colors.primaryDark} />
                <Text style={styles.mergeNoteText}>
                  {mergeTarget.quantity.amount === 0
                    ? `Restocks your empty ${selected.name} row`
                    : mergedTotal !== null
                      ? `Adds to the ${formatAmount(mergeTarget.quantity.amount)} ${mergeTarget.quantity.unit} you have: ${formatAmount(mergedTotal)} ${mergeTarget.quantity.unit} total`
                      : `Adds to the ${formatAmount(mergeTarget.quantity.amount)} ${mergeTarget.quantity.unit} you already have`}
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Keeps the row in the pantry with "OUT", so it's clear it needs buying */}
        {editing && editing.quantity.amount > 0 && (
          <Pressable style={styles.runOutButton} onPress={markRunOut} accessibilityRole="button">
            <Ionicons name="remove-circle-outline" size={20} color={Colors.danger} />
            <View style={{ flex: 1 }}>
              <Text style={styles.runOutTitle}>Mark as run out</Text>
              <Text style={styles.muted}>Keeps it in your pantry, marked as out of stock</Text>
            </View>
          </Pressable>
        )}
        {editing && editing.quantity.amount === 0 && (
          <View style={styles.outNote}>
            <Ionicons name="alert-circle-outline" size={18} color={Colors.danger} />
            <Text style={styles.outNoteText}>Out of stock. Set an amount above to restock it.</Text>
          </View>
        )}

        {/* Ingredient list to pick from (not shown when editing) */}
        {!isEdit && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{otherMatchesTitle.toUpperCase()}</Text>
              <Text style={styles.sectionCount}>
                {matches.length} {matches.length === 1 ? "item" : "items"}
              </Text>
            </View>

            <Animated.View layout={LinearTransition} style={styles.matchList}>
              {matches.map((ingredient) => (
                <Pressable
                  key={ingredient.id}
                  style={styles.matchRow}
                  onPress={() => select(ingredient)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${ingredient.name}`}
                >
                  <IngredientIcon ingredient={ingredient} small />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.matchName}>{ingredient.name}</Text>
                    <Text style={styles.muted}>{ingredient.ingredientCategory}</Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={22} color={Colors.textMuted} />
                </Pressable>
              ))}
              {matches.length === 0 && (
                <Text style={[styles.muted, { padding: 12 }]}>No ingredients match.</Text>
              )}
            </Animated.View>

            <CustomIngredient
              open={creating}
              onToggle={() => setCreating((c) => !c)}
              initialName={search.trim()}
              existing={ingredients}
              onCreate={(ingredient) => {
                saveIngredient(ingredient);
                select(ingredient);
                setSearch("");
              }}
            />
          </>
        )}
      </ScrollView>

      {/* Fixed button at the bottom */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={save}
          disabled={!canSave}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave }}
        >
          <Ionicons
            name={isEdit ? "checkmark-circle-outline" : "add-circle-outline"}
            size={20}
            color="white"
          />
          <Text style={styles.saveButtonText}>{isEdit ? "Save changes" : "Add to pantry"}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ---------- Pieces ---------- */

function IngredientIcon({ ingredient, small }: { ingredient: Ingredient; small?: boolean }) {
  const size = small ? 32 : 40;
  return (
    <View style={[styles.icon, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons
        name={CATEGORY_ICONS[ingredient.ingredientCategory]}
        size={small ? 16 : 20}
        color={Colors.primaryDark}
      />
    </View>
  );
}

function ExpiryField({
  value,
  onChange,
}: {
  value: DateKey | undefined;
  onChange: (value: DateKey | undefined) => void;
}) {
  const daysLeft = value ? dayjs(value).diff(dayjs().startOf("day"), "day") : null;
  const hint =
    daysLeft === null
      ? "(Optional)"
      : daysLeft < 0
        ? "Already expired"
        : daysLeft === 0
          ? "Today"
          : `In ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`;

  return (
    <View style={styles.expiryBox}>
      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={16} color={Colors.textMuted} />
        <Text style={styles.expiryLabel}>Expires</Text>
        <View style={{ flex: 1 }} />
        {value ? (
          <>
            <Pressable onPress={() => onChange(addDays(value, -1))} hitSlop={8} accessibilityLabel="One day earlier">
              <Ionicons name="chevron-back" size={18} color={Colors.primaryDark} />
            </Pressable>
            <Text style={styles.expiryDate}>{dayjs(value).format("MMM D, YYYY")}</Text>
            <Pressable onPress={() => onChange(addDays(value, 1))} hitSlop={8} accessibilityLabel="One day later">
              <Ionicons name="chevron-forward" size={18} color={Colors.primaryDark} />
            </Pressable>
          </>
        ) : null}
        <Text style={[styles.muted, daysLeft !== null && daysLeft < 0 && { color: Colors.danger }]}>
          {hint}
        </Text>
      </View>

      <View style={styles.shortcutRow}>
        {EXPIRY_SHORTCUTS.map((s) => (
          <Pressable
            key={s.label}
            style={styles.shortcut}
            onPress={() => onChange(addDays(undefined, s.days))}
            accessibilityRole="button"
            accessibilityLabel={`Expires in ${s.label}`}
          >
            <Text style={styles.shortcutText}>{s.label}</Text>
          </Pressable>
        ))}
        {value && (
          <Pressable style={styles.shortcut} onPress={() => onChange(undefined)} accessibilityRole="button">
            <Text style={[styles.shortcutText, { color: Colors.textMuted }]}>None</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function CustomIngredient({
  open,
  onToggle,
  initialName,
  existing,
  onCreate,
}: {
  open: boolean;
  onToggle: () => void;
  initialName: string;
  existing: Ingredient[];
  onCreate: (ingredient: Ingredient) => void;
}) {
  // null until the user types, so the field starts from the search text but can be cleared
  const [name, setName] = useState<string | null>(null);
  const [category, setCategory] = useState<INGREDIENT_CATEGORY>(INGREDIENT_CATEGORY.OTHER);
  const [group, setGroup] = useState(0);

  // Starts from what was typed in the search box
  const shownName = name ?? initialName;
  const trimmed = shownName.trim();
  const duplicate = existing.some((i) => i.name.toLowerCase() === trimmed.toLowerCase());
  const canCreate = trimmed !== "" && !duplicate;

  const create = () => {
    if (!canCreate) return;
    onCreate(createIngredient(trimmed, MeasurementTypes[UNIT_GROUPS[group].units[0]], category));
    setName(null);
    setCategory(INGREDIENT_CATEGORY.OTHER);
    setGroup(0);
  };

  return (
    <Animated.View layout={LinearTransition} style={styles.customCard}>
      <Pressable style={styles.row} onPress={onToggle} accessibilityRole="button">
        <View style={styles.titleIcon}>
          <Ionicons name="add" size={18} color={Colors.primaryDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.matchName}>Can't find it?</Text>
          <Text style={styles.muted}>Create a new custom ingredient</Text>
        </View>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color={Colors.textMuted} />
      </Pressable>

      {open && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={{ gap: 10, marginTop: 12 }}>
          <TextInput
            style={styles.textField}
            value={shownName}
            onChangeText={setName}
            placeholder="Ingredient name"
            placeholderTextColor={Colors.textMuted}
          />
          {duplicate && <Text style={styles.error}>{trimmed} is already in your ingredients</Text>}

          <Text style={styles.fieldLabel}>Category</Text>
          <ChipRow>
            {Object.values(INGREDIENT_CATEGORY).map((c) => (
              <Chip key={c} label={c} active={c === category} onPress={() => setCategory(c)} />
            ))}
          </ChipRow>

          <Text style={styles.fieldLabel}>Measured in</Text>
          <ChipRow>
            {UNIT_GROUPS.map((g, i) => (
              <Chip key={g.label} label={g.label} active={i === group} onPress={() => setGroup(i)} />
            ))}
          </ChipRow>

          <Pressable
            style={[styles.createButton, !canCreate && styles.saveButtonDisabled]}
            onPress={create}
            disabled={!canCreate}
            accessibilityRole="button"
          >
            <Text style={styles.saveButtonText}>Create and select</Text>
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>
  );
}

function ChipRow({ children }: { children: ReactNode }) {
  return <View style={styles.chipRow}>{children}</View>;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },

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

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textDark },

  selectedCard: {
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 16,
    padding: 14,
    gap: 14,
  },
  selectedName: { fontSize: 17, fontWeight: "700", color: Colors.textDark },
  categoryChip: {
    backgroundColor: Colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryChipText: { fontSize: 11, fontWeight: "600", color: Colors.primaryDark },
  icon: { backgroundColor: Colors.primarySoft, alignItems: "center", justifyContent: "center" },

  amountRow: { flexDirection: "row", gap: 12 },
  fieldLabel: { fontSize: 12, color: Colors.textMuted, marginBottom: 6 },
  amountBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    gap: 6,
  },
  amountInput: {
    flex: 1,
    minWidth: 0, // lets it shrink, otherwise web gives it a default width that pushes + out
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textDark,
    paddingVertical: 0,
  },
  segment: {
    flexDirection: "row",
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 3,
    height: 40,
  },
  segmentItem: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 8 },
  segmentItemActive: { backgroundColor: Colors.primaryDark },
  segmentText: { fontSize: 13, color: Colors.textMuted, fontWeight: "600" },
  segmentTextActive: { color: "white" },

  expiryBox: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 10,
    gap: 10,
  },
  expiryLabel: { fontSize: 14, fontWeight: "600", color: Colors.textDark },
  expiryDate: { fontSize: 14, fontWeight: "600", color: Colors.primaryDark },
  shortcutRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  shortcut: {
    borderRadius: 999,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  shortcutText: { fontSize: 12, fontWeight: "600", color: Colors.primaryDark },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  sectionTitle: { fontSize: 11, fontWeight: "700", color: Colors.textMuted, letterSpacing: 0.5 },
  sectionCount: { fontSize: 11, color: Colors.textMuted },
  matchList: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    overflow: "hidden",
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  matchName: { fontSize: 15, fontWeight: "600", color: Colors.textDark },
  muted: { fontSize: 12, color: Colors.textMuted },
  link: { fontSize: 15, fontWeight: "600", color: Colors.primaryDark },
  error: { fontSize: 12, color: Colors.danger },

  mergeNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primarySoft,
    borderRadius: 10,
    padding: 10,
  },
  mergeNoteText: { flex: 1, fontSize: 13, color: Colors.primaryDark },
  runOutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: "#F3C7C7",
    borderRadius: 16,
    padding: 14,
  },
  runOutTitle: { fontSize: 15, fontWeight: "700", color: Colors.danger },
  outNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FDECEC",
    borderRadius: 12,
    padding: 12,
  },
  outNoteText: { flex: 1, fontSize: 13, color: Colors.danger },

  customCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 12,
  },
  textField: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 15,
    color: Colors.textDark,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: Colors.primaryDark, borderColor: Colors.primaryDark },
  chipText: { fontSize: 13, color: Colors.primaryDark },
  chipTextActive: { color: "white" },
  createButton: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 12,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

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

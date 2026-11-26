// A unit picker that looks like a select box: shows the chosen unit, tap to open a list below it.
// Built on the core Modal so it works the same on iOS, Android and web, including inside other modals.

import { ComponentRef, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { UNITS } from "../../data/util/types";

const UNIT_NAMES: Record<UNITS, string> = {
  mg: "milligrams",
  g: "grams",
  kg: "kilograms",
  ml: "millilitres",
  l: "litres",
  kl: "kilolitres",
  cup: "cups",
  tbsp: "tablespoons",
  tsp: "teaspoons",
  oz: "ounces",
  lb: "pounds",
  piece: "pieces",
  pinch: "pinches",
};

const ROW_HEIGHT = 44;
const MAX_MENU_HEIGHT = 264;
const GAP = 4;

type Anchor = { x: number; y: number; width: number; height: number };

export function UnitDropdown({
  units,
  value,
  onChange,
  style,
}: {
  units: UNITS[];
  value: UNITS | null;
  onChange: (unit: UNITS) => void;
  style?: ViewStyle;
}) {
  const triggerRef = useRef<ComponentRef<typeof View>>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const window = useWindowDimensions();

  const open = () =>
    triggerRef.current?.measureInWindow((x, y, width, height) =>
      setAnchor({ x, y, width, height }),
    );
  const close = () => setAnchor(null);

  const pick = (unit: UNITS) => {
    onChange(unit);
    close();
  };

  // Opens upwards when there isn't room below the box
  const menuHeight = Math.min(units.length * ROW_HEIGHT, MAX_MENU_HEIGHT);
  const menuWidth = anchor ? Math.max(anchor.width, 180) : 180;
  const position = anchor
    ? {
        left: Math.max(8, Math.min(anchor.x, window.width - menuWidth - 8)),
        width: menuWidth,
        ...(anchor.y + anchor.height + GAP + menuHeight > window.height - 16
          ? { bottom: window.height - anchor.y + GAP }
          : { top: anchor.y + anchor.height + GAP }),
      }
    : {};

  return (
    <>
      <Pressable
        ref={triggerRef}
        onPress={open}
        style={({ pressed }) => [styles.trigger, anchor && styles.triggerOpen, pressed && styles.pressed, style]}
        accessibilityRole="button"
        accessibilityLabel={`Unit: ${value ? UNIT_NAMES[value] : "none"}. Change unit`}
      >
        <Text style={[styles.triggerText, !value && styles.placeholder]} numberOfLines={1}>
          {value ?? "Unit"}
        </Text>
        <Ionicons
          name={anchor ? "chevron-up" : "chevron-down"}
          size={16}
          color={Colors.textMuted}
        />
      </Pressable>

      <Modal
        visible={anchor !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={close}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close unit list" />
        <View style={[styles.menu, position]}>
          <ScrollView style={{ maxHeight: MAX_MENU_HEIGHT }} bounces={false}>
            {units.map((u) => {
              const selected = u === value;
              return (
                <Pressable
                  key={u}
                  onPress={() => pick(u)}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.optionUnit, selected && styles.optionUnitSelected]}>{u}</Text>
                  <Text style={styles.optionName}>{UNIT_NAMES[u]}</Text>
                  {selected && <Ionicons name="checkmark" size={18} color={Colors.primaryDark} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  triggerOpen: { borderColor: Colors.primary },
  pressed: { opacity: 0.8 },
  triggerText: { flex: 1, fontSize: 15, fontWeight: "600", color: Colors.textDark },
  placeholder: { color: Colors.textMuted, fontWeight: "400" },
  menu: {
    position: "absolute",
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    // Lifts the list off the page
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: ROW_HEIGHT,
    paddingHorizontal: 14,
  },
  optionSelected: { backgroundColor: Colors.primarySoft },
  optionPressed: { backgroundColor: Colors.background },
  optionUnit: { width: 48, fontSize: 15, fontWeight: "600", color: Colors.textDark },
  optionUnitSelected: { color: Colors.primaryDark },
  optionName: { flex: 1, fontSize: 13, color: Colors.textMuted },
});

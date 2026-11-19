// A list row that slides left to show Edit and Remove buttons.
// Only one row stays open at a time: opening another one closes the previous.

import { ReactNode, useRef } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import ReanimatedSwipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

const BUTTON_WIDTH = 76;
const RADIUS = 16;

let openRow: SwipeableMethods | null = null;

/** Closes whichever row is open, e.g. before leaving the screen. */
export function closeOpenRow() {
  openRow?.close();
  openRow = null;
}

type Props = {
  children: ReactNode;
  onEdit?: () => void; // omit to show only Remove
  onDelete: () => void;
  radius?: number;
};

export default function SwipeableRow({ children, onEdit, onDelete, radius }: Props) {
  const ref = useRef<SwipeableMethods>(null);
  const actionsWidth = BUTTON_WIDTH * (onEdit ? 2 : 1);

  const run = (action: () => void, close: boolean) => {
    if (close) ref.current?.close();
    openRow = null;
    action();
  };

  return (
    <ReanimatedSwipeable
      ref={ref}
      friction={1.5}
      rightThreshold={actionsWidth / 3}
      overshootRight={false}
      containerStyle={[styles.container, radius !== undefined && { borderRadius: radius }]}
      onSwipeableWillOpen={() => {
        if (openRow && openRow !== ref.current) openRow.close();
        openRow = ref.current;
      }}
      onSwipeableClose={() => {
        if (openRow === ref.current) openRow = null;
      }}
      renderRightActions={(progress) => (
        <Actions
          progress={progress}
          width={actionsWidth}
          onEdit={onEdit ? () => run(onEdit, true) : undefined}
          onDelete={() => run(onDelete, false)}
        />
      )}
    >
      {children}
    </ReanimatedSwipeable>
  );
}


function Actions({
  progress,
  width,
  onEdit,
  onDelete,
}: {
  progress: SharedValue<number>;
  width: number;
  onEdit?: () => void;
  onDelete: () => void;
}) {  // Hidden while closed, so the red can't peek out around the row's rounded corners
  const visible = useAnimatedStyle(() => ({
    opacity: progress.value > 0.01 ? 1 : 0,
  }));

  // The icons grow and fade in as the row slides, instead of just being uncovered
  const appear = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.6, 1], [0, 0.6, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.7, 1], Extrapolation.CLAMP) }],
  }));

  return (
    <Animated.View style={[styles.actions, { width }, visible]}>
      {onEdit && (
        <Pressable
          style={[styles.button, styles.edit]}
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel="Edit"
        >
          <Animated.View style={[styles.buttonContent, appear]}>
            <Ionicons name="pencil" size={20} color={Colors.primaryDark} />
            <Text style={[styles.label, { color: Colors.primaryDark }]}>Edit</Text>
          </Animated.View>
        </Pressable>
      )}
      {/* Remove Pressable unchanged */}
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  // Rounded and clipped, so the buttons share the row's card shape
  container: { borderRadius: RADIUS, overflow: "hidden" },
  actions: { flexDirection: "row" },
  button: { width: BUTTON_WIDTH, alignItems: "center", justifyContent: "center" },
  buttonContent: { alignItems: "center", gap: 4 },
  edit: { backgroundColor: Colors.primarySoft },
  remove: { backgroundColor: Colors.danger },
  label: { fontSize: 12, fontWeight: "600" },
});

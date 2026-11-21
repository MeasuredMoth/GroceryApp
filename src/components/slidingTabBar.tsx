import { useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { Colors } from "@/constants/Colors";

const BAR_HEIGHT = 56;
const INDICATOR_INSET = 6;
const SLIDE_DURATION = 220;

export default function SlidingTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
}: BottomTabBarProps) {
  const [barWidth, setBarWidth] = useState(0);

  const routes = state.routes.filter((route) => !descriptors[route.key].options.hidden);
  const focusedKey = state.routes[state.index]?.key;
  const activeIndex = Math.max(0, routes.findIndex((route) => route.key === focusedKey));
  const tabWidth = routes.length > 0 ? barWidth / routes.length : 0;

  const indicatorStyle = useAnimatedStyle(() => ({
    width: Math.max(0, tabWidth - INDICATOR_INSET * 2),
    transform: [
      {
        translateX: withTiming(activeIndex * tabWidth + INDICATOR_INSET, {
          duration: SLIDE_DURATION,
        }),
      },
    ],
  }));

  const onLayout = (e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.row} onLayout={onLayout} role="tablist">
        {barWidth > 0 && (
          <Animated.View pointerEvents="none" style={[styles.indicator, indicatorStyle]} />
        )}

        {routes.map((route) => {
          const { options } = descriptors[route.key];
          const focused = route.key === focusedKey;
          const color = focused ? Colors.primaryDark : Colors.textMuted;
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : options.title ?? route.name;

          const onPress = () => {
            const event = emitter.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigateToTab(route.key);
            }
          };

          return (
            <Pressable
              key={route.key}
              role="tab"
              aria-selected={focused}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              onPress={onPress}
              style={styles.tab}
            >
              {options.tabBarIcon?.({ focused, color, size: 24 })}
              <Text numberOfLines={1} style={[styles.label, { color }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  row: {
    height: BAR_HEIGHT,
    flexDirection: "row",
  },
  indicator: {
    position: "absolute",
    top: INDICATOR_INSET,
    bottom: INDICATOR_INSET,
    left: 0,
    borderRadius: 12,
    backgroundColor: Colors.primarySoft,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  label: {
    fontSize: 12,
  },
});


import { Pressable, StyleSheet, Text, View } from "react-native";
import { AlertTriangle, CheckCircle2 } from "lucide-react-native";

export interface NextExpiringItem {
  name: string;
  /** Days until expiry. 0 = today, negative = already expired. */
  daysLeft: number;
}

export interface PantryResumeProps {
  totalItems: number;
  /** Number of items expiring within your "soon" window (e.g. 3 days). */
  expiringSoonCount: number;
  /** The single item that expires first. Used for the subtitle. */
  nextExpiring?: NextExpiringItem;
  /** Called when the warning pill is pressed, e.g. to filter the list. */
  onExpiringPress?: () => void;
}

const COLORS = {
  surface: "#FFFFFF",
  title: "#171717",
  subtitle: "#737373",
  warningBg: "#FEF2F2",
  warningFg: "#DC2626",
  okBg: "#ECFDF5",
  okFg: "#047857",
};

function formatDaysLeft(days: number): string {
  if (days < 0) return "expired";
  if (days === 0) return "expires today";
  if (days === 1) return "expires tomorrow";
  return `expires in ${days} days`;
}

function getSubtitle(
  expiringSoonCount: number,
  nextExpiring?: NextExpiringItem
): string {
  if (nextExpiring && expiringSoonCount > 0) {
    return `${nextExpiring.name} ${formatDaysLeft(nextExpiring.daysLeft)}`;
  }
  if (nextExpiring) {
    return `Next up: ${nextExpiring.name} ${formatDaysLeft(nextExpiring.daysLeft)}`;
  }
  return "Nothing expiring soon";
}

export default function PantryResume({
  totalItems,
  expiringSoonCount,
  nextExpiring,
  onExpiringPress,
}: PantryResumeProps) {
  const hasWarning = expiringSoonCount > 0; 
  const subtitle = getSubtitle(expiringSoonCount, nextExpiring);
  const fg = hasWarning ? COLORS.warningFg : COLORS.okFg;
  const label = hasWarning ? `${expiringSoonCount} expiring soon` : "All fresh";
  const Icon = hasWarning ? AlertTriangle : CheckCircle2;

  const pillContent = (
    <>
      <Icon size={16} color={fg} />
      <Text style={[styles.pillText, { color: fg }]}>{label}</Text>
    </>
  );

  const pillStyle = [
    styles.pill,
    { backgroundColor: hasWarning ? COLORS.warningBg : COLORS.okBg },
  ];

  return (
    <View style={styles.card} accessibilityLabel="Pantry summary">
      <View style={styles.textBlock}>
        <Text style={styles.title}>
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      {hasWarning && onExpiringPress ? (
        <Pressable
          onPress={onExpiringPress}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={({ pressed }) => [pillStyle, pressed && styles.pillPressed]}
        >
          {pillContent}
        </Pressable>
      ) : (
        <View style={pillStyle} accessible accessibilityLabel={label}>
          {pillContent}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.title,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: COLORS.subtitle,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillPressed: {
    opacity: 0.7,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
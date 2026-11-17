import { Text, View, StyleSheet, Pressable } from "react-native";

import Entypo from '@expo/vector-icons/Entypo'; //website for vector icons: https://icons.expo.fyi/Index
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from "@/constants/Colors";
import { ReactNode } from "react";
import { Href, router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";


type HeaderProps = {
  icon?: ReactNode;
  textHeader: string;
  firstSubheading?: string;
  secondSubheading?: string;
  action?: ReactNode;
};

export default function Header({ icon, textHeader, firstSubheading, secondSubheading, action }: HeaderProps) {
  return (
    <View style={styles.container}>
      {/* Layer 1: app bar */}
      <View style={styles.topRow}>
  <View style={styles.brand}>
    {icon}
    <Text style={styles.brandName}>{textHeader}</Text>
  </View>

  <View style={styles.topRight}>
    {action}
    <Pressable
      style={styles.profileButton}
      onPress={() => router.push("/settings" as Href)}
      accessibilityRole="button"
      accessibilityLabel="Settings"
    >
      <Ionicons name="person-outline" size={20} color={Colors.primaryDark} />
    </Pressable>
  </View>
</View>

<View style={styles.subheadingText}>
  {firstSubheading ? <Text style={styles.greeting}>{firstSubheading}</Text> : null}
  {secondSubheading ? <Text style={styles.tagline}>{secondSubheading}</Text> : null}
</View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    gap: 6,         /*Puts a gap (vertical) between each child*/
  },
  topRow: {
    flexDirection: 'row',               /*The default is vertical*/
    justifyContent: 'space-between',    //How the content is distributed in the axis (in this case on the two opposite sides)
    alignItems: 'center',               //How the content is aligned vertically 
  },
  brand: {
    flexDirection: 'row',               //In which direction items are placed (left to right in this case)
    alignItems: 'center',
    gap: 8,
  },
topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
profileButton: {
  width: 36,            // was 48
  height: 36,
  borderRadius: 18,
  backgroundColor: '#DCEFE4',
  alignItems: 'center',
  justifyContent: 'center',
},
brandName: { fontSize: 28, fontWeight: '700', color: '#0d3332' },  // was 34
  greeting: {
    fontSize: 20,          // was 26
    fontWeight: '700',
    color: '#0f4d3a',
    marginTop: 4,          // was 8
  },
  tagline: {
    fontSize: 16,
    color: '#6B7A72',
  },
subheadingRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
},
subheadingText: {
  flex: 1,
  gap: 4,
},
action: {
  flexDirection: 'row',
},
appName: { fontSize: 18, fontWeight: '700', color: '#0d3332' },
titleRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',   // button lines up with the title, not the subtitle
  gap: 12,
},
titleBlock: { flex: 1, gap: 2 },
});
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';


//Temporary until data structure reception
type Ingredient = {
  id: string;
  name: string;
  category: string;
  kcal: number;
  price: number;
  unit: string;
};

type IngredientRowProps = {
  ingredient: Ingredient;
};

export default function IngredientRow( {ingredient}: IngredientRowProps ) {
  return (
    <Pressable style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{ingredient.name}</Text>
        <Text style={styles.details}>
          {ingredient.category} · {ingredient.kcal} kcal / 100 g
        </Text>
      </View>

      <View style={styles.priceBlock}>
        <Text style={styles.price}>${ingredient.price.toFixed(2)}</Text>
        <Text style={styles.unit}>/ {ingredient.unit}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  details: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 2,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  unit: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});
// Generated color palette useful to style the UI

export const Colors = {
  // Brand greens
  primary: '#2E7D4F',        // buttons, active tab, plus icon
  primaryDark: '#1F5D3A',    // titles ("GroceryMeal", "Today")
  primarySoft: '#DCEFE4',    // profile button, soft green fills

  // Backgrounds
  background: '#F5FAF7',     // screen background
  card: '#FFFFFF',           // section cards
  border: '#E3EBE6',         // thin lines around rows, tab bar divider

  // Text
  textDark: '#1F2A24',       // main text (meal names)
  textMuted: '#6B7A72',      // ingredients lists, dates, inactive tabs
  textOnPrimary: '#FFFFFF',  // text on green buttons

  // Meal types: icon color + pastel background
  breakfast: '#E8943A',
  breakfastBg: '#FFF1DC',
  lunch: '#4CAF6A',
  lunchBg: '#E3F4E8',
  snack: '#8E5BB5',
  snackBg: '#EFE4F7',
  dinner: '#3B82D6',
  dinnerBg: '#E3EEFB',

  // Quick stats tiles
  statRecipesBg: '#E3F4E8',
  statIngredientsBg: '#EFE4F7',
  statPantryBg: '#E3EEFB',
  statCostBg: '#FFF1DC',
  statCostText: '#B5651D',

  // Action tiles
  addIngredientBg: '#E3F4E8',
  addRecipeBg: '#E3EEFB',
  addRecipeIcon: '#3B82D6',

  // Status
  success: '#2E7D4F',
  danger: '#D64545',
} as const;
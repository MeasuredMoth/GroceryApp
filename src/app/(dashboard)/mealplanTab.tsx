import { useRef, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import dayjs from "dayjs";
import Screen from "@/components/Screen";
import Header from "@/components/header";
import DaySelector from "@/components/daySelector";
import { DayScreen } from "@/components/dayScreen";
import RecipePickerModal from "@/components/recipePickerModal";
import {
  addMeal,
  createEmptyPlan,
  createMeal,
  editMeal,
  EditScope,
  hasOverride,
  Meal,
  mealsFor,
  MealType,
  Plan,
  resetDay,
  weekdayOf,
} from "../../../data/recipe/meal-plan";
import { Recipe, recipeToItems } from "../../../data/recipe/recipe";

// Time given to a meal created from the picker. Meal times become editable later.
const DEFAULT_TIMES: Record<MealType, string> = {
  Breakfast: "08:00",
  Lunch: "12:30",
  Dinner: "19:00",
  Snack: "16:00",
};

const WEEKS = 8; // how many weeks you can swipe to on each side of this one

// Starts on a Monday, so index % 7 is the position inside the week strip.
function buildDays(): Date[] {
  const today = dayjs().startOf("day");
  const monday = today.subtract((today.day() + 6) % 7, "day");
  const start = monday.subtract(WEEKS, "week");
  return Array.from({ length: (WEEKS * 2 + 1) * 7 }, (_, i) =>
    start.add(i, "day").toDate(),
  );
}

const DAYS = buildDays();
const TODAY_INDEX = WEEKS * 7 + ((new Date().getDay() + 6) % 7);

export default function MealPlanTab() {
  // Own state for now. Swap for the shared plan once the JSON storage exists.
  const [plan, setPlan] = useState<Plan>(createEmptyPlan);
  const [selected, setSelected] = useState(TODAY_INDEX);
  const [pageWidth, setPageWidth] = useState(0);
  const [pickerFor, setPickerFor] = useState<MealType | null>(null);
  const listRef = useRef<FlatList<Date>>(null);

  const date = DAYS[selected];
  const weekStart = selected - (selected % 7);
  const week = DAYS.slice(weekStart, weekStart + 7);

  // Tapping the week strip jumps to that day. Swiping updates `selected` in onScroll.
  const goTo = (index: number) => {
    setSelected(index);
    listRef.current?.scrollToIndex({ index, animated: false });
  };

  const addRecipe = (recipe: Recipe, scope: EditScope) => {
    if (!pickerFor) return;
    const type = pickerFor;
    const items = recipeToItems(recipe);
    setPlan((p) => {
      const existing = mealsFor(p, date).find((m) => m.type === type);
      return existing
        ? editMeal(p, date, { ...existing, items: [...existing.items, ...items] }, scope)
        : addMeal(p, date, createMeal(type, DEFAULT_TIMES[type], items), scope);
    });
    setPickerFor(null);
  };

  const removeItem = (d: Date, meal: Meal, index: number) => {
    setPlan((p) =>
      editMeal(p, d, { ...meal, items: meal.items.filter((_, i) => i !== index) }, "day"),
    );
  };

  return (
    <Screen>
      <View style={styles.headerContainer}>
        <Header
          textHeader="Meal Plan"
          secondSubheading="Swipe between days to see or change your plan."
        />
      </View>

      <DaySelector days={week} selected={selected % 7} onSelect={(i) => goTo(weekStart + i)} />

      {hasOverride(plan, date) && (
        <Pressable onPress={() => setPlan((p) => resetDay(p, date))}>
          <Text style={styles.reset}>
            Changed for this day only. Tap to go back to every {weekdayOf(date)}.
          </Text>
        </Pressable>
      )}

      <View style={styles.pager} onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}>
        {pageWidth > 0 && (
          <FlatList
            ref={listRef}
            data={DAYS}
            extraData={plan}
            keyExtractor={(d) => d.toISOString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={TODAY_INDEX}
            getItemLayout={(_, i) => ({ length: pageWidth, offset: pageWidth * i, index: i })}
            scrollEventThrottle={16}
            onScroll={(e) => setSelected(Math.round(e.nativeEvent.contentOffset.x / pageWidth))}
            renderItem={({ item }) => (
              <ScrollView
                style={{ width: pageWidth }}
                contentContainerStyle={styles.page}
                showsVerticalScrollIndicator={false}
              >
                <DayScreen
                  date={item}
                  plan={plan}
                  onAdd={setPickerFor}
                  onRemoveItem={(meal, i) => removeItem(item, meal, i)}
                />
              </ScrollView>
            )}
          />
        )}
      </View>

      <RecipePickerModal
        type={pickerFor}
        weekday={weekdayOf(date)}
        onPick={addRecipe}
        onClose={() => setPickerFor(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: { paddingHorizontal: 16, paddingBottom: 12 },
  reset: { color: "#0f4d3a", fontSize: 13, paddingHorizontal: 16, paddingTop: 10 },
  pager: { flex: 1, marginTop: 16 },
  page: { paddingHorizontal: 16, paddingBottom: 24 },
});
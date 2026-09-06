import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MealPlanItem, MealType } from '../../types';
import { STORE_METADATA } from '../../data/defaultData';
import { AddMealModal } from './AddMealModal';
import { CookingConfirmModal } from './CookingConfirmModal';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Flame,
  CheckCircle2,
  Trash2,
  ShoppingCart,
  Clock,
  Sparkles,
  RotateCcw,
  Check,
  Edit2
} from 'lucide-react';

export const MealPlannerView: React.FC = () => {
  const {
    mealPlans,
    selectedDate,
    setSelectedDate,
    removeMealPlan,
    updateMealPlan,
    unmarkMealCooked,
    addMissingIngredientsToGrocery,
    dailyGoals,
    userProfile,
    updateUserProfile
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeMealTypeForAdd, setActiveMealTypeForAdd] = useState<MealType>('lunch');
  const [selectedMealForCooking, setSelectedMealForCooking] = useState<MealPlanItem | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [editingMealExclusionsId, setEditingMealExclusionsId] = useState<string | null>(null);

  // Helper to generate 7 days around selected date or current week
  const getWeekDates = (centerDateStr: string) => {
    const centerDate = new Date(centerDateStr + 'T00:00:00');
    // Find Monday of this week
    const dayOfWeek = centerDate.getDay(); // 0 is Sunday, 1 is Monday...
    const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const monday = new Date(centerDate);
    monday.setDate(centerDate.getDate() + diff);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d.toISOString().split('T')[0]);
    }
    return week;
  };

  const weekDates = getWeekDates(selectedDate);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const cur = new Date(selectedDate + 'T00:00:00');
    cur.setDate(cur.getDate() + (direction === 'prev' ? -7 : 7));
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const mealsOnSelectedDate = mealPlans.filter(m => m.date === selectedDate);

  // Calculate day totals
  const totalCalories = mealsOnSelectedDate.reduce((sum, m) => sum + m.nutrition.calories, 0);
  const totalProtein = mealsOnSelectedDate.reduce((sum, m) => sum + m.nutrition.protein, 0);
  const totalCarbs = mealsOnSelectedDate.reduce((sum, m) => sum + m.nutrition.carbs, 0);
  const totalFats = mealsOnSelectedDate.reduce((sum, m) => sum + m.nutrition.fats, 0);

  const mealSections: { type: MealType; label: string; icon: string }[] = [
    { type: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { type: 'lunch', label: 'Lunch', icon: '☀️' },
    { type: 'dinner', label: 'Dinner', icon: '🌙' },
  ];

  if (userProfile?.includeSnacksInPlanner !== false) {
    mealSections.push({ type: 'snack', label: 'Snacks & Light Bites', icon: '🍎' });
  }

  if (userProfile?.includeDessertsInPlanner !== false) {
    mealSections.push({ type: 'dessert', label: 'Desserts & Sweet Treats', icon: '🍨' });
  }

  const handleOpenAddForSlot = (type: MealType) => {
    setActiveMealTypeForAdd(type);
    setIsAddModalOpen(true);
  };

  const handleManualAddIngredients = (meal: MealPlanItem) => {
    if (!meal.ingredients || meal.ingredients.length === 0) return;
    const activeIngredients = meal.ingredients.filter(
      i => !(meal.excludedIngredientIds || []).includes(i.id)
    );
    const addedCount = addMissingIngredientsToGrocery(activeIngredients, meal.customTitle);
    const excludedCount = (meal.excludedIngredientIds || []).length;
    setFeedbackBanner(
      `Added ${addedCount} missing ingredients for ${meal.customTitle} to your grocery list` +
      (excludedCount > 0 ? ` (${excludedCount} excluded veggies omitted)` : '') +
      `!`
    );
    setTimeout(() => setFeedbackBanner(null), 4000);
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-5xl mx-auto">
      {/* Week Navigator */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600" />
            <h2 className="font-black text-slate-900 text-base sm:text-lg">Weekly Meal Calendar</h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Slot Visibility Toggles */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => updateUserProfile({ includeSnacksInPlanner: userProfile?.includeSnacksInPlanner === false ? true : false })}
                className={`px-2 py-0.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                  userProfile?.includeSnacksInPlanner !== false
                    ? 'bg-amber-100 text-amber-900 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Toggle snack slots in planner"
              >
                <span>🍎</span>
                <span className="hidden sm:inline">Snacks</span>
                <span className="text-[10px]">{userProfile?.includeSnacksInPlanner !== false ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => updateUserProfile({ includeDessertsInPlanner: userProfile?.includeDessertsInPlanner === false ? true : false })}
                className={`px-2 py-0.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                  userProfile?.includeDessertsInPlanner !== false
                    ? 'bg-pink-100 text-pink-900 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Toggle dessert slots in planner"
              >
                <span>🍨</span>
                <span className="hidden sm:inline">Desserts</span>
                <span className="text-[10px]">{userProfile?.includeDessertsInPlanner !== false ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                title="Previous Week"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateWeek('next')}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                title="Next Week"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Days Pill Bar */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekDates.map((dateStr, idx) => {
            const isSelected = dateStr === selectedDate;
            const dayNum = parseInt(dateStr.split('-')[2], 10);
            const countForDay = mealPlans.filter(m => m.date === dateStr).length;
            const isCurrentDay = isToday(dateStr);

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex flex-col items-center py-2 sm:py-3 rounded-xl transition-all relative ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100'
                }`}
              >
                <span className={`text-[11px] font-semibold uppercase ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {dayNames[idx]}
                </span>
                <span className="text-sm sm:text-base font-black my-0.5">
                  {dayNum}
                </span>

                {/* Indicators: Today dot or meal count */}
                <div className="flex items-center gap-1 h-3 mt-0.5">
                  {isCurrentDay && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                  {countForDay > 0 && (
                    <span
                      className={`text-[9px] px-1 rounded-full font-bold leading-none ${
                        isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {countForDay}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{feedbackBanner}</span>
          </div>
          <button onClick={() => setFeedbackBanner(null)} className="text-emerald-700 font-bold ml-2">×</button>
        </div>
      )}

      {/* Selected Day Header & Macro Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-4 sm:p-5 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-black">{formatDisplayDate(selectedDate)}</h3>
            {isToday(selectedDate) && (
              <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                Today
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Planned Nutrition: <strong className="text-white">{totalCalories}</strong> of {dailyGoals.calories} kcal goal
          </p>
        </div>

        {/* Macros Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-center">
            <div className="text-[10px] text-slate-300 font-medium">Protein</div>
            <div className="text-xs sm:text-sm font-bold text-emerald-300">{totalProtein}g</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-center">
            <div className="text-[10px] text-slate-300 font-medium">Carbs</div>
            <div className="text-xs sm:text-sm font-bold text-amber-300">{totalCarbs}g</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-center">
            <div className="text-[10px] text-slate-300 font-medium">Fats</div>
            <div className="text-xs sm:text-sm font-bold text-rose-300">{totalFats}g</div>
          </div>

          <button
            onClick={() => handleOpenAddForSlot('lunch')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Plan Meal</span>
          </button>
        </div>
      </div>

      {/* Meal Slots List */}
      <div className="space-y-5">
        {mealSections.map(({ type, label, icon }) => {
          const mealsInSlot = mealsOnSelectedDate.filter(m => m.mealType === type);

          return (
            <div key={type} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{icon}</span>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base capitalize">{label}</h4>
                  <span className="text-xs text-slate-400 font-medium">({mealsInSlot.length})</span>
                </div>
                <button
                  onClick={() => handleOpenAddForSlot(type)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add {label}</span>
                </button>
              </div>

              {mealsInSlot.length === 0 ? (
                <div 
                  onClick={() => handleOpenAddForSlot(type)}
                  className="border-2 border-dashed border-slate-200 hover:border-emerald-300 rounded-xl p-6 text-center cursor-pointer transition-colors group"
                >
                  <p className="text-xs text-slate-400 group-hover:text-emerald-700 font-medium">
                    No {label.toLowerCase()} planned yet. Tap to add a dish from your recipe book.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mealsInSlot.map((meal) => (
                    <div
                      key={meal.id}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                        meal.isCooked
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-white hover:border-slate-300 border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl mt-0.5">{meal.isLeftover ? '🧊' : '🥘'}</span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-sm sm:text-base text-slate-900">
                                {meal.customTitle}
                              </h5>
                              <span className="text-xs text-slate-500 font-medium">
                                ({meal.servings} serving{meal.servings > 1 ? 's' : ''})
                              </span>
                              {meal.isLeftover && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                                  🧊 Ready in Fridge
                                </span>
                              )}
                              {meal.isCooked && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Eaten & Logged to Calories
                                </span>
                              )}
                            </div>

                            {/* Macro Pills */}
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                🔥 {meal.nutrition.calories} kcal
                              </span>
                              <span className="text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                {meal.nutrition.protein}g Protein
                              </span>
                              <span className="text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                {meal.nutrition.carbs}g Carbs
                              </span>
                              <span className="text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                {meal.nutrition.fats}g Fat
                              </span>
                              {meal.nutrition.fiber > 0 && (
                                <span className="text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                  {meal.nutrition.fiber}g Fiber
                                </span>
                              )}
                            </div>

                            {/* Ingredients with Store Tags and Exclusions */}
                            {!meal.isLeftover && meal.ingredients && meal.ingredients.length > 0 && (
                              <div className="mt-2.5 space-y-1.5">
                                {editingMealExclusionsId === meal.id ? (
                                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-fadeIn">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                        <span>🥦</span>
                                        <span>Toggle Veggie & Item Exclusions:</span>
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setEditingMealExclusionsId(null)}
                                        className="text-[11px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-md transition-colors"
                                      >
                                        Done
                                      </button>
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                      Tap items to include or exclude from this meal (and groceries):
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 pt-1 max-h-36 overflow-y-auto">
                                      {meal.ingredients.map(ing => {
                                        const isExcluded = (meal.excludedIngredientIds || []).includes(ing.id);
                                        const isProduce = ing.department === 'Produce';
                                        return (
                                          <button
                                            key={ing.id}
                                            type="button"
                                            onClick={() => {
                                              const currentEx = meal.excludedIngredientIds || [];
                                              const newEx = isExcluded
                                                ? currentEx.filter(id => id !== ing.id)
                                                : [...currentEx, ing.id];
                                              updateMealPlan({
                                                ...meal,
                                                excludedIngredientIds: newEx
                                              });
                                            }}
                                            className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                                              isExcluded
                                                ? 'bg-rose-50 text-rose-800 border-rose-300 line-through opacity-75'
                                                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                                            }`}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={!isExcluded}
                                              onChange={() => {}}
                                              className="w-3 h-3 text-emerald-600 rounded cursor-pointer pointer-events-none"
                                            />
                                            <span>{ing.name} ({ing.quantity})</span>
                                            {isProduce && <span className="text-[10px]">🥬</span>}
                                            {isExcluded && <span className="text-[9px] font-bold text-rose-600">Omitted</span>}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[11px] text-slate-400 font-medium">Ingredients:</span>
                                      {meal.ingredients
                                        .filter(i => !(meal.excludedIngredientIds || []).includes(i.id))
                                        .slice(0, 4)
                                        .map(ing => {
                                          const storeMeta = STORE_METADATA[ing.store];
                                          return (
                                            <span
                                              key={ing.id}
                                              className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${storeMeta.badgeClass}`}
                                            >
                                              {ing.name}
                                            </span>
                                          );
                                        })}
                                      {meal.ingredients.filter(i => !(meal.excludedIngredientIds || []).includes(i.id)).length > 4 && (
                                        <span className="text-[10px] text-slate-400 font-medium">
                                          +{meal.ingredients.filter(i => !(meal.excludedIngredientIds || []).includes(i.id)).length - 4} more
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => setEditingMealExclusionsId(meal.id)}
                                        className="text-[10px] text-slate-500 hover:text-emerald-700 font-semibold inline-flex items-center gap-0.5 ml-1 transition-colors"
                                        title="Edit excluded veggies for this planned meal"
                                      >
                                        <Edit2 className="w-2.5 h-2.5" />
                                        <span>Edit Exclusions</span>
                                      </button>
                                    </div>

                                    {/* Excluded Veggies / Ingredients Callout */}
                                    {(meal.excludedIngredientIds && meal.excludedIngredientIds.length > 0) && (
                                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                        <button
                                          type="button"
                                          onClick={() => setEditingMealExclusionsId(meal.id)}
                                          className="text-[10px] text-rose-700 font-bold bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1 text-left transition-colors cursor-pointer"
                                          title="Click to view and edit omitted ingredients"
                                        >
                                          <span>🚫</span>
                                          <span>Omitted: {
                                            meal.ingredients
                                              .filter(i => meal.excludedIngredientIds?.includes(i.id))
                                              .map(i => i.name)
                                              .join(', ') || `${meal.excludedIngredientIds.length} ingredients`
                                          }</span>
                                          <span className="underline ml-0.5 text-[9px] text-rose-600 font-normal">(change)</span>
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {meal.isCooked ? (
                            <button
                              onClick={() => unmarkMealCooked(meal.id)}
                              className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
                              title="Undo cooked status"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Undo</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedMealForCooking(meal)}
                              className="text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{meal.isLeftover ? 'Eat Leftover' : 'Cook / Eat'}</span>
                            </button>
                          )}

                          {!meal.isLeftover && meal.ingredients && meal.ingredients.length > 0 && (
                            <button
                              onClick={() => handleManualAddIngredients(meal)}
                              className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors"
                              title="Ensure all ingredients are on grocery list"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => removeMealPlan(meal.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                            title="Remove meal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <AddMealModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultDate={selectedDate}
        defaultMealType={activeMealTypeForAdd}
      />

      {selectedMealForCooking && (
        <CookingConfirmModal
          meal={selectedMealForCooking}
          isOpen={!!selectedMealForCooking}
          onClose={() => setSelectedMealForCooking(null)}
        />
      )}
    </div>
  );
};

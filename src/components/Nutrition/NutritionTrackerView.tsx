import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NutritionLogEntry, MealType } from '../../types';
import {
  Flame,
  Droplets,
  Plus,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Target,
  Sparkles,
  X,
  PieChart,
  CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const NutritionTrackerView: React.FC = () => {
  const {
    nutritionLogs,
    selectedDate,
    setSelectedDate,
    dailyRecords,
    dailyGoals,
    addQuickLog,
    removeNutritionLog,
    updateWaterIntake
  } = useApp();

  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickMealType, setQuickMealType] = useState<MealType>('snack');
  const [quickCalories, setQuickCalories] = useState('250');
  const [quickProtein, setQuickProtein] = useState('15');
  const [quickCarbs, setQuickCarbs] = useState('30');
  const [quickFats, setQuickFats] = useState('8');
  const [quickFiber, setQuickFiber] = useState('3');

  // Logs for selected date
  const logsForDate = nutritionLogs.filter(l => l.date === selectedDate);
  const waterForDate = dailyRecords[selectedDate]?.waterIntake || 0;

  // Calculate totals for selected date
  const totalCalories = logsForDate.reduce((sum, l) => sum + (l.nutrition.calories || 0), 0);
  const totalProtein = logsForDate.reduce((sum, l) => sum + (l.nutrition.protein || 0), 0);
  const totalCarbs = logsForDate.reduce((sum, l) => sum + (l.nutrition.carbs || 0), 0);
  const totalFats = logsForDate.reduce((sum, l) => sum + (l.nutrition.fats || 0), 0);
  const totalFiber = logsForDate.reduce((sum, l) => sum + (l.nutrition.fiber || 0), 0);

  const caloriesRemaining = dailyGoals.calories - totalCalories;
  const caloriePercent = Math.min(100, Math.round((totalCalories / dailyGoals.calories) * 100));

  const proteinPercent = Math.min(100, Math.round((totalProtein / dailyGoals.protein) * 100));
  const carbsPercent = Math.min(100, Math.round((totalCarbs / dailyGoals.carbs) * 100));
  const fatsPercent = Math.min(100, Math.round((totalFats / dailyGoals.fats) * 100));
  const fiberPercent = Math.min(100, Math.round((totalFiber / dailyGoals.fiber) * 100));
  const waterPercent = Math.min(100, Math.round((waterForDate / dailyGoals.water) * 100));

  const handleQuickLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addQuickLog({
      date: selectedDate,
      title: quickTitle.trim(),
      mealType: quickMealType,
      nutrition: {
        calories: Number(quickCalories) || 0,
        protein: Number(quickProtein) || 0,
        carbs: Number(quickCarbs) || 0,
        fats: Number(quickFats) || 0,
        fiber: Number(quickFiber) || 0,
      }
    });

    setQuickTitle('');
    setIsQuickLogOpen(false);
  };

  const handleWaterClick = (delta: number) => {
    updateWaterIntake(selectedDate, delta);
    if (delta > 0 && waterForDate + delta >= dailyGoals.water && waterForDate < dailyGoals.water) {
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}
    }
  };

  const navigateDate = (deltaDays: number) => {
    const cur = new Date(selectedDate + 'T00:00:00');
    cur.setDate(cur.getDate() + deltaDays);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-5xl mx-auto">
      {/* Date Switcher Header */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateDate(-1)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base sm:text-lg text-slate-900">
                {formatDisplayDate(selectedDate)}
              </h2>
              {isToday && (
                <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">Track calories, macro balance, and hydration</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isToday && (
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Go to Today
            </button>
          )}
          <button
            onClick={() => navigateDate(1)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Calorie & Nutrition Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calorie Hero Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-black tracking-wider text-emerald-200 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
                Daily Calorie Target
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                Goal: {dailyGoals.calories} kcal
              </span>
            </div>

            <div className="text-center my-4">
              <div className="text-5xl sm:text-6xl font-black tracking-tight">
                {totalCalories}
              </div>
              <div className="text-sm font-semibold text-emerald-100 mt-1">
                kcal consumed
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/20">
            <div className="flex justify-between text-xs font-bold">
              <span>{caloriePercent}% of goal reached</span>
              <span>
                {caloriesRemaining >= 0
                  ? `${caloriesRemaining} kcal remaining`
                  : `${Math.abs(caloriesRemaining)} kcal over budget`}
              </span>
            </div>

            {/* Calorie Progress Bar */}
            <div className="w-full h-3 rounded-full bg-black/20 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  caloriePercent > 100 ? 'bg-rose-400' : 'bg-white shadow-sm'
                }`}
                style={{ width: `${Math.min(100, caloriePercent)}%` }}
              />
            </div>

            <button
              onClick={() => setIsQuickLogOpen(true)}
              className="w-full py-2.5 bg-white text-emerald-900 rounded-2xl font-bold text-xs sm:text-sm hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Quick Log Food / Snack</span>
            </button>
          </div>
        </div>

        {/* Macro Breakdown Progress Cards */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-slate-900 text-base sm:text-lg">Macronutrients & Fiber</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Daily Goals</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Protein */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-sm text-emerald-900">Protein</span>
                <span className="text-xs font-black text-emerald-700">{totalProtein} / {dailyGoals.protein}g</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-emerald-200/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-emerald-800 font-medium mt-1.5 text-right">
                {proteinPercent}% completed
              </div>
            </div>

            {/* Carbs */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-sm text-amber-900">Carbohydrates</span>
                <span className="text-xs font-black text-amber-700">{totalCarbs} / {dailyGoals.carbs}g</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-amber-200/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${carbsPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-amber-800 font-medium mt-1.5 text-right">
                {carbsPercent}% completed
              </div>
            </div>

            {/* Fats */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-sm text-rose-900">Dietary Fats</span>
                <span className="text-xs font-black text-rose-700">{totalFats} / {dailyGoals.fats}g</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-rose-200/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${fatsPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-rose-800 font-medium mt-1.5 text-right">
                {fatsPercent}% completed
              </div>
            </div>

            {/* Fiber */}
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-sm text-teal-900">Dietary Fiber</span>
                <span className="text-xs font-black text-teal-700">{totalFiber} / {dailyGoals.fiber}g</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-teal-200/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal-600 transition-all duration-500"
                  style={{ width: `${fiberPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-teal-800 font-medium mt-1.5 text-right">
                {fiberPercent}% completed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Water Hydration Tracker */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-100 text-cyan-700">
              <Droplets className="w-6 h-6 fill-cyan-500 text-cyan-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-900">Daily Water Intake</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                  {waterPercent}%
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Logged: <strong className="text-cyan-800 font-bold">{waterForDate} ml</strong> / Goal: {dailyGoals.water} ml ({Math.round(dailyGoals.water / 250)} glasses)
              </p>
            </div>
          </div>

          {/* Quick Water Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleWaterClick(-250)}
              disabled={waterForDate <= 0}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              - 1 Glass
            </button>
            <button
              onClick={() => handleWaterClick(250)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm flex items-center gap-1 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ 250 ml (1 Glass)</span>
            </button>
            <button
              onClick={() => handleWaterClick(500)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm flex items-center gap-1 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ 500 ml (Bottle)</span>
            </button>
          </div>
        </div>

        {/* Glasses Visual Grid */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {Array.from({ length: Math.max(10, Math.ceil(dailyGoals.water / 250)) }).map((_, index) => {
            const isDrank = (index + 1) * 250 <= waterForDate;
            return (
              <button
                key={index}
                onClick={() => {
                  if (isDrank) {
                    updateWaterIntake(selectedDate, -250);
                  } else {
                    handleWaterClick(250);
                  }
                }}
                className={`p-2.5 rounded-xl border transition-all flex flex-col items-center justify-center ${
                  isDrank
                    ? 'bg-cyan-50 border-cyan-300 text-cyan-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-300 hover:border-cyan-200'
                }`}
                title={`Glass ${index + 1} (250ml)`}
              >
                <Droplets className={`w-5 h-5 ${isDrank ? 'fill-cyan-500 text-cyan-600' : 'text-slate-300'}`} />
                <span className="text-[9px] font-bold mt-1 text-slate-500">{(index + 1) * 250}ml</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Logged Foods Timeline */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="font-black text-slate-900 text-base sm:text-lg">Logged Foods & Meals</h3>
            <p className="text-xs text-slate-500">Meals marked as cooked in your planner automatically show here</p>
          </div>
          <button
            onClick={() => setIsQuickLogOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Log</span>
          </button>
        </div>

        {logsForDate.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <p className="text-sm font-semibold text-slate-700">No foods logged for this day yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Mark a planned meal as "Cooked" in the Planner, or tap "Quick Log" to record a snack or meal.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logsForDate.map(log => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase mt-0.5">
                    {log.mealType.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">{log.title}</h4>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {log.mealType}
                      </span>
                    </div>
                    {/* Nutrition pills */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs font-bold text-emerald-700">
                        🔥 {log.nutrition.calories} kcal
                      </span>
                      <span className="text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        P: {log.nutrition.protein}g
                      </span>
                      <span className="text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        C: {log.nutrition.carbs}g
                      </span>
                      <span className="text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        F: {log.nutrition.fats}g
                      </span>
                      {log.nutrition.fiber > 0 && (
                        <span className="text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          Fiber: {log.nutrition.fiber}g
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeNutritionLog(log.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 self-end sm:self-center transition-colors"
                  title="Remove log entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Log Modal */}
      {isQuickLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-600" />
                Quick Log Food / Snack
              </h3>
              <button onClick={() => setIsQuickLogOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickLogSubmit} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Food or Snack Name</label>
                <input
                  type="text"
                  placeholder="e.g. Protein Bar, Chai & Almonds, Greek Yogurt"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  required
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meal Slot</label>
                <select
                  value={quickMealType}
                  onChange={(e) => setQuickMealType(e.target.value as MealType)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={quickCalories}
                    onChange={(e) => setQuickCalories(e.target.value)}
                    required
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={quickProtein}
                    onChange={(e) => setQuickProtein(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={quickCarbs}
                    onChange={(e) => setQuickCarbs(e.target.value)}
                    className="w-full text-xs sm:text-sm px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fats (g)</label>
                  <input
                    type="number"
                    value={quickFats}
                    onChange={(e) => setQuickFats(e.target.value)}
                    className="w-full text-xs sm:text-sm px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fiber (g)</label>
                  <input
                    type="number"
                    value={quickFiber}
                    onChange={(e) => setQuickFiber(e.target.value)}
                    className="w-full text-xs sm:text-sm px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsQuickLogOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
                >
                  Log Food
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

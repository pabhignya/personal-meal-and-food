import React, { useState } from 'react';
import { MealPlanItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { Utensils, CheckCircle, Flame, Scale, Users, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CookingConfirmModalProps {
  meal: MealPlanItem;
  isOpen: boolean;
  onClose: () => void;
}

export const CookingConfirmModal: React.FC<CookingConfirmModalProps> = ({
  meal,
  isOpen,
  onClose
}) => {
  const { markMealCooked } = useApp();

  const initialTotal = Math.max(1, meal.servings || 1);

  // Measurement method: 'servings' or 'weight'
  const [portionMode, setPortionMode] = useState<'servings' | 'weight'>('servings');

  // Servings mode states
  const [totalCookedServings, setTotalCookedServings] = useState<number>(
    meal.isLeftover ? 1 : (initialTotal === 1 ? 3 : initialTotal)
  );
  const [eatenServings, setEatenServings] = useState<number>(1);

  // Weight mode states
  const [weightUnit, setWeightUnit] = useState<'g' | 'oz' | 'lbs'>('g');
  const [totalCookedWeight, setTotalCookedWeight] = useState<string>('800');
  const [eatenWeight, setEatenWeight] = useState<string>('200');

  // Options
  const [deductPantry, setDeductPantry] = useState(!meal.isLeftover);
  const [scheduleLeftovers, setScheduleLeftovers] = useState(true);

  if (!isOpen) return null;

  // Calculate ratio and eaten nutrition
  let ratio = 1;
  let leftoverCount = 0;
  let portionLabelText = '';

  if (portionMode === 'servings') {
    const total = Math.max(1, totalCookedServings);
    const eaten = Math.max(1, Math.min(total, eatenServings));
    ratio = eaten / total;
    leftoverCount = Math.max(0, total - eaten);
    portionLabelText = total > 1 ? `${eaten} of ${total} servings` : '1 serving';
  } else {
    const totalW = Number(totalCookedWeight) || 1;
    const eatenW = Math.min(totalW, Math.max(0, Number(eatenWeight) || 0));
    ratio = totalW > 0 ? (eatenW / totalW) : 1;
    const remainingW = Math.max(0, totalW - eatenW);
    leftoverCount = eatenW > 0 ? Math.max(1, Math.round(remainingW / eatenW)) : 0;
    portionLabelText = `${eatenW}${weightUnit} of ${totalW}${weightUnit}`;
  }

  // Calculate accurate eaten nutrition
  const loggedCalories = Math.round(meal.nutrition.calories * ratio);
  const loggedProtein = Math.round(meal.nutrition.protein * ratio);
  const loggedCarbs = Math.round(meal.nutrition.carbs * ratio);
  const loggedFats = Math.round(meal.nutrition.fats * ratio);
  const loggedFiber = Math.round(meal.nutrition.fiber * ratio);

  const handleConfirm = () => {
    markMealCooked(
      meal.id,
      deductPantry,
      eatenServings,
      scheduleLeftovers && leftoverCount > 0,
      ratio,
      portionLabelText,
      leftoverCount
    );

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {}

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {meal.isLeftover ? 'Enjoying Fridge Leftover' : 'Cooking & Eating Meal'}
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                {meal.customTitle}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Measurement Mode Tabs (Servings vs Weight) */}
          {!meal.isLeftover && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">How do you want to portion this batch?</span>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPortionMode('servings')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    portionMode === 'servings'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>By Number of Servings</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPortionMode('weight')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    portionMode === 'weight'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>By Weight (Food Scale)</span>
                </button>
              </div>
            </div>
          )}

          {/* Servings Mode Form */}
          {portionMode === 'servings' && !meal.isLeftover && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800 block">
                    Total Cooked Batch (Servings / Meals)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    e.g. Cooked a pot for 3–4 meals
                  </p>
                </div>
                <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-xs">
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setTotalCookedServings(num);
                        if (eatenServings > num) setEatenServings(num);
                      }}
                      className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-colors ${
                        totalCookedServings === num
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <div>
                  <label className="text-xs font-bold text-slate-800 block">
                    Servings You Are Eating Right Now
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Only this portion is logged to today's calories
                  </p>
                </div>
                <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-xs">
                  {Array.from({ length: totalCookedServings }).map((_, i) => {
                    const num = i + 1;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setEatenServings(num)}
                        className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-colors ${
                          eatenServings === num
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Weight Mode Form (Food Scale) */}
          {portionMode === 'weight' && !meal.isLeftover && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block">
                    Total Cooked Weight of the Pot
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Weigh the entire cooked food on your scale
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={totalCookedWeight}
                    onChange={(e) => setTotalCookedWeight(e.target.value)}
                    className="w-24 text-xs sm:text-sm px-2.5 py-1.5 rounded-xl border border-slate-300 font-bold text-right"
                  />
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value as any)}
                    className="text-xs px-2 py-1.5 rounded-xl border border-slate-300 font-semibold bg-white"
                  >
                    <option value="g">g (grams)</option>
                    <option value="oz">oz (ounces)</option>
                    <option value="lbs">lbs</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                <div>
                  <label className="text-xs font-bold text-slate-800 block">
                    Portion You Are Eating Now
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Weigh your plate/bowl portion
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={eatenWeight}
                    onChange={(e) => setEatenWeight(e.target.value)}
                    className="w-24 text-xs sm:text-sm px-2.5 py-1.5 rounded-xl border border-slate-300 font-bold text-right"
                  />
                  <span className="text-xs font-bold text-slate-600 w-12 text-left">
                    {weightUnit}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl text-[11px] text-emerald-900 font-medium flex items-center justify-between">
                <span>Eating {Math.round(ratio * 100)}% of the pot</span>
                <span>Remaining: {Math.max(0, (Number(totalCookedWeight) || 0) - (Number(eatenWeight) || 0))}{weightUnit}</span>
              </div>
            </div>
          )}

          {/* Leftover Scheduling Option */}
          {leftoverCount > 0 && !meal.isLeftover && (
            <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduleLeftovers}
                  onChange={(e) => setScheduleLeftovers(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300"
                />
                <div>
                  <div className="text-xs font-bold text-cyan-950 flex items-center gap-1.5">
                    <span>🧊 Automatically schedule {leftoverCount} leftover meal{leftoverCount > 1 ? 's' : ''} for upcoming days</span>
                  </div>
                  <p className="text-[11px] text-cyan-800 mt-0.5">
                    Will add {leftoverCount} ready-to-eat meal{leftoverCount > 1 ? 's' : ''} to your calendar. These <strong>never add groceries</strong> because they're already in your fridge!
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Nutrition to be logged to today's dashboard */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                Logging to Today's Calories ({portionLabelText}):
              </span>
              <span className="text-sm font-black text-emerald-800">
                +{loggedCalories} kcal
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-emerald-200/60">
              <div className="bg-white p-2 rounded-xl border border-emerald-100">
                <div className="text-[10px] text-slate-400 font-semibold">Protein</div>
                <div className="text-xs font-bold text-slate-800">{loggedProtein}g</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-emerald-100">
                <div className="text-[10px] text-slate-400 font-semibold">Carbs</div>
                <div className="text-xs font-bold text-slate-800">{loggedCarbs}g</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-emerald-100">
                <div className="text-[10px] text-slate-400 font-semibold">Fats</div>
                <div className="text-xs font-bold text-slate-800">{loggedFats}g</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-emerald-100">
                <div className="text-[10px] text-slate-400 font-semibold">Fiber</div>
                <div className="text-xs font-bold text-slate-800">{loggedFiber}g</div>
              </div>
            </div>
          </div>

          {/* Pantry deduction toggle */}
          {!meal.isLeftover && (
            <div className="border border-slate-200 rounded-2xl p-3.5 hover:border-slate-300 transition-colors">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deductPantry}
                  onChange={(e) => setDeductPantry(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Deduct batch ingredients from Pantry stock</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Marks used ingredients as consumed/low so you know when to restock.
                  </p>

                  {deductPantry && meal.ingredients && meal.ingredients.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {meal.ingredients.map(ing => {
                        const isExcluded = (meal.excludedIngredientIds || []).includes(ing.id);
                        return (
                          <span
                            key={ing.id}
                            className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                              isExcluded
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 line-through opacity-70'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isExcluded ? `🚫 ${ing.name} (omitted)` : `${ing.name} (${ing.quantity})`}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <CheckCircle className="w-4 h-4" />
            <span>
              {meal.isLeftover
                ? 'Eat Leftover & Log Calories'
                : `Confirm (${portionLabelText}) & Log`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

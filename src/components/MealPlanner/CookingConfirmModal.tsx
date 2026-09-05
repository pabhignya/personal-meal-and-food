import React, { useState } from 'react';
import { MealPlanItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { Utensils, CheckCircle, Flame, ShieldAlert, Sparkles, X } from 'lucide-react';
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
  const { markMealCooked, pantry } = useApp();
  const [deductPantry, setDeductPantry] = useState(true);

  if (!isOpen) return null;

  const handleConfirm = () => {
    markMealCooked(meal.id, deductPantry);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      // ignore
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Mark as Cooked & Eaten</h3>
              <p className="text-xs text-emerald-100 mt-0.5">{meal.customTitle} ({meal.servings} serving{meal.servings > 1 ? 's' : ''})</p>
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
        <div className="p-5 space-y-4">
          {/* Nutrition to be logged */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Will Log to Calorie Tracker:
              </span>
              <span className="text-sm font-black text-emerald-700">
                +{meal.nutrition.calories} kcal
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center pt-1 border-t border-slate-200/60">
              <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400 font-medium">Protein</div>
                <div className="text-xs font-bold text-slate-800">{meal.nutrition.protein}g</div>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400 font-medium">Carbs</div>
                <div className="text-xs font-bold text-slate-800">{meal.nutrition.carbs}g</div>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400 font-medium">Fats</div>
                <div className="text-xs font-bold text-slate-800">{meal.nutrition.fats}g</div>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400 font-medium">Fiber</div>
                <div className="text-xs font-bold text-slate-800">{meal.nutrition.fiber}g</div>
              </div>
            </div>
          </div>

          {/* Pantry deduction toggle */}
          <div className="border border-slate-200 rounded-xl p-3.5 hover:border-slate-300 transition-colors">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={deductPantry}
                onChange={(e) => setDeductPantry(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <span>Deduct used ingredients from Pantry stock</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automatically marks corresponding in-stock ingredients as used or running low.
                </p>

                {deductPantry && meal.ingredients && meal.ingredients.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {meal.ingredients.map(ing => (
                      <span
                        key={ing.id}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                      >
                        {ing.name} ({ing.quantity})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Confirm & Log</span>
          </button>
        </div>
      </div>
    </div>
  );
};

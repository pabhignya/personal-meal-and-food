import React, { useState } from 'react';
import { MealType, Recipe, StoreType, DepartmentType } from '../../types';
import { useApp } from '../../context/AppContext';
import { STORE_METADATA } from '../../data/defaultData';
import { X, Plus, Search, Sparkles, ChefHat, Check } from 'lucide-react';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate: string;
  defaultMealType?: MealType;
}

export const AddMealModal: React.FC<AddMealModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  defaultMealType = 'lunch'
}) => {
  const { recipes, addMealPlan } = useApp();

  const [mode, setMode] = useState<'recipe' | 'custom'>('recipe');
  const [date, setDate] = useState(defaultDate);
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [servings, setServings] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || '');

  // Custom meal fields
  const [customTitle, setCustomTitle] = useState('');
  const [calories, setCalories] = useState('450');
  const [protein, setProtein] = useState('25');
  const [carbs, setCarbs] = useState('45');
  const [fats, setFats] = useState('15');
  const [fiber, setFiber] = useState('5');
  const [customIngredientName, setCustomIngredientName] = useState('');
  const [customIngredientQty, setCustomIngredientQty] = useState('');
  const [customIngredientStore, setCustomIngredientStore] = useState<StoreType>('indian');
  const [customIngredientsList, setCustomIngredientsList] = useState<Array<{
    id: string;
    name: string;
    quantity: string;
    store: StoreType;
    department: DepartmentType;
  }>>([]);

  if (!isOpen) return null;

  const filteredRecipes = recipes.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);

  const handleAddCustomIngredient = () => {
    if (!customIngredientName.trim()) return;
    setCustomIngredientsList(prev => [
      ...prev,
      {
        id: 'cing-' + Date.now(),
        name: customIngredientName.trim(),
        quantity: customIngredientQty.trim() || '1 item',
        store: customIngredientStore,
        department: 'Other'
      }
    ]);
    setCustomIngredientName('');
    setCustomIngredientQty('');
  };

  const handleRemoveCustomIngredient = (id: string) => {
    setCustomIngredientsList(prev => prev.filter(i => i.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'recipe' && selectedRecipe) {
      // Multiply nutrition by servings
      const totalNutrition = {
        calories: Math.round(selectedRecipe.nutritionPerServing.calories * servings),
        protein: Math.round(selectedRecipe.nutritionPerServing.protein * servings),
        carbs: Math.round(selectedRecipe.nutritionPerServing.carbs * servings),
        fats: Math.round(selectedRecipe.nutritionPerServing.fats * servings),
        fiber: Math.round(selectedRecipe.nutritionPerServing.fiber * servings),
      };

      addMealPlan({
        date,
        mealType,
        recipeId: selectedRecipe.id,
        customTitle: selectedRecipe.title,
        servings,
        nutrition: totalNutrition,
        ingredients: selectedRecipe.ingredients
      });
    } else if (mode === 'custom') {
      if (!customTitle.trim()) return;

      addMealPlan({
        date,
        mealType,
        customTitle: customTitle.trim(),
        servings,
        nutrition: {
          calories: (Number(calories) || 0) * servings,
          protein: (Number(protein) || 0) * servings,
          carbs: (Number(carbs) || 0) * servings,
          fats: (Number(fats) || 0) * servings,
          fiber: (Number(fiber) || 0) * servings,
        },
        ingredients: customIngredientsList
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900">Plan What to Cook</h3>
              <p className="text-xs text-slate-500">Missing ingredients will automatically update your grocery list</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setMode('recipe')}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              mode === 'recipe'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Choose From Recipe Book
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              mode === 'custom'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quick Custom Food
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Date, Meal Slot, Servings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meal Time</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Servings</label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-l-xl text-slate-700 font-bold"
                >
                  -
                </button>
                <div className="flex-1 text-center py-2 border-y border-slate-300 text-xs sm:text-sm font-semibold">
                  {servings}
                </div>
                <button
                  type="button"
                  onClick={() => setServings(servings + 1)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-r-xl text-slate-700 font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {mode === 'recipe' ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search recipes (e.g. Palak Paneer, Costco Chicken, Oats)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Recipe Cards List */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {filteredRecipes.map((recipe) => {
                  const isSelected = selectedRecipeId === recipe.id;
                  const store = STORE_METADATA[recipe.cuisine === 'costco-prep' ? 'costco' : recipe.cuisine === 'indian' ? 'indian' : 'american'];
                  return (
                    <div
                      key={recipe.id}
                      onClick={() => setSelectedRecipeId(recipe.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-2xl">{recipe.imageEmoji || '🍲'}</span>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                            {recipe.title}
                            {isSelected && <Check className="w-4 h-4 text-emerald-600 inline" />}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-semibold text-emerald-700">
                              {recipe.nutritionPerServing.calories} kcal
                            </span>
                            <span>•</span>
                            <span>{recipe.nutritionPerServing.protein}g Protein</span>
                            <span>•</span>
                            <span>{recipe.prepTime}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${store.badgeClass}`}>
                              {store.shortName}
                            </span>
                            {recipe.tags.slice(0, 2).map((t, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedRecipe && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Ingredients to check against pantry ({selectedRecipe.ingredients.length}):</span>
                    <span className="text-emerald-700 font-semibold">
                      Total: {selectedRecipe.nutritionPerServing.calories * servings} kcal
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedRecipe.ingredients.map(ing => (
                      <span
                        key={ing.id}
                        className="px-2 py-0.5 rounded text-[11px] bg-white border border-slate-200 text-slate-700 font-medium"
                      >
                        {ing.name} ({ing.quantity})
                        <span className="text-slate-400 ml-1">[{STORE_METADATA[ing.store].shortName}]</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meal / Food Name</label>
                <input
                  type="text"
                  placeholder="e.g. Grilled Chicken Wrap, Protein Shake, Dal & Rice"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  required
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full text-xs sm:text-sm px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full text-xs sm:text-sm px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="w-full text-xs sm:text-sm px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fats (g)</label>
                  <input
                    type="number"
                    value={fats}
                    onChange={(e) => setFats(e.target.value)}
                    className="w-full text-xs sm:text-sm px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fiber (g)</label>
                  <input
                    type="number"
                    value={fiber}
                    onChange={(e) => setFiber(e.target.value)}
                    className="w-full text-xs sm:text-sm px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* Custom Ingredients section */}
              <div className="border-t border-slate-200 pt-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Optional: Add Groceries for this meal
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={customIngredientName}
                    onChange={(e) => setCustomIngredientName(e.target.value)}
                    className="flex-1 min-w-[120px] text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Qty (e.g. 1 bunch)"
                    value={customIngredientQty}
                    onChange={(e) => setCustomIngredientQty(e.target.value)}
                    className="w-24 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                  <select
                    value={customIngredientStore}
                    onChange={(e) => setCustomIngredientStore(e.target.value as StoreType)}
                    className="text-xs px-2 py-1.5 rounded-lg border border-slate-300"
                  >
                    <option value="indian">Indian Store</option>
                    <option value="costco">Costco</option>
                    <option value="american">American Store</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddCustomIngredient}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900"
                  >
                    Add
                  </button>
                </div>

                {customIngredientsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {customIngredientsList.map(ing => (
                      <span
                        key={ing.id}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border"
                      >
                        {ing.name} ({ing.quantity})
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomIngredient(ing.id)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Meal Plan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { MealType, Recipe, StoreType, DepartmentType } from '../../types';
import { useApp } from '../../context/AppContext';
import { STORE_METADATA } from '../../data/defaultData';
import { X, Plus, Search, Sparkles, ChefHat, Check } from 'lucide-react';
import { QuantityUnitInput } from '../Common/QuantityUnitInput';

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
  const { recipes, addMealPlan, userProfile } = useApp();

  const [mode, setMode] = useState<'recipe' | 'custom'>('recipe');
  const [date, setDate] = useState(defaultDate);
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [servings, setServings] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [recipeCategoryFilter, setRecipeCategoryFilter] = useState<'all' | 'meal' | 'snack' | 'dessert'>('all');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || '');
  const [excludedIngredientIds, setExcludedIngredientIds] = useState<string[]>([]);

  // Custom meal fields
  const [customTitle, setCustomTitle] = useState('');
  const [calories, setCalories] = useState('450');
  const [protein, setProtein] = useState('25');
  const [carbs, setCarbs] = useState('45');
  const [fats, setFats] = useState('15');
  const [fiber, setFiber] = useState('5');
  const [customIngredientName, setCustomIngredientName] = useState('');
  const [customIngAmount, setCustomIngAmount] = useState('1');
  const [customIngUnit, setCustomIngUnit] = useState('pcs');
  const [customIngredientStore, setCustomIngredientStore] = useState<StoreType>('indian');
  const [customIngredientsList, setCustomIngredientsList] = useState<Array<{
    id: string;
    name: string;
    quantity: string;
    store: StoreType;
    department: DepartmentType;
  }>>([]);

  if (!isOpen) return null;

  const filteredRecipes = recipes.filter(r => {
    const matchesCategory =
      recipeCategoryFilter === 'all' ? true :
      recipeCategoryFilter === 'meal' ? (r.category === 'meal' || !r.category) :
      recipeCategoryFilter === 'snack' ? (r.category === 'snack') :
      recipeCategoryFilter === 'dessert' ? (r.category === 'dessert') :
      true;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);

  const handleSelectRecipe = (r: Recipe) => {
    setSelectedRecipeId(r.id);
    if (r.category === 'snack') setMealType('snack');
    else if (r.category === 'dessert') setMealType('dessert');

    // Auto-exclude ingredients matching user's global excluded veggies
    const userExclusions = userProfile?.excludedVeggies || [];
    const autoEx: string[] = [];
    r.ingredients.forEach(ing => {
      const match = userExclusions.some(ev => {
        const clean = ev.toLowerCase().split('(')[0].trim();
        return ing.name.toLowerCase().includes(clean) || clean.includes(ing.name.toLowerCase());
      });
      if (match) autoEx.push(ing.id);
    });
    setExcludedIngredientIds(autoEx);
  };

  const toggleIngredientExcluded = (ingId: string) => {
    setExcludedIngredientIds(prev =>
      prev.includes(ingId) ? prev.filter(id => id !== ingId) : [...prev, ingId]
    );
  };

  const handleToggleAllProduce = () => {
    if (!selectedRecipe) return;
    const produceIds = selectedRecipe.ingredients.filter(i => i.department === 'Produce').map(i => i.id);
    const allExcluded = produceIds.length > 0 && produceIds.every(id => excludedIngredientIds.includes(id));
    if (allExcluded) {
      setExcludedIngredientIds(prev => prev.filter(id => !produceIds.includes(id)));
    } else {
      setExcludedIngredientIds(prev => Array.from(new Set([...prev, ...produceIds])));
    }
  };

  const handleAddCustomIngredient = () => {
    if (!customIngredientName.trim()) return;
    const formattedQty = `${customIngAmount.trim() || '1'} ${customIngUnit}`.trim();
    setCustomIngredientsList(prev => [
      ...prev,
      {
        id: 'cing-' + Date.now(),
        name: customIngredientName.trim(),
        quantity: formattedQty,
        store: customIngredientStore,
        department: 'Other'
      }
    ]);
    setCustomIngredientName('');
    setCustomIngAmount('1');
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
        ingredients: selectedRecipe.ingredients,
        excludedIngredientIds: excludedIngredientIds
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
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
                <option value="dessert">Dessert & Sweet Treat</option>
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
              {/* Search and Category Filter Pills */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search recipes (e.g. Palak Paneer, Costco Chicken, Makhana, Kheer)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  {[
                    { id: 'all', label: 'All Recipes', emoji: '🍱' },
                    { id: 'meal', label: 'Main Meals', emoji: '🍛' },
                    { id: 'snack', label: 'Snacks', emoji: '🍿' },
                    { id: 'dessert', label: 'Desserts', emoji: '🍨' },
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setRecipeCategoryFilter(c.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        recipeCategoryFilter === c.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{c.emoji}</span>
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipe Cards List */}
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                {filteredRecipes.map((recipe) => {
                  const isSelected = selectedRecipeId === recipe.id;
                  const store = STORE_METADATA[recipe.cuisine === 'costco-prep' ? 'costco' : recipe.cuisine === 'indian' ? 'indian' : 'american'];
                  return (
                    <div
                      key={recipe.id}
                      onClick={() => handleSelectRecipe(recipe)}
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
                            {recipe.category && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                                {recipe.category === 'snack' ? 'Snack' : recipe.category === 'dessert' ? 'Dessert' : 'Meal'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Recipe Ingredients Customization & Veggie Exclusions */}
              {selectedRecipe && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <span>🥦</span>
                        <span>Ingredients & Veggie Exclusions:</span>
                      </span>
                      {excludedIngredientIds.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                          {excludedIngredientIds.length} Excluded
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleAllProduce}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold"
                      >
                        {selectedRecipe.ingredients.filter(i => i.department === 'Produce').every(i => excludedIngredientIds.includes(i.id))
                          ? 'Restore Veggies'
                          : 'Exclude Veggies'}
                      </button>
                      <span className="text-xs text-emerald-700 font-black">
                        Total: {selectedRecipe.nutritionPerServing.calories * servings} kcal
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Click to exclude any veggies or items (excluded items will not be added to groceries or deducted from pantry):
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1 max-h-32 overflow-y-auto">
                    {selectedRecipe.ingredients.map(ing => {
                      const isExcluded = excludedIngredientIds.includes(ing.id);
                      const isProduce = ing.department === 'Produce';
                      return (
                        <button
                          key={ing.id}
                          type="button"
                          onClick={() => toggleIngredientExcluded(ing.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                            isExcluded
                              ? 'bg-rose-50 text-rose-800 border-rose-300 line-through opacity-70'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={!isExcluded}
                            onChange={() => {}}
                            className="w-3.5 h-3.5 rounded text-emerald-600 border-slate-300 cursor-pointer pointer-events-none"
                          />
                          <span>{ing.name} ({ing.quantity})</span>
                          {isProduce && <span className="text-[10px] text-emerald-600">🥬</span>}
                          {isExcluded && <span className="text-[9px] font-bold text-rose-600">Omitted</span>}
                        </button>
                      );
                    })}
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
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      placeholder="Ingredient name (e.g. Paneer, Rice)"
                      value={customIngredientName}
                      onChange={(e) => setCustomIngredientName(e.target.value)}
                      className="flex-1 min-w-[140px] text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                    />
                    <select
                      value={customIngredientStore}
                      onChange={(e) => setCustomIngredientStore(e.target.value as StoreType)}
                      className="text-xs px-2 py-1.5 rounded-lg border border-slate-300"
                    >
                      <option value="indian">🇮🇳 Indian Store</option>
                      <option value="costco">🔴 Costco</option>
                      <option value="american">🇺🇸 American Store</option>
                      <option value="other">🌐 Other</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <QuantityUnitInput
                        amount={customIngAmount}
                        unit={customIngUnit}
                        onAmountChange={setCustomIngAmount}
                        onUnitChange={setCustomIngUnit}
                        label=""
                        amountPlaceholder="Qty (e.g. 2)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomIngredient}
                      className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 self-end"
                    >
                      Add
                    </button>
                  </div>
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

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Recipe, RecipeIngredient, StoreType, DepartmentType } from '../../types';
import { STORE_METADATA } from '../../data/defaultData';
import {
  BookOpen,
  Plus,
  Search,
  Clock,
  Flame,
  Calendar,
  ShoppingCart,
  Trash2,
  Check,
  X,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuantityUnitInput } from '../Common/QuantityUnitInput';

export const RecipeBookView: React.FC = () => {
  const {
    recipes,
    addRecipe,
    deleteRecipe,
    addMealPlan,
    addMissingIngredientsToGrocery,
    selectedDate,
    setActiveTab,
    userProfile
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'meal' | 'snack' | 'dessert' | 'veg'>('all');
  const [activeRecipeModal, setActiveRecipeModal] = useState<Recipe | null>(null);
  const [modalExcludedIngIds, setModalExcludedIngIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Recipe Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine, setCuisine] = useState<'indian' | 'american' | 'costco-prep' | 'custom'>('indian');
  const [recipeCategory, setRecipeCategory] = useState<'meal' | 'snack' | 'dessert'>('meal');
  const [prepTime, setPrepTime] = useState('25 mins');
  const [servings, setServings] = useState(2);
  const [emoji, setEmoji] = useState('🍲');
  const [calories, setCalories] = useState('450');
  const [protein, setProtein] = useState('25');
  const [carbs, setCarbs] = useState('45');
  const [fats, setFats] = useState('15');
  const [fiber, setFiber] = useState('5');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [instructions, setInstructions] = useState<string[]>(['']);

  // Temp ingredient inputs
  const [ingName, setIngName] = useState('');
  const [ingAmount, setIngAmount] = useState('1');
  const [ingUnit, setIngUnit] = useState('pcs');
  const [ingStore, setIngStore] = useState<StoreType>('indian');
  const [ingDept, setIngDept] = useState<DepartmentType>('Produce');

  const filteredRecipes = recipes.filter(r => {
    const matchesCuisine = selectedCuisine === 'all' || r.cuisine === selectedCuisine;
    const matchesCategory = 
      selectedCategory === 'all' ? true :
      selectedCategory === 'meal' ? (r.category === 'meal' || !r.category) :
      selectedCategory === 'snack' ? (r.category === 'snack') :
      selectedCategory === 'dessert' ? (r.category === 'dessert') :
      selectedCategory === 'veg' ? (r.tags.some(t => t.toLowerCase().includes('veg'))) :
      true;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.ingredients.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCuisine && matchesCategory && matchesSearch;
  });

  // Open recipe details modal and pre-exclude any veggies that match user's global exclusions
  const handleOpenRecipeModal = (recipe: Recipe) => {
    const userExclusions = userProfile?.excludedVeggies || [];
    const autoExcludedIds: string[] = [];

    recipe.ingredients.forEach(ing => {
      const isExcluded = userExclusions.some(ev => {
        const cleanEv = ev.toLowerCase().split('(')[0].trim();
        return ing.name.toLowerCase().includes(cleanEv) || cleanEv.includes(ing.name.toLowerCase());
      });
      if (isExcluded) {
        autoExcludedIds.push(ing.id);
      }
    });

    setModalExcludedIngIds(autoExcludedIds);
    setActiveRecipeModal(recipe);
  };

  const toggleModalIngredientExcluded = (ingId: string) => {
    setModalExcludedIngIds(prev => 
      prev.includes(ingId) ? prev.filter(id => id !== ingId) : [...prev, ingId]
    );
  };

  const handleToggleAllProduce = () => {
    if (!activeRecipeModal) return;
    const produceIds = activeRecipeModal.ingredients
      .filter(i => i.department === 'Produce')
      .map(i => i.id);
    const allProduceAlreadyExcluded = produceIds.length > 0 && produceIds.every(id => modalExcludedIngIds.includes(id));
    if (allProduceAlreadyExcluded) {
      setModalExcludedIngIds(prev => prev.filter(id => !produceIds.includes(id)));
    } else {
      setModalExcludedIngIds(prev => Array.from(new Set([...prev, ...produceIds])));
    }
  };

  const handlePlanWithExclusions = (recipe: Recipe) => {
    const activeIngredients = recipe.ingredients.filter(i => !modalExcludedIngIds.includes(i.id));
    const targetMealType = recipe.category === 'snack' ? 'snack' : recipe.category === 'dessert' ? 'dessert' : 'dinner';

    addMealPlan({
      date: selectedDate,
      mealType: targetMealType,
      recipeId: recipe.id,
      customTitle: recipe.title,
      servings: 1,
      nutrition: recipe.nutritionPerServing,
      ingredients: recipe.ingredients,
      excludedIngredientIds: modalExcludedIngIds
    });

    const excludedCount = modalExcludedIngIds.length;
    setToastMessage(
      `Planned "${recipe.title}" for ${targetMealType.toUpperCase()}` +
      (excludedCount > 0 ? ` (${excludedCount} excluded veggies omitted)` : '') +
      ` on ${selectedDate}!`
    );
    setTimeout(() => setToastMessage(null), 4000);
    setActiveRecipeModal(null);
  };

  const handleAddActiveToGroceries = (recipe: Recipe) => {
    const activeIngredients = recipe.ingredients.filter(i => !modalExcludedIngIds.includes(i.id));
    const count = addMissingIngredientsToGrocery(activeIngredients, recipe.title);
    const excludedCount = modalExcludedIngIds.length;
    setToastMessage(
      `Added ${count} items from "${recipe.title}" to your grocery list` +
      (excludedCount > 0 ? ` (${excludedCount} excluded veggies omitted)` : '') +
      `!`
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddRecipeToGroceries = (recipe: Recipe) => {
    const userExclusions = userProfile?.excludedVeggies || [];
    const activeIngredients = recipe.ingredients.filter(ing => {
      const isExcluded = userExclusions.some(ev => {
        const cleanEv = ev.toLowerCase().split('(')[0].trim();
        return ing.name.toLowerCase().includes(cleanEv) || cleanEv.includes(ing.name.toLowerCase());
      });
      return !isExcluded;
    });
    const count = addMissingIngredientsToGrocery(activeIngredients, recipe.title);
    const omittedCount = recipe.ingredients.length - activeIngredients.length;
    setToastMessage(
      `Added ${count} items from "${recipe.title}" to your grocery list` +
      (omittedCount > 0 ? ` (${omittedCount} excluded veggies omitted)` : '') +
      `!`
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddIngredientToNewRecipe = () => {
    if (!ingName.trim()) return;
    const formattedQty = `${ingAmount.trim() || '1'} ${ingUnit}`.trim();
    setIngredients(prev => [
      ...prev,
      {
        id: 'ing-' + Date.now(),
        name: ingName.trim(),
        quantity: formattedQty,
        store: ingStore,
        department: ingDept
      }
    ]);
    setIngName('');
    setIngAmount('1');
  };

  const handleCreateRecipeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addRecipe({
      title: title.trim(),
      description: description.trim() || 'Delicious home-cooked recipe',
      servings: Number(servings) || 2,
      prepTime: prepTime.trim() || '30 mins',
      cuisine,
      category: recipeCategory,
      tags: ['Home Cooked', cuisine === 'indian' ? 'Indian' : cuisine === 'costco-prep' ? 'Costco Prep' : 'American', recipeCategory === 'snack' ? 'Snack' : recipeCategory === 'dessert' ? 'Dessert' : 'Meal'],
      imageEmoji: emoji || '🍲',
      nutritionPerServing: {
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fats: Number(fats) || 0,
        fiber: Number(fiber) || 0,
      },
      ingredients,
      instructions: instructions.filter(i => i.trim().length > 0)
    });

    setIsCreateModalOpen(false);
    // Reset form
    setTitle('');
    setDescription('');
    setIngredients([]);
    setInstructions(['']);
    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    } catch (e) {}
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-5xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 font-bold ml-2">×</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
            Recipe & Meal Library
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-loaded with Indian favorites, Costco bulk meal prep, and American staples
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center gap-1.5 self-start sm:self-auto transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Recipe</span>
        </button>
      </div>

      {/* Search & Cuisine Filter */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search recipes by name, ingredient, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Cuisine Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Recipes', emoji: '🍽️' },
            { id: 'indian', label: 'Indian Cuisine', emoji: '🇮🇳' },
            { id: 'costco-prep', label: 'Costco Meal Prep', emoji: '🔴' },
            { id: 'american', label: 'American Classics', emoji: '🇺🇸' },
            { id: 'custom', label: 'My Custom', emoji: '✨' },
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCuisine(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCuisine === c.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

        {/* Category Filter Pills (Meals, Snacks, Desserts) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-100 pt-2.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Filter:</span>
          {[
            { id: 'all', label: 'All Items', emoji: '🍱' },
            { id: 'meal', label: 'Meals (Lunch / Dinner)', emoji: '🍛' },
            { id: 'snack', label: 'Snacks & Light Bites', emoji: '🍿' },
            { id: 'dessert', label: 'Desserts & Sweets', emoji: '🍨' },
            { id: 'veg', label: 'Vegetarian', emoji: '🥬' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecipes.map(recipe => {
          const storeKey = recipe.cuisine === 'indian' ? 'indian' : recipe.cuisine === 'costco-prep' ? 'costco' : 'american';
          const storeMeta = STORE_METADATA[storeKey];

          const matchingExcluded = (userProfile?.excludedVeggies || []).filter(ev => {
            const cleanEv = ev.toLowerCase().split('(')[0].trim();
            return recipe.ingredients.some(i => i.name.toLowerCase().includes(cleanEv));
          });

          const categoryBadge = recipe.category === 'snack' 
            ? { label: 'Snack', class: 'bg-amber-100 text-amber-800 border-amber-300' }
            : recipe.category === 'dessert'
            ? { label: 'Dessert', class: 'bg-pink-100 text-pink-800 border-pink-300' }
            : { label: 'Meal', class: 'bg-slate-100 text-slate-700 border-slate-200' };

          return (
            <div
              key={recipe.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-2xl bg-slate-50 border border-slate-100">
                      {recipe.imageEmoji || '🍲'}
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{recipe.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {recipe.prepTime}
                        </span>
                        <span>•</span>
                        <span>{recipe.servings} serving{recipe.servings > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${storeMeta.badgeClass}`}>
                      {storeMeta.shortName}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-semibold ${categoryBadge.class}`}>
                      {categoryBadge.label}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                  {recipe.description}
                </p>

                {/* Excludable Veggies Callout */}
                {matchingExcluded.length > 0 && (
                  <div className="mt-2 text-[11px] px-2.5 py-1 bg-rose-50 text-rose-800 rounded-lg border border-rose-200 flex items-center gap-1.5 font-medium">
                    <span>🥦</span>
                    <span>Contains <strong>{matchingExcluded.join(', ')}</strong> (can exclude in details)</span>
                  </div>
                )}

                {/* Macro summary pills */}
                <div className="grid grid-cols-4 gap-1.5 mt-3.5 pt-3 border-t border-slate-100 text-center">
                  <div className="bg-emerald-50/70 p-1.5 rounded-lg">
                    <div className="text-[10px] text-emerald-800 font-semibold">Calories</div>
                    <div className="text-xs font-black text-emerald-900">{recipe.nutritionPerServing.calories}</div>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-lg">
                    <div className="text-[10px] text-slate-500 font-medium">Protein</div>
                    <div className="text-xs font-bold text-slate-800">{recipe.nutritionPerServing.protein}g</div>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-lg">
                    <div className="text-[10px] text-slate-500 font-medium">Carbs</div>
                    <div className="text-xs font-bold text-slate-800">{recipe.nutritionPerServing.carbs}g</div>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-lg">
                    <div className="text-[10px] text-slate-500 font-medium">Fat</div>
                    <div className="text-xs font-bold text-slate-800">{recipe.nutritionPerServing.fats}g</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenRecipeModal(recipe)}
                  className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1"
                >
                  <span>Customize & Ingredients</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAddRecipeToGroceries(recipe)}
                    className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors"
                    title="Send ingredients to grocery list (omits excluded veggies)"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenRecipeModal(recipe)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Plan Meal</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recipe Detail Modal */}
      {activeRecipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeRecipeModal.imageEmoji || '🍲'}</span>
                <div>
                  <h3 className="font-black text-lg sm:text-xl">{activeRecipeModal.title}</h3>
                  <p className="text-xs text-emerald-300 mt-0.5">
                    {activeRecipeModal.prepTime} • {activeRecipeModal.servings} Servings • {activeRecipeModal.nutritionPerServing.calories} kcal/serving
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveRecipeModal(null)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              {/* Macro Bar */}
              <div className="grid grid-cols-5 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Calories</div>
                  <div className="text-xs sm:text-sm font-black text-emerald-800">{activeRecipeModal.nutritionPerServing.calories}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Protein</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800">{activeRecipeModal.nutritionPerServing.protein}g</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Carbs</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800">{activeRecipeModal.nutritionPerServing.carbs}g</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Fats</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800">{activeRecipeModal.nutritionPerServing.fats}g</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Fiber</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800">{activeRecipeModal.nutritionPerServing.fiber}g</div>
                </div>
              </div>

              {/* Ingredients & Veggie Customization */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div>
                    <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                      <span>Ingredients & Veggie Exclusions</span>
                      {modalExcludedIngIds.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                          {modalExcludedIngIds.length} Excluded
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Uncheck any veggies or ingredients to omit them from grocery lists and pantry deductions.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleToggleAllProduce}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                    >
                      {activeRecipeModal.ingredients.filter(i => i.department === 'Produce').every(i => modalExcludedIngIds.includes(i.id))
                        ? 'Restore Veggies'
                        : 'Exclude Veggies'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddActiveToGroceries(activeRecipeModal)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1 transition-colors"
                      title="Add only active (non-excluded) ingredients to shopping list"
                    >
                      <ShoppingCart className="w-3 h-3 text-emerald-600" />
                      <span>Send Active to Groceries</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {activeRecipeModal.ingredients.map(ing => {
                    const isExcluded = modalExcludedIngIds.includes(ing.id);
                    const storeMeta = STORE_METADATA[ing.store];
                    const isProduce = ing.department === 'Produce';

                    return (
                      <div
                        key={ing.id}
                        onClick={() => toggleModalIngredientExcluded(ing.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                          isExcluded
                            ? 'bg-rose-50/60 border-rose-200 text-slate-400'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={!isExcluded}
                            onChange={() => {}} // handled by parent div click
                            className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <span className={`font-bold ${isExcluded ? 'line-through text-rose-800/60' : 'text-slate-800'}`}>
                              {ing.name}
                            </span>
                            <span className="font-normal text-slate-500 ml-1">({ing.quantity})</span>
                            {isProduce && (
                              <span className="ml-1.5 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                                Veggie / Fresh
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isExcluded ? (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">
                              🚫 Excluded
                            </span>
                          ) : (
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${storeMeta.badgeClass}`}>
                              {storeMeta.shortName}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step by step Instructions */}
              <div>
                <h4 className="font-black text-sm text-slate-900 mb-2.5">Cooking Instructions</h4>
                <ol className="space-y-2 text-xs sm:text-sm text-slate-700 list-decimal list-inside">
                  {activeRecipeModal.instructions.map((step, idx) => (
                    <li key={idx} className="leading-relaxed pl-1">
                      <span className="ml-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                {modalExcludedIngIds.length > 0 ? (
                  <span className="text-rose-600 font-bold">
                    {modalExcludedIngIds.length} item{modalExcludedIngIds.length > 1 ? 's' : ''} excluded
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium">All ingredients included</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveRecipeModal(null)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Close
                </button>
                <button
                  onClick={() => handlePlanWithExclusions(activeRecipeModal)}
                  className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Plan This Meal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Recipe Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-black text-base sm:text-lg text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                Create New Recipe
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecipeSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Recipe Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Chicken Biryani, Grilled Salmon Bowl"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cuisine</label>
                  <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value as any)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="indian">Indian</option>
                    <option value="costco-prep">Costco Prep</option>
                    <option value="american">American</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={recipeCategory}
                    onChange={(e) => setRecipeCategory(e.target.value as any)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 font-semibold text-emerald-800 bg-emerald-50/50"
                  >
                    <option value="meal">Meal (Lunch/Dinner)</option>
                    <option value="snack">Snack</option>
                    <option value="dessert">Dessert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="A quick summary of the dish..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Prep Time</label>
                  <input
                    type="text"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Servings</label>
                  <input
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Emoji</label>
                  <input
                    type="text"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fats (g)</label>
                  <input
                    type="number"
                    value={fats}
                    onChange={(e) => setFats(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fiber (g)</label>
                  <input
                    type="number"
                    value={fiber}
                    onChange={(e) => setFiber(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* Add Ingredients */}
              <div className="border-t border-slate-200 pt-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ingredients & Store Assignment ({ingredients.length})
                </label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      placeholder="Ingredient (e.g. Paneer, Rice, Garam Masala)"
                      value={ingName}
                      onChange={(e) => setIngName(e.target.value)}
                      className="flex-1 min-w-[140px] text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                    />
                    <select
                      value={ingStore}
                      onChange={(e) => setIngStore(e.target.value as StoreType)}
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
                        amount={ingAmount}
                        unit={ingUnit}
                        onAmountChange={setIngAmount}
                        onUnitChange={setIngUnit}
                        label=""
                        amountPlaceholder="Qty (e.g. 2)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddIngredientToNewRecipe}
                      className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 self-end"
                    >
                      Add Ingredient
                    </button>
                  </div>
                </div>

                {ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {ingredients.map(ing => (
                      <span
                        key={ing.id}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border"
                      >
                        {ing.name} ({ing.quantity}) [{ing.store}]
                        <button
                          type="button"
                          onClick={() => setIngredients(prev => prev.filter(i => i.id !== ing.id))}
                          className="text-slate-400 hover:text-red-500 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="border-t border-slate-200 pt-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Step-by-step Instructions</label>
                {instructions.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                    <input
                      type="text"
                      placeholder={`Step ${idx + 1}...`}
                      value={step}
                      onChange={(e) => {
                        const copy = [...instructions];
                        copy[idx] = e.target.value;
                        setInstructions(copy);
                      }}
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setInstructions(prev => [...prev, ''])}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  + Add another step
                </button>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
                >
                  Save Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

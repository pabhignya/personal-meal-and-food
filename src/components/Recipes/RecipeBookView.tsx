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

export const RecipeBookView: React.FC = () => {
  const { recipes, addRecipe, deleteRecipe, addMealPlan, addMissingIngredientsToGrocery, selectedDate, setActiveTab } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [activeRecipeModal, setActiveRecipeModal] = useState<Recipe | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Recipe Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine, setCuisine] = useState<'indian' | 'american' | 'costco-prep' | 'custom'>('indian');
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
  const [ingQty, setIngQty] = useState('');
  const [ingStore, setIngStore] = useState<StoreType>('indian');
  const [ingDept, setIngDept] = useState<DepartmentType>('Produce');

  const filteredRecipes = recipes.filter(r => {
    const matchesCuisine = selectedCuisine === 'all' || r.cuisine === selectedCuisine;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.ingredients.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCuisine && matchesSearch;
  });

  const handlePlanDirectly = (recipe: Recipe) => {
    addMealPlan({
      date: selectedDate,
      mealType: 'dinner',
      recipeId: recipe.id,
      customTitle: recipe.title,
      servings: 1,
      nutrition: recipe.nutritionPerServing,
      ingredients: recipe.ingredients
    });

    setToastMessage(`Planned "${recipe.title}" for Dinner on ${selectedDate}. Missing items added to groceries!`);
    setTimeout(() => setToastMessage(null), 4000);
    setActiveRecipeModal(null);
  };

  const handleAddAllToGroceries = (recipe: Recipe) => {
    const count = addMissingIngredientsToGrocery(recipe.ingredients, recipe.title);
    setToastMessage(`Added ${count} items from "${recipe.title}" to your grocery list!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddIngredientToNewRecipe = () => {
    if (!ingName.trim()) return;
    setIngredients(prev => [
      ...prev,
      {
        id: 'ing-' + Date.now(),
        name: ingName.trim(),
        quantity: ingQty.trim() || '1 item',
        store: ingStore,
        department: ingDept
      }
    ]);
    setIngName('');
    setIngQty('');
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
      tags: ['Home Cooked', cuisine === 'indian' ? 'Indian' : cuisine === 'costco-prep' ? 'Costco Prep' : 'American'],
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
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecipes.map(recipe => {
          const storeKey = recipe.cuisine === 'indian' ? 'indian' : recipe.cuisine === 'costco-prep' ? 'costco' : 'american';
          const storeMeta = STORE_METADATA[storeKey];

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

                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${storeMeta.badgeClass}`}>
                    {storeMeta.shortName}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                  {recipe.description}
                </p>

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
                  onClick={() => setActiveRecipeModal(recipe)}
                  className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1"
                >
                  <span>View Details & Ingredients</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAddAllToGroceries(recipe)}
                    className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors"
                    title="Send ingredients to grocery list"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePlanDirectly(recipe)}
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

              {/* Ingredients with Stores */}
              <div>
                <h4 className="font-black text-sm text-slate-900 mb-2.5 flex items-center justify-between">
                  <span>Ingredients & Store Route</span>
                  <button
                    onClick={() => handleAddAllToGroceries(activeRecipeModal)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Send all to Groceries</span>
                  </button>
                </h4>
                <div className="space-y-2">
                  {activeRecipeModal.ingredients.map(ing => {
                    const storeMeta = STORE_METADATA[ing.store];
                    return (
                      <div
                        key={ing.id}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-slate-800">
                          {ing.name} <span className="font-normal text-slate-500">({ing.quantity})</span>
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${storeMeta.badgeClass}`}>
                          {storeMeta.shortName}
                        </span>
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
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setActiveRecipeModal(null)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => handlePlanDirectly(activeRecipeModal)}
                className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Plan This Meal</span>
              </button>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cuisine / Category</label>
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
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    placeholder="Ingredient (e.g. Paneer)"
                    value={ingName}
                    onChange={(e) => setIngName(e.target.value)}
                    className="flex-1 min-w-[120px] text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Qty (e.g. 250g)"
                    value={ingQty}
                    onChange={(e) => setIngQty(e.target.value)}
                    className="w-24 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                  <select
                    value={ingStore}
                    onChange={(e) => setIngStore(e.target.value as StoreType)}
                    className="text-xs px-2 py-1.5 rounded-lg border border-slate-300"
                  >
                    <option value="indian">Indian Store</option>
                    <option value="costco">Costco</option>
                    <option value="american">American Store</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddIngredientToNewRecipe}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
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

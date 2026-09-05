import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppState,
  MealPlanItem,
  GroceryItem,
  PantryItem,
  Recipe,
  NutritionLogEntry,
  DailyGoals,
  DailyRecord,
  StoreType,
  RecipeIngredient
} from '../types';
import {
  INITIAL_RECIPES,
  INITIAL_PANTRY,
  INITIAL_GROCERIES,
  DEFAULT_DAILY_GOALS
} from '../data/defaultData';

interface AppContextType extends AppState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  activeStoreFilter: StoreType | 'all';
  setActiveStoreFilter: (store: StoreType | 'all') => void;
  
  // Meal Planning
  addMealPlan: (plan: Omit<MealPlanItem, 'id' | 'isCooked'>) => void;
  removeMealPlan: (id: string) => void;
  markMealCooked: (planId: string, deductPantry: boolean) => void;
  unmarkMealCooked: (planId: string) => void;

  // Grocery
  addGroceryItem: (item: Omit<GroceryItem, 'id' | 'isBought' | 'addedDate'>) => void;
  toggleGroceryBought: (id: string) => void;
  removeGroceryItem: (id: string) => void;
  clearBoughtGroceries: (store?: StoreType | 'all') => void;
  moveBoughtToPantry: (store?: StoreType | 'all') => void;
  addMissingIngredientsToGrocery: (ingredients: RecipeIngredient[], recipeTitle?: string) => number;

  // Pantry
  addPantryItem: (item: Omit<PantryItem, 'id' | 'lastUpdated'>) => void;
  updatePantryStatus: (id: string, status: 'in_stock' | 'low' | 'out') => void;
  removePantryItem: (id: string) => void;
  sendPantryItemToGrocery: (pantryId: string) => void;

  // Nutrition
  addQuickLog: (entry: Omit<NutritionLogEntry, 'id' | 'timestamp'>) => void;
  removeNutritionLog: (id: string) => void;
  updateWaterIntake: (date: string, deltaMl: number) => void;
  updateDailyGoals: (goals: DailyGoals) => void;

  // Recipes
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;

  // Backup & Restore
  exportDataJSON: () => void;
  importDataJSON: (jsonString: string) => boolean;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'mealcraft_app_state_v1';

const getInitialDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('planner');
  const [selectedDate, setSelectedDate] = useState<string>(getInitialDateString());
  const [activeStoreFilter, setActiveStoreFilter] = useState<StoreType | 'all'>('all');

  // Load state from localStorage or initialize with defaults
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          recipes: parsed.recipes || INITIAL_RECIPES,
          mealPlans: parsed.mealPlans || [],
          groceries: parsed.groceries || INITIAL_GROCERIES,
          pantry: parsed.pantry || INITIAL_PANTRY,
          nutritionLogs: parsed.nutritionLogs || [],
          dailyRecords: parsed.dailyRecords || {},
          dailyGoals: parsed.dailyGoals || DEFAULT_DAILY_GOALS,
        };
      }
    } catch (e) {
      console.error('Error loading saved state:', e);
    }
    return {
      recipes: INITIAL_RECIPES,
      mealPlans: [],
      groceries: INITIAL_GROCERIES,
      pantry: INITIAL_PANTRY,
      nutritionLogs: [],
      dailyRecords: {},
      dailyGoals: DEFAULT_DAILY_GOALS,
    };
  });

  // Save to localStorage on every state update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }, [state]);

  // --- Meal Planning Handlers ---
  const addMealPlan = (planData: Omit<MealPlanItem, 'id' | 'isCooked'>) => {
    const newPlanId = 'plan-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newPlan: MealPlanItem = {
      ...planData,
      id: newPlanId,
      isCooked: false
    };

    // Automatically check recipe ingredients against Pantry and push missing to grocery list!
    let updatedGroceries = [...state.groceries];
    const missingIngredients: RecipeIngredient[] = [];

    if (newPlan.ingredients && newPlan.ingredients.length > 0) {
      newPlan.ingredients.forEach(ing => {
        const pantryMatch = state.pantry.find(p => 
          p.name.toLowerCase().includes(ing.name.toLowerCase()) || 
          ing.name.toLowerCase().includes(p.name.toLowerCase())
        );

        // Missing if not in pantry OR status is 'out' or 'low'
        const isMissingOrLow = !pantryMatch || pantryMatch.status === 'out' || pantryMatch.status === 'low';

        if (isMissingOrLow) {
          missingIngredients.push(ing);
          // Check if already in groceries (unbought)
          const alreadyInGrocery = updatedGroceries.some(g => 
            !g.isBought && g.name.toLowerCase() === ing.name.toLowerCase() && g.store === ing.store
          );

          if (!alreadyInGrocery) {
            updatedGroceries.push({
              id: 'g-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              name: ing.name,
              quantity: ing.quantity,
              store: ing.store,
              department: ing.department,
              isBought: false,
              mealPlanId: newPlanId,
              recipeTitle: newPlan.customTitle,
              addedDate: newPlan.date
            });
          }
        }
      });
    }

    setState(prev => ({
      ...prev,
      mealPlans: [...prev.mealPlans, newPlan],
      groceries: updatedGroceries
    }));
  };

  const removeMealPlan = (id: string) => {
    setState(prev => ({
      ...prev,
      mealPlans: prev.mealPlans.filter(p => p.id !== id),
      // Also remove any nutrition log associated with this plan
      nutritionLogs: prev.nutritionLogs.filter(n => n.mealPlanId !== id)
    }));
  };

  const markMealCooked = (planId: string, deductPantry: boolean) => {
    const meal = state.mealPlans.find(p => p.id === planId);
    if (!meal) return;

    const now = new Date().toISOString();
    const todayStr = meal.date || getInitialDateString();

    // Create nutrition log entry
    const newLogEntry: NutritionLogEntry = {
      id: 'log-' + Date.now(),
      date: todayStr,
      mealPlanId: planId,
      title: meal.customTitle || 'Meal',
      mealType: meal.mealType,
      nutrition: meal.nutrition,
      timestamp: now
    };

    // Optionally deduct pantry items
    let updatedPantry = [...state.pantry];
    if (deductPantry && meal.ingredients) {
      meal.ingredients.forEach(ing => {
        const pIndex = updatedPantry.findIndex(p => 
          p.name.toLowerCase().includes(ing.name.toLowerCase()) || 
          ing.name.toLowerCase().includes(p.name.toLowerCase())
        );
        if (pIndex !== -1) {
          // If was in_stock, downgrade to low; if low, downgrade to out
          const current = updatedPantry[pIndex];
          const newStatus = current.status === 'in_stock' ? 'low' : 'out';
          updatedPantry[pIndex] = {
            ...current,
            status: newStatus,
            lastUpdated: todayStr
          };
        }
      });
    }

    setState(prev => ({
      ...prev,
      mealPlans: prev.mealPlans.map(p => 
        p.id === planId ? { ...p, isCooked: true, cookedAt: now } : p
      ),
      nutritionLogs: [...prev.nutritionLogs.filter(n => n.mealPlanId !== planId), newLogEntry],
      pantry: updatedPantry
    }));
  };

  const unmarkMealCooked = (planId: string) => {
    setState(prev => ({
      ...prev,
      mealPlans: prev.mealPlans.map(p => 
        p.id === planId ? { ...p, isCooked: false, cookedAt: undefined } : p
      ),
      nutritionLogs: prev.nutritionLogs.filter(n => n.mealPlanId !== planId)
    }));
  };

  // --- Grocery Handlers ---
  const addGroceryItem = (itemData: Omit<GroceryItem, 'id' | 'isBought' | 'addedDate'>) => {
    const newItem: GroceryItem = {
      ...itemData,
      id: 'g-' + Date.now(),
      isBought: false,
      addedDate: getInitialDateString()
    };
    setState(prev => ({
      ...prev,
      groceries: [newItem, ...prev.groceries]
    }));
  };

  const toggleGroceryBought = (id: string) => {
    setState(prev => ({
      ...prev,
      groceries: prev.groceries.map(g => 
        g.id === id ? { ...g, isBought: !g.isBought } : g
      )
    }));
  };

  const removeGroceryItem = (id: string) => {
    setState(prev => ({
      ...prev,
      groceries: prev.groceries.filter(g => g.id !== id)
    }));
  };

  const clearBoughtGroceries = (storeFilter: StoreType | 'all' = 'all') => {
    setState(prev => ({
      ...prev,
      groceries: prev.groceries.filter(g => {
        if (!g.isBought) return true;
        if (storeFilter === 'all') return false;
        return g.store !== storeFilter;
      })
    }));
  };

  const moveBoughtToPantry = (storeFilter: StoreType | 'all' = 'all') => {
    const boughtItems = state.groceries.filter(g => 
      g.isBought && (storeFilter === 'all' || g.store === storeFilter)
    );

    if (boughtItems.length === 0) return;

    let updatedPantry = [...state.pantry];
    const todayStr = getInitialDateString();

    boughtItems.forEach(b => {
      const existingIdx = updatedPantry.findIndex(p => p.name.toLowerCase() === b.name.toLowerCase());
      if (existingIdx !== -1) {
        updatedPantry[existingIdx] = {
          ...updatedPantry[existingIdx],
          status: 'in_stock',
          quantity: b.quantity || updatedPantry[existingIdx].quantity,
          lastUpdated: todayStr
        };
      } else {
        updatedPantry.push({
          id: 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          name: b.name,
          quantity: b.quantity || '1 pack',
          store: b.store,
          department: b.department,
          status: 'in_stock',
          lastUpdated: todayStr
        });
      }
    });

    // Remove bought items from grocery list
    const remainingGroceries = state.groceries.filter(g => 
      !(g.isBought && (storeFilter === 'all' || g.store === storeFilter))
    );

    setState(prev => ({
      ...prev,
      pantry: updatedPantry,
      groceries: remainingGroceries
    }));
  };

  const addMissingIngredientsToGrocery = (ingredients: RecipeIngredient[], recipeTitle?: string): number => {
    let count = 0;
    const todayStr = getInitialDateString();
    let updatedGroceries = [...state.groceries];

    ingredients.forEach(ing => {
      // Check if already in list
      const exists = updatedGroceries.some(g => !g.isBought && g.name.toLowerCase() === ing.name.toLowerCase() && g.store === ing.store);
      if (!exists) {
        updatedGroceries.push({
          id: 'g-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          name: ing.name,
          quantity: ing.quantity,
          store: ing.store,
          department: ing.department,
          isBought: false,
          recipeTitle: recipeTitle,
          addedDate: todayStr
        });
        count++;
      }
    });

    if (count > 0) {
      setState(prev => ({
        ...prev,
        groceries: updatedGroceries
      }));
    }
    return count;
  };

  // --- Pantry Handlers ---
  const addPantryItem = (itemData: Omit<PantryItem, 'id' | 'lastUpdated'>) => {
    const newItem: PantryItem = {
      ...itemData,
      id: 'p-' + Date.now(),
      lastUpdated: getInitialDateString()
    };
    setState(prev => ({
      ...prev,
      pantry: [newItem, ...prev.pantry]
    }));
  };

  const updatePantryStatus = (id: string, status: 'in_stock' | 'low' | 'out') => {
    setState(prev => ({
      ...prev,
      pantry: prev.pantry.map(p => 
        p.id === id ? { ...p, status, lastUpdated: getInitialDateString() } : p
      )
    }));
  };

  const removePantryItem = (id: string) => {
    setState(prev => ({
      ...prev,
      pantry: prev.pantry.filter(p => p.id !== id)
    }));
  };

  const sendPantryItemToGrocery = (pantryId: string) => {
    const item = state.pantry.find(p => p.id === pantryId);
    if (!item) return;

    addGroceryItem({
      name: item.name,
      quantity: item.quantity || '1',
      store: item.store,
      department: item.department,
      notes: `Restock needed (${item.status === 'out' ? 'Out of stock' : 'Running low'})`
    });
  };

  // --- Nutrition Handlers ---
  const addQuickLog = (entry: Omit<NutritionLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: NutritionLogEntry = {
      ...entry,
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      nutritionLogs: [...prev.nutritionLogs, newEntry]
    }));
  };

  const removeNutritionLog = (id: string) => {
    setState(prev => ({
      ...prev,
      nutritionLogs: prev.nutritionLogs.filter(n => n.id !== id)
    }));
  };

  const updateWaterIntake = (date: string, deltaMl: number) => {
    setState(prev => {
      const existing = prev.dailyRecords[date] || { date, waterIntake: 0 };
      const newWater = Math.max(0, (existing.waterIntake || 0) + deltaMl);
      return {
        ...prev,
        dailyRecords: {
          ...prev.dailyRecords,
          [date]: {
            ...existing,
            waterIntake: newWater
          }
        }
      };
    });
  };

  const updateDailyGoals = (goals: DailyGoals) => {
    setState(prev => ({
      ...prev,
      dailyGoals: goals
    }));
  };

  // --- Recipe Handlers ---
  const addRecipe = (recipeData: Omit<Recipe, 'id'>) => {
    const newRecipe: Recipe = {
      ...recipeData,
      id: 'recipe-' + Date.now()
    };
    setState(prev => ({
      ...prev,
      recipes: [newRecipe, ...prev.recipes]
    }));
  };

  const updateRecipe = (recipe: Recipe) => {
    setState(prev => ({
      ...prev,
      recipes: prev.recipes.map(r => r.id === recipe.id ? recipe : r)
    }));
  };

  const deleteRecipe = (id: string) => {
    setState(prev => ({
      ...prev,
      recipes: prev.recipes.filter(r => r.id !== id)
    }));
  };

  // --- Backup & Restore ---
  const exportDataJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mealcraft_backup_${getInitialDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.recipes && parsed.dailyGoals) {
        setState({
          recipes: parsed.recipes || INITIAL_RECIPES,
          mealPlans: parsed.mealPlans || [],
          groceries: parsed.groceries || [],
          pantry: parsed.pantry || [],
          nutritionLogs: parsed.nutritionLogs || [],
          dailyRecords: parsed.dailyRecords || {},
          dailyGoals: parsed.dailyGoals || DEFAULT_DAILY_GOALS,
        });
        return true;
      }
    } catch (e) {
      console.error('Failed to import JSON data:', e);
    }
    return false;
  };

  const resetToDefaults = () => {
    setState({
      recipes: INITIAL_RECIPES,
      mealPlans: [],
      groceries: INITIAL_GROCERIES,
      pantry: INITIAL_PANTRY,
      nutritionLogs: [],
      dailyRecords: {},
      dailyGoals: DEFAULT_DAILY_GOALS,
    });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        activeTab,
        setActiveTab,
        selectedDate,
        setSelectedDate,
        activeStoreFilter,
        setActiveStoreFilter,
        addMealPlan,
        removeMealPlan,
        markMealCooked,
        unmarkMealCooked,
        addGroceryItem,
        toggleGroceryBought,
        removeGroceryItem,
        clearBoughtGroceries,
        moveBoughtToPantry,
        addMissingIngredientsToGrocery,
        addPantryItem,
        updatePantryStatus,
        removePantryItem,
        sendPantryItemToGrocery,
        addQuickLog,
        removeNutritionLog,
        updateWaterIntake,
        updateDailyGoals,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        exportDataJSON,
        importDataJSON,
        resetToDefaults
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

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
  RecipeIngredient,
  Nutrition,
  MealType,
  UserProfile,
  BloodReport,
  WeightEntry
} from '../types';
import {
  INITIAL_RECIPES,
  INITIAL_PANTRY,
  INITIAL_GROCERIES,
  DEFAULT_DAILY_GOALS,
  DEFAULT_USER_PROFILE,
  DEFAULT_BLOOD_REPORTS,
  DEFAULT_WEIGHT_HISTORY
} from '../data/defaultData';
import { generateRecommendedGoals } from '../utils/healthCalculator';
import {
  loadInitialStateSync,
  persistAppState,
  loadFullPersistedState,
  LOCAL_STORAGE_KEY
} from '../utils/storageEngine';
import {
  subscribeToAuthState,
  saveUserDataToCloud,
  fetchUserDataFromCloud,
  subscribeToCloudUserData,
  isFirebaseConfigured
} from '../services/firebase';
import type { User } from 'firebase/auth';
import { isIngredientExcluded } from '../utils/ingredientMatcher';

interface AppContextType extends AppState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  activeStoreFilter: StoreType | 'all';
  setActiveStoreFilter: (store: StoreType | 'all') => void;

  // Hydration & Storage State
  isHydrated: boolean;

  // Cloud Sync & Auth
  currentUser: User | null;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'unauthenticated';
  isSyncing: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  forceSyncCloud: () => Promise<void>;

  // Profile, Health & Biomarkers
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  applyRecommendedGoalsToDailyGoals: () => void;
  addBloodReport: (report: Omit<BloodReport, 'id'> & { id?: string }) => string;
  updateBloodReport: (report: BloodReport) => void;
  removeBloodReport: (id: string) => void;
  logWeight: (weight: number, date?: string, notes?: string) => void;
  removeWeightEntry: (id: string) => void;
  
  // Meal Planning
  addMealPlan: (plan: Omit<MealPlanItem, 'id' | 'isCooked'>) => void;
  updateMealPlan: (plan: MealPlanItem) => void;
  removeMealPlan: (id: string) => void;
  markMealCooked: (
    planId: string,
    deductPantry: boolean,
    eatenServings?: number,
    scheduleLeftovers?: boolean,
    customRatio?: number,
    portionLabel?: string,
    leftoverPortionsCount?: number
  ) => void;
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

  // Helper to merge saved recipes without destroying user recipes or custom recipe edits
  const mergeRecipesNonDestructive = (savedRecipes: Recipe[] | undefined, defaultRecipes: Recipe[]): Recipe[] => {
    if (!savedRecipes || !Array.isArray(savedRecipes) || savedRecipes.length === 0) {
      return defaultRecipes;
    }
    const savedIds = new Set(savedRecipes.map(r => r.id));
    const newDefaults = defaultRecipes.filter(dr => !savedIds.has(dr.id));
    return [...savedRecipes, ...newDefaults];
  };

  // Hydration state gate
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Load state from synchronous storage cache (or initialize with robust defaults)
  const [state, setState] = useState<AppState>(() => {
    try {
      const parsed = loadInitialStateSync();
      if (parsed) {
        return {
          recipes: mergeRecipesNonDestructive(parsed.recipes, INITIAL_RECIPES),
          mealPlans: parsed.mealPlans || [],
          groceries: parsed.groceries || INITIAL_GROCERIES,
          pantry: parsed.pantry || INITIAL_PANTRY,
          nutritionLogs: parsed.nutritionLogs || [],
          dailyRecords: parsed.dailyRecords || {},
          dailyGoals: parsed.dailyGoals || DEFAULT_DAILY_GOALS,
          userProfile: { ...DEFAULT_USER_PROFILE, ...(parsed.userProfile || {}) },
          bloodReports: parsed.bloodReports
            ? parsed.bloodReports.filter((r: any) => r.id !== 'report-demo-1')
            : DEFAULT_BLOOD_REPORTS,
          weightHistory: (parsed.weightHistory && parsed.weightHistory.length > 0) ? parsed.weightHistory : DEFAULT_WEIGHT_HISTORY,
        };
      }
    } catch (e) {
      console.error('Error loading initial state:', e);
    }
    return {
      recipes: INITIAL_RECIPES,
      mealPlans: [],
      groceries: INITIAL_GROCERIES,
      pantry: INITIAL_PANTRY,
      nutritionLogs: [],
      dailyRecords: {},
      dailyGoals: DEFAULT_DAILY_GOALS,
      userProfile: DEFAULT_USER_PROFILE,
      bloodReports: DEFAULT_BLOOD_REPORTS,
      weightHistory: DEFAULT_WEIGHT_HISTORY,
    };
  });

  // Helper to merge cloud blood reports with local state so heavy local attachments are NEVER wiped
  const mergeBloodReportsWithLocal = (cloudReports: BloodReport[] | undefined, localReports: BloodReport[]): BloodReport[] => {
    if (!cloudReports || !Array.isArray(cloudReports)) return localReports;

    const cloudIds = new Set(cloudReports.map(r => r.id));
    // Keep recent local reports (< 60s) not yet committed to cloud
    const pendingLocal = localReports.filter(lr => {
      if (cloudIds.has(lr.id)) return false;
      if (lr.id.startsWith('report-')) {
        const timePart = parseInt(lr.id.split('-')[1] || '0', 10);
        if (!isNaN(timePart) && Date.now() - timePart < 60000) {
          return true;
        }
      }
      return false;
    });

    const mergedCloud = cloudReports.map(cr => {
      const localMatch = localReports.find(lr => lr.id === cr.id);
      const localFile = localMatch?.fileData;
      const hasValidLocalFile = Boolean(localFile && localFile.length > 50 && localFile !== '[STORED_IN_INDEXEDDB]');

      return {
        ...cr,
        labName: cr.labName || localMatch?.labName || '',
        notes: cr.notes || localMatch?.notes || '',
        fileName: cr.fileName || localMatch?.fileName || '',
        fileType: cr.fileType || localMatch?.fileType || '',
        fileData: hasValidLocalFile ? (localFile as string) : (cr.fileData || ''),
        hasAttachment: cr.hasAttachment || Boolean(hasValidLocalFile || cr.fileData),
        biomarkers: cr.biomarkers || localMatch?.biomarkers || [],
        recommendedFoods: cr.recommendedFoods || localMatch?.recommendedFoods || [],
        foodsToLimit: cr.foodsToLimit || localMatch?.foodsToLimit || [],
      };
    });

    return [...pendingLocal, ...mergedCloud];
  };

  // Background hydration from IndexedDB on initial mount
  // Restores full uncompressed documents (PDFs, images) and ensures complete data integrity
  useEffect(() => {
    loadFullPersistedState()
      .then(persisted => {
        if (persisted && typeof persisted === 'object') {
          setState(current => {
            const persistedReports = (persisted.bloodReports && persisted.bloodReports.length > 0)
              ? persisted.bloodReports.filter((r: any) => r.id !== 'report-demo-1')
              : [];
            const currentReports = current.bloodReports || [];
            const persistedIds = new Set(persistedReports.map((r: any) => r.id));
            // Preserve any report created during boot before hydration returned
            const onlyInCurrent = currentReports.filter(cr => !persistedIds.has(cr.id));

            const mergedReports = [
              ...onlyInCurrent,
              ...persistedReports.map((pr: BloodReport) => {
                const existing = currentReports.find(cr => cr.id === pr.id);
                const validExistingFile = existing?.fileData && existing.fileData !== '[STORED_IN_INDEXEDDB]' && existing.fileData.length > 50;
                const validPersistedFile = pr.fileData && pr.fileData !== '[STORED_IN_INDEXEDDB]' && pr.fileData.length > 50;
                return {
                  ...pr,
                  ...(existing || {}),
                  fileData: validPersistedFile ? pr.fileData : (validExistingFile ? existing!.fileData : (pr.fileData || '')),
                };
              })
            ];

            return {
              ...current,
              recipes: mergeRecipesNonDestructive(persisted.recipes, INITIAL_RECIPES),
              mealPlans: (persisted.mealPlans && persisted.mealPlans.length > 0) ? persisted.mealPlans : current.mealPlans,
              groceries: (persisted.groceries && persisted.groceries.length > 0) ? persisted.groceries : current.groceries,
              pantry: (persisted.pantry && persisted.pantry.length > 0) ? persisted.pantry : current.pantry,
              nutritionLogs: (persisted.nutritionLogs && persisted.nutritionLogs.length > 0) ? persisted.nutritionLogs : current.nutritionLogs,
              dailyRecords: { ...current.dailyRecords, ...(persisted.dailyRecords || {}) },
              userProfile: { ...DEFAULT_USER_PROFILE, ...current.userProfile, ...(persisted.userProfile || {}) },
              bloodReports: mergedReports.length > 0 ? mergedReports : current.bloodReports,
              weightHistory: (persisted.weightHistory && persisted.weightHistory.length > 0) ? persisted.weightHistory : current.weightHistory,
            };
          });
        }
        setIsHydrated(true);
      })
      .catch(err => {
        console.error('Error hydrating from storage:', err);
        setIsHydrated(true);
      });
  }, []);

  // Auth & Cloud Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'unauthenticated'>('unauthenticated');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Save to both IndexedDB and safe localStorage on every state update
  useEffect(() => {
    if (!isHydrated) return; // Prevent overwriting stored user data before hydration completes!

    persistAppState(state);

    if (currentUser) {
      setSyncStatus('syncing');
      const timer = setTimeout(async () => {
        try {
          await saveUserDataToCloud(currentUser.uid, state);
          setSyncStatus('synced');
        } catch {
          setSyncStatus('offline');
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [state, currentUser, isHydrated]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      setCurrentUser(user);
      if (user) {
        setSyncStatus('syncing');
        setIsSyncing(true);
        try {
          // Fetch cloud state
          const cloudData = await fetchUserDataFromCloud(user.uid);
          if (cloudData && typeof cloudData === 'object' && Object.keys(cloudData).length > 0) {
            setState((prev) => ({
              ...prev,
              recipes: mergeRecipesNonDestructive(cloudData.recipes, prev.recipes),
              mealPlans: cloudData.mealPlans || prev.mealPlans,
              groceries: cloudData.groceries || prev.groceries,
              pantry: cloudData.pantry || prev.pantry,
              nutritionLogs: cloudData.nutritionLogs || prev.nutritionLogs,
              dailyRecords: { ...prev.dailyRecords, ...(cloudData.dailyRecords || {}) },
              dailyGoals: cloudData.dailyGoals || prev.dailyGoals,
              userProfile: { ...DEFAULT_USER_PROFILE, ...prev.userProfile, ...(cloudData.userProfile || {}) },
              bloodReports: mergeBloodReportsWithLocal(cloudData.bloodReports, prev.bloodReports),
              weightHistory: (cloudData.weightHistory && cloudData.weightHistory.length > 0) ? cloudData.weightHistory : prev.weightHistory,
            }));
            setSyncStatus('synced');
          } else {
            // First time login: upload local state so no local data is lost!
            await saveUserDataToCloud(user.uid, state);
            setSyncStatus('synced');
          }
        } catch (err) {
          console.warn('[Sync] Auth login sync error:', err);
          setSyncStatus('offline');
        } finally {
          setIsSyncing(false);
        }
      } else {
        setSyncStatus('unauthenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for multi-device sync
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToCloudUserData(currentUser.uid, (cloudData) => {
      if (cloudData && typeof cloudData === 'object') {
        setState((prev) => ({
          ...prev,
          recipes: mergeRecipesNonDestructive(cloudData.recipes, prev.recipes),
          mealPlans: cloudData.mealPlans || prev.mealPlans,
          groceries: cloudData.groceries || prev.groceries,
          pantry: cloudData.pantry || prev.pantry,
          nutritionLogs: cloudData.nutritionLogs || prev.nutritionLogs,
          dailyRecords: { ...prev.dailyRecords, ...(cloudData.dailyRecords || {}) },
          dailyGoals: cloudData.dailyGoals || prev.dailyGoals,
          userProfile: { ...DEFAULT_USER_PROFILE, ...prev.userProfile, ...(cloudData.userProfile || {}) },
          bloodReports: mergeBloodReportsWithLocal(cloudData.bloodReports, prev.bloodReports),
          weightHistory: (cloudData.weightHistory && cloudData.weightHistory.length > 0) ? cloudData.weightHistory : prev.weightHistory,
        }));
        setSyncStatus('synced');
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const forceSyncCloud = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    setSyncStatus('syncing');
    try {
      await saveUserDataToCloud(currentUser.uid, state);
      const cloudData = await fetchUserDataFromCloud(currentUser.uid);
      if (cloudData) {
        setState((prev) => ({
          ...prev,
          ...cloudData,
          bloodReports: mergeBloodReportsWithLocal(cloudData.bloodReports, prev.bloodReports),
        }));
      }
      setSyncStatus('synced');
    } catch {
      setSyncStatus('offline');
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Meal Planning Handlers ---
  const addMealPlan = (planData: Omit<MealPlanItem, 'id' | 'isCooked'>) => {
    const newPlanId = 'plan-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    // If caller explicitly provided excludedIngredientIds, use that exact list!
    // Otherwise, auto-calculate from user's global profile exclusions.
    let finalExcludedIds: string[];
    if (planData.excludedIngredientIds !== undefined) {
      finalExcludedIds = planData.excludedIngredientIds;
    } else {
      const userExclusions = state.userProfile?.excludedVeggies || [];
      finalExcludedIds = [];
      if (planData.ingredients) {
        planData.ingredients.forEach(ing => {
          if (isIngredientExcluded(ing.name, userExclusions)) {
            finalExcludedIds.push(ing.id);
          }
        });
      }
    }

    const newPlan: MealPlanItem = {
      ...planData,
      id: newPlanId,
      isCooked: false,
      excludedIngredientIds: finalExcludedIds
    };

    // Automatically check recipe ingredients against Pantry and push missing to grocery list!
    let updatedGroceries = [...state.groceries];
    const missingIngredients: RecipeIngredient[] = [];

    const effectiveIngredients = (!newPlan.isLeftover && newPlan.ingredients && newPlan.ingredients.length > 0)
      ? newPlan.ingredients.filter(ing => !finalExcludedIds.includes(ing.id))
      : [];

    if (effectiveIngredients.length > 0) {
      effectiveIngredients.forEach(ing => {
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

  const updateMealPlan = (plan: MealPlanItem) => {
    setState(prev => {
      // Keep unbought groceries in sync for this meal plan when exclusions change
      const excludedIds = plan.excludedIngredientIds || [];
      const updatedGroceries = prev.groceries.filter(g => {
        if (g.mealPlanId !== plan.id || g.isBought) return true;
        const matchingIng = plan.ingredients?.find(i => 
          i.name.toLowerCase() === g.name.toLowerCase() && i.store === g.store
        );
        if (matchingIng && excludedIds.includes(matchingIng.id)) {
          return false; // Remove omitted ingredient from groceries
        }
        return true;
      });

      return {
        ...prev,
        mealPlans: prev.mealPlans.map(p => p.id === plan.id ? plan : p),
        groceries: updatedGroceries
      };
    });
  };

  const removeMealPlan = (id: string) => {
    setState(prev => ({
      ...prev,
      mealPlans: prev.mealPlans.filter(p => p.id !== id),
      // Also remove any nutrition log associated with this plan
      nutritionLogs: prev.nutritionLogs.filter(n => n.mealPlanId !== id)
    }));
  };

  const markMealCooked = (
    planId: string,
    deductPantry: boolean,
    eatenServings: number = 1,
    scheduleLeftovers: boolean = false,
    customRatio?: number,
    portionLabel?: string,
    leftoverPortionsCount?: number
  ) => {
    const meal = state.mealPlans.find(p => p.id === planId);
    if (!meal) return;

    const now = new Date().toISOString();
    const todayStr = meal.date || getInitialDateString();

    const totalCookedServings = Math.max(1, meal.servings || 1);

    // Determine ratio of batch eaten (either by weight customRatio e.g. 200g/800g = 0.25, or by servings)
    const ratio = (customRatio && customRatio > 0 && customRatio <= 1)
      ? customRatio
      : (Math.max(1, Math.min(totalCookedServings, eatenServings)) / totalCookedServings);

    // Nutrition consumed
    const eatenNutrition: Nutrition = {
      calories: Math.round(meal.nutrition.calories * ratio),
      protein: Math.round(meal.nutrition.protein * ratio),
      carbs: Math.round(meal.nutrition.carbs * ratio),
      fats: Math.round(meal.nutrition.fats * ratio),
      fiber: Math.round(meal.nutrition.fiber * ratio),
    };

    // Description label for the nutrition log
    const label = portionLabel || (totalCookedServings > 1 ? `${eatenServings} of ${totalCookedServings} servings` : '');
    const logTitle = label ? `${meal.customTitle || 'Meal'} (${label})` : (meal.customTitle || 'Meal');

    // Create nutrition log entry for the portion eaten today
    const newLogEntry: NutritionLogEntry = {
      id: 'log-' + Date.now(),
      date: todayStr,
      mealPlanId: planId,
      title: logTitle,
      mealType: meal.mealType,
      nutrition: eatenNutrition,
      timestamp: now
    };

    // Calculate remaining leftovers
    const remainingRatio = Math.max(0, 1 - ratio);
    const numLeftovers = leftoverPortionsCount !== undefined
      ? leftoverPortionsCount
      : Math.max(0, totalCookedServings - eatenServings);

    const leftoverPlans: MealPlanItem[] = [];

    if (scheduleLeftovers && remainingRatio > 0.05 && numLeftovers > 0) {
      const perLeftoverRatio = remainingRatio / numLeftovers;
      const perLeftoverNutrition: Nutrition = {
        calories: Math.round(meal.nutrition.calories * perLeftoverRatio),
        protein: Math.round(meal.nutrition.protein * perLeftoverRatio),
        carbs: Math.round(meal.nutrition.carbs * perLeftoverRatio),
        fats: Math.round(meal.nutrition.fats * perLeftoverRatio),
        fiber: Math.round(meal.nutrition.fiber * perLeftoverRatio),
      };

      const baseDate = new Date(todayStr + 'T00:00:00');
      for (let i = 0; i < numLeftovers; i++) {
        const targetDate = new Date(baseDate);
        const daysAhead = Math.floor(i / 2) + 1; // alternate: tomorrow lunch, tomorrow dinner, day after lunch...
        targetDate.setDate(targetDate.getDate() + daysAhead);
        const targetDateStr = targetDate.toISOString().split('T')[0];
        const targetMealType: MealType = (i % 2 === 0) ? 'lunch' : 'dinner';

        leftoverPlans.push({
          id: 'plan-leftover-' + Date.now() + '-' + i,
          date: targetDateStr,
          mealType: targetMealType,
          recipeId: meal.recipeId,
          customTitle: `${meal.customTitle} (Leftover)`,
          servings: 1,
          nutrition: perLeftoverNutrition,
          isCooked: false,
          isLeftover: true,
          ingredients: [] // already in fridge!
        });
      }
    }

    // Optionally deduct pantry items for the cooked batch (if not already a leftover)
    let updatedPantry = [...state.pantry];
    if (deductPantry && !meal.isLeftover && meal.ingredients) {
      const userExclusions = state.userProfile?.excludedVeggies || [];
      const activeIngredients = meal.ingredients.filter(ing => {
        if (meal.excludedIngredientIds !== undefined) {
          return !meal.excludedIngredientIds.includes(ing.id);
        }
        return !isIngredientExcluded(ing.name, userExclusions);
      });
      activeIngredients.forEach(ing => {
        const pIndex = updatedPantry.findIndex(p => 
          p.name.toLowerCase().includes(ing.name.toLowerCase()) || 
          ing.name.toLowerCase().includes(p.name.toLowerCase())
        );
        if (pIndex !== -1) {
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
      mealPlans: [
        ...prev.mealPlans.map(p => 
          p.id === planId ? { ...p, isCooked: true, cookedAt: now } : p
        ),
        ...leftoverPlans
      ],
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

  // --- Profile, Health & Weight Handlers ---
  const updateUserProfile = (updatedFields: Partial<UserProfile>) => {
    setState(prev => {
      const newProfile: UserProfile = { ...prev.userProfile, ...updatedFields };
      const newGoals: DailyGoals = {
        calories: newProfile.customTargetCalories !== undefined ? newProfile.customTargetCalories : prev.dailyGoals.calories,
        protein: newProfile.customTargetProtein !== undefined ? newProfile.customTargetProtein : prev.dailyGoals.protein,
        carbs: newProfile.customTargetCarbs !== undefined ? newProfile.customTargetCarbs : prev.dailyGoals.carbs,
        fats: newProfile.customTargetFats !== undefined ? newProfile.customTargetFats : prev.dailyGoals.fats,
        fiber: newProfile.customTargetFiber !== undefined ? newProfile.customTargetFiber : prev.dailyGoals.fiber,
        water: newProfile.customTargetWater !== undefined ? newProfile.customTargetWater : prev.dailyGoals.water,
      };

      let newWeightHistory = prev.weightHistory;
      if (updatedFields.weight !== undefined && updatedFields.weight !== prev.userProfile.weight) {
        const todayStr = getInitialDateString();
        const weightEntry: WeightEntry = {
          id: 'w-' + Date.now(),
          date: todayStr,
          weight: updatedFields.weight,
          notes: 'Profile weight update'
        };
        newWeightHistory = [weightEntry, ...prev.weightHistory.filter(w => w.date !== todayStr)];
      }

      return {
        ...prev,
        userProfile: newProfile,
        dailyGoals: newGoals,
        weightHistory: newWeightHistory
      };
    });
  };

  const applyRecommendedGoalsToDailyGoals = () => {
    setState(prev => {
      const rec = generateRecommendedGoals(prev.userProfile);
      return {
        ...prev,
        dailyGoals: rec,
        userProfile: {
          ...prev.userProfile,
          customTargetCalories: rec.calories,
          customTargetProtein: rec.protein,
          customTargetCarbs: rec.carbs,
          customTargetFats: rec.fats,
          customTargetFiber: rec.fiber,
          customTargetWater: rec.water,
        }
      };
    });
  };

  const addBloodReport = (reportData: Omit<BloodReport, 'id'> & { id?: string }): string => {
    const newId = reportData.id || ('report-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6));
    const newReport: BloodReport = {
      ...reportData,
      id: newId,
      labName: reportData.labName || '',
      notes: reportData.notes || '',
      fileName: reportData.fileName || '',
      fileData: reportData.fileData || '',
      fileType: reportData.fileType || '',
      hasAttachment: Boolean(reportData.fileData && reportData.fileData.length > 0),
      biomarkers: reportData.biomarkers || [],
      overallSummary: reportData.overallSummary || '',
      recommendedFoods: reportData.recommendedFoods || [],
      foodsToLimit: reportData.foodsToLimit || [],
    };
    setState(prev => ({
      ...prev,
      bloodReports: [newReport, ...prev.bloodReports.filter(r => r.id !== newId)]
    }));
    return newId;
  };

  const updateBloodReport = (report: BloodReport) => {
    setState(prev => ({
      ...prev,
      bloodReports: prev.bloodReports.map(r => r.id === report.id ? {
        ...r,
        ...report,
        hasAttachment: Boolean(report.fileData || r.fileData),
      } : r)
    }));
  };

  const removeBloodReport = (id: string) => {
    setState(prev => ({
      ...prev,
      bloodReports: prev.bloodReports.filter(r => r.id !== id)
    }));
  };

  const logWeight = (weight: number, date?: string, notes?: string) => {
    const entryDate = date || getInitialDateString();
    const newEntry: WeightEntry = {
      id: 'w-' + Date.now(),
      date: entryDate,
      weight,
      notes
    };
    setState(prev => ({
      ...prev,
      userProfile: {
        ...prev.userProfile,
        weight
      },
      weightHistory: [newEntry, ...prev.weightHistory.filter(w => w.date !== entryDate)]
    }));
  };

  const removeWeightEntry = (id: string) => {
    setState(prev => ({
      ...prev,
      weightHistory: prev.weightHistory.filter(w => w.id !== id)
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
      if (parsed && typeof parsed === 'object') {
        const newState: AppState = {
          recipes: (parsed.recipes && parsed.recipes.length > 0) ? parsed.recipes : INITIAL_RECIPES,
          mealPlans: parsed.mealPlans || [],
          groceries: parsed.groceries || [],
          pantry: parsed.pantry || [],
          nutritionLogs: parsed.nutritionLogs || [],
          dailyRecords: parsed.dailyRecords || {},
          dailyGoals: parsed.dailyGoals || DEFAULT_DAILY_GOALS,
          userProfile: { ...DEFAULT_USER_PROFILE, ...(parsed.userProfile || {}) },
          bloodReports: parsed.bloodReports
            ? parsed.bloodReports.filter((r: any) => r.id !== 'report-demo-1')
            : DEFAULT_BLOOD_REPORTS,
          weightHistory: (parsed.weightHistory && parsed.weightHistory.length > 0) ? parsed.weightHistory : DEFAULT_WEIGHT_HISTORY,
        };
        setState(newState);
        persistAppState(newState);
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
      userProfile: DEFAULT_USER_PROFILE,
      bloodReports: DEFAULT_BLOOD_REPORTS,
      weightHistory: DEFAULT_WEIGHT_HISTORY,
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
        updateMealPlan,
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
        updateUserProfile,
        applyRecommendedGoalsToDailyGoals,
        addBloodReport,
        updateBloodReport,
        removeBloodReport,
        logWeight,
        removeWeightEntry,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        exportDataJSON,
        importDataJSON,
        resetToDefaults,

        // Hydration & Storage State
        isHydrated,

        // Cloud Sync & Auth
        currentUser,
        syncStatus,
        isSyncing,
        isAuthModalOpen,
        setIsAuthModalOpen,
        forceSyncCloud
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

export type StoreType = 'indian' | 'american' | 'costco' | 'other';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

export type DepartmentType = 
  | 'Produce'
  | 'Spices & Lentils'
  | 'Dairy & Eggs'
  | 'Meat & Seafood'
  | 'Pantry & Bulk'
  | 'Bakery & Grains'
  | 'Frozen'
  | 'Snacks & Beverages'
  | 'Other';

export interface Nutrition {
  calories: number; // kcal
  protein: number;  // g
  carbs: number;    // g
  fats: number;     // g
  fiber: number;    // g
}

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: string;
  store: StoreType;
  department: DepartmentType;
  optional?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number;
  prepTime: string;
  cuisine: 'indian' | 'american' | 'costco-prep' | 'custom';
  category?: 'meal' | 'snack' | 'dessert';
  tags: string[];
  nutritionPerServing: Nutrition;
  ingredients: RecipeIngredient[];
  instructions: string[];
  imageEmoji: string;
  defaultExcludedIngredientIds?: string[];
}

export interface MealPlanItem {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  recipeId?: string;
  customTitle?: string;
  servings: number;
  nutrition: Nutrition; // total for the planned servings
  isCooked: boolean;
  cookedAt?: string;
  isLeftover?: boolean;
  ingredients: RecipeIngredient[];
  excludedIngredientIds?: string[];
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  store: StoreType;
  department: DepartmentType;
  isBought: boolean;
  mealPlanId?: string;
  recipeTitle?: string;
  notes?: string;
  addedDate: string;
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  store: StoreType;
  department: DepartmentType;
  status: 'in_stock' | 'low' | 'out';
  lastUpdated: string;
}

export interface NutritionLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealPlanId?: string;
  title: string;
  mealType: MealType;
  nutrition: Nutrition;
  timestamp: string;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  water: number; // in ml
}

export interface DailyRecord {
  date: string;
  waterIntake: number; // in ml
  notes?: string;
}

export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type FitnessGoal = 'lose_weight' | 'maintain' | 'build_muscle';

export interface UserProfile {
  name: string;
  dateOfBirth?: string; // YYYY-MM-DD
  age: number;
  weight: number; // in kg
  weightUnit: 'kg' | 'lbs';
  height: number; // in cm
  heightUnit: 'cm' | 'ft_in';
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  excludedVeggies?: string[];
  includeSnacksInPlanner?: boolean;
  includeDessertsInPlanner?: boolean;
  customTargetCalories?: number;
  customTargetProtein?: number;
  customTargetCarbs?: number;
  customTargetFats?: number;
  customTargetFiber?: number;
  customTargetWater?: number;
}

export interface Biomarker {
  id: string;
  name: string;
  category: 'Metabolic / Glucose' | 'Lipid Panel' | 'Vitamins & Minerals' | 'Liver & Kidney' | 'Blood Count' | 'Other';
  value: number;
  unit: string;
  minNormal: number;
  maxNormal: number;
  status: 'low' | 'normal' | 'high';
  dietaryTip: string;
}

export interface BloodReport {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  labName?: string;
  fileName?: string;
  fileData?: string; // base64 or data URL
  fileType?: string;
  notes?: string;
  biomarkers?: Biomarker[];
  overallSummary?: string;
  recommendedFoods?: string[];
  foodsToLimit?: string[];
  hasAttachment?: boolean;
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // in kg
  notes?: string;
}

export interface AppState {
  recipes: Recipe[];
  mealPlans: MealPlanItem[];
  groceries: GroceryItem[];
  pantry: PantryItem[];
  nutritionLogs: NutritionLogEntry[];
  dailyRecords: Record<string, DailyRecord>; // keyed by YYYY-MM-DD
  dailyGoals: DailyGoals;
  userProfile: UserProfile;
  bloodReports: BloodReport[];
  weightHistory: WeightEntry[];
}

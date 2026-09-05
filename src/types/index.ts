export type StoreType = 'indian' | 'american' | 'costco' | 'other';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

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
  tags: string[];
  nutritionPerServing: Nutrition;
  ingredients: RecipeIngredient[];
  instructions: string[];
  imageEmoji: string;
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
  ingredients: RecipeIngredient[];
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

export interface AppState {
  recipes: Recipe[];
  mealPlans: MealPlanItem[];
  groceries: GroceryItem[];
  pantry: PantryItem[];
  nutritionLogs: NutritionLogEntry[];
  dailyRecords: Record<string, DailyRecord>; // keyed by YYYY-MM-DD
  dailyGoals: DailyGoals;
}

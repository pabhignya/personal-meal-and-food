import { Recipe, PantryItem, GroceryItem, DailyGoals } from '../types';

export const STORE_METADATA = {
  indian: {
    id: 'indian',
    name: 'Indian Grocery',
    shortName: 'Indian Store',
    subtext: 'Patel Brothers, Subzi Mandi, local Indian markets',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    accentColor: '#ea580c',
    icon: 'Spice',
    description: 'Spices, Dals, Atta flour, Paneer, Curry leaves, Basmati rice, Ghee',
  },
  american: {
    id: 'american',
    name: 'American Grocery',
    shortName: 'Supermarket',
    subtext: "Trader Joe's, Kroger, Safeway, Whole Foods",
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    accentColor: '#2563eb',
    icon: 'Store',
    description: 'Fresh salad greens, specialty cheeses, bakery breads, dairy, deli',
  },
  costco: {
    id: 'costco',
    name: 'Costco / Wholesale',
    shortName: 'Costco Wholesale',
    subtext: 'Kirkland bulk values & meal prep proteins',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    accentColor: '#dc2626',
    icon: 'Boxes',
    description: 'Bulk chicken breasts, eggs, Greek yogurt, salmon, olive oil, oats, nuts',
  },
  other: {
    id: 'other',
    name: 'General / Other',
    shortName: 'Other Stores',
    subtext: 'Target, Farmers Market, Asian market',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    accentColor: '#64748b',
    icon: 'ShoppingBag',
    description: 'Specialty snacks, household essentials, specialty seasonings',
  }
} as const;

export const DEFAULT_DAILY_GOALS: DailyGoals = {
  calories: 2000,
  protein: 135, // grams
  carbs: 190,   // grams
  fats: 60,     // grams
  fiber: 30,    // grams
  water: 2500,  // ml (10 glasses of 250ml)
};

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'recipe-1',
    title: 'Palak Paneer & Basmati Rice',
    description: 'Vibrant spinach gravy blended with paneer cubes and served over fragrant basmati rice.',
    servings: 2,
    prepTime: '30 mins',
    cuisine: 'indian',
    tags: ['Vegetarian', 'High Protein', 'Classic Indian'],
    imageEmoji: '🥘',
    nutritionPerServing: {
      calories: 490,
      protein: 24,
      carbs: 48,
      fats: 22,
      fiber: 6
    },
    ingredients: [
      { id: 'ing-1', name: 'Paneer Block', quantity: '250g', store: 'indian', department: 'Dairy & Eggs' },
      { id: 'ing-2', name: 'Baby Spinach Leaves', quantity: '1 big tub (16oz)', store: 'costco', department: 'Produce' },
      { id: 'ing-3', name: 'Garam Masala & Kasuri Methi', quantity: '1 tbsp each', store: 'indian', department: 'Spices & Lentils' },
      { id: 'ing-4', name: 'Heavy Cream or Greek Yogurt', quantity: '3 tbsp', store: 'american', department: 'Dairy & Eggs' },
      { id: 'ing-5', name: 'Royal Basmati Rice', quantity: '1 cup', store: 'costco', department: 'Pantry & Bulk' },
      { id: 'ing-6', name: 'Ginger & Garlic Paste', quantity: '1 tbsp', store: 'indian', department: 'Produce' },
      { id: 'ing-7', name: 'Onions & Tomatoes', quantity: '2 each', store: 'american', department: 'Produce' }
    ],
    instructions: [
      'Blanch spinach in boiling water for 2 minutes, shock in ice water, then blend into a smooth puree.',
      'In a pan, sauté diced onions, ginger-garlic paste, and pureed tomatoes until fragrant and oil separates.',
      'Add turmeric, garam masala, salt, and spinach puree. Simmer on low heat for 5 minutes.',
      'Fold in paneer cubes and a dash of cream. Cook covered for 4 minutes.',
      'Serve hot alongside steamed basmati rice.'
    ]
  },
  {
    id: 'recipe-2',
    title: 'Dal Tadka with Jeera Ghee',
    description: 'Hearty yellow toor and masoor lentils tempered with cumin, garlic, Kashmiri chili, and pure ghee.',
    servings: 3,
    prepTime: '25 mins',
    cuisine: 'indian',
    tags: ['High Fiber', 'Vegetarian', 'Comfort Food'],
    imageEmoji: '🍲',
    nutritionPerServing: {
      calories: 360,
      protein: 18,
      carbs: 52,
      fats: 9,
      fiber: 10
    },
    ingredients: [
      { id: 'ing-8', name: 'Toor Dal & Moong Dal', quantity: '1 cup mixed', store: 'indian', department: 'Spices & Lentils' },
      { id: 'ing-9', name: 'Pure Desi Ghee', quantity: '2 tbsp', store: 'indian', department: 'Pantry & Bulk' },
      { id: 'ing-10', name: 'Cumin Seeds (Jeera) & Hing', quantity: '1 tbsp', store: 'indian', department: 'Spices & Lentils' },
      { id: 'ing-11', name: 'Whole Garlic Cloves & Green Chillies', quantity: '5 cloves, 2 chillies', store: 'american', department: 'Produce' },
      { id: 'ing-12', name: 'Fresh Cilantro (Kothmir)', quantity: '1 bunch', store: 'american', department: 'Produce' }
    ],
    instructions: [
      'Pressure cook or instant pot the dal with water, turmeric, and salt until tender and creamy.',
      'Heat ghee in a small tadka pan. Splutter cumin seeds, sliced garlic, and slit green chillies until golden.',
      'Pour sizzling tempering over cooked dal immediately and cover with lid to trap the aroma.',
      'Garnish with freshly chopped cilantro and lemon juice.'
    ]
  },
  {
    id: 'recipe-3',
    title: 'Costco High-Protein Sheet Pan Chicken & Veggies',
    description: 'Juicy, marinated chicken breasts roasted alongside bell peppers, broccoli florets, and red onion.',
    servings: 4,
    prepTime: '35 mins',
    cuisine: 'costco-prep',
    tags: ['High Protein', 'Low Carb', 'Meal Prep'],
    imageEmoji: '🍗',
    nutritionPerServing: {
      calories: 420,
      protein: 46,
      carbs: 14,
      fats: 18,
      fiber: 5
    },
    ingredients: [
      { id: 'ing-13', name: 'Kirkland Boneless Skinless Chicken Breasts', quantity: '2 lbs', store: 'costco', department: 'Meat & Seafood' },
      { id: 'ing-14', name: 'Costco Bell Pepper 6-Pack', quantity: '3 peppers', store: 'costco', department: 'Produce' },
      { id: 'ing-15', name: 'Fresh Broccoli Florets Bag', quantity: '1 lb', store: 'costco', department: 'Produce' },
      { id: 'ing-16', name: 'Kirkland Extra Virgin Olive Oil', quantity: '2 tbsp', store: 'costco', department: 'Pantry & Bulk' },
      { id: 'ing-17', name: 'Smoked Paprika, Garlic Powder, Italian Herb Seasoning', quantity: '1 tbsp', store: 'american', department: 'Spices & Lentils' }
    ],
    instructions: [
      'Preheat oven to 400°F (200°C). Line a large baking sheet with parchment paper.',
      'Cut chicken breasts into bite-sized pieces. Chop bell peppers and broccoli.',
      'Toss chicken and vegetables with olive oil, paprika, garlic powder, salt, and pepper.',
      'Spread evenly on sheet pan and bake for 22-25 minutes until chicken registers 165°F.',
      'Divide into 4 meal prep containers for the week.'
    ]
  },
  {
    id: 'recipe-4',
    title: 'Wild Alaskan Salmon & Roasted Asparagus',
    description: 'Crispy pan-seared salmon fillet glazed with lemon herb butter, accompanied by tender asparagus.',
    servings: 2,
    prepTime: '20 mins',
    cuisine: 'costco-prep',
    tags: ['High Protein', 'Omega 3', 'Quick 20-min'],
    imageEmoji: '🐟',
    nutritionPerServing: {
      calories: 460,
      protein: 38,
      carbs: 6,
      fats: 28,
      fiber: 3
    },
    ingredients: [
      { id: 'ing-18', name: 'Kirkland Wild Sockeye Salmon Fillets', quantity: '2 portions (12oz)', store: 'costco', department: 'Meat & Seafood' },
      { id: 'ing-19', name: 'Fresh Asparagus Bunch', quantity: '1 lb', store: 'costco', department: 'Produce' },
      { id: 'ing-20', name: 'Fresh Lemons & Organic Butter', quantity: '2 lemons, 1 tbsp butter', store: 'american', department: 'Produce' },
      { id: 'ing-21', name: 'Coarse Sea Salt & Cracked Black Pepper', quantity: 'to taste', store: 'american', department: 'Spices & Lentils' }
    ],
    instructions: [
      'Pat salmon dry with paper towel; season generously with sea salt and black pepper.',
      'Heat 1 tbsp olive oil in a non-stick skillet over medium-high heat.',
      'Sear salmon skin-side down for 5 minutes, flip, baste with butter and lemon juice for 3-4 minutes.',
      'In the same pan or air fryer, roast trimmed asparagus with olive oil and lemon zest for 6 minutes.',
      'Plate together with fresh lemon wedges.'
    ]
  },
  {
    id: 'recipe-5',
    title: 'Overnight Chia Protein Oats',
    description: 'Creamy rolled oats soaked in almond milk with Greek yogurt, chia seeds, honey, and fresh berries.',
    servings: 1,
    prepTime: '5 mins prep (overnight)',
    cuisine: 'costco-prep',
    tags: ['Breakfast', 'High Fiber', 'High Protein'],
    imageEmoji: '🥣',
    nutritionPerServing: {
      calories: 380,
      protein: 26,
      carbs: 52,
      fats: 8,
      fiber: 9
    },
    ingredients: [
      { id: 'ing-22', name: 'Kirkland Organic Rolled Oats', quantity: '1/2 cup', store: 'costco', department: 'Pantry & Bulk' },
      { id: 'ing-23', name: 'Kirkland Plain Organic Greek Yogurt', quantity: '3/4 cup', store: 'costco', department: 'Dairy & Eggs' },
      { id: 'ing-24', name: 'Organic Chia Seeds', quantity: '1 tbsp', store: 'costco', department: 'Pantry & Bulk' },
      { id: 'ing-25', name: 'Unsweetened Almond Milk', quantity: '1/2 cup', store: 'american', department: 'Dairy & Eggs' },
      { id: 'ing-26', name: 'Fresh Blueberries & Strawberries', quantity: '1/3 cup', store: 'costco', department: 'Produce' }
    ],
    instructions: [
      'In a mason jar or bowl, combine rolled oats, Greek yogurt, chia seeds, and almond milk.',
      'Stir well with a fork, cover, and refrigerate overnight (or at least 4 hours).',
      'In the morning, top with fresh berries, a drizzle of raw honey or cinnamon, and enjoy cold!'
    ]
  },
  {
    id: 'recipe-6',
    title: 'Turkey Avocado Power Salad',
    description: 'Crisp mixed greens, lean sliced turkey, ripe avocado, English cucumber, and toasted pumpkin seeds.',
    servings: 1,
    prepTime: '10 mins',
    cuisine: 'american',
    tags: ['Quick Lunch', 'Keto Friendly', 'No Cook'],
    imageEmoji: '🥗',
    nutritionPerServing: {
      calories: 410,
      protein: 34,
      carbs: 12,
      fats: 24,
      fiber: 7
    },
    ingredients: [
      { id: 'ing-27', name: 'Organic Spring Mix Greens', quantity: '3 cups', store: 'american', department: 'Produce' },
      { id: 'ing-28', name: 'Roasted Turkey Breast Slices', quantity: '6 oz', store: 'costco', department: 'Meat & Seafood' },
      { id: 'ing-29', name: 'Hass Avocado', quantity: '1/2 avocado', store: 'costco', department: 'Produce' },
      { id: 'ing-30', name: 'English Cucumber & Cherry Tomatoes', quantity: '1/2 cup', store: 'american', department: 'Produce' },
      { id: 'ing-31', name: 'Balsamic Vinaigrette & Pumpkin Seeds', quantity: '2 tbsp', store: 'american', department: 'Pantry & Bulk' }
    ],
    instructions: [
      'Wash and dry salad greens and place in a wide bowl.',
      'Slice roasted turkey breast, ripe avocado, and cucumber.',
      'Assemble turkey and toppings over greens.',
      'Drizzle with balsamic vinaigrette and sprinkle pumpkin seeds for a crunchy finish.'
    ]
  }
];

export const INITIAL_PANTRY: PantryItem[] = [
  { id: 'p-1', name: 'Pure Desi Ghee', quantity: '1 jar (500g)', store: 'indian', department: 'Pantry & Bulk', status: 'in_stock', lastUpdated: '2026-09-01' },
  { id: 'p-2', name: 'Garam Masala & Spices', quantity: 'Full spice box', store: 'indian', department: 'Spices & Lentils', status: 'in_stock', lastUpdated: '2026-09-01' },
  { id: 'p-3', name: 'Kirkland Extra Virgin Olive Oil', quantity: '2L bottle', store: 'costco', department: 'Pantry & Bulk', status: 'in_stock', lastUpdated: '2026-09-01' },
  { id: 'p-4', name: 'Kirkland Organic Rolled Oats', quantity: '10 lb box', store: 'costco', department: 'Pantry & Bulk', status: 'in_stock', lastUpdated: '2026-09-01' },
  { id: 'p-5', name: 'Royal Basmati Rice', quantity: '20 lb bag', store: 'costco', department: 'Pantry & Bulk', status: 'in_stock', lastUpdated: '2026-09-01' },
  { id: 'p-6', name: 'Turmeric Powder (Haldi)', quantity: '200g', store: 'indian', department: 'Spices & Lentils', status: 'in_stock', lastUpdated: '2026-09-01' },
  { id: 'p-7', name: 'Paneer Block', quantity: 'Empty', store: 'indian', department: 'Dairy & Eggs', status: 'out', lastUpdated: '2026-09-04' },
  { id: 'p-8', name: 'Toor Dal & Moong Dal', quantity: 'Almost empty', store: 'indian', department: 'Spices & Lentils', status: 'low', lastUpdated: '2026-09-04' },
  { id: 'p-9', name: 'Kirkland Plain Organic Greek Yogurt', quantity: '1/4 tub left', store: 'costco', department: 'Dairy & Eggs', status: 'low', lastUpdated: '2026-09-05' }
];

export const INITIAL_GROCERIES: GroceryItem[] = [
  // Indian Store
  {
    id: 'g-1',
    name: 'Paneer Block (250g)',
    quantity: '2 packs',
    store: 'indian',
    department: 'Dairy & Eggs',
    isBought: false,
    recipeTitle: 'Palak Paneer',
    notes: 'Prefer fresh Haldiram or Nanak brand',
    addedDate: '2026-09-05'
  },
  {
    id: 'g-2',
    name: 'Kasuri Methi (Dried Fenugreek)',
    quantity: '1 box (100g)',
    store: 'indian',
    department: 'Spices & Lentils',
    isBought: false,
    recipeTitle: 'Palak Paneer',
    addedDate: '2026-09-05'
  },
  {
    id: 'g-3',
    name: 'Toor Dal (Oily or Plain)',
    quantity: '4 lb bag',
    store: 'indian',
    department: 'Spices & Lentils',
    isBought: false,
    notes: 'Low stock in pantry',
    addedDate: '2026-09-05'
  },
  // Costco Wholesale
  {
    id: 'g-4',
    name: 'Kirkland Boneless Chicken Breasts',
    quantity: '6-pack (approx 10 lbs)',
    store: 'costco',
    department: 'Meat & Seafood',
    isBought: false,
    recipeTitle: 'Sheet Pan Chicken Meal Prep',
    notes: 'Freezer refill',
    addedDate: '2026-09-05'
  },
  {
    id: 'g-5',
    name: 'Kirkland Organic Greek Yogurt',
    quantity: '48 oz tub',
    store: 'costco',
    department: 'Dairy & Eggs',
    isBought: false,
    recipeTitle: 'Overnight Chia Protein Oats',
    addedDate: '2026-09-05'
  },
  {
    id: 'g-6',
    name: 'Organic Pasture-Raised Eggs',
    quantity: '2 dozen',
    store: 'costco',
    department: 'Dairy & Eggs',
    isBought: false,
    addedDate: '2026-09-05'
  },
  {
    id: 'g-7',
    name: 'Costco Organic Baby Spinach Tub',
    quantity: '1 tub (1 lb)',
    store: 'costco',
    department: 'Produce',
    isBought: false,
    recipeTitle: 'Palak Paneer & Salads',
    addedDate: '2026-09-05'
  },
  // American Supermarket
  {
    id: 'g-8',
    name: 'Fresh English Cucumbers & Cherry Tomatoes',
    quantity: '1 pack',
    store: 'american',
    department: 'Produce',
    isBought: false,
    recipeTitle: 'Turkey Avocado Salad',
    addedDate: '2026-09-05'
  },
  {
    id: 'g-9',
    name: 'Unsweetened Vanilla Almond Milk',
    quantity: '1 half-gallon',
    store: 'american',
    department: 'Dairy & Eggs',
    isBought: false,
    recipeTitle: 'Overnight Oats',
    addedDate: '2026-09-05'
  }
];

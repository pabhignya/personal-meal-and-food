import { Recipe, PantryItem, GroceryItem, DailyGoals, BloodReport } from '../types';

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

export const DEFAULT_USER_PROFILE = {
  name: 'Alex',
  dateOfBirth: '1996-05-15',
  age: 30,
  weight: 75,
  weightUnit: 'kg' as const,
  height: 175,
  heightUnit: 'cm' as const,
  gender: 'male' as const,
  activityLevel: 'moderate' as const,
  goal: 'maintain' as const,
  excludedVeggies: ['Bitter Gourd (Karela)', 'Mushrooms'],
  includeSnacksInPlanner: true,
  includeDessertsInPlanner: true,
  customTargetCalories: 2000,
  customTargetProtein: 135,
  customTargetCarbs: 190,
  customTargetFats: 60,
  customTargetFiber: 30,
  customTargetWater: 2500,
};

export const DEFAULT_BLOOD_REPORTS: BloodReport[] = [];

export const DEFAULT_WEIGHT_HISTORY = [
  { id: 'w-1', date: '2026-08-01', weight: 76.8, notes: 'Starting month baseline' },
  { id: 'w-2', date: '2026-08-15', weight: 75.9, notes: 'Mid-month check-in' },
  { id: 'w-3', date: '2026-09-01', weight: 75.0, notes: 'Target achieved with consistent meal prep!' },
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'recipe-1',
    title: 'Palak Paneer & Basmati Rice',
    description: 'Vibrant spinach gravy blended with paneer cubes and served over fragrant basmati rice.',
    servings: 2,
    prepTime: '30 mins',
    cuisine: 'indian',
    category: 'meal',
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
    category: 'meal',
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
    category: 'meal',
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
    category: 'meal',
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
    category: 'meal',
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
    category: 'meal',
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
  },
  {
    id: 'recipe-7',
    title: 'Roasted Masala Makhana & Cashews',
    description: 'Crispy roasted foxnuts (lotus seeds) and whole cashews tossed in a touch of ghee, turmeric, chaat masala, and Himalayan pink salt.',
    servings: 2,
    prepTime: '10 mins',
    cuisine: 'indian',
    category: 'snack',
    tags: ['Snack', 'Low Calorie', 'High Fiber', 'Crunchy'],
    imageEmoji: '🍿',
    nutritionPerServing: {
      calories: 180,
      protein: 5,
      carbs: 22,
      fats: 8,
      fiber: 4
    },
    ingredients: [
      { id: 'ing-32', name: 'Phool Makhana (Foxnuts)', quantity: '2 cups', store: 'indian', department: 'Pantry & Bulk' },
      { id: 'ing-33', name: 'Kirkland Raw Whole Cashews', quantity: '1/4 cup', store: 'costco', department: 'Pantry & Bulk' },
      { id: 'ing-34', name: 'Pure Desi Ghee', quantity: '1 tsp', store: 'indian', department: 'Pantry & Bulk' },
      { id: 'ing-35', name: 'Chaat Masala & Roasted Cumin Powder', quantity: '1/2 tsp', store: 'indian', department: 'Spices & Lentils' },
      { id: 'ing-36', name: 'Pink Himalayan Salt & Black Pepper', quantity: 'to taste', store: 'american', department: 'Spices & Lentils' }
    ],
    instructions: [
      'Heat ghee in a wide heavy-bottom pan on low flame.',
      'Add cashews and roast for 2 minutes until golden.',
      'Add makhana and slow roast for 6-8 minutes, stirring constantly until crispy and brittle.',
      'Sprinkle chaat masala, cumin powder, and salt while hot. Toss well and enjoy as a guilt-free afternoon crunch.'
    ]
  },
  {
    id: 'recipe-8',
    title: 'Costco Chili-Lime Steamed Edamame',
    description: 'Plump organic green edamame pods steamed fresh and sprinkled with coarse flaky sea salt, red chili flakes, and a squeeze of lime.',
    servings: 2,
    prepTime: '8 mins',
    cuisine: 'costco-prep',
    category: 'snack',
    tags: ['Snack', 'High Protein', 'Plant Based', 'Quick'],
    imageEmoji: '🫛',
    nutritionPerServing: {
      calories: 140,
      protein: 14,
      carbs: 11,
      fats: 4,
      fiber: 6
    },
    ingredients: [
      { id: 'ing-37', name: 'Kirkland Organic Edamame Pods (Frozen)', quantity: '3 cups', store: 'costco', department: 'Frozen' },
      { id: 'ing-38', name: 'Fresh Lime', quantity: '1 lime', store: 'american', department: 'Produce' },
      { id: 'ing-39', name: 'Maldon Flaky Sea Salt & Red Chili Flakes', quantity: '1 tsp', store: 'american', department: 'Spices & Lentils' }
    ],
    instructions: [
      'Bring 4 cups of salted water to a boil, or place frozen edamame pods in a microwave-safe steamer bowl.',
      'Steam or boil for 4-5 minutes until tender-crisp and bright green.',
      'Drain water thoroughly and transfer to a serving bowl.',
      'Squeeze fresh lime juice all over and toss with flaky sea salt and crushed red pepper.'
    ]
  },
  {
    id: 'recipe-9',
    title: 'Zesty Spiced Chickpea & Veggie Chaat',
    description: 'Refreshing protein salad with tender boiled chickpeas, diced cucumbers, tomatoes, red onions, fresh mint, and tangy chaat seasoning.',
    servings: 2,
    prepTime: '12 mins',
    cuisine: 'indian',
    category: 'snack',
    tags: ['Snack', 'High Fiber', 'Vegan', 'Veggies'],
    imageEmoji: '🥗',
    nutritionPerServing: {
      calories: 210,
      protein: 10,
      carbs: 34,
      fats: 4,
      fiber: 8
    },
    ingredients: [
      { id: 'ing-40', name: 'Boiled Kabuli Chana (Chickpeas)', quantity: '1.5 cups', store: 'indian', department: 'Spices & Lentils' },
      { id: 'ing-41', name: 'English Cucumber', quantity: '1 medium', store: 'american', department: 'Produce' },
      { id: 'ing-42', name: 'Roma Tomatoes & Red Onion', quantity: '1 each', store: 'american', department: 'Produce' },
      { id: 'ing-43', name: 'Fresh Mint & Cilantro Leaves', quantity: '1/2 cup chopped', store: 'indian', department: 'Produce' },
      { id: 'ing-44', name: 'Chaat Masala & Lemon Juice', quantity: '1 tbsp each', store: 'indian', department: 'Spices & Lentils' }
    ],
    instructions: [
      'In a large mixing bowl, combine rinsed boiled chickpeas with diced cucumber, tomatoes, and red onions.',
      'Add finely chopped fresh cilantro, mint leaves, and a pinch of roasted cumin powder.',
      'Drizzle with fresh lemon juice and toss thoroughly with chaat masala.',
      'Serve chilled or at room temperature as a refreshing midday power snack.'
    ]
  },
  {
    id: 'recipe-10',
    title: 'Low-Calorie Almond Saffron Phirni (Kheer)',
    description: 'Velvety royal Indian dessert made with finely ground almonds, unsweetened almond milk, crushed cardamom, and steeped saffron strands.',
    servings: 3,
    prepTime: '20 mins',
    cuisine: 'indian',
    category: 'dessert',
    tags: ['Dessert', 'Low Sugar', 'Indian Sweet', 'Guilt-Free'],
    imageEmoji: '🍮',
    nutritionPerServing: {
      calories: 160,
      protein: 6,
      carbs: 12,
      fats: 10,
      fiber: 3
    },
    ingredients: [
      { id: 'ing-45', name: 'Whole Raw Almonds (Badam)', quantity: '1/2 cup', store: 'costco', department: 'Pantry & Bulk' },
      { id: 'ing-46', name: 'Unsweetened Almond Milk', quantity: '2.5 cups', store: 'american', department: 'Dairy & Eggs' },
      { id: 'ing-47', name: 'Kashmiri Kesar (Saffron Strands)', quantity: '10-12 strands', store: 'indian', department: 'Spices & Lentils' },
      { id: 'ing-48', name: 'Green Cardamom (Elaichi) Pods', quantity: '4 pods crushed', store: 'indian', department: 'Spices & Lentils' },
      { id: 'ing-49', name: 'Natural Stevia or Date Paste', quantity: '2 tbsp', store: 'american', department: 'Pantry & Bulk' }
    ],
    instructions: [
      'Soak saffron threads in 2 tablespoons of warm almond milk for 10 minutes to release golden color.',
      'Soak almonds in hot water, peel skins, and blend into a coarse creamy paste with 3 tbsp milk.',
      'Simmer remaining almond milk in a saucepan with crushed cardamom for 8 minutes until slightly reduced.',
      'Stir in the almond paste, saffron infusion, and sweetener. Cook on low flame for 6-8 minutes until thick.',
      'Pour into earthen bowls, garnish with slivered pistachios, and chill before serving.'
    ]
  },
  {
    id: 'recipe-11',
    title: 'High-Protein Mango Greek Yogurt Mousse',
    description: 'Thick creamy Kirkland Greek yogurt blended with Alphonso mango puree and a touch of cardamom for an indulgent 18g-protein dessert.',
    servings: 2,
    prepTime: '10 mins',
    cuisine: 'costco-prep',
    category: 'dessert',
    tags: ['Dessert', 'High Protein', 'Probiotic', 'No Cook'],
    imageEmoji: '🥭',
    nutritionPerServing: {
      calories: 190,
      protein: 18,
      carbs: 24,
      fats: 2,
      fiber: 2
    },
    ingredients: [
      { id: 'ing-50', name: 'Kirkland Plain Organic Greek Yogurt', quantity: '1.5 cups', store: 'costco', department: 'Dairy & Eggs' },
      { id: 'ing-51', name: 'Alphonso Mango Pulp or Fresh Ripe Mango', quantity: '3/4 cup', store: 'indian', department: 'Pantry & Bulk' },
      { id: 'ing-52', name: 'Cardamom Powder & Pistachio Sliver Garnish', quantity: '1/2 tsp', store: 'indian', department: 'Spices & Lentils' }
    ],
    instructions: [
      'In a mixing bowl or food processor, whisk chilled Greek yogurt until silky and airy.',
      'Gently fold in sweet mango puree and ground cardamom until beautifully marbled or homogenous.',
      'Spoon into dessert glasses and chill in the freezer for 15 minutes for a soft-serve texture.',
      'Garnish with sliced pistachios and fresh mint.'
    ]
  },
  {
    id: 'recipe-12',
    title: 'Costco Dark Chocolate Berry Parfait',
    description: 'Layers of rich Greek yogurt, antioxidant-loaded organic mixed berries, and shavings of 85% Belgian dark chocolate.',
    servings: 1,
    prepTime: '5 mins',
    cuisine: 'costco-prep',
    category: 'dessert',
    tags: ['Dessert', 'Antioxidants', 'Low Sugar', 'Quick'],
    imageEmoji: '🍨',
    nutritionPerServing: {
      calories: 220,
      protein: 15,
      carbs: 26,
      fats: 6,
      fiber: 5
    },
    ingredients: [
      { id: 'ing-53', name: 'Kirkland Organic Greek Yogurt', quantity: '3/4 cup', store: 'costco', department: 'Dairy & Eggs' },
      { id: 'ing-54', name: 'Fresh Raspberries & Blackberries', quantity: '1/2 cup', store: 'costco', department: 'Produce' },
      { id: 'ing-55', name: '85% Extra Dark Chocolate Square', quantity: '1 square (grated)', store: 'costco', department: 'Pantry & Bulk' },
      { id: 'ing-56', name: 'Pure Vanilla Extract & Raw Honey', quantity: '1/2 tsp each', store: 'american', department: 'Pantry & Bulk' }
    ],
    instructions: [
      'Stir vanilla extract and a touch of honey into cold Greek yogurt.',
      'Layer half the yogurt in a glass tumbler, followed by half the berries.',
      'Add the remaining yogurt layer and top with berries.',
      'Grate dark chocolate directly over top for a decadent yet macro-friendly treat.'
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

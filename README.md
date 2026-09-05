# 🥗 MealCraft — Personal Meal Planner, Store-Categorized Groceries & Calorie Tracker

A modern, mobile-first Progressive Web App (PWA) designed to simplify what you cook, automatically route needed ingredients to the correct grocery store (**Indian Grocery**, **American Grocery**, or **Costco Wholesale**), deduct pantry stock, and track your daily calories, macros, and hydration.

---

## 🌟 Key Features

### 1. 📅 Smart Meal & Cook Planner
- **Weekly Schedule**: Plan Breakfast, Lunch, Dinner, and Snacks for every day of the week.
- **Pantry Intelligence**: When you plan a meal, MealCraft automatically compares its ingredients against your **Pantry inventory**. Any missing or low-stock items are automatically added to your grocery list under their designated store.
- **Cooking Workflow**: When you mark a meal as **Cooked & Eaten**:
  - Automatically logs the meal's full nutritional profile (Calories, Protein, Carbs, Fats, Fiber) to today's Calorie Tracker.
  - Prompts you to confirm whether used ingredients should be deducted from your pantry stock.

### 2. 🛒 Store-Categorized Grocery Shopping List
- **Dedicated Store Views**:
  - 🇮🇳 **Indian Grocery Store**: Spices, Dals, Atta flour, Paneer, Curry leaves, Basmati rice, Desi Ghee (Patel Brothers, Subzi Mandi, etc.).
  - 🇺🇸 **American Grocery Store**: Fresh salad mixes, specialty cheeses, bakery items, organic produce (Trader Joe's, Safeway, Kroger, Whole Foods).
  - 🔴 **Costco / Wholesale**: Bulk chicken breasts, eggs, Greek yogurt, salmon fillets, olive oil, rolled oats, nuts.
  - 🌐 **All Stores View**: View consolidated items across all stores.
- **Department Grouping**: Secondary sorting by Produce, Spices & Lentils, Dairy & Eggs, Meat & Seafood, Pantry & Bulk, etc.
- **Interactive Shopping Mode**: High-contrast, full-screen mobile checklist tailored for walking through the aisles with an iPhone in hand.
- **Move to Pantry**: One click transfers all checked/purchased items straight into your Pantry stock as "In Stock"!

### 3. 🔥 Comprehensive Calorie & Nutrition Tracker
- **Hero Calorie Budget**: Real-time remaining calorie counter with target progress meters.
- **Macronutrients**: Dedicated progress indicators for **Protein (g)**, **Carbs (g)**, **Dietary Fats (g)**, and **Fiber (g)**.
- **Interactive Water Tracker**: Visual glasses grid with 1-tap `+250ml (Glass)` and `+500ml (Bottle)` tracking.
- **Daily Food Timeline**: Review all logged meals and quickly log snacks or custom foods.
- **Date Switcher**: Navigate back and forth between days to view previous logs and adherence.

### 4. 📖 Recipe Book & 🥫 Pantry Stock
- **Curated Starter Recipes**: Pre-loaded with authentic Indian dishes (Palak Paneer & Basmati Rice, Dal Tadka), Costco meal prep favorites (Sheet Pan Chicken & Veggies, Wild Salmon & Asparagus, Overnight Chia Oats), and American classics.
- **Custom Recipe Builder**: Add your family dishes with custom ingredients, store tags, and nutrition per serving.
- **Pantry Manager**: Keep track of what you already have at home (In Stock, Low, Out) and use the 1-click **Reorder** button to replenish depleted items.

### 5. 💾 100% Free Data Portability & Privacy
- All data is saved directly in your browser's local storage (no account creation required).
- **Export Backup (JSON)**: Download a complete backup of your meals, recipes, and logs anytime.
- **Restore Backup (JSON)**: Easily restore your data on a new phone or computer.

---

## 📱 How to Install on your iPhone for Free ($0)

You can run MealCraft on your iPhone just like a native App Store app without paying any Apple Developer fees:

1. Open the hosted URL in **Safari** on your iPhone.
2. Tap the **Share icon** (square with an upward arrow) at the bottom of the screen.
3. Scroll down and select **"Add to Home Screen"**.
4. Tap **"Add"** in the top-right corner.
5. The **MealCraft** app icon will appear on your iPhone home screen! Tap it anytime to open in fullscreen without any browser address bar. It also works offline inside grocery stores.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Free Hosting on GitHub Pages (Step-by-Step)

The repository comes pre-configured with relative base paths (`base: './'`) and an automated GitHub Actions deployment workflow:

1. Create a new repository on GitHub (e.g. `mealcraft`).
2. Initialize and push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of MealCraft PWA"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings** $\rightarrow$ **Pages** (under "Code and automation").
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
   - Your site will automatically build and publish to `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/` within 2 minutes!

import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navigation/Navbar';
import { MealPlannerView } from './components/MealPlanner/MealPlannerView';
import { GroceryListView } from './components/Grocery/GroceryListView';
import { NutritionTrackerView } from './components/Nutrition/NutritionTrackerView';
import { RecipeBookView } from './components/Recipes/RecipeBookView';
import { PantryView } from './components/Pantry/PantryView';
import { ProfileHealthView } from './components/Profile/ProfileHealthView';
import { SettingsModal } from './components/Settings/SettingsModal';

export const AppContent: React.FC = () => {
  const { activeTab } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Register PWA service worker for offline support
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker
        .register('./sw.js')
        .then((reg) => {
          console.log('MealCraft PWA service worker registered successfully:', reg.scope);
        })
        .catch((err) => {
          console.log('Service worker registration failed:', err);
        });
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-emerald-200">
      {/* Top and Bottom Navigation */}
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main View Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 transition-all">
        {activeTab === 'planner' && <MealPlannerView />}
        {activeTab === 'groceries' && <GroceryListView />}
        {activeTab === 'nutrition' && <NutritionTrackerView />}
        {activeTab === 'health' && <ProfileHealthView />}
        {activeTab === 'recipes' && <RecipeBookView />}
        {activeTab === 'pantry' && <PantryView />}
      </main>

      {/* Settings & PWA Guide Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

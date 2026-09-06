import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarDays,
  ShoppingCart,
  Activity,
  BookOpen,
  Archive,
  Settings,
  Flame,
  CheckCircle2,
  HeartPulse,
  Cloud
} from 'lucide-react';
import { AuthModal } from '../Auth/AuthModal';

interface NavbarProps {
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings }) => {
  const {
    activeTab,
    setActiveTab,
    groceries,
    nutritionLogs,
    dailyGoals,
    selectedDate,
    currentUser,
    syncStatus,
    isSyncing,
    isAuthModalOpen,
    setIsAuthModalOpen
  } = useApp();

  // Calculate unbought groceries count
  const pendingGroceriesCount = groceries.filter(g => !g.isBought).length;

  // Calculate today's logged calories
  const todayLogs = nutritionLogs.filter(l => l.date === selectedDate);
  const totalCaloriesToday = todayLogs.reduce((sum, item) => sum + (item.nutrition.calories || 0), 0);
  const remainingCalories = Math.max(0, dailyGoals.calories - totalCaloriesToday);

  const navItems = [
    { id: 'planner', label: 'Planner', icon: CalendarDays },
    { id: 'groceries', label: 'Groceries', icon: ShoppingCart, badge: pendingGroceriesCount },
    { id: 'nutrition', label: 'Calories', icon: Activity },
    { id: 'health', label: 'Health', icon: HeartPulse },
    { id: 'recipes', label: 'Recipes', icon: BookOpen },
    { id: 'pantry', label: 'Pantry', icon: Archive },
  ];

  return (
    <>
      {/* Top Header - Desktop & Mobile */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('planner')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <span className="text-xl">🥗</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg tracking-tight text-slate-900">MealCraft</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  PWA
                </span>
                {!import.meta.env.PROD && (
                  <span
                    className="text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 shadow-xs"
                    title="Development Sandbox (Port 3000) - Edits happen here"
                  >
                    DEV
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Plan • Store-Categorized Groceries • Calorie Tracking</p>
            </div>
          </div>

            {/* Cloud Sync Status / Login Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-colors ${
                currentUser
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={currentUser ? `Cloud Sync Active: ${currentUser.email}` : 'Sign in to sync phone & computer'}
            >
              <Cloud className={`w-3.5 h-3.5 ${currentUser ? 'text-emerald-600' : 'text-slate-400'} ${isSyncing ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">
                {currentUser ? (isSyncing ? 'Syncing...' : 'Synced') : 'Sync'}
              </span>
              {currentUser && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
              )}
            </button>

            {/* Calorie Pill & Settings */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('nutrition')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 transition-colors"
                title="Daily Calorie Status"
              >
                <Flame className="w-4 h-4 text-emerald-600 fill-emerald-500" />
                <div className="text-xs font-semibold">
                  <span>{totalCaloriesToday}</span>
                  <span className="text-slate-400 font-normal"> / {dailyGoals.calories} kcal</span>
                </div>
              </button>

              <button
                onClick={onOpenSettings}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Settings & Backup"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:block border-t border-slate-100 bg-slate-50/70">
          <div className="max-w-6xl mx-auto px-6 flex space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all relative ${
                    isActive
                      ? 'border-emerald-600 text-emerald-700 font-semibold bg-white'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-500 text-white leading-none">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile iOS-style Bottom Floating Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 pb-[env(safe-area-inset-bottom,8px)] pt-1 px-2 shadow-lg">
        <div className="flex justify-around items-center h-14">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
                  isActive ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 px-1.5 py-0.2 text-[10px] font-black rounded-full bg-amber-500 text-white min-w-[16px] text-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Cloud Sync & User Account Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

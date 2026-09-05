import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyGoals } from '../../types';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Smartphone,
  Globe,
  Check,
  X,
  Flame,
  Droplets,
  HelpCircle
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { dailyGoals, updateDailyGoals, exportDataJSON, importDataJSON, resetToDefaults } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'goals' | 'backup' | 'ios-pwa' | 'github'>('goals');
  const [goals, setGoals] = useState<DailyGoals>(dailyGoals);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    updateDailyGoals({
      calories: Number(goals.calories) || 2000,
      protein: Number(goals.protein) || 135,
      carbs: Number(goals.carbs) || 190,
      fats: Number(goals.fats) || 60,
      fiber: Number(goals.fiber) || 30,
      water: Number(goals.water) || 2500,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;

    const success = importDataJSON(importText.trim());
    if (success) {
      setImportStatus('Data successfully imported and restored!');
      setImportText('');
    } else {
      setImportStatus('Failed to import: invalid JSON format.');
    }
    setTimeout(() => setImportStatus(null), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          setImportStatus('Backup file successfully restored!');
        } else {
          setImportStatus('Error: Invalid backup file.');
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-200/80 rounded-xl text-slate-800">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900">Settings & Preferences</h3>
              <p className="text-xs text-slate-500">Nutrition targets, data backups, and iOS PWA installation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 p-1.5 gap-1 overflow-x-auto">
          {[
            { id: 'goals', label: 'Nutrition Goals', icon: Flame },
            { id: 'backup', label: 'Backup & Restore', icon: Download },
            { id: 'ios-pwa', label: 'iPhone App Guide', icon: Smartphone },
            { id: 'github', label: 'Free Hosting Guide', icon: Globe },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* Nutrition Goals Tab */}
          {activeSubTab === 'goals' && (
            <form onSubmit={handleSaveGoals} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Set Your Daily Targets
                </span>
                {savedSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Saved!
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Daily Calorie Target (kcal)</label>
                <input
                  type="number"
                  value={goals.calories}
                  onChange={(e) => setGoals({ ...goals, calories: Number(e.target.value) })}
                  required
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={goals.protein}
                    onChange={(e) => setGoals({ ...goals, protein: Number(e.target.value) })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={goals.carbs}
                    onChange={(e) => setGoals({ ...goals, carbs: Number(e.target.value) })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fats (g)</label>
                  <input
                    type="number"
                    value={goals.fats}
                    onChange={(e) => setGoals({ ...goals, fats: Number(e.target.value) })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fiber (g)</label>
                  <input
                    type="number"
                    value={goals.fiber}
                    onChange={(e) => setGoals({ ...goals, fiber: Number(e.target.value) })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Daily Water Goal (ml)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="250"
                    value={goals.water}
                    onChange={(e) => setGoals({ ...goals, water: Number(e.target.value) })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300"
                  />
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    ≈ {Math.round(goals.water / 250)} glasses
                  </span>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
                >
                  Save Targets
                </button>
              </div>
            </form>
          )}

          {/* Backup & Restore Tab */}
          {activeSubTab === 'backup' && (
            <div className="space-y-5">
              {importStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold">
                  {importStatus}
                </div>
              )}

              {/* Export */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <h4 className="font-bold text-sm text-slate-900 mb-1">Export Data Backup</h4>
                <p className="text-xs text-slate-500 mb-3">
                  Download a complete JSON file with your custom recipes, meal plans, grocery lists, and calorie logs.
                </p>
                <button
                  onClick={exportDataJSON}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup File (.json)</span>
                </button>
              </div>

              {/* Import */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-sm text-slate-900 mb-1">Restore from Backup</h4>
                <p className="text-xs text-slate-500">
                  Select a backup file from your computer or phone to restore:
                </p>

                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />

                <div className="text-xs text-slate-400 font-medium my-1 text-center">— OR PASTE JSON TEXT —</div>

                <textarea
                  rows={3}
                  placeholder="Paste JSON backup text here..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                />

                {importText.trim().length > 0 && (
                  <button
                    onClick={handleImportSubmit}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Restore Pasted Data</span>
                  </button>
                )}
              </div>

              {/* Reset Defaults */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">Need a fresh start?</span>
                <button
                  onClick={() => {
                    if (window.confirm('Reset all meals, recipes, and groceries to defaults?')) {
                      resetToDefaults();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          )}

          {/* iPhone App (PWA) Guide Tab */}
          {activeSubTab === 'ios-pwa' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950">
                <h4 className="font-black text-sm flex items-center gap-2 mb-1">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  Install MealCraft on your iPhone for Free ($0)
                </h4>
                <p className="text-xs text-emerald-800">
                  This app is equipped with full PWA (Progressive Web App) support. You can install it on your iPhone home screen in 10 seconds without paying Apple anything:
                </p>
              </div>

              <ol className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900">Open in Safari:</strong>
                    <p className="text-slate-500 mt-0.5">
                      Open the app URL in <strong>Safari</strong> on your iPhone (Apple requires Safari for Add to Home Screen).
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900">Tap the Share Icon:</strong>
                    <p className="text-slate-500 mt-0.5">
                      Tap the <strong>Share</strong> button at the bottom of Safari (the square icon with an upward arrow).
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900">Select "Add to Home Screen":</strong>
                    <p className="text-slate-500 mt-0.5">
                      Scroll down and tap <strong>"Add to Home Screen"</strong> (plus icon), then tap <strong>"Add"</strong> in the top right.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                    4
                  </span>
                  <div>
                    <strong className="text-slate-900">Enjoy full-screen App:</strong>
                    <p className="text-slate-500 mt-0.5">
                      MealCraft now lives on your iPhone home screen! Tap it anytime to open in full screen (no browser address bar) and take it into the grocery store even when offline.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* GitHub Pages Free Hosting Guide */}
          {activeSubTab === 'github' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 text-white rounded-2xl">
                <h4 className="font-black text-sm mb-1 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  Free 100% Cloud Hosting on GitHub Pages
                </h4>
                <p className="text-xs text-slate-300">
                  Because this app is built with relative base paths (`base: './'`), it can be published to GitHub Pages in 3 minutes completely free of charge.
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <p className="font-bold text-slate-900">Simple 3-Step Setup:</p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-semibold text-slate-800">1. Build the production files:</div>
                  <pre className="bg-slate-900 text-emerald-400 p-2 rounded-lg mt-1 font-mono text-[11px] overflow-x-auto">
                    npm run build
                  </pre>
                  <p className="text-[11px] text-slate-500 mt-1">This produces the standalone static files in `dist/`.</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-semibold text-slate-800">2. Push your project to a GitHub repository:</div>
                  <pre className="bg-slate-900 text-emerald-400 p-2 rounded-lg mt-1 font-mono text-[11px] overflow-x-auto">
                    git init{"\n"}
                    git add .{"\n"}
                    git commit -m "Initial commit for MealCraft PWA"{"\n"}
                    git branch -M main{"\n"}
                    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git{"\n"}
                    git push -u origin main
                  </pre>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-semibold text-slate-800">3. Turn on GitHub Pages:</div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    On GitHub, go to your repository <strong>Settings</strong> $\rightarrow$ <strong>Pages</strong> $\rightarrow$ Build and deployment $\rightarrow$ Choose <strong>GitHub Actions</strong> (Static HTML / Vite) or deploy the `dist` folder.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserProfile,
  BloodReport,
  Biomarker,
  StoreType,
  DepartmentType
} from '../../types';
import {
  calculateBMR,
  calculateTDEE,
  calculatePureRecommendedGoals,
  calculateMacrosForCalories,
  generateRecommendedGoals,
  STANDARD_BIOMARKER_TEMPLATES
} from '../../utils/healthCalculator';
import { isIngredientExcluded } from '../../utils/ingredientMatcher';
import {
  User,
  HeartPulse,
  Activity,
  FileText,
  Upload,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Scale,
  Flame,
  Droplets,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingDown,
  TrendingUp,
  ShoppingCart,
  Utensils,
  ChevronRight,
  Download,
  Zap,
  RefreshCw,
  ExternalLink,
  Eye,
  Building2,
  Stethoscope,
  X,
  Database,
  ShieldCheck,
  HardDrive
} from 'lucide-react';

export const ProfileHealthView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    applyRecommendedGoalsToDailyGoals,
    dailyGoals,
    bloodReports,
    addBloodReport,
    removeBloodReport,
    weightHistory,
    logWeight,
    removeWeightEntry,
    nutritionLogs,
    mealPlans,
    dailyRecords,
    groceries,
    addGroceryItem,
    exportDataJSON,
    importDataJSON
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'blood' | 'monthly'>('profile');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile Form state - kept in sync with userProfile
  const [profileForm, setProfileForm] = useState<UserProfile>(userProfile);
  const [weightInput, setWeightInput] = useState<string>(userProfile.weight.toString());
  const [weightDateInput, setWeightDateInput] = useState<string>(new Date().toISOString().split('T')[0]);
  const [weightNotesInput, setWeightNotesInput] = useState<string>('');
  const [isWeightModalOpen, setIsWeightModalOpen] = useState<boolean>(false);
  const [customExclusionInput, setCustomExclusionInput] = useState<string>('');

  // Sync profileForm whenever userProfile changes from context (e.g. IndexedDB hydration)
  useEffect(() => {
    setProfileForm(userProfile);
  }, [userProfile]);

  // Blood Report Modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportTitle, setReportTitle] = useState<string>('');
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reportLab, setReportLab] = useState<string>('');
  const [reportNotes, setReportNotes] = useState<string>('');
  const [reportFileName, setReportFileName] = useState<string>('');
  const [reportFileData, setReportFileData] = useState<string>('');
  const [reportFileType, setReportFileType] = useState<string>('');
  const [reportBiomarkers, setReportBiomarkers] = useState<Biomarker[]>([]);
  const [showBiomarkerEntry, setShowBiomarkerEntry] = useState<boolean>(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    bloodReports.length > 0 ? bloodReports[0].id : null
  );

  // Monthly Report state
  const currentDate = new Date();
  const defaultMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonthStr);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const backupFileInputRef = useRef<HTMLInputElement | null>(null);

  // Show temporary toast message
  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const [isAutoSyncTargets, setIsAutoSyncTargets] = useState<boolean>(true);

  // Calculations for current profile
  const bmr = useMemo(() => calculateBMR(profileForm), [profileForm]);
  const tdee = useMemo(() => calculateTDEE(profileForm), [profileForm]);
  const pureGoals = useMemo(() => calculatePureRecommendedGoals(profileForm), [profileForm]);

  // Update body metric and auto-recalculate targets if isAutoSyncTargets is true, immediately syncing to storage
  const updateBodyMetric = (patch: Partial<UserProfile>) => {
    const updated = { ...profileForm, ...patch };
    let nextProfile = updated;
    if (isAutoSyncTargets) {
      const pure = calculatePureRecommendedGoals(updated);
      nextProfile = {
        ...updated,
        customTargetCalories: pure.calories,
        customTargetProtein: pure.protein,
        customTargetCarbs: pure.carbs,
        customTargetFats: pure.fats,
        customTargetFiber: pure.fiber,
        customTargetWater: pure.water,
      };
    }
    setProfileForm(nextProfile);
    updateUserProfile(nextProfile);
  };

  // User manually edits a target calorie or macro input - auto persists immediately
  const handleManualTargetChange = (patch: Partial<UserProfile>) => {
    setIsAutoSyncTargets(false);
    const nextProfile = {
      ...profileForm,
      ...patch,
    };
    setProfileForm(nextProfile);
    updateUserProfile(nextProfile);
  };

  // Re-generate targets from body metrics
  const handleAutoGenerateTargets = () => {
    const pure = calculatePureRecommendedGoals(profileForm);
    const nextProfile = {
      ...profileForm,
      customTargetCalories: pure.calories,
      customTargetProtein: pure.protein,
      customTargetCarbs: pure.carbs,
      customTargetFats: pure.fats,
      customTargetFiber: pure.fiber,
      customTargetWater: pure.water,
    };
    setProfileForm(nextProfile);
    updateUserProfile(nextProfile);
    setIsAutoSyncTargets(true);
    triggerSuccess(`Auto-generated targets from body metrics: ${pure.calories} kcal/day`);
  };

  // Quick Macro Split distribution based on current target calories
  const handleApplyMacroSplit = (split: 'balanced' | 'high_protein' | 'low_carb') => {
    setIsAutoSyncTargets(false);
    const targetCals = profileForm.customTargetCalories !== undefined ? profileForm.customTargetCalories : pureGoals.calories;
    const macros = calculateMacrosForCalories(targetCals, split);
    const nextProfile = {
      ...profileForm,
      customTargetCalories: targetCals,
      customTargetProtein: macros.protein,
      customTargetCarbs: macros.carbs,
      customTargetFats: macros.fats,
      customTargetFiber: macros.fiber,
    };
    setProfileForm(nextProfile);
    updateUserProfile(nextProfile);
    const label = split === 'balanced' ? 'Balanced (30P / 45C / 25F)' : split === 'high_protein' ? 'High Protein (40P / 35C / 25F)' : 'Low Carb (35P / 15C / 50F)';
    triggerSuccess(`Applied ${label} macro split!`);
  };

  // Toggle excluded vegetable and auto-persist
  const handleToggleVeggie = (veggie: string) => {
    const current = profileForm.excludedVeggies || [];
    const exists = current.some(v => v.toLowerCase() === veggie.toLowerCase());
    const nextVeggies = exists
      ? current.filter(v => v.toLowerCase() !== veggie.toLowerCase())
      : [...current, veggie];
    const nextProfile = {
      ...profileForm,
      excludedVeggies: nextVeggies,
    };
    setProfileForm(nextProfile);
    updateUserProfile(nextProfile);
    triggerSuccess(exists ? `Restored "${veggie}" to meal planning` : `Excluded "${veggie}" from all meal plans!`);
  };

  // Add custom excluded ingredient / item
  const handleAddCustomExclusion = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customExclusionInput.trim();
    if (!trimmed) return;

    const current = profileForm.excludedVeggies || [];
    if (!current.some(v => v.toLowerCase() === trimmed.toLowerCase())) {
      const nextVeggies = [...current, trimmed];
      const nextProfile = { ...profileForm, excludedVeggies: nextVeggies };
      setProfileForm(nextProfile);
      updateUserProfile(nextProfile);
      triggerSuccess(`Added "${trimmed}" to excluded items list!`);
    } else {
      triggerSuccess(`"${trimmed}" is already in your excluded list.`);
    }
    setCustomExclusionInput('');
  };

  // Remove vegetable exclusion by index and auto-persist
  const handleRemoveVeggieIndex = (idx: number) => {
    const removedItem = (profileForm.excludedVeggies || [])[idx];
    const nextVeggies = (profileForm.excludedVeggies || []).filter((_, i) => i !== idx);
    const nextProfile = {
      ...profileForm,
      excludedVeggies: nextVeggies,
    };
    setProfileForm(nextProfile);
    updateUserProfile(nextProfile);
    if (removedItem) {
      triggerSuccess(`Removed "${removedItem}" from excluded list.`);
    }
  };

  // Toggle meal planner snacks slot and auto-persist
  const handleToggleSnacks = (checked: boolean) => {
    const nextProfile = { ...profileForm, includeSnacksInPlanner: checked };
    setProfileForm(nextProfile);
    updateUserProfile(nextProfile);
  };

  // Toggle meal planner desserts slot and auto-persist
  const handleToggleDesserts = (checked: boolean) => {
    const nextProfile = { ...profileForm, includeDessertsInPlanner: checked };
    setProfileForm(nextProfile);
    updateUserProfile(nextProfile);
  };

  // Handle profile save button (explicit confirmation)
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(profileForm);
    triggerSuccess('Personal profile and calorie targets saved successfully! (Auto-saved to storage)');
  };

  // One-click apply recommended scientific goals
  const handleApplyRecommended = () => {
    handleAutoGenerateTargets();
    applyRecommendedGoalsToDailyGoals();
  };

  // Handle Weight Log submit
  const handleLogWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 0) {
      logWeight(val, weightDateInput, weightNotesInput);
      const nextProfile = { ...profileForm, weight: val };
      setProfileForm(nextProfile);
      updateUserProfile(nextProfile);
      setIsWeightModalOpen(false);
      setWeightNotesInput('');
      triggerSuccess(`Logged weight ${val} ${profileForm.weightUnit} for ${weightDateInput}!`);
    }
  };

  // Handle restoring backup JSON file
  const handleRestoreBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const ok = importDataJSON(content);
          if (ok) {
            triggerSuccess('Backup restored successfully! All data recovered.');
          } else {
            alert('Failed to parse backup JSON. Please ensure it is a valid MealCraft backup file.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle Blood Report File selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert('File is larger than 20MB. Please upload a report document under 20MB.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setReportFileName(file.name);
      setReportFileType(file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'));
      if (!reportTitle) {
        setReportTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReportFileData(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick add biomarker preset to modal (starts at 0/empty, NO fake numbers)
  const handleAddBiomarkerPreset = (templateId: string) => {
    const template = STANDARD_BIOMARKER_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    if (reportBiomarkers.some(b => b.id === template.id)) return;

    const newBiomarker: Biomarker = {
      id: template.id,
      name: template.name,
      category: template.category,
      value: 0,
      unit: template.unit,
      minNormal: template.minNormal,
      maxNormal: template.maxNormal,
      status: 'normal',
      dietaryTip: '',
    };
    setReportBiomarkers(prev => [...prev, newBiomarker]);
  };

  // Update a biomarker value in report modal
  const handleUpdateBiomarkerValue = (id: string, valStr: string) => {
    const val = parseFloat(valStr);
    setReportBiomarkers(prev =>
      prev.map(b => {
        if (b.id !== id) return b;
        let newStatus: 'low' | 'normal' | 'high' = 'normal';
        if (!isNaN(val) && val > 0) {
          if (val < b.minNormal) {
            newStatus = 'low';
          } else if (val > b.maxNormal) {
            newStatus = 'high';
          } else {
            newStatus = 'normal';
          }
        }
        return {
          ...b,
          value: isNaN(val) ? 0 : val,
          status: newStatus,
        };
      })
    );
  };

  // Remove biomarker from report modal
  const handleRemoveBiomarker = (id: string) => {
    setReportBiomarkers(prev => prev.filter(b => b.id !== id));
  };

  // Save new blood report document (authentic data only, no fake AI analysis)
  const handleSaveBloodReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim()) return;

    const newId = 'report-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const createdId = addBloodReport({
      id: newId,
      title: reportTitle.trim(),
      date: reportDate,
      labName: reportLab.trim(),
      notes: reportNotes.trim(),
      fileName: reportFileName || '',
      fileData: reportFileData || '',
      fileType: reportFileType || (reportFileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
      biomarkers: reportBiomarkers.filter(b => b.value > 0),
      overallSummary: reportNotes.trim(),
      recommendedFoods: [],
      foodsToLimit: [],
    });

    setSelectedReportId(createdId || newId);
    setIsReportModalOpen(false);
    setReportTitle('');
    setReportLab('');
    setReportNotes('');
    setReportFileName('');
    setReportFileData('');
    setReportFileType('');
    setReportBiomarkers([]);
    setShowBiomarkerEntry(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    triggerSuccess('Lab report document saved successfully!');
  };

  // Monthly Report Calculations
  const monthlyData = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const daysInMonth = new Date(year, month, 0).getDate();

    const monthLogs = nutritionLogs.filter(l => l.date.startsWith(selectedMonth));
    const uniqueDaysLogged = Array.from(new Set(monthLogs.map(l => l.date)));

    let totalCals = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let totalFiber = 0;

    monthLogs.forEach(l => {
      totalCals += l.nutrition.calories || 0;
      totalProtein += l.nutrition.protein || 0;
      totalCarbs += l.nutrition.carbs || 0;
      totalFats += l.nutrition.fats || 0;
      totalFiber += l.nutrition.fiber || 0;
    });

    const loggedCount = Math.max(1, uniqueDaysLogged.length);
    const avgDailyCalories = Math.round(totalCals / loggedCount);
    const avgDailyProtein = Math.round(totalProtein / loggedCount);
    const avgDailyCarbs = Math.round(totalCarbs / loggedCount);
    const avgDailyFats = Math.round(totalFats / loggedCount);
    const avgDailyFiber = Math.round(totalFiber / loggedCount);

    let totalWaterMl = 0;
    let waterDaysCount = 0;
    Object.entries(dailyRecords).forEach(([dateStr, record]) => {
      if (dateStr.startsWith(selectedMonth) && record.waterIntake > 0) {
        totalWaterMl += record.waterIntake;
        waterDaysCount++;
      }
    });
    const avgWaterMl = waterDaysCount > 0 ? Math.round(totalWaterMl / waterDaysCount) : 0;

    const monthMealPlans = mealPlans.filter(p => p.date.startsWith(selectedMonth));
    const cookedMealsCount = monthMealPlans.filter(p => p.isCooked).length;
    const leftoverMealsCount = monthMealPlans.filter(p => p.isLeftover).length;
    const scratchCookedCount = Math.max(0, cookedMealsCount - leftoverMealsCount);

    const monthWeights = weightHistory
      .filter(w => w.date.startsWith(selectedMonth))
      .sort((a, b) => a.date.localeCompare(b.date));

    let startWeight: number | null = null;
    let endWeight: number | null = null;
    let weightDelta: number | null = null;

    if (monthWeights.length > 0) {
      startWeight = monthWeights[0].weight;
      endWeight = monthWeights[monthWeights.length - 1].weight;
      weightDelta = Math.round((endWeight - startWeight) * 10) / 10;
    }

    const target = dailyGoals.calories;
    let adheringDays = 0;
    uniqueDaysLogged.forEach(dateStr => {
      const dayLogs = monthLogs.filter(l => l.date === dateStr);
      const dayTotal = dayLogs.reduce((s, i) => s + (i.nutrition.calories || 0), 0);
      if (Math.abs(dayTotal - target) <= target * 0.15) {
        adheringDays++;
      }
    });
    const adherenceRate = uniqueDaysLogged.length > 0
      ? Math.round((adheringDays / uniqueDaysLogged.length) * 100)
      : 0;

    return {
      daysInMonth,
      uniqueDaysLoggedCount: uniqueDaysLogged.length,
      avgDailyCalories,
      avgDailyProtein,
      avgDailyCarbs,
      avgDailyFats,
      avgDailyFiber,
      avgWaterMl,
      cookedMealsCount,
      leftoverMealsCount,
      scratchCookedCount,
      startWeight,
      endWeight,
      weightDelta,
      adherenceRate,
      targetCalories: dailyGoals.calories
    };
  }, [selectedMonth, nutritionLogs, dailyRecords, mealPlans, weightHistory, dailyGoals]);

  const currentBloodReport = useMemo(() => {
    return bloodReports.find(r => r.id === selectedReportId) || bloodReports[0] || null;
  }, [bloodReports, selectedReportId]);

  // Handle DOB change and auto-calculate age
  const handleDobChange = (dobStr: string) => {
    if (!dobStr) {
      updateBodyMetric({ dateOfBirth: '' });
      return;
    }
    const birthDate = new Date(dobStr);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    if (calculatedAge >= 1 && calculatedAge <= 120) {
      updateBodyMetric({ dateOfBirth: dobStr, age: calculatedAge });
      triggerSuccess(`Auto-calculated age to ${calculatedAge} years from DOB, updated targets!`);
    } else {
      updateBodyMetric({ dateOfBirth: dobStr });
    }
  };

  // Profile Edit Form
  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-700 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in text-sm font-medium border border-emerald-500">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Health & Profile Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-300" />
                Health & Longevity Center
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {userProfile.name ? `${userProfile.name}'s Health Hub` : 'Personal Health & Lab Hub'}
              </h1>
              <p className="text-emerald-100 text-sm mt-1 max-w-xl">
                Personalized metabolism calculations, clinical biomarker reports, smart grocery integration, and monthly health performance summaries.
              </p>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex bg-black/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 gap-1">
              <button
                onClick={() => setActiveSubTab('profile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeSubTab === 'profile'
                    ? 'bg-white text-emerald-900 shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile & Targets</span>
              </button>
              <button
                onClick={() => setActiveSubTab('blood')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeSubTab === 'blood'
                    ? 'bg-white text-emerald-900 shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Lab Reports & Records</span>
                {bloodReports.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] flex items-center justify-center font-bold">
                    {bloodReports.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveSubTab('monthly')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeSubTab === 'monthly'
                    ? 'bg-white text-emerald-900 shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Monthly Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: PERSONAL PROFILE & TARGET CALORIES */}
      {/* ========================================================================= */}
      {activeSubTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Profile Form & Metrics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Metabolism Stats Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">BMR (Basal Rate)</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-slate-900">{bmr}</span>
                  <span className="text-xs text-slate-500">kcal/day</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Calories burned at complete resting baseline</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">TDEE (Maintenance)</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-emerald-600">{tdee}</span>
                  <span className="text-xs text-slate-500">kcal/day</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Based on {profileForm.activityLevel} activity</p>
              </div>

              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-sm">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Target Calories</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-emerald-900">
                    {profileForm.customTargetCalories !== undefined ? profileForm.customTargetCalories : pureGoals.calories}
                  </span>
                  <span className="text-xs text-emerald-700">kcal/day</span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                  {profileForm.goal === 'lose_weight' ? 'Fat Loss Deficit (-500 kcal)' : profileForm.goal === 'build_muscle' ? 'Muscle Growth (+300 kcal)' : 'Maintenance Balance'}
                </p>
              </div>

              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 shadow-sm">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">Water Target</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-blue-900">
                    {profileForm.customTargetWater !== undefined ? profileForm.customTargetWater : pureGoals.water}
                  </span>
                  <span className="text-xs text-blue-700">ml/day</span>
                </div>
                <p className="text-[11px] text-blue-700 mt-1 font-medium">
                  ~{Math.round((profileForm.customTargetWater !== undefined ? profileForm.customTargetWater : pureGoals.water) / 250)} glasses (250ml)
                </p>
              </div>
            </div>

            {/* Profile Edit Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    Personal Body Metrics
                  </h2>
                  <p className="text-xs text-slate-500">
                    We use the scientifically validated Mifflin-St Jeor equation to calculate your metabolic targets.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleApplyRecommended}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 transition-colors"
                  title="Auto-fill recommended macros"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Apply Recommended
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={e => updateBodyMetric({ name: e.target.value })}
                      placeholder="e.g. Alex"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Date of Birth (DOB)
                    </label>
                    <input
                      type="date"
                      value={profileForm.dateOfBirth || ''}
                      onChange={e => handleDobChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Auto-computes exact age</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Age (Years)</label>
                      <input
                        type="number"
                        min="10"
                        max="110"
                        value={profileForm.age}
                        onChange={e => updateBodyMetric({ age: parseInt(e.target.value) || 25 })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Gender</label>
                      <select
                        value={profileForm.gender}
                        onChange={e => updateBodyMetric({ gender: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Weight with unit toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 uppercase">Weight</label>
                      <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => {
                            if (profileForm.weightUnit === 'lbs') {
                              const kg = Math.round(profileForm.weight * 0.453592 * 10) / 10;
                              updateBodyMetric({ weight: kg, weightUnit: 'kg' });
                            }
                          }}
                          className={`px-2 py-0.5 rounded-md transition-all ${
                            profileForm.weightUnit === 'kg' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                          }`}
                        >
                          kg
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (profileForm.weightUnit === 'kg') {
                              const lbs = Math.round(profileForm.weight * 2.20462 * 10) / 10;
                              updateBodyMetric({ weight: lbs, weightUnit: 'lbs' });
                            }
                          }}
                          className={`px-2 py-0.5 rounded-md transition-all ${
                            profileForm.weightUnit === 'lbs' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                          }`}
                        >
                          lbs
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="20"
                        max="300"
                        value={profileForm.weight}
                        onChange={e => updateBodyMetric({ weight: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="absolute right-3.5 top-2.5 text-slate-400 text-sm font-semibold">
                        {profileForm.weightUnit}
                      </span>
                    </div>
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Height (cm)
                      <span className="ml-2 text-slate-400 font-normal">
                        (~{Math.floor(profileForm.height / 30.48)} ft {Math.round((profileForm.height % 30.48) / 2.54)} in)
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="90"
                        max="250"
                        value={profileForm.height}
                        onChange={e => updateBodyMetric({ height: parseInt(e.target.value) || 170 })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="absolute right-3.5 top-2.5 text-slate-400 text-sm font-semibold">cm</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Activity Level */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Activity Level</label>
                    <select
                      value={profileForm.activityLevel}
                      onChange={e => updateBodyMetric({ activityLevel: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="sedentary">Sedentary (Desk job, little exercise)</option>
                      <option value="light">Light (1-3 workout days/week)</option>
                      <option value="moderate">Moderate (3-5 workout days/week)</option>
                      <option value="active">Active (6-7 workout days/week)</option>
                      <option value="very_active">Very Active (Physical job or athlete)</option>
                    </select>
                  </div>

                  {/* Fitness Goal */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Primary Fitness Goal</label>
                    <select
                      value={profileForm.goal}
                      onChange={e => updateBodyMetric({ goal: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="lose_weight">Lose Weight / Fat Loss (-500 kcal deficit)</option>
                      <option value="maintain">Maintain Healthy Weight (TDEE balance)</option>
                      <option value="build_muscle">Build Muscle / Lean Bulk (+300 kcal surplus)</option>
                    </select>
                  </div>
                </div>

                {/* Target Calorie and Macro Auto-Generation & Customization */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-amber-500" />
                        Target Daily Calories & Macronutrients
                      </h3>
                      {isAutoSyncTargets ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          <Zap className="w-3 h-3 text-emerald-600" />
                          Auto-Generated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                          ✏️ Custom Edits Active
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoGenerateTargets}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors"
                      title="Recalculate targets from your current body metrics"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                      Auto-Generate from Metrics
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 mb-3">
                    Targets are auto-generated from your body metrics. You can edit any number below to customize your plan.
                  </p>

                  {/* Quick Macro Split Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-2 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <span className="text-[11px] font-bold text-slate-500">Quick Macro Split:</span>
                    <button
                      type="button"
                      onClick={() => handleApplyMacroSplit('balanced')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-lg border border-slate-200 text-[11px] shadow-xs transition-colors"
                    >
                      Balanced (30P / 45C / 25F)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyMacroSplit('high_protein')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-rose-700 font-semibold rounded-lg border border-slate-200 text-[11px] shadow-xs transition-colors"
                    >
                      High Protein (40P / 35C / 25F)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyMacroSplit('low_carb')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-blue-700 font-semibold rounded-lg border border-slate-200 text-[11px] shadow-xs transition-colors"
                    >
                      Low Carb (35P / 15C / 50F)
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Target Calories</label>
                        <span className="text-[10px] text-slate-400 font-medium">kcal/day</span>
                      </div>
                      <input
                        type="number"
                        min="800"
                        max="6000"
                        value={profileForm.customTargetCalories !== undefined ? profileForm.customTargetCalories : pureGoals.calories}
                        onChange={e => handleManualTargetChange({ customTargetCalories: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-black text-emerald-700 bg-white focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Rec: {pureGoals.calories} kcal</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-rose-500 focus-within:bg-white transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Protein</label>
                        <span className="text-[10px] text-slate-400 font-medium">grams</span>
                      </div>
                      <input
                        type="number"
                        min="20"
                        max="400"
                        value={profileForm.customTargetProtein !== undefined ? profileForm.customTargetProtein : pureGoals.protein}
                        onChange={e => handleManualTargetChange({ customTargetProtein: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-black text-rose-700 bg-white focus:ring-2 focus:ring-rose-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Rec: {pureGoals.protein} g</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Carbohydrates</label>
                        <span className="text-[10px] text-slate-400 font-medium">grams</span>
                      </div>
                      <input
                        type="number"
                        min="20"
                        max="800"
                        value={profileForm.customTargetCarbs !== undefined ? profileForm.customTargetCarbs : pureGoals.carbs}
                        onChange={e => handleManualTargetChange({ customTargetCarbs: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-black text-blue-700 bg-white focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Rec: {pureGoals.carbs} g</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-amber-500 focus-within:bg-white transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Fats</label>
                        <span className="text-[10px] text-slate-400 font-medium">grams</span>
                      </div>
                      <input
                        type="number"
                        min="10"
                        max="200"
                        value={profileForm.customTargetFats !== undefined ? profileForm.customTargetFats : pureGoals.fats}
                        onChange={e => handleManualTargetChange({ customTargetFats: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-black text-amber-700 bg-white focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Rec: {pureGoals.fats} g</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-emerald-500 focus-within:bg-white transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Dietary Fiber</label>
                        <span className="text-[10px] text-slate-400 font-medium">grams</span>
                      </div>
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={profileForm.customTargetFiber !== undefined ? profileForm.customTargetFiber : pureGoals.fiber}
                        onChange={e => handleManualTargetChange({ customTargetFiber: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-black text-emerald-700 bg-white focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Rec: {pureGoals.fiber} g</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 focus-within:border-cyan-500 focus-within:bg-white transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase">Water Intake</label>
                        <span className="text-[10px] text-slate-400 font-medium">ml/day</span>
                      </div>
                      <input
                        type="number"
                        step="100"
                        min="1000"
                        max="8000"
                        value={profileForm.customTargetWater !== undefined ? profileForm.customTargetWater : pureGoals.water}
                        onChange={e => handleManualTargetChange({ customTargetWater: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-black text-cyan-700 bg-white focus:ring-2 focus:ring-cyan-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Rec: {pureGoals.water} ml (~{Math.round(pureGoals.water / 250)} cups)</span>
                    </div>
                  </div>
                </div>

                {/* Veggie Exclusions & Meal Planning Dietary Preferences */}
                <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span className="text-base">🥦</span>
                      Excluded Veggies & Ingredients
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select or customize any vegetables you dislike or wish to exclude. These are automatically omitted from recipe shopping lists and pantry deductions.
                    </p>
                  </div>

                  {/* Common Veggie Exclusion Quick Toggles */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">
                      Quick Veggie Presets:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Bitter Gourd (Karela)',
                        'Eggplant (Baingan)',
                        'Mushrooms',
                        'Bell Peppers / Capsicum',
                        'Okra (Bhindi)',
                        'Spinach (Palak)',
                        'Cauliflower (Gobi)',
                        'Bottle Gourd (Lauki)',
                        'Radish (Mooli)'
                      ].map(veggie => {
                        const isExcluded = isIngredientExcluded(veggie, profileForm.excludedVeggies || []);
                        return (
                          <button
                            key={veggie}
                            type="button"
                            onClick={() => handleToggleVeggie(veggie)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                              isExcluded
                                ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-xs'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            <span>{isExcluded ? '🚫' : '🥬'}</span>
                            <span>{veggie}</span>
                            {isExcluded && <span className="text-[10px] font-bold text-rose-600">Excluded</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Veggie / Ingredient Input */}
                  <form onSubmit={handleAddCustomExclusion} className="flex gap-2 items-center pt-1">
                    <input
                      type="text"
                      value={customExclusionInput}
                      onChange={e => setCustomExclusionInput(e.target.value)}
                      placeholder="Type any custom ingredient to exclude (e.g. Cilantro, Onions, Garlic, Peanuts)..."
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white shadow-xs"
                    />
                    <button
                      type="submit"
                      disabled={!customExclusionInput.trim()}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Exclusion</span>
                    </button>
                  </form>

                  {/* Currently Excluded Veggies Tags */}
                  {(profileForm.excludedVeggies && profileForm.excludedVeggies.length > 0) && (
                    <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-rose-800 uppercase block">
                          Active Exclusions ({profileForm.excludedVeggies.length}):
                        </span>
                        <span className="text-[10px] text-rose-600 font-medium">
                          Omitted from shopping & meal planner
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {profileForm.excludedVeggies.map((veg, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-xs font-bold text-rose-700 shadow-xs"
                          >
                            <span>🚫 {veg}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveVeggieIndex(idx)}
                              className="text-slate-400 hover:text-rose-600 ml-1 text-sm font-bold leading-none p-0.5"
                              title="Remove exclusion"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meal Planner Slots Preferences: Snacks and Desserts */}
                  <div className="pt-3 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">
                      Meal Planner Slots & Treats
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer bg-white">
                        <input
                          type="checkbox"
                          checked={profileForm.includeSnacksInPlanner !== false}
                          onChange={e => handleToggleSnacks(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span>🍎</span>
                            <span>Include Daily Snack Slots</span>
                          </div>
                          <p className="text-[11px] text-slate-500">Show snacks in calendar & macro breakdown</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer bg-white">
                        <input
                          type="checkbox"
                          checked={profileForm.includeDessertsInPlanner !== false}
                          onChange={e => handleToggleDesserts(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span>🍨</span>
                            <span>Include Dessert & Treat Slots</span>
                          </div>
                          <p className="text-[11px] text-slate-500">Plan guilt-free low-calorie sweets & parfaits</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all shadow-emerald-600/20 text-sm"
                  >
                    Save Profile & Targets
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Col: Weight Tracking History & Data Protection */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-emerald-600" />
                    Weight Progress Log
                  </h3>
                  <p className="text-xs text-slate-500">Track body composition over time</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWeightModalOpen(true)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Log Weight
                </button>
              </div>

              {/* Current Weight Callout */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Current Weight</span>
                  <div className="text-2xl font-black text-slate-900">
                    {profileForm.weight} <span className="text-sm font-normal text-slate-500">{profileForm.weightUnit}</span>
                  </div>
                </div>
                {weightHistory.length >= 2 && (
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Recent Delta</span>
                    {(() => {
                      const sorted = [...weightHistory].sort((a, b) => a.date.localeCompare(b.date));
                      const diff = Math.round((sorted[sorted.length - 1].weight - sorted[0].weight) * 10) / 10;
                      return (
                        <div className={`text-sm font-black flex items-center justify-end gap-1 ${diff < 0 ? 'text-emerald-600' : diff > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                          {diff < 0 ? <TrendingDown className="w-4 h-4" /> : diff > 0 ? <TrendingUp className="w-4 h-4" /> : null}
                          {diff > 0 ? `+${diff}` : `${diff}`} {profileForm.weightUnit}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Weight History List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {weightHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No weight entries logged yet.</p>
                ) : (
                  [...weightHistory]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map(entry => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 text-xs transition-colors"
                      >
                        <div>
                          <span className="font-bold text-slate-800">
                            {entry.weight} {profileForm.weightUnit}
                          </span>
                          <span className="text-slate-400 ml-2">{entry.date}</span>
                          {entry.notes && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{entry.notes}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeWeightEntry(entry.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Info className="w-4 h-4 text-amber-600" />
                Dietitian Pro Tip
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Consistency is key! Weigh yourself first thing in the morning once or twice a week after waking up and before breakfast for the most reliable body trend line.
              </p>
            </div>

            {/* Data Protection & Backup Vault */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-md border border-slate-700/60">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Data Protection Vault</h4>
                    <p className="text-[11px] text-slate-400">IndexedDB Storage & Auto-Persistence</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Protected
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Your entries, meal plans, custom targets, and uploaded medical files are continuously saved into IndexedDB with high storage quota. Changes and code updates will not erase your data.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={exportDataJSON}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                  title="Download complete JSON file to your device"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Backup
                </button>
                <button
                  type="button"
                  onClick={() => backupFileInputRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold transition-all"
                  title="Restore previously exported JSON file"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Restore JSON
                </button>
              </div>
              <input
                ref={backupFileInputRef}
                type="file"
                accept=".json"
                onChange={handleRestoreBackupFile}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: LAB REPORTS & MEDICAL RECORDS LOCKER */}
      {/* ========================================================================= */}
      {activeSubTab === 'blood' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-600" />
                Medical & Lab Reports Locker
              </h2>
              <p className="text-xs text-slate-500">
                Securely upload, store, and view your actual blood tests and medical documents (PDF or images) with doctor notes.
              </p>
            </div>

            <button
              onClick={() => {
                setReportTitle('');
                setReportDate(new Date().toISOString().split('T')[0]);
                setReportLab('');
                setReportNotes('');
                setReportFileName('');
                setReportFileData('');
                setReportFileType('');
                setReportBiomarkers([]);
                setShowBiomarkerEntry(false);
                setIsReportModalOpen(true);
              }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all shadow-rose-600/20 text-xs sm:text-sm flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload / Add Lab Report
            </button>
          </div>

          {bloodReports.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">No Lab Reports Uploaded Yet</h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Upload your blood test reports or doctor visit summaries (PDF or images) to keep them organized and accessible anytime offline.
              </p>
              <button
                onClick={() => {
                  setReportTitle('');
                  setReportDate(new Date().toISOString().split('T')[0]);
                  setReportLab('');
                  setReportNotes('');
                  setReportFileName('');
                  setReportFileData('');
                  setReportFileType('');
                  setReportBiomarkers([]);
                  setShowBiomarkerEntry(false);
                  setIsReportModalOpen(true);
                }}
                className="px-5 py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-rose-700"
              >
                + Upload My First Report
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Reports Selector Sidebar */}
              <div className="lg:col-span-1 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Saved Reports ({bloodReports.length})
                  </span>
                  <button
                    onClick={() => {
                      setReportTitle('');
                      setReportDate(new Date().toISOString().split('T')[0]);
                      setReportLab('');
                      setReportNotes('');
                      setReportFileName('');
                      setReportFileData('');
                      setReportFileType('');
                      setReportBiomarkers([]);
                      setShowBiomarkerEntry(false);
                      setIsReportModalOpen(true);
                    }}
                    className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New
                  </button>
                </div>
                <div className="space-y-2">
                  {bloodReports.map(rep => {
                    const isSelected = (currentBloodReport?.id === rep.id);
                    const isPdf = rep.fileData?.startsWith('data:application/pdf') || rep.fileName?.toLowerCase().endsWith('.pdf');
                    return (
                      <div
                        key={rep.id}
                        onClick={() => setSelectedReportId(rep.id)}
                        className={`p-3.5 rounded-2xl cursor-pointer border transition-all ${
                          isSelected
                            ? 'bg-rose-50/70 border-rose-300 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-xs font-black line-clamp-1 ${isSelected ? 'text-rose-900' : 'text-slate-800'}`}>
                            {rep.title}
                          </h4>
                          {rep.fileData ? (
                            <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold shrink-0">
                              {isPdf ? 'PDF' : 'Image'}
                            </span>
                          ) : rep.hasAttachment ? (
                            <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold shrink-0">
                              Attached
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold shrink-0">
                              Notes
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{rep.date}</span>
                          {rep.labName && <span className="truncate">• {rep.labName}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Report Detailed Findings */}
              {currentBloodReport && (
                <div className="lg:col-span-3 space-y-6">
                  {/* Top Report Summary Banner */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-slate-900">{currentBloodReport.title}</h3>
                          {currentBloodReport.fileName && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <FileText className="w-3 h-3" />
                              {currentBloodReport.fileName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                          <span>Test Date: <strong className="text-slate-700">{currentBloodReport.date}</strong></span>
                          {currentBloodReport.labName && (
                            <span>Laboratory: <strong className="text-slate-700">{currentBloodReport.labName}</strong></span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {currentBloodReport.fileData && (
                          <>
                            <a
                              href={currentBloodReport.fileData}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                              title="Open file in separate tab / window"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Full View
                            </a>
                            <a
                              href={currentBloodReport.fileData}
                              download={currentBloodReport.fileName || `${currentBloodReport.title}.pdf`}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </a>
                          </>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete lab report "${currentBloodReport.title}"?`)) {
                              removeBloodReport(currentBloodReport.id);
                              const remaining = bloodReports.filter(r => r.id !== currentBloodReport.id);
                              setSelectedReportId(remaining.length > 0 ? remaining[0].id : null);
                              triggerSuccess('Lab report deleted.');
                            }
                          }}
                          className="text-xs text-rose-600 hover:text-rose-800 p-2 rounded-xl hover:bg-rose-50 flex items-center gap-1 transition-colors"
                          title="Delete this report"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Doctor's Notes / Remarks */}
                    {currentBloodReport.notes && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-700 mb-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                          <Stethoscope className="w-4 h-4 text-emerald-600" />
                          Doctor's Notes & Lab Remarks:
                        </div>
                        <p className="whitespace-pre-line text-slate-700">{currentBloodReport.notes}</p>
                      </div>
                    )}

                    {/* In-App Document Viewer */}
                    {currentBloodReport.fileData ? (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          <span className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4 text-slate-500" />
                            Document Viewer
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            {currentBloodReport.fileName}
                          </span>
                        </div>

                        {/* If PDF */}
                        {(currentBloodReport.fileData.startsWith('data:application/pdf') || currentBloodReport.fileName?.toLowerCase().endsWith('.pdf')) ? (
                          <div className="rounded-2xl border border-slate-300 overflow-hidden bg-slate-900 shadow-inner">
                            <div className="p-2.5 bg-slate-800 text-white flex items-center justify-between text-xs border-b border-slate-700">
                              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-rose-400" />
                                {currentBloodReport.fileName || 'Report PDF'}
                              </span>
                              <div className="flex items-center gap-2">
                                <a
                                  href={currentBloodReport.fileData}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] bg-slate-700 hover:bg-slate-600 px-2.5 py-1 rounded-lg text-white font-medium flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Open in Tab
                                </a>
                                <a
                                  href={currentBloodReport.fileData}
                                  download={currentBloodReport.fileName || `${currentBloodReport.title}.pdf`}
                                  className="text-[11px] bg-rose-600 hover:bg-rose-700 px-2.5 py-1 rounded-lg text-white font-bold flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  Download PDF
                                </a>
                              </div>
                            </div>
                            <div className="w-full h-[650px] bg-slate-800">
                              <iframe
                                src={currentBloodReport.fileData}
                                title={currentBloodReport.title}
                                className="w-full h-full border-none"
                              />
                            </div>
                          </div>
                        ) : (currentBloodReport.fileData.startsWith('data:image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(currentBloodReport.fileName || '')) ? (
                          /* If Image */
                          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 shadow-inner">
                            <div className="p-2.5 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-emerald-600" />
                                {currentBloodReport.fileName || 'Report Image'}
                              </span>
                              <div className="flex items-center gap-2">
                                <a
                                  href={currentBloodReport.fileData}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-medium flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Full Image
                                </a>
                                <a
                                  href={currentBloodReport.fileData}
                                  download={currentBloodReport.fileName || `${currentBloodReport.title}.png`}
                                  className="text-[11px] bg-emerald-700 hover:bg-emerald-800 px-2.5 py-1 rounded-lg text-white font-bold flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  Download Image
                                </a>
                              </div>
                            </div>
                            <div className="p-4 flex items-center justify-center bg-slate-50 max-h-[700px] overflow-auto">
                              <img
                                src={currentBloodReport.fileData}
                                alt={currentBloodReport.title}
                                className="max-h-[650px] w-auto object-contain rounded-xl shadow-md border border-slate-200"
                              />
                            </div>
                          </div>
                        ) : (
                          /* Other File type */
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-slate-700">
                              <FileText className="w-5 h-5 text-slate-500" />
                              <span>Attached Document: <strong>{currentBloodReport.fileName}</strong></span>
                            </div>
                            <a
                              href={currentBloodReport.fileData}
                              download={currentBloodReport.fileName || 'Report_Document'}
                              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-emerald-200"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download File
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                        <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                        <span className="font-semibold text-slate-700 block">
                          {currentBloodReport.hasAttachment ? 'Document Stored on Original Device' : 'No Document Attached'}
                        </span>
                        <span>
                          {currentBloodReport.hasAttachment
                            ? 'The original file attachment for this report is saved safely on the device where it was uploaded.'
                            : 'This report was logged with text notes. You can attach PDF or image files when uploading reports.'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Optional User-Recorded Biomarkers (Only if user recorded any) */}
                  {currentBloodReport.biomarkers && currentBloodReport.biomarkers.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Recorded Lab Test Values ({currentBloodReport.biomarkers.length})
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                              <th className="pb-2">Test Name</th>
                              <th className="pb-2">Recorded Value</th>
                              <th className="pb-2">Standard Range</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {currentBloodReport.biomarkers.map(bm => (
                              <tr key={bm.id} className="text-slate-700">
                                <td className="py-2.5 font-bold text-slate-900">{bm.name}</td>
                                <td className="py-2.5 font-bold">
                                  <span className="text-sm text-slate-900">{bm.value}</span>{' '}
                                  <span className="text-slate-500 font-normal">{bm.unit}</span>
                                </td>
                                <td className="py-2.5 text-slate-500">
                                  {bm.minNormal} - {bm.maxNormal} {bm.unit}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: END-OF-MONTH HEALTH & NUTRITION REPORT */}
      {/* ========================================================================= */}
      {activeSubTab === 'monthly' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                End-of-Month Health & Nutrition Summary
              </h2>
              <p className="text-xs text-slate-500">
                A complete executive report card of your calories, macros, hydration, cooking volume, and weight trends.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-sm font-bold bg-white text-slate-800"
                />
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>
          </div>

          {/* Printable Report Document Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
            {/* Header / Letterhead */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥗</span>
                  <h1 className="text-2xl font-black text-slate-900">MealCraft Health Report Card</h1>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Monthly Nutrition, Meal Prep Adherence & Biomarker Assessment
                </p>
              </div>

              <div className="text-right">
                <div className="text-base font-black text-emerald-700">
                  {new Date(`${selectedMonth}-02`).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Subject: <strong className="text-slate-800">{userProfile.name || 'User'}</strong> ({userProfile.age}y, {userProfile.gender})
                </div>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Monthly Calorie & Nutrition Performance
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase block">Daily Avg Intake</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-900">{monthlyData.avgDailyCalories}</span>
                    <span className="text-xs text-slate-500">kcal</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Target: {monthlyData.targetCalories} kcal
                  </span>
                </div>

                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-800 uppercase block">Adherence Rate</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-emerald-700">{monthlyData.adherenceRate}%</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 mt-1 block">
                    {monthlyData.uniqueDaysLoggedCount} of {monthlyData.daysInMonth} days logged
                  </span>
                </div>

                <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200">
                  <span className="text-xs font-bold text-blue-800 uppercase block">Avg Daily Water</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-blue-800">{monthlyData.avgWaterMl}</span>
                    <span className="text-xs text-blue-600">ml</span>
                  </div>
                  <span className="text-[11px] text-blue-600 mt-1 block">
                    ~{Math.round(monthlyData.avgWaterMl / 250)} glasses/day
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase block">Monthly Weight Trend</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    {monthlyData.weightDelta !== null ? (
                      <>
                        <span className={`text-2xl font-black ${monthlyData.weightDelta < 0 ? 'text-emerald-600' : monthlyData.weightDelta > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                          {monthlyData.weightDelta > 0 ? `+${monthlyData.weightDelta}` : monthlyData.weightDelta}
                        </span>
                        <span className="text-xs text-slate-500">{userProfile.weightUnit}</span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-slate-400">No logs</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {monthlyData.startWeight ? `Start: ${monthlyData.startWeight} → End: ${monthlyData.endWeight}` : 'Log weekly in Profile'}
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Average Macronutrients Breakdown */}
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Average Daily Macronutrient Intake vs Recommended
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Protein</span>
                  <div className="text-lg font-black text-rose-700 mt-0.5">
                    {monthlyData.avgDailyProtein}g <span className="text-xs font-normal text-slate-400">/ {dailyGoals.protein}g</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.round((monthlyData.avgDailyProtein / (dailyGoals.protein || 1)) * 100))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Carbohydrates</span>
                  <div className="text-lg font-black text-blue-700 mt-0.5">
                    {monthlyData.avgDailyCarbs}g <span className="text-xs font-normal text-slate-400">/ {dailyGoals.carbs}g</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.round((monthlyData.avgDailyCarbs / (dailyGoals.carbs || 1)) * 100))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Fats</span>
                  <div className="text-lg font-black text-amber-700 mt-0.5">
                    {monthlyData.avgDailyFats}g <span className="text-xs font-normal text-slate-400">/ {dailyGoals.fats}g</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.round((monthlyData.avgDailyFats / (dailyGoals.fats || 1)) * 100))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Dietary Fiber</span>
                  <div className="text-lg font-black text-emerald-700 mt-0.5">
                    {monthlyData.avgDailyFiber}g <span className="text-xs font-normal text-slate-400">/ {dailyGoals.fiber}g</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.round((monthlyData.avgDailyFiber / (dailyGoals.fiber || 1)) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cooking, Meal Prep & Store Efficiency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-emerald-600" />
                  Home Cooking & Meal Prep Efficiency
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600">Total Planned Meals Cooked:</span>
                    <strong className="text-slate-900 font-bold">{monthlyData.cookedMealsCount} meals</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600">Batch-Cooked / Leftover Servings:</span>
                    <strong className="text-emerald-700 font-bold">{monthlyData.leftoverMealsCount} meals prepped</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600">Cooked from Scratch:</span>
                    <strong className="text-slate-900 font-bold">{monthlyData.scratchCookedCount} sessions</strong>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Batch-cooking 3-4 meals at once reduced grocery waste and saved ~6 cooking hours this month.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Medical & Lab Records Status
                </h3>
                {bloodReports.length > 0 ? (
                  <div className="space-y-2 text-xs">
                    <div className="text-slate-700 font-medium">
                      Latest Report: <strong>{bloodReports[0].title}</strong> ({bloodReports[0].date})
                    </div>
                    {bloodReports[0].labName && (
                      <div className="text-slate-500 text-[11px]">
                        Lab: {bloodReports[0].labName}
                      </div>
                    )}
                    {bloodReports[0].fileName && (
                      <div className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <FileText className="w-3 h-3" />
                        Attached: {bloodReports[0].fileName}
                      </div>
                    )}
                    {bloodReports[0].notes && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 italic">
                        "{bloodReports[0].notes}"
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-3">
                    No medical reports uploaded yet. Upload your blood tests or doctor records in the Lab Reports tab to keep them organized.
                  </p>
                )}
              </div>
            </div>

            {/* Executive Lifestyle Insights & Advice for Next Month */}
            <div className="bg-emerald-50/60 rounded-2xl p-6 border border-emerald-200">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                Executive Nutritional Insights for Next Month
              </h3>
              <ul className="space-y-2 text-xs text-emerald-900/90 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">•</span>
                  <span>
                    <strong>Calorie Alignment:</strong> Your average intake of {monthlyData.avgDailyCalories} kcal is {Math.abs(monthlyData.avgDailyCalories - monthlyData.targetCalories) <= 150 ? 'exceptionally well-aligned' : monthlyData.avgDailyCalories < monthlyData.targetCalories ? 'slightly below your target (prioritize healthy nuts and whole grains)' : 'slightly above your target (focus on filling veggies and dals)'} with your {profileForm.goal.replace('_', ' ')} goal.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">•</span>
                  <span>
                    <strong>Protein Target:</strong> Aim to hit ~{dailyGoals.protein}g of protein daily using Costco salmon/chicken and Indian paneer & toor dal to protect lean muscle tissue.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-emerald-700">•</span>
                  <span>
                    <strong>Hydration:</strong> Strive for {dailyGoals.water}ml of daily hydration (~10 cups) to optimize digestion and kidney biomarker clearance.
                  </span>
                </li>
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400">
              Generated automatically by MealCraft PWA on {new Date().toLocaleDateString()} • All data stored private and local.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LOG WEIGHT */}
      {/* ========================================================================= */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              Log Body Weight
            </h3>
            <p className="text-xs text-slate-500 mb-4">Record your morning weigh-in</p>

            <form onSubmit={handleLogWeightSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Weight ({profileForm.weightUnit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightInput}
                  onChange={e => setWeightInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={weightDateInput}
                  onChange={e => setWeightDateInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Post-workout, feeling energetic"
                  value={weightNotesInput}
                  onChange={e => setWeightNotesInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWeightModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / UPLOAD BLOOD REPORT */}
      {/* ========================================================================= */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-rose-600" />
                  Upload & Save Lab Report
                </h3>
                <p className="text-xs text-slate-500">
                  Upload a PDF or image of your test report, or record your doctor notes. All files remain private and local to your device.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBloodReport} className="space-y-5">
              {/* File Upload Drop Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Attach Report File (PDF or Image)
                </label>
                {reportFileName ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-900 block truncate max-w-xs sm:max-w-md">
                          {reportFileName}
                        </span>
                        <span className="text-[11px] text-emerald-700">
                          {reportFileType || (reportFileName.toLowerCase().endsWith('.pdf') ? 'PDF Document' : 'Image')} • Ready to save
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setReportFileName('');
                        setReportFileData('');
                        setReportFileType('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-rose-400 hover:bg-rose-50/30 rounded-2xl p-5 text-center cursor-pointer transition-all"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,image/*,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
                    <div className="text-xs font-bold text-slate-700">
                      Click to browse or drop your report document
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Supports PDF, PNG, JPG, JPEG, WEBP files
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Report Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual Blood Work 2026"
                    value={reportTitle}
                    onChange={e => setReportTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Test Date *</label>
                    <input
                      type="date"
                      required
                      value={reportDate}
                      onChange={e => setReportDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lab / Clinic</label>
                    <input
                      type="text"
                      placeholder="e.g. Quest, LabCorp"
                      value={reportLab}
                      onChange={e => setReportLab(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Doctor / Lab Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Doctor's Notes & Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Record what your physician or pathologist noted about this test..."
                  value={reportNotes}
                  onChange={e => setReportNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Optional Biomarkers Entry Section (Starts empty, no fake numbers) */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-700 uppercase block">
                      Record Specific Lab Numbers (Optional)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Optionally log individual numbers from your paper sheet to track over time
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBiomarkerEntry(!showBiomarkerEntry)}
                    className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-300 text-xs transition-colors"
                  >
                    {showBiomarkerEntry ? 'Hide' : reportBiomarkers.length > 0 ? `Show (${reportBiomarkers.length})` : '+ Add Metrics'}
                  </button>
                </div>

                {showBiomarkerEntry && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
                    {/* Quick Add Presets Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[11px] text-slate-500 self-center mr-1">Quick Add:</span>
                      {STANDARD_BIOMARKER_TEMPLATES.map(t => {
                        const alreadyAdded = reportBiomarkers.some(b => b.id === t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            disabled={alreadyAdded}
                            onClick={() => handleAddBiomarkerPreset(t.id)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                              alreadyAdded
                                ? 'bg-slate-100 text-slate-400 border-slate-200'
                                : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-300'
                            }`}
                          >
                            + {t.name.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>

                    {/* Biomarkers Input List */}
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {reportBiomarkers.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400 border border-slate-200 rounded-xl bg-white">
                          No specific metrics added. Click a button above if you want to record a test number.
                        </div>
                      ) : (
                        reportBiomarkers.map(bm => (
                          <div
                            key={bm.id}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200 text-xs"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-slate-800 block truncate">{bm.name}</span>
                              <span className="text-[10px] text-slate-500">
                                Ref: {bm.minNormal} - {bm.maxNormal} {bm.unit}
                              </span>
                            </div>

                            <div className="w-24">
                              <input
                                type="number"
                                step="0.1"
                                placeholder="Value"
                                value={bm.value || ''}
                                onChange={e => handleUpdateBiomarkerValue(bm.id, e.target.value)}
                                className="w-full px-2 py-1 rounded-lg border border-slate-300 text-center font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500"
                              />
                            </div>

                            <span className="text-[11px] font-semibold text-slate-500 w-12 truncate">
                              {bm.unit}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleRemoveBiomarker(bm.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              title="Remove metric"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!reportTitle.trim()}
                  className="px-6 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Report Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

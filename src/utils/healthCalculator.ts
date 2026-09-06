import { UserProfile, DailyGoals, Biomarker } from '../types';

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation
 */
export function calculateBMR(profile: UserProfile): number {
  const weightKg = profile.weightUnit === 'lbs' ? profile.weight * 0.453592 : profile.weight;
  const heightCm = profile.height;

  if (profile.gender === 'female') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * profile.age - 161);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * profile.age + 5);
  }
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE) based on activity level
 */
export function calculateTDEE(profile: UserProfile): number {
  const bmr = calculateBMR(profile);
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * (multipliers[profile.activityLevel] || 1.375));
}

/**
 * Calculates scientifically recommended daily targets without custom overrides
 */
export function calculatePureRecommendedGoals(profile: UserProfile): DailyGoals {
  const tdee = calculateTDEE(profile);
  const weightKg = profile.weightUnit === 'lbs' ? profile.weight * 0.453592 : profile.weight;

  let targetCalories = tdee;
  if (profile.goal === 'lose_weight') {
    targetCalories = Math.max(1200, tdee - 500); // 500 kcal deficit
  } else if (profile.goal === 'build_muscle') {
    targetCalories = tdee + 300; // clean surplus
  }

  // Protein: ~1.8 - 2.2g per kg bodyweight
  const proteinGrams = Math.round(weightKg * (profile.goal === 'build_muscle' ? 2.2 : 1.8));
  const proteinCalories = proteinGrams * 4;

  // Fats: 25% of total calories (9 kcal/g)
  const fatsGrams = Math.round((targetCalories * 0.25) / 9);
  const fatCalories = fatsGrams * 9;

  // Carbs: Remaining calories (4 kcal/g)
  const remainingCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
  const carbsGrams = Math.round(remainingCalories / 4);

  // Fiber: ~14g per 1000 kcal
  const fiberGrams = Math.round((targetCalories / 1000) * 14);

  // Water: ~35ml per kg bodyweight
  const waterMl = Math.round(weightKg * 35);

  return {
    calories: targetCalories,
    protein: proteinGrams,
    carbs: carbsGrams,
    fats: fatsGrams,
    fiber: fiberGrams,
    water: Math.max(2000, waterMl),
  };
}

/**
 * Distributes custom calories across standard macronutrient splits
 */
export function calculateMacrosForCalories(
  calories: number,
  ratioType: 'balanced' | 'high_protein' | 'low_carb' = 'balanced'
): { protein: number; carbs: number; fats: number; fiber: number } {
  let pPercent = 0.30;
  let cPercent = 0.45;
  let fPercent = 0.25;

  if (ratioType === 'high_protein') {
    pPercent = 0.40;
    cPercent = 0.35;
    fPercent = 0.25;
  } else if (ratioType === 'low_carb') {
    pPercent = 0.35;
    cPercent = 0.15;
    fPercent = 0.50;
  }

  const proteinGrams = Math.round((calories * pPercent) / 4);
  const fatsGrams = Math.round((calories * fPercent) / 9);
  const carbsGrams = Math.round((calories * cPercent) / 4);
  const fiberGrams = Math.round((calories / 1000) * 14);

  return {
    protein: proteinGrams,
    carbs: carbsGrams,
    fats: fatsGrams,
    fiber: fiberGrams
  };
}

/**
 * Generates daily goals, preferring custom overrides if present
 */
export function generateRecommendedGoals(profile: UserProfile): DailyGoals {
  const pure = calculatePureRecommendedGoals(profile);

  return {
    calories: profile.customTargetCalories || pure.calories,
    protein: profile.customTargetProtein || pure.protein,
    carbs: profile.customTargetCarbs || pure.carbs,
    fats: profile.customTargetFats || pure.fats,
    fiber: profile.customTargetFiber || pure.fiber,
    water: profile.customTargetWater || pure.water,
  };
}

/**
 * Pre-defined medical reference database for common blood biomarkers
 */
export const STANDARD_BIOMARKER_TEMPLATES: Array<{
  id: string;
  name: string;
  category: Biomarker['category'];
  unit: string;
  minNormal: number;
  maxNormal: number;
  lowTip: string;
  highTip: string;
}> = [
  {
    id: 'glucose',
    name: 'Fasting Blood Glucose',
    category: 'Metabolic / Glucose',
    unit: 'mg/dL',
    minNormal: 70,
    maxNormal: 99,
    lowTip: 'Eat complex carbs and balanced snacks to stabilize blood sugar.',
    highTip: 'Prioritize soluble fiber from Indian whole dals, chia seeds, and leafy greens. Limit refined flours (maida) and sugary sweets.',
  },
  {
    id: 'hba1c',
    name: 'HbA1c (Glycated Hemoglobin)',
    category: 'Metabolic / Glucose',
    unit: '%',
    minNormal: 4.0,
    maxNormal: 5.6,
    lowTip: 'Normal range. Continue balanced nutrition.',
    highTip: 'Elevated 3-month blood sugar. Emphasize low-glycemic foods: Costco steel-cut oats, methi (fenugreek) seeds, and bitter gourd (karela).',
  },
  {
    id: 'cholesterol_total',
    name: 'Total Cholesterol',
    category: 'Lipid Panel',
    unit: 'mg/dL',
    minNormal: 125,
    maxNormal: 200,
    lowTip: 'Unusually low cholesterol; consult your physician regarding fat absorption.',
    highTip: 'Incorporate Costco extra virgin olive oil, garlic, and psyllium husk (isabgol). Moderately limit heavy ghee and deep-fried snacks.',
  },
  {
    id: 'ldl',
    name: 'LDL ("Bad") Cholesterol',
    category: 'Lipid Panel',
    unit: 'mg/dL',
    minNormal: 50,
    maxNormal: 100,
    lowTip: 'Optimal LDL range.',
    highTip: 'Increase soluble fiber (oats, beans, lentils, apples) and Omega-3 rich wild salmon from Costco to lower LDL.',
  },
  {
    id: 'hdl',
    name: 'HDL ("Good") Cholesterol',
    category: 'Lipid Panel',
    unit: 'mg/dL',
    minNormal: 40,
    maxNormal: 80,
    lowTip: 'Low protective cholesterol. Boost with Kirkland raw walnuts, almonds, avocado, and regular aerobic exercise.',
    highTip: 'Excellent cardiovascular protective HDL levels.',
  },
  {
    id: 'triglycerides',
    name: 'Triglycerides',
    category: 'Lipid Panel',
    unit: 'mg/dL',
    minNormal: 50,
    maxNormal: 150,
    lowTip: 'Normal triglyceride levels.',
    highTip: 'Cut back on simple sugars, soda, and refined carbs. Add Costco wild Alaskan salmon fillets and chia seeds.',
  },
  {
    id: 'vitamin_d',
    name: 'Vitamin D3 (25-Hydroxy)',
    category: 'Vitamins & Minerals',
    unit: 'ng/mL',
    minNormal: 30,
    maxNormal: 100,
    lowTip: 'Vitamin D deficiency is common. Include fortified milk, paneer, egg yolks, salmon, and daily sunlight exposure / D3 drops.',
    highTip: 'Sufficient Vitamin D levels.',
  },
  {
    id: 'vitamin_b12',
    name: 'Vitamin B12 (Cobalamin)',
    category: 'Vitamins & Minerals',
    unit: 'pg/mL',
    minNormal: 211,
    maxNormal: 911,
    lowTip: 'Low B12 (very common in vegetarian diets). Include Greek yogurt, paneer, eggs, or sublingual B12 supplements.',
    highTip: 'Normal Vitamin B12 levels.',
  },
  {
    id: 'hemoglobin',
    name: 'Hemoglobin (CBC)',
    category: 'Blood Count',
    unit: 'g/dL',
    minNormal: 12.0,
    maxNormal: 17.5,
    lowTip: 'Potential iron-deficiency anemia. Eat iron-rich spinach (palak), beetroot, lentils, combined with vitamin C (lemon juice).',
    highTip: 'Normal to elevated hemoglobin. Ensure adequate daily water hydration.',
  },
  {
    id: 'tsh',
    name: 'TSH (Thyroid Stimulating Hormone)',
    category: 'Other',
    unit: 'mIU/L',
    minNormal: 0.45,
    maxNormal: 4.5,
    lowTip: 'Low TSH may indicate overactive thyroid. Consult your physician.',
    highTip: 'Elevated TSH may indicate sluggish thyroid. Ensure adequate dietary selenium (Brazil nuts), zinc, and iodized salt.',
  }
];

/**
 * Analyzes a list of biomarkers and outputs tailored clinical dietary advice
 */
export function analyzeBloodReport(biomarkers: Biomarker[]): {
  overallSummary: string;
  recommendedFoods: string[];
  foodsToLimit: string[];
} {
  const abnormal = biomarkers.filter(b => b.status !== 'normal');
  const recommendedFoods: Set<string> = new Set();
  const foodsToLimit: Set<string> = new Set();

  let summary = '';
  if (abnormal.length === 0) {
    summary = '🎉 Excellent blood report! All tested biomarkers fall within normal reference ranges. Maintain your balanced diet and consistent hydration.';
    recommendedFoods.add('Costco Wild Salmon (Omega-3)');
    recommendedFoods.add('Indian Whole Moong & Toor Dal (Fiber & Plant Protein)');
    recommendedFoods.add('Mixed Berries & Leafy Greens (Antioxidants)');
  } else {
    summary = `Report Analysis: ${abnormal.length} biomarker${abnormal.length > 1 ? 's' : ''} outside ideal range (${abnormal.map(a => `${a.name}: ${a.status.toUpperCase()}`).join(', ')}).`;

    abnormal.forEach(b => {
      const id = b.id.toLowerCase();
      if (id.includes('glucose') || id.includes('hba1c')) {
        if (b.status === 'high') {
          recommendedFoods.add('Fenugreek (Methi) Seeds & Spinach');
          recommendedFoods.add('Costco Rolled Oats (Beta-glucan fiber)');
          recommendedFoods.add('Whole Moong Dal & Chana Dal');
          foodsToLimit.add('Refined White Rice & Maida Flour');
          foodsToLimit.add('Sugary Beverages & Indian Sweets (Mithai)');
        }
      }
      if (id.includes('cholesterol') || id.includes('ldl') || id.includes('triglycerides')) {
        if (b.status === 'high') {
          recommendedFoods.add('Costco Wild Sockeye Salmon');
          recommendedFoods.add('Raw Walnuts & Almonds');
          recommendedFoods.add('Avocado & Extra Virgin Olive Oil');
          recommendedFoods.add('Psyllium Husk / Isabgol & Garlic');
          foodsToLimit.add('Deep-Fried Snacks (Samosas, Pakoras, Chips)');
          foodsToLimit.add('Processed Meats & Excessive Full-Fat Cream');
        }
      }
      if (id.includes('vitamin_d')) {
        if (b.status === 'low') {
          recommendedFoods.add('Fortified Kirkland Greek Yogurt & Milk');
          recommendedFoods.add('Pasture-Raised Eggs (Egg Yolks)');
          recommendedFoods.add('Mushrooms & Vitamin D3 Supplementation');
        }
      }
      if (id.includes('vitamin_b12')) {
        if (b.status === 'low') {
          recommendedFoods.add('Fresh Paneer Block (Haldiram / Nanak)');
          recommendedFoods.add('Organic Greek Yogurt & Milk');
          recommendedFoods.add('Fortified Nutritional Yeast or B12 Supplement');
        }
      }
      if (id.includes('hemoglobin')) {
        if (b.status === 'low') {
          recommendedFoods.add('Fresh Spinach (Palak) with Lemon Juice (Vitamin C)');
          recommendedFoods.add('Beetroot, Pomegranate & Black Raisins');
          recommendedFoods.add('Sprouted Lentils & Pumpkin Seeds');
          foodsToLimit.add('Drinking black tea or coffee directly with meals (inhibits iron absorption)');
        }
      }
    });
  }

  return {
    overallSummary: summary,
    recommendedFoods: Array.from(recommendedFoods),
    foodsToLimit: Array.from(foodsToLimit),
  };
}

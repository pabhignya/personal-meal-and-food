/**
 * Culinary alias mappings covering Indian, American, and Costco naming conventions.
 */
const INGREDIENT_ALIASES: Record<string, string[]> = {
  // Peppers
  'bell pepper': ['capsicum', 'bell peppers', 'shimla mirch', 'green pepper', 'red pepper', 'yellow pepper', 'peppers'],
  'capsicum': ['bell pepper', 'bell peppers', 'shimla mirch', 'green pepper', 'red pepper'],
  'shimla mirch': ['bell pepper', 'capsicum', 'bell peppers'],
  
  // Bitter Gourd
  'bitter gourd': ['karela', 'bitter melon', 'bitter gourd'],
  'karela': ['bitter gourd', 'bitter melon'],
  
  // Eggplant
  'eggplant': ['baingan', 'brinjal', 'aubergine', 'vankaya', 'kathirikai'],
  'baingan': ['eggplant', 'brinjal', 'aubergine'],
  'brinjal': ['eggplant', 'baingan', 'aubergine'],
  
  // Mushrooms
  'mushroom': ['mushrooms', 'cremini', 'portobello', 'button mushroom', 'shiitake', 'khumb'],
  'mushrooms': ['mushroom', 'cremini', 'portobello', 'button mushroom', 'khumb'],
  
  // Okra
  'okra': ['bhindi', 'ladyfinger', 'lady finger', 'lady fingers', 'gumbo', 'bhendi'],
  'bhindi': ['okra', 'ladyfinger', 'lady finger', 'bhendi'],
  
  // Spinach & Greens
  'spinach': ['palak', 'baby spinach', 'spinach leaves', 'keerai'],
  'palak': ['spinach', 'baby spinach', 'spinach leaves'],
  
  // Cauliflower
  'cauliflower': ['gobi', 'gobhi', 'phool gobi'],
  'gobi': ['cauliflower', 'gobhi', 'phool gobi'],
  'gobhi': ['cauliflower', 'gobi'],
  
  // Bottle Gourd / Squashes
  'bottle gourd': ['lauki', 'doodhi', 'ghiya', 'sorakaya', 'sorakkai'],
  'lauki': ['bottle gourd', 'doodhi', 'ghiya'],
  'doodhi': ['bottle gourd', 'lauki', 'ghiya'],
  
  // Radish
  'radish': ['mooli', 'muli', 'daikon', 'white radish'],
  'mooli': ['radish', 'muli', 'daikon'],
  
  // Herbs & Seasonings
  'cilantro': ['kothmir', 'coriander', 'fresh coriander', 'dhania', 'cilantro leaves'],
  'coriander': ['cilantro', 'kothmir', 'dhania'],
  'kothmir': ['cilantro', 'coriander'],
  'fenugreek': ['methi', 'kasuri methi', 'fresh methi'],
  'methi': ['fenugreek', 'kasuri methi'],
  'mint': ['pudina', 'fresh mint'],
  'pudina': ['mint', 'fresh mint'],
  
  // Alliums & Aromatics
  'onion': ['onions', 'pyaz', 'shallot', 'shallots', 'red onion', 'yellow onion', 'spring onion'],
  'onions': ['onion', 'pyaz', 'shallots'],
  'pyaz': ['onion', 'onions'],
  'garlic': ['lehsun', 'lahsun', 'garlic cloves'],
  'ginger': ['adrak'],
  'ginger garlic': ['ginger & garlic', 'ginger-garlic', 'adrak lehsun'],
  
  // Tomatoes
  'tomato': ['tomatoes', 'tamatar'],
  'tomatoes': ['tomato', 'tamatar'],
  
  // Proteins & Dairy
  'paneer': ['cottage cheese', 'indian cottage cheese', 'paneer block'],
  'tofu': ['bean curd', 'soy bean curd'],
  'egg': ['eggs', 'anda'],
  'eggs': ['egg', 'anda'],
  
  // Legumes & Starches
  'potato': ['potatoes', 'aloo', 'alu', 'batata'],
  'potatoes': ['potato', 'aloo', 'alu'],
  'aloo': ['potato', 'potatoes'],
  'peanut': ['peanuts', 'groundnut', 'groundnuts', 'moongphali', 'singdana'],
  'peanuts': ['peanut', 'groundnut', 'moongphali'],
};

/**
 * Normalizes string for fuzzy token comparison
 */
export function normalizeName(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts distinct exclusion tokens and aliases from an exclusion rule
 * e.g. "Bell Peppers / Capsicum" -> ['bell peppers', 'capsicum', 'bell pepper', 'shimla mirch', ...]
 */
export function extractExclusionTokens(exclusion: string): string[] {
  if (!exclusion || !exclusion.trim()) return [];

  const raw = exclusion.toLowerCase();
  // Split on slashes, commas, parentheses, semicolons, dashes
  const rawParts = raw
    .split(/[\/(),;\-]+/)
    .map(p => p.trim())
    .filter(p => p.length > 1);

  // If no delimiter was found, include the whole string
  if (rawParts.length === 0 && raw.trim().length > 1) {
    rawParts.push(raw.trim());
  }

  const tokenSet = new Set<string>();

  rawParts.forEach(part => {
    const norm = normalizeName(part);
    if (!norm || norm.length < 2) return;

    tokenSet.add(norm);

    // Add singular/plural variants
    if (norm.endsWith('ies')) {
      tokenSet.add(norm.slice(0, -3) + 'y');
    } else if (norm.endsWith('es') && norm.length > 4) {
      tokenSet.add(norm.slice(0, -2));
    } else if (norm.endsWith('s') && !norm.endsWith('ss') && norm.length > 3) {
      tokenSet.add(norm.slice(0, -1));
    } else {
      tokenSet.add(norm + 's');
    }

    // Look up in alias map
    for (const [key, aliases] of Object.entries(INGREDIENT_ALIASES)) {
      if (norm === key || norm.includes(key) || key.includes(norm)) {
        tokenSet.add(key);
        aliases.forEach(a => {
          tokenSet.add(a);
          tokenSet.add(normalizeName(a));
        });
      }
    }
  });

  return Array.from(tokenSet).filter(t => t.length > 1);
}

/**
 * Checks whether an ingredient matches any excluded term in userExclusions.
 * Handles sub-strings, word matches, and aliases.
 */
export function isIngredientExcluded(ingredientName: string, userExclusions: string[]): boolean {
  if (!ingredientName || !userExclusions || userExclusions.length === 0) {
    return false;
  }

  const normalizedIng = normalizeName(ingredientName);
  if (!normalizedIng) return false;

  const ingWords = normalizedIng.split(' ');

  return userExclusions.some(exclusion => {
    if (!exclusion || !exclusion.trim()) return false;

    const tokens = extractExclusionTokens(exclusion);

    return tokens.some(token => {
      const cleanToken = normalizeName(token);
      if (!cleanToken || cleanToken.length < 2) return false;

      // 1. Direct inclusion in either direction
      if (normalizedIng.includes(cleanToken) || cleanToken.includes(normalizedIng)) {
        return true;
      }

      // 2. Token matches any individual word in ingredient name
      if (ingWords.includes(cleanToken)) {
        return true;
      }

      // 3. Multi-word token substring match (e.g. "bell pepper" inside "costco bell pepper 6 pack")
      if (cleanToken.includes(' ') && normalizedIng.includes(cleanToken)) {
        return true;
      }

      return false;
    });
  });
}

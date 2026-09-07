/**
 * Universal Culinary Ingredient Matcher with Semantic Groups and Negative Guards.
 * 
 * Prevents false positives (e.g. Bell Peppers excluding Black Pepper, Eggplant excluding Eggs,
 * Cauliflower excluding Flour, Cilantro excluding Coriander Powder, Peanuts excluding Green Peas)
 * while correctly matching Indian, American, and Costco naming variations.
 */

export interface ExclusionGroup {
  id: string;
  name: string;
  triggers: string[];
  matches: string[];
  negatives?: string[];
}

export const CULINARY_EXCLUSION_GROUPS: ExclusionGroup[] = [
  {
    id: 'bell_peppers',
    name: 'Bell Peppers / Capsicum',
    triggers: [
      'bell pepper',
      'bell peppers',
      'capsicum',
      'capsicums',
      'shimla mirch',
      'sweet pepper',
      'sweet peppers',
      'green pepper',
      'red pepper',
      'yellow pepper'
    ],
    matches: [
      'bell pepper',
      'bell peppers',
      'capsicum',
      'capsicums',
      'shimla mirch',
      'green bell pepper',
      'green bell peppers',
      'red bell pepper',
      'red bell peppers',
      'yellow bell pepper',
      'yellow bell peppers',
      'orange bell pepper',
      'orange bell peppers',
      'sweet pepper',
      'sweet peppers',
      'green pepper',
      'green peppers',
      'red pepper',
      'red peppers',
      'yellow pepper',
      'yellow peppers',
      'banana pepper'
    ],
    // Essential negative guard: NEVER match black pepper, white pepper, peppercorns, or chili powder!
    negatives: [
      'black pepper',
      'white pepper',
      'peppercorn',
      'peppercorns',
      'cayenne',
      'chili pepper',
      'chilli pepper',
      'sichuan pepper',
      'cracked pepper',
      'ground pepper',
      'pepper powder'
    ]
  },
  {
    id: 'eggplant',
    name: 'Eggplant (Baingan)',
    triggers: [
      'eggplant',
      'eggplants',
      'baingan',
      'brinjal',
      'brinjals',
      'aubergine',
      'aubergines',
      'vankaya',
      'kathirikai'
    ],
    matches: [
      'eggplant',
      'eggplants',
      'baingan',
      'brinjal',
      'brinjals',
      'aubergine',
      'aubergines',
      'vankaya',
      'kathirikai'
    ],
    // Negative guard: NEVER match regular eggs!
    negatives: ['boiled egg', 'large eggs', 'egg whites', 'egg white', 'egg', 'eggs']
  },
  {
    id: 'bitter_gourd',
    name: 'Bitter Gourd (Karela)',
    triggers: ['bitter gourd', 'bitter gourds', 'bitter melon', 'bitter melons', 'karela', 'karele', 'kakarakaya', 'pavakkai'],
    matches: ['bitter gourd', 'bitter gourds', 'bitter melon', 'bitter melons', 'karela', 'karele', 'kakarakaya', 'pavakkai'],
    negatives: []
  },
  {
    id: 'mushrooms',
    name: 'Mushrooms',
    triggers: ['mushroom', 'mushrooms', 'cremini', 'portobello', 'shiitake', 'button mushroom', 'khumb'],
    matches: ['mushroom', 'mushrooms', 'cremini', 'portobello', 'shiitake', 'khumb', 'oyster mushroom', 'enoki', 'button mushroom', 'button mushrooms'],
    negatives: []
  },
  {
    id: 'okra',
    name: 'Okra (Bhindi)',
    triggers: ['okra', 'bhindi', 'bhendi', 'ladyfinger', 'lady finger', 'ladyfingers', 'lady fingers', 'vendakkai'],
    matches: ['okra', 'bhindi', 'bhendi', 'ladyfinger', 'lady finger', 'ladyfingers', 'lady fingers', 'vendakkai'],
    negatives: []
  },
  {
    id: 'spinach',
    name: 'Spinach (Palak)',
    triggers: ['spinach', 'palak', 'baby spinach', 'keerai', 'spinach leaves'],
    matches: ['spinach', 'palak', 'baby spinach', 'keerai', 'spinach leaves'],
    negatives: []
  },
  {
    id: 'cauliflower',
    name: 'Cauliflower (Gobi)',
    triggers: ['cauliflower', 'cauliflowers', 'phool gobi', 'phool gobhi', 'gobhi', 'gobi'],
    matches: ['cauliflower', 'cauliflowers', 'phool gobi', 'phool gobhi', 'gobhi', 'gobi'],
    // Essential negative guard: NEVER match all-purpose flour, besan flour, or cabbage!
    negatives: [
      'patta gobi',
      'band gobi',
      'cabbage',
      'all purpose flour',
      'wheat flour',
      'besan flour',
      'almond flour',
      'corn flour',
      'rice flour',
      'flour'
    ]
  },
  {
    id: 'bottle_gourd',
    name: 'Bottle Gourd (Lauki)',
    triggers: ['bottle gourd', 'bottle gourds', 'lauki', 'doodhi', 'dudhi', 'ghiya', 'sorakaya', 'sorakkai'],
    matches: ['bottle gourd', 'bottle gourds', 'lauki', 'doodhi', 'dudhi', 'ghiya', 'sorakaya', 'sorakkai'],
    negatives: []
  },
  {
    id: 'radish',
    name: 'Radish (Mooli)',
    triggers: ['radish', 'radishes', 'mooli', 'muli', 'daikon', 'white radish'],
    matches: ['radish', 'radishes', 'mooli', 'muli', 'daikon', 'white radish', 'red radish', 'daikon radish'],
    negatives: ['horseradish']
  },
  {
    id: 'cilantro',
    name: 'Cilantro / Fresh Coriander',
    triggers: ['cilantro', 'kothmir', 'fresh coriander', 'coriander leaves', 'dhania patta'],
    matches: ['cilantro', 'kothmir', 'fresh coriander', 'coriander leaves', 'dhania patta'],
    // Essential negative guard: DO NOT exclude coriander powder / dhania powder spice!
    negatives: [
      'coriander powder',
      'ground coriander',
      'coriander seed',
      'coriander seeds',
      'dhania powder',
      'dhaniya powder'
    ]
  },
  {
    id: 'onion',
    name: 'Onions (Pyaz)',
    triggers: ['onion', 'onions', 'pyaz', 'shallot', 'shallots', 'kanda'],
    matches: [
      'onion',
      'onions',
      'pyaz',
      'shallot',
      'shallots',
      'kanda',
      'red onion',
      'yellow onion',
      'white onion',
      'green onion',
      'spring onion'
    ],
    negatives: []
  },
  {
    id: 'garlic',
    name: 'Garlic (Lehsun)',
    triggers: ['garlic', 'lehsun', 'lahsun', 'garlic paste', 'vellulli'],
    matches: [
      'garlic',
      'lehsun',
      'lahsun',
      'garlic cloves',
      'garlic clove',
      'garlic paste',
      'minced garlic',
      'garlic powder',
      'vellulli'
    ],
    negatives: []
  },
  {
    id: 'ginger',
    name: 'Ginger (Adrak)',
    triggers: ['ginger', 'adrak', 'allam', 'inji'],
    matches: ['ginger', 'adrak', 'fresh ginger', 'ginger paste', 'minced ginger', 'allam', 'inji'],
    negatives: []
  },
  {
    id: 'peanuts',
    name: 'Peanuts / Groundnuts',
    triggers: ['peanut', 'peanuts', 'groundnut', 'groundnuts', 'moongphali', 'singdana', 'palli'],
    matches: ['peanut', 'peanuts', 'groundnut', 'groundnuts', 'moongphali', 'singdana', 'palli', 'peanut butter'],
    negatives: ['green pea', 'green peas', 'split pea', 'split peas', 'pea protein']
  },
  {
    id: 'peas',
    name: 'Green Peas (Matar)',
    triggers: ['peas', 'green peas', 'matar', 'mutter', 'vatana'],
    matches: ['peas', 'green peas', 'matar', 'mutter', 'vatana', 'frozen peas'],
    negatives: ['peanut', 'peanuts', 'groundnut', 'chickpea', 'chickpeas', 'black eyed pea']
  },
  {
    id: 'cabbage',
    name: 'Cabbage (Patta Gobi)',
    triggers: ['cabbage', 'cabbages', 'patta gobi', 'band gobi', 'muttaikose'],
    matches: ['cabbage', 'cabbages', 'patta gobi', 'band gobi', 'muttaikose'],
    negatives: ['cauliflower', 'phool gobi']
  },
  {
    id: 'potato',
    name: 'Potatoes (Aloo)',
    triggers: ['potato', 'potatoes', 'aloo', 'alu', 'batata', 'urulaikizhangu'],
    matches: ['potato', 'potatoes', 'aloo', 'alu', 'batata', 'urulaikizhangu', 'baby potatoes', 'russet potato'],
    negatives: ['sweet potato', 'sweet potatoes']
  },
  {
    id: 'tomato',
    name: 'Tomatoes (Tamatar)',
    triggers: ['tomato', 'tomatoes', 'tamatar', 'thakkali'],
    matches: ['tomato', 'tomatoes', 'tamatar', 'thakkali', 'roma tomato', 'cherry tomato', 'diced tomatoes'],
    negatives: []
  },
  {
    id: 'paneer',
    name: 'Paneer (Cottage Cheese)',
    triggers: ['paneer', 'cottage cheese', 'indian cottage cheese'],
    matches: ['paneer', 'cottage cheese', 'indian cottage cheese', 'paneer cubes'],
    negatives: []
  },
  {
    id: 'eggs',
    name: 'Eggs (Anda)',
    triggers: ['egg', 'eggs', 'anda', 'ande', 'muttai'],
    matches: ['egg', 'eggs', 'anda', 'ande', 'muttai', 'boiled egg', 'egg white', 'egg whites'],
    negatives: ['eggplant', 'eggplants']
  }
];

/**
 * Normalizes string for clean word-boundary comparison
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
 * Checks if target phrase exists as a whole word or contiguous phrase in text.
 * Prevents false substring matches (e.g. "egg" in "eggplant", "flour" in "cauliflower", "pea" in "peanut").
 */
export function matchesWholeWordOrPhrase(text: string, phrase: string): boolean {
  const normText = normalizeName(text);
  const normPhrase = normalizeName(phrase);
  if (!normText || !normPhrase) return false;

  if (normText === normPhrase) return true;

  const escaped = normPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|\\s)${escaped}(\\s|$)`, 'i');
  return regex.test(normText);
}

/**
 * Checks whether an ingredient matches any excluded term in userExclusions.
 */
export function isIngredientExcluded(ingredientName: string, userExclusions: string[]): boolean {
  if (!ingredientName || !userExclusions || userExclusions.length === 0) {
    return false;
  }

  const normIng = normalizeName(ingredientName);
  if (!normIng) return false;

  for (const rawEx of userExclusions) {
    if (!rawEx || !rawEx.trim()) continue;
    const normEx = normalizeName(rawEx);
    if (!normEx) continue;

    // Extract subparts if user entered compound or delimited terms (e.g. "Zucchini / Squash")
    const rawTokens = rawEx
      .split(/[\/(),;\-]+/)
      .map(t => normalizeName(t))
      .filter(t => t.length > 1);
    
    // Always include full normEx as first token to test
    const tokensToTest = rawTokens.length > 0 ? Array.from(new Set([normEx, ...rawTokens])) : [normEx];

    for (const token of tokensToTest) {
      // 1. Check if token triggers any defined CULINARY_EXCLUSION_GROUPS
      const activeGroups = CULINARY_EXCLUSION_GROUPS.filter(group =>
        group.triggers.some(t => matchesWholeWordOrPhrase(token, t) || token === t)
      );

      if (activeGroups.length > 0) {
        for (const group of activeGroups) {
          // If ingredient contains a negative keyword, it cannot match this group
          const hasNegative = (group.negatives || []).some(neg => matchesWholeWordOrPhrase(normIng, neg));
          if (hasNegative) continue;

          const isMatch = group.matches.some(m => matchesWholeWordOrPhrase(normIng, m));
          if (isMatch) return true;
        }
      } else {
        // 2. Fallback for custom user exclusions: whole word matching + singular/plural variants
        let variants = [token];
        if (token.endsWith('ies') && token.length > 3) {
          variants.push(token.slice(0, -3) + 'y');
        } else if (token.endsWith('es') && token.length > 4) {
          variants.push(token.slice(0, -2));
        } else if (token.endsWith('s') && !token.endsWith('ss') && token.length > 3) {
          variants.push(token.slice(0, -1));
        } else {
          variants.push(token + 's');
        }

        for (const v of variants) {
          if (matchesWholeWordOrPhrase(normIng, v)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

/**
 * Cleanly toggles an exclusion in an array.
 * If the vegetable is currently excluded (via exact match or alias group), removes all matching items.
 * If not currently excluded, adds it to the list.
 */
export function toggleExclusionInList(veggie: string, currentList: string[]): string[] {
  const isCurrentlyExcluded = isIngredientExcluded(veggie, currentList);
  if (isCurrentlyExcluded) {
    return currentList.filter(v => 
      !isIngredientExcluded(v, [veggie]) && 
      !isIngredientExcluded(veggie, [v]) && 
      v.toLowerCase() !== veggie.toLowerCase()
    );
  } else {
    return [...currentList, veggie];
  }
}

/**
 * Extracts distinct tokens from an exclusion string (backwards compatibility).
 */
export function extractExclusionTokens(exclusion: string): string[] {
  if (!exclusion || !exclusion.trim()) return [];
  const rawParts = exclusion
    .toLowerCase()
    .split(/[\/(),;\-]+/)
    .map(p => p.trim())
    .filter(p => p.length > 1);

  if (rawParts.length === 0 && exclusion.trim().length > 1) {
    rawParts.push(exclusion.trim());
  }

  return rawParts.map(normalizeName).filter(Boolean);
}

import { ShoppingCategory, shoppingCategories } from '@/features/home-basket/domain/models';

const canonicalCategoryAliases: Record<string, ShoppingCategory> = {
  fruit: 'Produce',
  fruits: 'Produce',
  vegetable: 'Produce',
  vegetables: 'Produce',
  veg: 'Produce',
  produce: 'Produce',
  greens: 'Produce',
  dairy: 'Dairy',
  eggs: 'Dairy',
  cheese: 'Dairy',
  yoghurt: 'Dairy',
  yogurt: 'Dairy',
  meat: 'Meat',
  poultry: 'Meat',
  seafood: 'Meat',
  deli: 'Meat',
  groceries: 'Pantry',
  grocery: 'Pantry',
  pantry: 'Pantry',
  drygoods: 'Pantry',
  'dry goods': 'Pantry',
  toiletries: 'Toiletries',
  hygiene: 'Toiletries',
  'personal care': 'Toiletries',
  beauty: 'Toiletries',
  cosmetics: 'Toiletries',
  cleaning: 'Cleaning',
  'household cleaning': 'Cleaning',
  laundry: 'Cleaning',
};

const inferredCategoryMatchers: { category: ShoppingCategory; patterns: RegExp[] }[] = [
  {
    category: 'Beverages',
    patterns: [
      /\b(water|juice|soda|cola|coffee|tea|beer|wine|drink|beverage)\b/i,
    ],
  },
  {
    category: 'Produce',
    patterns: [
      /\b(apples?|bananas?|oranges?|lemons?|limes?|pears?|grapes?|berries|avocados?|tomatoes?|potatoes?|onions?|lettuce|spinach|cabbage|broccoli|carrots?|peppers?|cucumbers?|herbs?|mushrooms?|garlic|ginger)\b/i,
    ],
  },
  {
    category: 'Dairy',
    patterns: [
      /\b(milk|cheese|butter|cream|yoghurt|yogurt|custard|egg|eggs)\b/i,
    ],
  },
  {
    category: 'Meat',
    patterns: [
      /\b(chicken|beef|pork|mince|sausage|bacon|ham|steak|fish|salmon|tuna|lamb|turkey|seafood|shrimp|prawn)\b/i,
    ],
  },
  {
    category: 'Cleaning',
    patterns: [
      /\b(detergent|bleach|laundry|dish ?soap|dishwash|cleaner|disinfectant|softener|sponge|bin bag|trash bag|garbage bag|mop|broom|polish)\b/i,
    ],
  },
  {
    category: 'Toiletries',
    patterns: [
      /\b(toothpaste|toothbrush|shampoo|conditioner|soap|body wash|deodorant|lotion|razor|sanitary|nappy|diaper|tissue|wipes)\b/i,
    ],
  },
  {
    category: 'Gardening',
    patterns: [
      /\b(seed|soil|compost|fertili[sz]er|plant food|potting mix|mulch|garden|gardening|pesticide|herbicide)\b/i,
    ],
  },
  {
    category: 'Pets',
    patterns: [
      /\b(dog|cat|pet food|pet treat|litter|pet)\b/i,
    ],
  },
  {
    category: 'Baby',
    patterns: [
      /\b(baby|formula|nappy|diaper|wipes)\b/i,
    ],
  },
  {
    category: 'Frozen',
    patterns: [
      /\b(frozen|ice cream)\b/i,
    ],
  },
  {
    category: 'Pharmacy',
    patterns: [
      /\b(vitamin|medicine|medication|tablet|capsule|bandage|pain relief|paracetamol|ibuprofen)\b/i,
    ],
  },
  {
    category: 'Hardware',
    patterns: [
      /\b(battery|bulb|glue|tape|screw|nail|paint|brush|tool|hardware)\b/i,
    ],
  },
  {
    category: 'Pantry',
    patterns: [
      /\b(rice|bread|flour|sugar|salt|oil|pasta|cereal|beans|lentils|sauce|spice|snack|biscuit|cracker|noodle)\b/i,
    ],
  },
];

function canonicalizeCategoryAlias(value: string) {
  const normalizedValue = value.toLowerCase().replace(/\s+/g, ' ').trim();

  if (!normalizedValue) {
    return '';
  }

  const canonicalAlias = canonicalCategoryAliases[normalizedValue];

  if (canonicalAlias) {
    return canonicalAlias;
  }

  const compactValue = normalizedValue.replace(/\s+/g, '');

  return canonicalCategoryAliases[compactValue] ?? '';
}

export function normalizeShoppingCategoryLabel(value: string) {
  const trimmedValue = value.trim().replace(/\s+/g, ' ');

  if (!trimmedValue) {
    return '';
  }

  const canonicalCategory = shoppingCategories.find(
    (category) => category.toLowerCase() === trimmedValue.toLowerCase()
  );

  if (canonicalCategory) {
    return canonicalCategory;
  }

  const canonicalAlias = canonicalizeCategoryAlias(trimmedValue);

  if (canonicalAlias) {
    return canonicalAlias;
  }

  return trimmedValue
    .split(' ')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(' ');
}

export function inferShoppingCategoryFromText(value: string): ShoppingCategory {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return 'Other';
  }

  for (const matcher of inferredCategoryMatchers) {
    if (matcher.patterns.some((pattern) => pattern.test(trimmedValue))) {
      return matcher.category;
    }
  }

  return 'Other';
}

export function resolveShoppingCategory(
  selectedCategory: ShoppingCategory,
  customCategory?: string
): ShoppingCategory {
  const normalizedCustomCategory = normalizeShoppingCategoryLabel(customCategory ?? '');

  if (normalizedCustomCategory) {
    return normalizedCustomCategory;
  }

  const normalizedSelectedCategory = normalizeShoppingCategoryLabel(selectedCategory ?? '');

  return normalizedSelectedCategory || 'Other';
}

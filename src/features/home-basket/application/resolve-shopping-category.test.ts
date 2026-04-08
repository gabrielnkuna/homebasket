import { describe, expect, it } from 'vitest';

import {
  inferShoppingCategoryFromText,
  normalizeShoppingCategoryLabel,
  resolveShoppingCategory,
} from '@/features/home-basket/application/resolve-shopping-category';

describe('resolveShoppingCategory', () => {
  it('keeps built-in categories canonical', () => {
    expect(normalizeShoppingCategoryLabel('produce')).toBe('Produce');
    expect(resolveShoppingCategory('Pantry', ' dairy ')).toBe('Dairy');
  });

  it('normalizes custom categories into title case', () => {
    expect(resolveShoppingCategory('Other', ' gardening supplies ')).toBe('Gardening Supplies');
    expect(resolveShoppingCategory('Produce', ' fruits ')).toBe('Fruits');
  });

  it('falls back to Other when no usable value is provided', () => {
    expect(resolveShoppingCategory('', '   ')).toBe('Other');
  });

  it('maps global aliases onto canonical built-in categories', () => {
    expect(normalizeShoppingCategoryLabel('personal care')).toBe('Toiletries');
    expect(normalizeShoppingCategoryLabel('seafood')).toBe('Meat');
  });

  it('infers useful categories from item names', () => {
    expect(inferShoppingCategoryFromText('Potting mix 30L')).toBe('Gardening');
    expect(inferShoppingCategoryFromText('Cheddar cheese slices')).toBe('Dairy');
    expect(inferShoppingCategoryFromText('Sparkling water lemon')).toBe('Beverages');
  });
});

// Groups for browsing IFANCA's product categories. A browsing aid only: it says nothing about any product.
// Every one of the 62 categories in products.json is listed. A category not listed falls into Food.

export const CONSUMER_GROUPS = [
  'Beverages',
  'Food',
  'Cosmetics and Personal Care',
  'Nutritional and Dietary Supplements',
  'Pharmaceuticals',
] as const
export const BASE_GROUP = 'Ingredients and base materials'
export type Group = (typeof CONSUMER_GROUPS)[number] | typeof BASE_GROUP

const MAP: Record<string, Group> = {
  Beverages: 'Beverages',
  'Beverage Concentrates': 'Beverages',
  'Coffee and Tea': 'Beverages',
  'Drink Mixes': 'Beverages',
  Water: 'Beverages',

  'Baby Food Products': 'Food',
  'Bakery Items': 'Food',
  'Candy / Chocolate': 'Food',
  Cheese: 'Food',
  Condiments: 'Food',
  'Dairy Products': 'Food',
  'Dairy Substitutes': 'Food',
  'Dessert Mixes': 'Food',
  'Egg Products': 'Food',
  'Entrée / Meals': 'Food',
  'Food Products': 'Food',
  'Frozen Novelties': 'Food',
  'Fruit Filling & Glazes': 'Food',
  'Fruits Processed': 'Food',
  'Herbs & Spices': 'Food',
  'Ice Cream & Frozen Yogurt': 'Food',
  'Meat & Poultry – Processed': 'Food',
  'Nutritional Food Products': 'Food',
  'Nuts & Seeds': 'Food',
  'Potato Products': 'Food',
  Purees: 'Food',
  'Sauces & Dressings': 'Food',
  'Seafood and Fish Products': 'Food',
  'Snack Foods': 'Food',
  'Spices & Seasonings': 'Food',
  Sweeteners: 'Food',
  Syrups: 'Food',
  'Toppings & Accompaniments': 'Food',
  'Vegetable Oils': 'Food',
  'Vegetables Processed': 'Food',

  Cosmetics: 'Cosmetics and Personal Care',
  'Personal Care Products': 'Cosmetics and Personal Care',
  'Skin Care products': 'Cosmetics and Personal Care',
  Fragrances: 'Cosmetics and Personal Care',
  'Essential Oils': 'Cosmetics and Personal Care',

  'Nutritional Supp - Gelatin Capsules- Bovine Bone': 'Nutritional and Dietary Supplements',
  'Nutritional Supp - Softgel Gelatin-Bovine Bone': 'Nutritional and Dietary Supplements',
  'Nutritional Supplement - Gummies': 'Nutritional and Dietary Supplements',
  'Nutritional Supplement - Liquids': 'Nutritional and Dietary Supplements',
  'Nutritional Supplement - Powder': 'Nutritional and Dietary Supplements',
  'Nutritional Supplement - Softgel Veggie': 'Nutritional and Dietary Supplements',
  'Nutritional Supplement - Tablet': 'Nutritional and Dietary Supplements',
  'Nutritional Supplement - Veggie Capsules': 'Nutritional and Dietary Supplements',

  Pharmaceuticals: 'Pharmaceuticals',

  'Botanical Extracts': BASE_GROUP,
  Colorings: BASE_GROUP,
  'Dairy Ingredients': BASE_GROUP,
  Flavors: BASE_GROUP,
  'Food Chemicals': BASE_GROUP,
  'Food Ingredients': BASE_GROUP,
  'Nutritional Ingredients': BASE_GROUP,
  'Personal care Ingredients': BASE_GROUP,
  'Sanitation Chemicals': BASE_GROUP,
  'Soy Ingredients': BASE_GROUP,
  'Vitamin/Mineral Premixes': BASE_GROUP,
  'Water Treatment Chemicals': BASE_GROUP,
  'Whey Products': BASE_GROUP,
}

export function groupOf(category: string, name: string): Group {
  // Base powders are sold to manufacturers, whatever their category says.
  if (/\bbase powder\b/i.test(name)) return BASE_GROUP
  return MAP[category] ?? 'Food'
}

// Consumer groups first, then ingredients and base materials.
export const groupRank = (g: Group) => (g === BASE_GROUP ? 1 : 0)

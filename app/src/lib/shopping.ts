// Combined shopping list from the meal plan. Lines are grouped by a simplified name.
// The simplified name is only used to group lines. Every original line is kept as published.

export type ShopLine = { text: string; recipe: string; recipeSlug: string }
export type ShopItem = { key: string; name: string; lines: ShopLine[] }

type RecipeLike = { title: string; slug: string; ingredients: string[] }

const isHeading = (line: string) => line.trim().endsWith(':')

const UNITS = [
  'cups?', 'c\\.', 'tablespoons?', 'tbsps?\\.?', 'tbs\\.?', 'teaspoons?', 'tsps?\\.?', 'pounds?', 'lbs?\\.?',
  'ounces?', 'oz\\.?', 'fl\\.? oz\\.?', 'grams?', 'g', 'kg', 'kilograms?', 'ml', 'milliliters?', 'liters?', 'litres?', 'l',
  'quarts?', 'qt\\.?', 'pints?', 'cans?', 'jars?', 'packages?', 'pkgs?\\.?', 'packets?', 'bottles?', 'boxes?', 'bags?',
  'cloves?', 'pinch(?:es)?', 'dash(?:es)?', 'sprigs?', 'bunch(?:es)?', 'handfuls?', 'slices?', 'pieces?', 'sticks?',
  'heads?', 'stalks?', 'envelopes?', 'containers?', 'cartons?', 'leaves', 'drops?', 'large', 'medium', 'small', 'whole', 'heaping', 'level', 'scant', 'about',
  'of',
]
const AMOUNT = /^(?:[\d\s½⅓⅔¼¾⅛/.,\-–]+|\([^)]*\)|a\s|an\s|one\s|two\s|three\s|four\s|few\s)+/i
const UNIT = new RegExp(`^(?:(?:${UNITS.join('|')})\\b\\.?\\s*)+`, 'i')

export function itemName(line: string): string {
  let s = line.trim()
  for (let i = 0; i < 3; i++) {
    s = s.replace(AMOUNT, '').replace(UNIT, '').trim()
  }
  s = s.split(',')[0].split(' (')[0].trim()
  return s || line.trim()
}

export function itemKey(line: string): string {
  return itemName(line)
    .toLowerCase()
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Each recipe counts once, even when it is planned on several days.
export function buildList(recipes: RecipeLike[]): ShopItem[] {
  const seen = new Set<string>()
  const items = new Map<string, ShopItem>()
  for (const r of recipes) {
    if (seen.has(r.slug)) continue
    seen.add(r.slug)
    for (const text of r.ingredients) {
      if (isHeading(text) || !text.trim()) continue
      const key = itemKey(text)
      const item = items.get(key) ?? { key, name: itemName(text), lines: [] }
      item.lines.push({ text, recipe: r.title, recipeSlug: r.slug })
      items.set(key, item)
    }
  }
  return [...items.values()].sort((a, b) => a.key.localeCompare(b.key))
}

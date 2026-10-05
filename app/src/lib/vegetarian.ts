// "Vegetarian" filter for recipes. Based on the ingredient list only, so it is a browsing aid, not a guarantee.
// A recipe is left out when any ingredient line (headings included) names one of these. Eggs and dairy are allowed.
// IFANCA's recipe pages carry no vegetarian tags, so there is nothing else to use.
export const NOT_VEGETARIAN = new RegExp(
  '\\b(' +
    [
      // meat and poultry
      'meats?', 'meatballs?', 'beef', 'veal', 'lamb', 'mutton', 'goat', 'chicken', 'turkey', 'duck', 'goose', 'quail',
      'poultry', 'venison', 'bison', 'camel', 'rabbit', 'pork', 'ham', 'bacon', 'sausages?', 'salami', 'pepperoni',
      'hot ?dogs?', 'kebabs?', 'keema', 'qeema', 'kheema', 'steaks?', 'ribs?', 'brisket', 'shanks?', 'liver', 'tripe',
      'bones?', 'marrow', 'oxtail', 'pastrami', 'jerky', 'suet', 'tallow', 'lard',
      // fish and seafood
      'fish', 'salmon', 'tuna', 'cod', 'tilapia', 'mackerel', 'sardines?', 'anchov(?:y|ies)', 'halibut', 'trout',
      'haddock', 'snapper', 'catfish', 'bass', 'herring', 'swordfish', 'shrimps?', 'prawns?', 'crabs?', 'lobsters?',
      'scallops?', 'clams?', 'mussels?', 'oysters?', 'squid', 'calamari', 'octopus', 'seafood', 'caviar',
      // animal-derived ingredients named in the rule, and common products made with them
      'gelatine?', 'marshmallows?', 'worcestershire',
      // stock or broth unless it says vegetable (checked below)
      'stock', 'broth', 'bouillon',
    ].join('|') +
    ')\\b',
  'i',
)

const PLANT_STOCK = /\b(vegetable|veggie|mushroom)\s+(stock|broth|bouillon)\b/i

export function isVegetarian(lines: string[]): boolean {
  for (const raw of lines) {
    const line = raw.replace(PLANT_STOCK, '')
    if (NOT_VEGETARIAN.test(line)) return false
  }
  return true
}

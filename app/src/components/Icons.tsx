// Section icons, shared by the home tiles and the bottom navigation.
import type { ReactNode, SVGProps } from 'react'

function Svg({ size = 24, children, ...rest }: SVGProps<SVGSVGElement> & { size?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

type P = { size?: number }

export const LearnIcon = (p: P) => (
  <Svg {...p}>
    <path d="M12 4 2.5 8.5 12 13l9.5-4.5z" />
    <path d="M6.5 10.6v4.6c0 1.6 2.5 3.3 5.5 3.3s5.5-1.7 5.5-3.3v-4.6" />
    <path d="M21.5 8.5V14" />
  </Svg>
)

export const ProductIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z" />
    <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
  </Svg>
)

export const IngredientsIcon = (p: P) => (
  <Svg {...p}>
    <path d="M9 3h6M10 3v5L5 18a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-10V3" />
    <path d="M7.5 14h9" />
  </Svg>
)

export const RecipesIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 11h16a8 8 0 0 1-16 0z" />
    <path d="M9 7c0-1.5 1-2 1-3.5M14 7c0-1.5 1-2 1-3.5" />
  </Svg>
)

export const PlanIcon = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
    <path d="m9 15 2 2 4-4" />
  </Svg>
)

export const ReadIcon = (p: P) => (
  <Svg {...p}>
    <path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2z" />
    <path d="M22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" />
  </Svg>
)

export const PersonIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="4" />
    <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
  </Svg>
)

export const CloseIcon = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
)

export const ChevronIcon = (p: P) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
)

export const BackIcon = (p: P) => (
  <Svg {...p}>
    <path d="m15 18-6-6 6-6" />
  </Svg>
)

export const SearchIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Svg>
)

// The sections, in home and navigation order.
export const SECTIONS = [
  { id: 'learn', label: 'Learn and quiz', short: 'Learn', Icon: LearnIcon, color: 'bg-learn' },
  { id: 'product', label: 'Check a product', short: 'Products', Icon: ProductIcon, color: 'bg-product' },
  { id: 'ingredients', label: 'Check ingredients', short: 'Ingredients', Icon: IngredientsIcon, color: 'bg-ingredients' },
  { id: 'recipes', label: 'Recipes', short: 'Recipes', Icon: RecipesIcon, color: 'bg-recipes' },
  { id: 'plan', label: 'Meal plan', short: 'Meal plan', Icon: PlanIcon, color: 'bg-plan' },
  { id: 'read', label: 'Read', short: 'Read', Icon: ReadIcon, color: 'bg-read' },
] as const
